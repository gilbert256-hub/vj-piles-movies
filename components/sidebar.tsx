"use client"

import { Home, Film, Tv, TrendingUp, Clock, Star, Crown, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Film, label: "Movies", href: "/movies" },
  { icon: Tv, label: "TV Series", href: "/tv-series" },
  { icon: TrendingUp, label: "Trending", href: "/trending" },
  { icon: Clock, label: "Recently Added", href: "/recent" },
  { icon: Star, label: "Top Rated", href: "/top-rated" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { hasActiveSubscription, user } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
        <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
          <Image src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8f0dfd43a_VjPilesUg55.png" alt="VJ Piles UG Movies" fill className="object-cover" />
        </div>
        <h1 className="text-base font-bold text-sidebar-foreground leading-tight">VJ Piles UG Movies</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gray-700 text-white font-semibold"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}

          {user?.isAdmin && (
            <>
              <div className="my-2 border-t border-sidebar-border" />
              <Link
                href="/admin"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  pathname === "/admin"
                    ? "bg-blue-500/20 text-blue-400 font-semibold"
                    : "text-blue-400 hover:bg-blue-500/10"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Admin Dashboard</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {hasActiveSubscription ? (
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-green-400" />
              <h3 className="text-sm font-semibold text-green-400">Active Subscription</h3>
            </div>
            <p className="text-xs text-gray-300 mb-3">Enjoying unlimited access</p>
            <Link
              href="/profile"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg text-center transition-colors"
            >
              Manage Plan
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-500/30">
            <h3 className="text-sm font-semibold mb-2">Subscribe Now</h3>
            <p className="text-xs text-muted mb-3">Get unlimited access to all content</p>
            <Link
              href="/subscribe"
              className="block w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg text-center transition-colors"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}
