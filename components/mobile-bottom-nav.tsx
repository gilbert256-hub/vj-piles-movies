"use client"

import { Home, Film, Tv, User, Crown, Download, Settings, UserPlus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { hasActiveSubscription, user } = useAuth()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const navItems = user
    ? [
        { icon: Home, label: "Home", href: "/" },
        { icon: Film, label: "Movies", href: "/movies" },
        { icon: Tv, label: "TV", href: "/tv-series" },
        ...(user?.isAdmin ? [{ icon: Settings, label: "Admin", href: "/admin" }] : []),
        { icon: User, label: "Profile", href: "/profile" },
      ]
    : [
        { icon: Home, label: "Home", href: "/" },
        { icon: Film, label: "Movies", href: "/movies" },
        { icon: Tv, label: "TV", href: "/tv-series" },
        { icon: UserPlus, label: "Account", href: "#", action: () => setShowAuthDialog(true) },
      ]

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
      console.log("User accepted the install prompt")
    }

    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  return (
    <>
      {showInstallButton && (
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all animate-bounce"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm font-semibold">Install App</span>
          </button>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isProfile = item.href === "/profile"
            const isAdmin = item.href === "/admin"
            const isAccount = item.label === "Account"

            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center gap-1 px-3 py-2 transition-colors relative"
                >
                  <div
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                      isActive ? "bg-accent" : "hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted"}`} />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-muted"}`}>
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 transition-colors relative"
              >
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    isActive ? (isAdmin ? "bg-blue-500/20" : "bg-accent") : "hover:bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? (isAdmin ? "text-blue-400" : "text-primary") : "text-muted"}`}
                  />
                  {isProfile && hasActiveSubscription && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? (isAdmin ? "text-blue-400" : "text-primary") : "text-muted"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome to VJ Piles UG Movies</DialogTitle>
            <DialogDescription className="text-center">Choose an option to continue</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/signup" onClick={() => setShowAuthDialog(false)}>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold py-6">
                Create New Account
              </Button>
            </Link>
            <Link href="/login" onClick={() => setShowAuthDialog(false)}>
              <Button variant="outline" className="w-full text-base font-semibold py-6 bg-transparent">
                Login to Existing Account
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
