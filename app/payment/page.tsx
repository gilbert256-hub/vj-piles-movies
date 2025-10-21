"use client"

import type React from "react"
import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Smartphone, Loader2, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

// --- Helper function to call the backend ---
async function callApi(endpoint: string, method: "POST" | "GET", body?: any) {
  const baseUrl = "https://lucky-sun-a4fc.globalnexussystem-tech.workers.dev"
  const url = `${baseUrl}${endpoint}`

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    }
    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || "API request failed")
    }
    return data
  } catch (err: any) {
    console.error(`API Error at ${endpoint}:`, err)
    return { success: false, message: err.message }
  }
}

// --- Payment Content Component ---
function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateSubscription } = useAuth()

  // --- State Management ---
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")
  const [pollingStatus, setPollingStatus] = useState<string | null>(null)
  const [internalReference, setInternalReference] = useState<string | null>(null)

  // --- Get URL parameters ---
  const planId = searchParams.get("plan")
  const amount = searchParams.get("amount")
  const duration = searchParams.get("duration")
  const planName = searchParams.get("name")

  // --- Redirect if user or plan info is missing ---
  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/subscribe")
    } else if (!planId || !amount || !duration || !planName) {
      router.push("/subscribe")
    }
  }, [user, router, planId, amount, duration, planName])

  // --- Payment Status Polling ---
  const checkPaymentStatus = useCallback(async () => {
    if (!internalReference) return

    setPollingStatus("Verifying payment status...")
    const data = await callApi(`/api/request-status?internal_reference=${internalReference}`, "GET")

    if (data.success && data.relworx?.request_status === "success") {
      setPollingStatus("Payment successful! Updating your subscription...")
      await updateSubscription(planName!, Number(duration))
      setPollingStatus("Subscription updated successfully! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 2000)
      return "stop"
    } else if (data.success && data.relworx?.request_status === "failed") {
      setError("Payment failed or was rejected. Please try again.")
      return "stop"
    }
    // Continue polling if status is pending
    return "continue"
  }, [internalReference, planName, duration, updateSubscription, router])

  useEffect(() => {
    if (!internalReference) return

    const intervalId = setInterval(async () => {
      const result = await checkPaymentStatus()
      if (result === "stop") {
        clearInterval(intervalId)
        setInternalReference(null) // Reset for next transaction
        setIsProcessing(false)
      }
    }, 5000) // Poll every 5 seconds

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId)
      if (pollingStatus !== "Subscription updated successfully! Redirecting...") {
        setError("Payment verification timed out. Please check your transaction history or contact support.")
        setIsProcessing(false)
        setInternalReference(null)
      }
    }, 120000) // 2-minute timeout

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [internalReference, checkPaymentStatus, pollingStatus])

  // --- Handle Payment Submission ---
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setPollingStatus(null)
    if (!phoneNumber) {
      setError("Please enter your phone number.")
      return
    }

    setIsProcessing(true)

    // Format phone number
    let msisdn = phoneNumber
    if (msisdn.startsWith("0")) {
      msisdn = `+256${msisdn.substring(1)}`
    } else if (!msisdn.startsWith("+")) {
      msisdn = `+${msisdn}`
    }

    const paymentData = {
      msisdn,
      amount: Number(amount),
      description: `Payment for ${planName} plan`,
    }

    setPollingStatus("Sending payment request...")
    const result = await callApi("/api/deposit", "POST", paymentData)

    if (result.success && result.internal_reference) {
      setInternalReference(result.internal_reference)
      setPollingStatus("Request sent! Please approve the transaction on your phone.")
    } else {
      setError(result.message || "Failed to initiate payment. Please check the phone number and try again.")
      setIsProcessing(false)
    }
  }

  if (!user || !planId || !amount || !duration || !planName) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  const isSuccess = pollingStatus?.startsWith("Subscription updated")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Image src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8f0dfd43a_VjPilesUg55.png" alt="Website Logo" width={150} height={150} className="mx-auto mb-4 rounded-full" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Complete Your Subscription</h1>
          <p className="text-gray-400">Pay securely with Ugandan Mobile Money.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Plan:</span>
                <span className="font-semibold text-white">{planName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Duration:</span>
                <span className="font-semibold text-white">{duration} days</span>
              </div>
              <div className="border-t border-gray-800 pt-4 flex justify-between text-lg">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-red-500 font-bold">{Number.parseInt(amount).toLocaleString()} UGX</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription className="text-gray-400">Enter your phone number for mobile money payment.</CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center text-green-400 space-y-4 p-4">
                  <CheckCircle className="w-12 h-12 mx-auto" />
                  <h3 className="text-xl font-bold">Payment Successful!</h3>
                  <p>Your subscription is now active. You will be redirected shortly.</p>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number (MTN or Airtel)</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0701234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>{error}</div>
                    </div>
                  )}

                  {pollingStatus && (
                    <div className="bg-blue-500/10 border border-blue-500/50 text-blue-300 px-4 py-3 rounded text-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <div>{pollingStatus}</div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {isProcessing ? "Processing..." : `Pay ${Number.parseInt(amount).toLocaleString()} UGX`}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Secure mobile money payment powered by Relworx</p>
        </div>
      </div>
    </div>
  )
}

// --- Main Page Component ---
export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
