"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const orderTrackingId = searchParams.get("orderTrackingId")

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderTrackingId) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch(`/api/pesapal/transaction-status?orderTrackingId=${orderTrackingId}`)
        const data = await response.json()

        if (data.success) {
          setPaymentDetails(data)
        }
      } catch (error) {
        console.error("Error verifying payment:", error)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [orderTrackingId])

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-gray-900/50 border-gray-800 text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
            <p className="text-white">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-gray-900/50 border-gray-800 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
          <CardDescription className="text-gray-400">Your subscription has been activated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentDetails && (
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white">{paymentDetails.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white">{paymentDetails.amount?.toLocaleString()} UGX</span>
              </div>
              {paymentDetails.confirmation_code && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Confirmation:</span>
                  <span className="text-white font-mono text-xs">{paymentDetails.confirmation_code}</span>
                </div>
              )}
            </div>
          )}
          <p className="text-gray-300">You now have full access to all movies and series!</p>
          <Button onClick={() => router.push("/")} className="w-full bg-red-600 hover:bg-red-700 text-white">
            Start Watching
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
