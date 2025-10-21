"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, db } from "./firebase"

interface Subscription {
  plan: string
  expiresAt: Date
  isActive: boolean
}

interface User {
  id: string
  email: string
  name: string
  isAdmin?: boolean
  avatar?: string
  subscription?: Subscription
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAdmin: boolean
  hasActiveSubscription: boolean
  updateSubscription: (plan: string, days: number) => void
  updateUserProfile: (name: string, avatar?: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = "okotstephen57@gmail.com"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set persistence first
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await loadUserData(firebaseUser)
          } else {
            setUser(null)
          }
          setIsLoading(false)
        })
        return unsubscribe
      })
      .catch((error) => {
        console.error("Error setting persistence:", error)
        setIsLoading(false)
      })
  }, [])

  const loadUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      const userData = userDoc.data()

      const isAdminUser = firebaseUser.email === ADMIN_EMAIL

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || userData?.name || "User",
        isAdmin: isAdminUser,
        avatar: firebaseUser.photoURL || userData?.avatar,
        subscription: userData?.subscription
          ? {
              ...userData.subscription,
              expiresAt: userData.subscription.expiresAt.toDate(),
              isActive: userData.subscription.expiresAt.toDate() > new Date(),
            }
          : undefined,
      }

      setUser(user)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      await loadUserData(userCredential.user)
      return true
    } catch (error: any) {
      console.error("Login error:", error)
      return false
    }
  }

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      const isAdminUser = firebaseUser.email === ADMIN_EMAIL

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          avatar: firebaseUser.photoURL,
          isAdmin: isAdminUser,
          createdAt: new Date(),
        })
      } else {
        // Update isAdmin field if it's the admin email
        await setDoc(
          doc(db, "users", firebaseUser.uid),
          {
            isAdmin: isAdminUser,
          },
          { merge: true },
        )
      }

      await loadUserData(firebaseUser)
      return true
    } catch (error: any) {
      console.error("Google login error:", error)
      return false
    }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName: name })

      const isAdminUser = email === ADMIN_EMAIL

      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        name,
        isAdmin: isAdminUser,
        createdAt: new Date(),
      })

      await loadUserData(firebaseUser)
      return true
    } catch (error: any) {
      console.error("Signup error:", error)
      return false
    }
  }

  const updateUserProfile = async (name: string, avatar?: string): Promise<boolean> => {
    if (!user) return false

    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: avatar || auth.currentUser.photoURL,
        })
      }

      // Update Firestore document
      await setDoc(
        doc(db, "users", user.id),
        {
          name,
          ...(avatar && { avatar }),
        },
        { merge: true },
      )

      // Update local state
      setUser({
        ...user,
        name,
        ...(avatar && { avatar }),
      })

      return true
    } catch (error) {
      console.error("Error updating profile:", error)
      return false
    }
  }

  const updateSubscription = async (plan: string, days: number) => {
    if (!user) return

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    const subscription = {
      plan,
      expiresAt,
      isActive: true,
    }

    try {
      await setDoc(
        doc(db, "users", user.id),
        {
          subscription,
        },
        { merge: true },
      )

      setUser({
        ...user,
        subscription,
      })
    } catch (error) {
      console.error("Error updating subscription:", error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (error: any) {
      console.error("Password reset error:", error)
      return false
    }
  }

  const hasActiveSubscription =
    user?.isAdmin || (user?.subscription?.isActive && user?.subscription?.expiresAt > new Date()) || false

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        signup,
        logout,
        isLoading,
        isAdmin: user?.isAdmin || false,
        hasActiveSubscription,
        updateSubscription,
        updateUserProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
