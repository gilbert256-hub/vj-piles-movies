import { NextResponse } from "next/server"
import { getPesapalIpnId } from "@/lib/pesapal"

export async function POST() {
  try {
    console.log("[v0] IPN registration endpoint called")
    const ipnId = await getPesapalIpnId()

    return NextResponse.json({
      success: true,
      ipn_id: ipnId,
    })
  } catch (error) {
    console.error("[v0] IPN registration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to register IPN URL",
      },
      { status: 500 },
    )
  }
}
