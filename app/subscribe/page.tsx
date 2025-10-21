"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const subscriptionPlans = [
  {
    id: "2days",
    name: "2 Days Access",
    price: 5000,
    duration: 2,
    description: "Perfect for a weekend binge",
    features: ["Unlimited streaming", "HD quality", "All movies & series", "Mobile & desktop access"],
  },
  {
    id: "1week",
    name: "1 Week Access",
    price: 10000,
    duration: 7,
    description: "Great for weekly entertainment",
    features: [
      "Unlimited streaming",
      "HD quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
    ],
    popular: true,
  },
  {
    id: "2weeks",
    name: "2 Weeks Access",
    price: 17000,
    duration: 14,
    description: "Extended viewing pleasure",
    features: [
      "Unlimited streaming",
      "HD quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
      "Priority support",
    ],
  },
  {
    id: "1month",
    name: "1 Month Access",
    price: 30000,
    duration: 30,
    description: "Full month of entertainment",
    features: [
      "Unlimited streaming",
      "Full HD quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "3months",
    name: "3 Months Access",
    price: 70000,
    duration: 90,
    description: "Best value for regular viewers",
    features: [
      "Unlimited streaming",
      "Full HD quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
      "Priority support",
      "Early access to new releases",
    ],
  },
  {
    id: "6months",
    name: "6 Months Access",
    price: 120000,
    duration: 180,
    description: "Half year of unlimited access",
    features: [
      "Unlimited streaming",
      "4K quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
      "Priority support",
      "Early access to new releases",
      "Exclusive content",
    ],
  },
  {
    id: "1year",
    name: "1 Year Access",
    price: 200000,
    duration: 365,
    description: "Ultimate annual subscription",
    features: [
      "Unlimited streaming",
      "4K quality",
      "All movies & series",
      "Mobile & desktop access",
      "Download option",
      "24/7 Priority support",
      "Early access to new releases",
      "Exclusive content",
      "Special events access",
    ],
    popular: true,
  },
]

export default function SubscribePage() {
  const router = useRouter()
  const { user, hasActiveSubscription } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      router.push("/login?redirect=/subscribe")
      return
    }
    setSelectedPlan(planId)
    const plan = subscriptionPlans.find((p) => p.id === planId)
    if (plan) {
      router.push(
        `/payment?plan=${planId}&amount=${plan.price}&duration=${plan.duration}&name=${encodeURIComponent(plan.name)}`,
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock unlimited access to thousands of movies and series. Pay with Mobile Money.
          </p>
          {hasActiveSubscription && (
            <div className="mt-4 inline-block bg-green-500/20 text-green-400 px-6 py-2 rounded-full">
              You currently have an active subscription
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-all ${
                plan.popular ? "ring-2 ring-red-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price.toLocaleString()}</span>
                  <span className="text-gray-400 ml-2">UGX</span>
                  <div className="text-sm text-gray-500 mt-1">/ {plan.duration} days</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? "Processing..." : "Subscribe Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>All plans include instant activation after payment confirmation</p>
          <p className="mt-2">Secure payment via Mobile Money (MTN, Airtel)</p>
        </div>
      </div>
    </div>
  )
}
