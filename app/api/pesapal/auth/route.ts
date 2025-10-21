import { NextResponse } from "next/server"
import { getPesapalAuthToken } from "@/lib/pesapal"

export async function POST() {
  try {
    console.log("[v0] Auth endpoint called")
    const { token, expiryDate } = await getPesapalAuthToken()

    return NextResponse.json({
      success: true,
      token,
      expiryDate,
    })
  } catch (error) {
    console.error("[v0] Pesapal auth error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to authenticate with Pesapal",
      },
      { status: 500 },
    )
  }
}
