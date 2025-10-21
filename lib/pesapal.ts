// Pesapal API configuration and helper functions

function normalizeUrl(url: string): string {
  if (!url) return ""
  // If URL doesn't start with http:// or https://, add https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`
  }
  return url
}

function cleanCredential(value: string): string {
  if (!value) return ""
  // Remove surrounding quotes if present
  return value.replace(/^["']|["']$/g, "")
}

function getPesapalBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_PESAPAL_ENV || ""

  // If env is a full URL, use it directly
  if (env.startsWith("http://") || env.startsWith("https://")) {
    return env
  }

  // Otherwise, check if it's "production" or default to sandbox
  return env === "production" ? "https://pay.pesapal.com/v3" : "https://cybqa.pesapal.com/pesapalv3"
}

export const PESAPAL_CONFIG = {
  baseUrl: getPesapalBaseUrl(),
  consumerKey: cleanCredential(process.env.PESAPAL_CONSUMER_KEY || ""),
  consumerSecret: cleanCredential(process.env.PESAPAL_CONSUMER_SECRET || ""),
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)}/api/pesapal/callback`
    : "http://localhost:3000/api/pesapal/callback",
  ipnUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)}/api/pesapal/ipn`
    : "http://localhost:3000/api/pesapal/ipn",
}

export interface PesapalAuthResponse {
  token: string
  expiryDate: string
  error: any
  status: string
  message: string
}

export interface PesapalIPNResponse {
  url: string
  created_date: string
  ipn_id: string
  notification_type: number
  ipn_notification_type_description: string
  ipn_status: number
  ipn_status_description: string
  error: any
  status: string
}

export interface PesapalOrderRequest {
  id: string // Merchant reference (unique)
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    phone_number: string
    country_code: string
    first_name: string
    middle_name?: string
    last_name: string
    line_1?: string
    line_2?: string
    city?: string
    state?: string
    postal_code?: string
    zip_code?: string
  }
}

export interface PesapalOrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error: any
  status: string
}

export interface PesapalTransactionStatus {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string
  call_back_url: string
  status_code: number // 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
  merchant_reference: string
  payment_status_code: string
  currency: string
  error: any
  status: string
}

// Helper to check if token is expired
export function isTokenExpired(expiryDate: string): boolean {
  return new Date(expiryDate) <= new Date()
}

// Helper to generate unique merchant reference
export function generateMerchantReference(userId: string, planId: string): string {
  const timestamp = Date.now()
  return `SUB-${userId.slice(0, 8)}-${planId}-${timestamp}`
}

// Token cache for auth tokens
let tokenCache: { token: string; expiryDate: string } | null = null

export async function getPesapalAuthToken(): Promise<{ token: string; expiryDate: string }> {
  // Check if we have a valid cached token
  if (tokenCache && new Date(tokenCache.expiryDate) > new Date()) {
    console.log("[v0] Using cached Pesapal token")
    return tokenCache
  }

  console.log("[v0] Requesting new Pesapal token")

  if (!PESAPAL_CONFIG.consumerKey || !PESAPAL_CONFIG.consumerSecret) {
    throw new Error(
      "Pesapal credentials not configured. Please set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET environment variables.",
    )
  }

  const authUrl = `${PESAPAL_CONFIG.baseUrl}/api/Auth/RequestToken`
  const authPayload = {
    consumer_key: PESAPAL_CONFIG.consumerKey,
    consumer_secret: PESAPAL_CONFIG.consumerSecret,
  }

  console.log("[v0] Auth request to:", authUrl)
  console.log("[v0] Environment:", process.env.NEXT_PUBLIC_PESAPAL_ENV || "sandbox")
  console.log("[v0] Consumer key length:", PESAPAL_CONFIG.consumerKey.length)

  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(authPayload),
  })

  console.log("[v0] Auth response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Pesapal auth failed:", errorText)
    throw new Error(`Pesapal auth failed: ${response.status} - ${errorText}`)
  }

  const data: PesapalAuthResponse = await response.json()

  if (data.status !== "200" || !data.token) {
    console.error("[v0] Invalid auth response:", data)
    throw new Error(data.message || "Failed to authenticate with Pesapal")
  }

  // Cache the token
  tokenCache = {
    token: data.token,
    expiryDate: data.expiryDate,
  }

  console.log("[v0] Token cached successfully, expires:", data.expiryDate)

  return tokenCache
}

// IPN ID cache
let ipnIdCache: string | null = null

export async function getPesapalIpnId(): Promise<string> {
  // Return cached IPN ID if available
  if (ipnIdCache) {
    console.log("[v0] Using cached IPN ID")
    return ipnIdCache
  }

  console.log("[v0] Registering new IPN URL")

  // Get auth token
  const { token } = await getPesapalAuthToken()

  // Register IPN URL
  const response = await fetch(`${PESAPAL_CONFIG.baseUrl}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: PESAPAL_CONFIG.ipnUrl,
      ipn_notification_type: "GET",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] IPN registration failed:", errorText)
    throw new Error(`IPN registration failed: ${response.status} - ${errorText}`)
  }

  const data: PesapalIPNResponse = await response.json()

  if (data.status !== "200" || !data.ipn_id) {
    console.error("[v0] Invalid IPN response:", data)
    throw new Error("Failed to register IPN URL")
  }

  // Cache the IPN ID
  ipnIdCache = data.ipn_id
  console.log("[v0] IPN ID cached successfully:", ipnIdCache)

  return ipnIdCache
}
