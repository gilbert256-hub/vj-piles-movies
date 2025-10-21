"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Shield, User, CheckCircle, XCircle, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllUsers, updateUserSubscription, type UserData } from "@/lib/firebase-db"

export default function UsersPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetchedUsers = await getAllUsers()
        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin) {
      fetchUsers()
    }
  }, [user, isAdmin])

  const handleActivateSubscription = async (userId: string, plan: string) => {
    if (!plan) return

    const planDurations: Record<string, number> = {
      "2days": 2,
      "1week": 7,
      "2weeks": 14,
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365,
    }

    const days = planDurations[plan]
    if (!days) return

    try {
      await updateUserSubscription(userId, plan, days)
      // Refresh users list
      const fetchedUsers = await getAllUsers()
      setUsers(fetchedUsers)
      setSelectedUser(null)
      setSelectedPlan("")
    } catch (error) {
      console.error("Error activating subscription:", error)
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading users...</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeUsers = users.filter((u) => u.subscription?.isActive)
  const totalWatchTime = users.reduce((sum, u) => sum + (u.watchTime || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-sm font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{users.length}</div>
            <div className="text-sm text-muted">Total Users</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{activeUsers.length}</div>
            <div className="text-sm text-muted">Active Subscriptions</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{users.filter((u) => u.isAdmin).length}</div>
            <div className="text-sm text-muted">Admins</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{Math.round(totalWatchTime / 60)}h</div>
            <div className="text-sm text-muted">Total Watch Time</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Subscription</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Join Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Last Active</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Watch Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((userData) => (
                  <tr key={userData.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-sm font-semibold">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{userData.name}</div>
                          <div className="text-xs text-muted">{userData.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1">
                        {userData.subscription?.isActive ? (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-500 font-medium">{userData.subscription.plan}</span>
                            </div>
                            <span className="text-xs text-muted">
                              Expires: {new Date(userData.subscription.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">No Active Plan</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {userData.isAdmin ? (
                          <>
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Admin</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 text-muted" />
                            <span className="text-sm text-muted">User</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {userData.lastActive ? new Date(userData.lastActive).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-4 px-4 text-sm">{Math.round((userData.watchTime || 0) / 60)} hrs</td>
                    <td className="py-4 px-4">
                      {selectedUser === userData.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2days">2 Days</SelectItem>
                              <SelectItem value="1week">1 Week</SelectItem>
                              <SelectItem value="2weeks">2 Weeks</SelectItem>
                              <SelectItem value="1month">1 Month</SelectItem>
                              <SelectItem value="3months">3 Months</SelectItem>
                              <SelectItem value="6months">6 Months</SelectItem>
                              <SelectItem value="1year">1 Year</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => handleActivateSubscription(userData.id, selectedPlan)}
                            disabled={!selectedPlan}
                          >
                            Activate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-transparent"
                            onClick={() => {
                              setSelectedUser(null)
                              setSelectedPlan("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs bg-transparent"
                          onClick={() => setSelectedUser(userData.id)}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Manage Plan
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p>No users found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  )
}
