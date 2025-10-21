import { type NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

// IPN handler - receives payment notifications from Pesapal
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const orderMerchantReference = searchParams.get("OrderMerchantReference")
    const orderNotificationType = searchParams.get("OrderNotificationType")

    console.log("[v0] IPN received:", { orderTrackingId, orderMerchantReference, orderNotificationType })

    if (!orderTrackingId || !orderMerchantReference) {
      return NextResponse.json(
        {
          orderNotificationType: orderNotificationType || "IPNCHANGE",
          orderTrackingId: orderTrackingId || "",
          orderMerchantReference: orderMerchantReference || "",
          status: 500,
        },
        { status: 400 },
      )
    }

    // Get transaction status from Pesapal
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/pesapal/transaction-status?orderTrackingId=${orderTrackingId}`,
    )
    const statusData = await statusResponse.json()

    console.log("[v0] Transaction status:", statusData)

    // Extract user ID from merchant reference (format: SUB-{userId}-{planId}-{timestamp})
    const userId = orderMerchantReference.split("-")[1]

    // Extract duration from merchant reference or use default
    const planId = orderMerchantReference.split("-")[2]
    let duration = 30 // default

    // Map plan IDs to durations
    const planDurations: Record<string, number> = {
      "2days": 2,
      "1week": 7,
      "2weeks": 14,
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365,
    }

    if (planId && planDurations[planId]) {
      duration = planDurations[planId]
    }

    // If payment is completed (status_code = 1), update user subscription
    if (statusData.success && statusData.status_code === 1) {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + duration)

      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        subscription: {
          plan: planId,
          expiresAt: Timestamp.fromDate(expiresAt),
          isActive: true,
          paymentMethod: statusData.payment_method,
          confirmationCode: statusData.confirmation_code,
        },
      })

      console.log("[v0] Subscription updated for user:", userId)
    }

    // Respond to Pesapal
    return NextResponse.json({
      orderNotificationType: orderNotificationType || "IPNCHANGE",
      orderTrackingId,
      orderMerchantReference,
      status: 200,
    })
  } catch (error) {
    console.error("[v0] IPN handler error:", error)
    return NextResponse.json(
      {
        orderNotificationType: "IPNCHANGE",
        orderTrackingId: "",
        orderMerchantReference: "",
        status: 500,
      },
      { status: 500 },
    )
  }
}
