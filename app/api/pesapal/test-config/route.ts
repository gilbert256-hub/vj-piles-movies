import { NextResponse } from "next/server"
import { PESAPAL_CONFIG } from "@/lib/pesapal"

export async function GET() {
  return NextResponse.json({
    environment: process.env.NEXT_PUBLIC_PESAPAL_ENV || "sandbox",
    baseUrl: PESAPAL_CONFIG.baseUrl,
    hasConsumerKey: !!PESAPAL_CONFIG.consumerKey,
    hasConsumerSecret: !!PESAPAL_CONFIG.consumerSecret,
    consumerKeyLength: PESAPAL_CONFIG.consumerKey?.length || 0,
    consumerSecretLength: PESAPAL_CONFIG.consumerSecret?.length || 0,
    consumerKeyPrefix: PESAPAL_CONFIG.consumerKey?.substring(0, 10) || "NOT SET",
    callbackUrl: PESAPAL_CONFIG.callbackUrl,
    ipnUrl: PESAPAL_CONFIG.ipnUrl,
    envVars: {
      NEXT_PUBLIC_PESAPAL_ENV: process.env.NEXT_PUBLIC_PESAPAL_ENV || "not set",
      PESAPAL_CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY ? "SET" : "NOT SET",
      PESAPAL_CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET ? "SET" : "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "not set",
    },
  })
}
