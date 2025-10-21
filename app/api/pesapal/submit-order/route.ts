import { type NextRequest, NextResponse } from "next/server"
import {
  PESAPAL_CONFIG,
  generateMerchantReference,
  getPesapalAuthToken,
  getPesapalIpnId,
  type PesapalOrderRequest,
  type PesapalOrderResponse,
} from "@/lib/pesapal"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, planId, amount, duration, planName, userEmail, userName, userPhone } = body

    console.log("[v0] Submit order request received:", {
      userId,
      planId,
      amount,
      duration,
      planName,
      userEmail,
      userName,
      userPhone,
    })

    // Validate required fields
    if (!userId || !planId || !amount || !userEmail) {
      console.error("[v0] Missing required fields:", { userId, planId, amount, userEmail })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Getting auth token...")
    const { token } = await getPesapalAuthToken()
    console.log("[v0] Auth token obtained successfully")

    console.log("[v0] Getting IPN ID...")
    const ipnId = await getPesapalIpnId()
    console.log("[v0] IPN ID obtained successfully:", ipnId)

    // Generate unique merchant reference
    const merchantReference = generateMerchantReference(userId, planId)
    console.log("[v0] Generated merchant reference:", merchantReference)

    // Split user name
    const nameParts = (userName || "User").split(" ")
    const firstName = nameParts[0] || "User"
    const lastName = nameParts.slice(1).join(" ") || "Name"

    // Prepare order request
    const orderRequest: PesapalOrderRequest = {
      id: merchantReference,
      currency: "UGX",
      amount: Number.parseFloat(amount.toString()),
      description: `${planName || "Subscription"} - ${duration} days access`,
      callback_url: PESAPAL_CONFIG.callbackUrl,
      notification_id: ipnId,
      billing_address: {
        email_address: userEmail,
        phone_number: userPhone || "",
        country_code: "UG",
        first_name: firstName,
        last_name: lastName,
      },
    }

    console.log("[v0] Submitting order to Pesapal:", {
      url: `${PESAPAL_CONFIG.baseUrl}/api/Transactions/SubmitOrderRequest`,
      orderRequest,
    })

    // Submit order to Pesapal
    const response = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderRequest),
    })

    console.log("[v0] Pesapal response status:", response.status, response.statusText)

    const responseText = await response.text()
    console.log("[v0] Pesapal response body:", responseText)

    if (!response.ok) {
      console.error("[v0] Order submission failed:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      })
      throw new Error(`Order submission failed: ${response.statusText} - ${responseText}`)
    }

    const data: PesapalOrderResponse = JSON.parse(responseText)
    console.log("[v0] Parsed Pesapal response:", data)

    if (data.status !== "200" || !data.redirect_url) {
      console.error("[v0] Invalid Pesapal response:", data)
      throw new Error(`Failed to create payment order: ${data.error || data.status}`)
    }

    console.log("[v0] Order created successfully:", {
      order_tracking_id: data.order_tracking_id,
      merchant_reference: data.merchant_reference,
    })

    return NextResponse.json({
      success: true,
      order_tracking_id: data.order_tracking_id,
      merchant_reference: data.merchant_reference,
      redirect_url: data.redirect_url,
    })
  } catch (error) {
    console.error("[v0] Order submission error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment order",
      },
      { status: 500 },
    )
  }
}
