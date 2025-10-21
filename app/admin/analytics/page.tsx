"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Eye, Users, PlayCircle, Download } from "lucide-react"

export default function AnalyticsPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  if (!user || !isAdmin) {
    return null
  }

  const stats = [
    {
      label: "Total Views",
      value: "2.4M",
      change: "+12.5%",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Users",
      value: "45.2K",
      change: "+8.2%",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Watch Time",
      value: "1.2M hrs",
      change: "+15.3%",
      icon: PlayCircle,
      color: "from-green-500 to-teal-500",
    },
    {
      label: "Downloads",
      value: "89.5K",
      change: "+5.7%",
      icon: Download,
      color: "from-orange-500 to-red-500",
    },
  ]

  const topContent = [
    { title: "Inception", type: "Movie", views: "125K", rating: 4.8 },
    { title: "Breaking Bad S01E01", type: "Episode", views: "98K", rating: 4.9 },
    { title: "The Dark Knight", type: "Movie", views: "87K", rating: 4.7 },
    { title: "Game of Thrones S01E01", type: "Episode", views: "76K", rating: 4.6 },
    { title: "Interstellar", type: "Movie", views: "65K", rating: 4.8 },
  ]

  const recentActivity = [
    { user: "john_doe", action: "Watched", content: "Inception", time: "2 min ago" },
    { user: "jane_smith", action: "Downloaded", content: "Breaking Bad S01E01", time: "5 min ago" },
    { user: "mike_wilson", action: "Rated", content: "The Dark Knight", time: "12 min ago" },
    { user: "sarah_jones", action: "Added to Watchlist", content: "Interstellar", time: "18 min ago" },
    { user: "tom_brown", action: "Watched", content: "Game of Thrones S01E01", time: "25 min ago" },
  ]

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
              <h1 className="text-2xl font-bold">Analytics</h1>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Content */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top Content</h2>
            <div className="space-y-3">
              {topContent.map((content, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[image:var(--gradient-brand)] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{content.title}</div>
                      <div className="text-xs text-muted">{content.type}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{content.views}</div>
                    <div className="text-xs text-muted">⭐ {content.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="py-3 border-b border-border last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="font-medium text-sm">{activity.user}</div>
                    <div className="text-xs text-muted">{activity.time}</div>
                  </div>
                  <div className="text-xs text-muted">
                    {activity.action} <span className="text-foreground font-medium">{activity.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-6 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Views Over Time</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center text-muted">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chart visualization would go here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  )
}
