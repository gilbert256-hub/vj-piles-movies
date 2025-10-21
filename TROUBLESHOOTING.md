# Firebase Troubleshooting Guide

## 🔥 Most Common Error: auth/unauthorized-domain

### What It Means
Firebase is blocking authentication because your current domain is not in the authorized domains list.

### Quick Fix (3 Steps)

**Step 1:** Copy your domain from the browser address bar
- Look at the URL when previewing your app
- Copy just the domain part (without `https://`)
- Example: `https://abc123.v0.app/signup` → copy `abc123.v0.app`

**Step 2:** Add it to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select project: **luo-ancient-movies-com**
3. Go to **Authentication** → **Settings** tab
4. Scroll to **Authorized domains** section
5. Click **Add domain**
6. Paste your domain and click **Add**

**Step 3:** Wait and retry
- Wait 1-2 minutes for changes to take effect
- Refresh your preview page
- Try Google Sign-in again

### Domains You Should Add
- ✅ `localhost` (for local development)
- ✅ Your v0 preview domain (e.g., `your-project.v0.app`)
- ✅ Your production domain (when deploying to Vercel)

---

## Other Common Errors

### 1. `auth/invalid-api-key`

**Cause:** Firebase API key is missing or incorrect in environment variables.

**Solution:**
- Check that all environment variables in `.env.local` match your Firebase Console
- Verify the API key in Firebase Console > Project Settings > General
- Restart your development server after updating `.env.local`

### 2. `auth/popup-blocked`

**Cause:** Browser is blocking the Google sign-in popup.

**Solution:**
- Allow popups for your domain in browser settings
- Try using `signInWithRedirect` instead of `signInWithPopup` (see code below)

### 3. Firestore Permission Denied

**Cause:** Firestore security rules are too restrictive.

**Solution:**
- Go to Firebase Console > Firestore Database > Rules
- Update rules to allow authenticated users (see FIREBASE_SETUP.md)
- Click **Publish** to apply the rules

### 4. Storage Upload Fails

**Cause:** Storage security rules are too restrictive.

**Solution:**
- Go to Firebase Console > Storage > Rules
- Update rules to allow authenticated users (see FIREBASE_SETUP.md)
- Click **Publish** to apply the rules

### 5. Email/Password Sign-up Not Working

**Cause:** Email/Password authentication is not enabled.

**Solution:**
1. Go to Firebase Console > Authentication > Sign-in method
2. Click on **Email/Password**
3. Enable it and click **Save**

---

## Alternative: Using Redirect Instead of Popup

If popup-based Google sign-in continues to fail, you can switch to redirect-based authentication:

\`\`\`typescript
// In lib/auth-context.tsx, replace signInWithPopup with:
import { signInWithRedirect, getRedirectResult } from "firebase/auth"

// In loginWithGoogle function:
const loginWithGoogle = async (): Promise<boolean> => {
  try {
    await signInWithRedirect(auth, googleProvider)
    return true
  } catch (error: any) {
    console.error("[v0] Google login error:", error)
    return false
  }
}

// Add this in useEffect to handle redirect result:
useEffect(() => {
  const handleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth)
      if (result?.user) {
        const userDoc = await getDoc(doc(db, "users", result.user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", result.user.uid), {
            email: result.user.email,
            name: result.user.displayName,
            avatar: result.user.photoURL,
            isAdmin: result.user.email === ADMIN_EMAIL,
            createdAt: new Date(),
          })
        }
        await loadUserData(result.user)
      }
    } catch (error) {
      console.error("[v0] Redirect result error:", error)
    }
  }
  handleRedirectResult()
}, [])
\`\`\`

---

## Checking Firebase Configuration

Run this checklist to verify your setup:

- [ ] All environment variables are set in `.env.local`
- [ ] Environment variables match Firebase Console values
- [ ] Email/Password authentication is enabled in Firebase Console
- [ ] Google authentication is enabled in Firebase Console
- [ ] **All required domains are added to Authorized domains** ⚠️
- [ ] Firestore database is created
- [ ] Firestore security rules are configured and published
- [ ] Storage bucket is created
- [ ] Storage security rules are configured and published

---

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Verify all steps** in FIREBASE_SETUP.md are completed
3. **Wait 1-2 minutes** after making changes in Firebase Console
4. **Clear browser cache** and try again
5. **Try incognito/private window** to rule out cache issues
6. **Check Firebase Console status** at [Firebase Status Dashboard](https://status.firebase.google.com/)

---

## Quick Reference: Firebase Console Links

- [Authentication Settings](https://console.firebase.google.com/project/luo-ancient-movies-com/authentication/providers)
- [Authorized Domains](https://console.firebase.google.com/project/luo-ancient-movies-com/authentication/settings)
- [Firestore Rules](https://console.firebase.google.com/project/luo-ancient-movies-com/firestore/rules)
- [Storage Rules](https://console.firebase.google.com/project/luo-ancient-movies-com/storage/rules)
- [Project Settings](https://console.firebase.google.com/project/luo-ancient-movies-com/settings/general)
