"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function PaymentFailedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-gray-900/50 border-gray-800 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <CardTitle className="text-white text-2xl">Payment Failed</CardTitle>
          <CardDescription className="text-gray-400">We couldn't process your payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300">
            Your payment was not successful. Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/subscribe")} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="flex-1 border-gray-700 text-white hover:bg-gray-800"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
