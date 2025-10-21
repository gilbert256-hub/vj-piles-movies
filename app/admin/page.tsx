"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Film, Tv, PlaySquare, Megaphone, BarChart3, Users, ImageIcon } from "lucide-react"
import { getContentStats, getAllUsers } from "@/lib/firebase-db"

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalSeries: 0,
    totalEpisodes: 0,
    activeUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  console.log("[v0] Admin page - user:", user?.email, "isAdmin:", isAdmin, "isLoading:", isLoading)

  useEffect(() => {
    console.log("[v0] Admin page useEffect - user:", user, "isAdmin:", isAdmin, "isLoading:", isLoading)

    if (!isLoading) {
      if (!user) {
        console.log("[v0] No user, redirecting to login")
        router.push("/login")
      } else if (!isAdmin) {
        console.log("[v0] User is not admin, redirecting to home")
        router.push("/")
      } else {
        console.log("[v0] User is admin, showing dashboard")
      }
    }
  }, [user, isAdmin, isLoading, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const [contentStats, users] = await Promise.all([getContentStats(), getAllUsers()])

        setStats({
          totalMovies: contentStats.totalMovies,
          totalSeries: contentStats.totalSeries,
          totalEpisodes: contentStats.totalEpisodes,
          activeUsers: users.filter((u) => u.subscription?.isActive).length,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin) {
      fetchStats()
    }
  }, [user, isAdmin])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  const adminCards = [
    {
      title: "Upload Movies",
      description: "Add new movies to the platform",
      icon: Film,
      href: "/admin/upload/movies",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Upload Series",
      description: "Add new TV series",
      icon: Tv,
      href: "/admin/upload/series",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Upload Episodes",
      description: "Add episodes to existing series",
      icon: PlaySquare,
      href: "/admin/upload/episodes",
      color: "from-green-500 to-teal-500",
    },
    {
      title: "Upload Adverts",
      description: "Manage promotional content",
      icon: Megaphone,
      href: "/admin/upload/adverts",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Hero Images",
      description: "Manage homepage hero slider images",
      icon: ImageIcon,
      href: "/admin/upload/hero-images",
      color: "from-yellow-500 to-amber-500",
    },
    {
      title: "Analytics",
      description: "View platform statistics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "from-indigo-500 to-blue-500",
    },
    {
      title: "Manage Users",
      description: "User management and permissions",
      icon: Users,
      href: "/admin/users",
      color: "from-pink-500 to-rose-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted mt-1">Manage your MovieBox platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
                Back to Home
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.totalMovies.toLocaleString()}</div>
            <div className="text-sm text-muted">Total Movies</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.totalSeries.toLocaleString()}</div>
            <div className="text-sm text-muted">Total Series</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.totalEpisodes.toLocaleString()}</div>
            <div className="text-sm text-muted">Total Episodes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl font-bold mb-1">{stats.activeUsers.toLocaleString()}</div>
            <div className="text-sm text-muted">Active Users</div>
          </div>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-lg`}
                />

                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{card.title}</h3>
                  <p className="text-sm text-muted">{card.description}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted">Content Library</h3>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Movies:</span>
                  <span className="font-medium">{stats.totalMovies}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Series:</span>
                  <span className="font-medium">{stats.totalSeries}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Episodes:</span>
                  <span className="font-medium">{stats.totalEpisodes}</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted">User Engagement</h3>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span>Active Subscriptions:</span>
                  <span className="font-medium text-green-500">{stats.activeUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
