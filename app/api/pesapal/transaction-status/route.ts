import { type NextRequest, NextResponse } from "next/server"
import { PESAPAL_CONFIG, type PesapalTransactionStatus } from "@/lib/pesapal"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderTrackingId = searchParams.get("orderTrackingId")

    if (!orderTrackingId) {
      return NextResponse.json({ success: false, error: "Order tracking ID is required" }, { status: 400 })
    }

    // Get auth token
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/pesapal/auth`, {
      method: "POST",
    })
    const authData = await authResponse.json()

    if (!authData.success || !authData.token) {
      throw new Error("Failed to get auth token")
    }

    // Get transaction status
    const response = await fetch(
      `${PESAPAL_CONFIG.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.token}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Transaction status check failed: ${response.statusText}`)
    }

    const data: PesapalTransactionStatus = await response.json()

    return NextResponse.json({
      success: true,
      status_code: data.status_code,
      payment_status: data.payment_status_description,
      payment_method: data.payment_method,
      amount: data.amount,
      confirmation_code: data.confirmation_code,
      merchant_reference: data.merchant_reference,
      description: data.description,
    })
  } catch (error) {
    console.error("Transaction status error:", error)
    return NextResponse.json({ success: false, error: "Failed to check transaction status" }, { status: 500 })
  }
}
