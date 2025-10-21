import { type NextRequest, NextResponse } from "next/server"

// Callback handler - redirects user after payment
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const orderMerchantReference = searchParams.get("OrderMerchantReference")
    const orderNotificationType = searchParams.get("OrderNotificationType")

    console.log("[v0] Callback received:", { orderTrackingId, orderMerchantReference, orderNotificationType })

    // Redirect to payment success page with tracking ID
    const redirectUrl = new URL("/payment/success", request.url)
    if (orderTrackingId) {
      redirectUrl.searchParams.set("orderTrackingId", orderTrackingId)
    }
    if (orderMerchantReference) {
      redirectUrl.searchParams.set("merchantReference", orderMerchantReference)
    }

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Callback handler error:", error)
    return NextResponse.redirect(new URL("/payment/failed", request.url))
  }
}
