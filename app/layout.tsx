import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import RegisterServiceWorker from "./register-sw"

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "VJ Piles UG Movies - Watch Movies Free Online, Watch TV Series Online",
  description:
    "VJ Piles UG Movies lets you watch movies and TV series online and for free. Download the app to watch the latest movies and popular TV series in HD quality.",
  keywords:
    "VJ Piles UG Movies, Find ratings and free for the newest movie and TV shows. Trending Movies Hub, free movies, movie download, movies online, watch TV, TV shows online, watch TV shows, stream movies, stream tv, instant streaming, watch online, movies, watch TV online, full length movies, 2025 movies, Action movies, horror movies",
  manifest: "/manifest.json",
  themeColor: "#4A1942",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VJ Piles UG Movies",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4A1942" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VJ Piles UG Movies" />
        <link rel="apple-touch-icon" href="/images/vj-piles-logo.jpg" />
      </head>
      <body className="antialiased font-sans">
        <RegisterServiceWorker />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
