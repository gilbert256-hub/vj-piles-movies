"use client"

import { useEffect } from "react"

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("[v0] Service Worker registered successfully:", registration.scope)
        })
        .catch((error) => {
          console.log("[v0] Service Worker registration failed:", error)
        })
    }
  }, [])

  return null
}
