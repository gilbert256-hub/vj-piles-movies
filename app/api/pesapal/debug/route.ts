import { NextResponse } from "next/server"
import { PESAPAL_CONFIG } from "@/lib/pesapal"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_PESAPAL_ENV: process.env.NEXT_PUBLIC_PESAPAL_ENV || "sandbox",
      PESAPAL_CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY
        ? `${process.env.PESAPAL_CONSUMER_KEY.substring(0, 10)}...${process.env.PESAPAL_CONSUMER_KEY.substring(process.env.PESAPAL_CONSUMER_KEY.length - 4)}`
        : "NOT SET",
      PESAPAL_CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET
        ? `${process.env.PESAPAL_CONSUMER_SECRET.substring(0, 10)}...${process.env.PESAPAL_CONSUMER_SECRET.substring(process.env.PESAPAL_CONSUMER_SECRET.length - 4)}`
        : "NOT SET",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    }

    // Check config
    const configCheck = {
      baseUrl: PESAPAL_CONFIG.baseUrl,
      callbackUrl: PESAPAL_CONFIG.callbackUrl,
      ipnUrl: PESAPAL_CONFIG.ipnUrl,
      hasConsumerKey: !!PESAPAL_CONFIG.consumerKey,
      hasConsumerSecret: !!PESAPAL_CONFIG.consumerSecret,
      consumerKeyLength: PESAPAL_CONFIG.consumerKey.length,
      consumerSecretLength: PESAPAL_CONFIG.consumerSecret.length,
    }

    // Test authentication endpoint
    const authUrl = `${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`
    const authPayload = {
      consumer_key: PESAPAL_CONFIG.consumerKey,
      consumer_secret: PESAPAL_CONFIG.consumerSecret,
    }

    console.log("[v0 Debug] Testing Pesapal authentication...")
    console.log("[v0 Debug] Auth URL:", authUrl)

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(authPayload),
    })

    const responseText = await response.text()
    const isHtml = responseText.trim().startsWith("<")

    let parsedResponse = null
    if (!isHtml) {
      try {
        parsedResponse = JSON.parse(responseText)
      } catch (e) {
        // Could not parse
      }
    }

    const testResult = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      isHtmlResponse: isHtml,
      responsePreview: responseText.substring(0, 500),
      parsedResponse: parsedResponse,
    }

    const hasApiError = parsedResponse?.error || parsedResponse?.status === "500"
    const isSuccess = response.ok && !hasApiError

    return NextResponse.json({
      success: isSuccess,
      environment: envCheck,
      config: configCheck,
      authTest: testResult,
      diagnosis: isSuccess
        ? "✅ Pesapal authentication successful!"
        : hasApiError
          ? `❌ Pesapal API Error: ${parsedResponse?.error?.code || "Unknown error"}. ${parsedResponse?.error?.message || "Your API credentials (Consumer Key/Secret) are invalid or don't match the environment (sandbox/production). Please verify your credentials in the Pesapal dashboard."}`
          : isHtml
            ? "❌ Pesapal returned an HTML error page. This usually means invalid credentials or wrong environment. Please verify your PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET match your Pesapal account environment (sandbox/production)."
            : "❌ Pesapal authentication failed. Check the response details above.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
