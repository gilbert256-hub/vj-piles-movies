"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Calendar, Mail, User, LogOut, CreditCard, Edit, Settings } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, hasActiveSubscription, logout } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const daysRemaining = user.subscription?.expiresAt
    ? Math.ceil((new Date(user.subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account and subscription</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* User Information */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-white font-semibold">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-white font-semibold">{user.email}</p>
              </div>
              {user.isAdmin && (
                <>
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
                    <p className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Admin Account
                    </p>
                  </div>
                  <Link href="/admin">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Go to Admin Dashboard
                    </Button>
                  </Link>
                </>
              )}
              <Link href="/profile/edit">
                <Button variant="outline" className="w-full bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasActiveSubscription ? (
                <>
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-6 h-6 text-green-400" />
                      <span className="text-green-400 font-semibold text-lg">Active</span>
                    </div>
                    <p className="text-gray-300 text-sm">You have unlimited access to all content</p>
                  </div>

                  {user.subscription && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400">Current Plan</label>
                        <p className="text-white font-semibold">{user.subscription.plan}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Expires On
                        </label>
                        <p className="text-white font-semibold">{formatDate(user.subscription.expiresAt)}</p>
                        <p className="text-sm text-gray-400 mt-1">{daysRemaining} days remaining</p>
                      </div>
                    </>
                  )}

                  <Button onClick={() => router.push("/subscribe")} className="w-full bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Renew Subscription
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-400 font-semibold mb-2">No Active Subscription</p>
                    <p className="text-gray-300 text-sm">Subscribe now to watch unlimited movies and series</p>
                  </div>

                  <Button onClick={() => router.push("/subscribe")} className="w-full bg-red-600 hover:bg-red-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Subscribe Now
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subscription Benefits */}
        {hasActiveSubscription && (
          <Card className="bg-gray-900/50 border-gray-800 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Subscription Benefits</CardTitle>
              <CardDescription className="text-gray-400">What you get with your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {[
                  "Unlimited streaming of all movies and series",
                  "HD and 4K quality content",
                  "Watch on mobile and desktop",
                  "Download for offline viewing",
                  "No ads or interruptions",
                  "Early access to new releases",
                  "Priority customer support",
                  "Exclusive content and specials",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <Crown className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
