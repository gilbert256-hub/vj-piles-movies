'use client'

import { useState, useEffect } from "react"
import { Search, Download, X, User, LogOut, Crown, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const { user, logout, hasActiveSubscription } = useAuth()

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      console.log("[v0] User accepted the install prompt")
    }

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1A1A1A] border-b border-gray-700 backdrop-blur-sm text-white">
      <div className="flex items-center justify-between gap-4 px-4 lg:px-6 py-3">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
            <Image src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8f0dfd43a_VjPilesUg55.png" alt="VJ Piles UG Movies" fill className="object-cover" priority />
          </div>
          <h1 className="text-base font-bold leading-tight">VJ Piles UG Movies</h1>
        </Link>

        <Link href="/" className="hidden lg:flex items-center gap-2">
          <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
            <Image src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8f0dfd43a_VjPilesUg55.png" alt="VJ Piles UG Movies" fill className="object-cover" priority />
          </div>
          <h1 className="text-xl font-bold">VJ Piles UG Movies</h1>
        </Link>

        <div className={`flex-1 max-w-xl transition-all ${isSearchFocused ? "ring-2 ring-red-500" : ""} rounded-lg`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search movies, TV shows, adverts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="pl-10 pr-10 bg-gray-800 border-transparent text-white placeholder:text-gray-400 h-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && !hasActiveSubscription && (
            <Link href="/subscribe">
              <Button
                size="sm"
                className="hidden lg:flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
              >
                <Crown className="w-4 h-4" />
                <span className="text-sm font-medium">Subscribe</span>
              </Button>
            </Link>
          )}

          {showInstallButton ? (
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="hidden lg:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-full"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Install App</span>
            </Button>
          ) : (
            <Button
              size="sm"
              className="hidden lg:flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full"
              disabled
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="flex items-center gap-2 rounded-full hover:bg-gray-700">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center relative">
                      <User className="w-4 h-4 text-white" />
                      {hasActiveSubscription && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Pink ring indicator */}
                    <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-pulse"></div>
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 text-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  {hasActiveSubscription && (
                    <div className="flex items-center gap-1 mt-1">
                      <Crown className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">Premium Member</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-gray-700 focus:text-white">
                  <Link href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {!hasActiveSubscription && (
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-gray-700">
                    <Link href="/subscribe" className="flex items-center text-red-500">
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </Link>
                  </DropdownMenuItem>
                )}
                {showInstallButton && (
                  <DropdownMenuItem onClick={handleInstallClick} className="cursor-pointer text-green-600 focus:bg-gray-700 focus:text-green-500">
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </DropdownMenuItem>
                )}
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-gray-700">
                      <Link href="/admin" className="flex items-center text-blue-500">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:bg-gray-700 focus:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-sm font-medium hover:bg-gray-700">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
