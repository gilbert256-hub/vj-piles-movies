"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, sum } from "firebase/firestore"

async function getWalletBalance() {
  const subscriptionsRef = collection(db, "subscriptions");
  const q = query(subscriptionsRef, where("status", "==", "completed"));
  const querySnapshot = await getDocs(q);
  let total = 0;
  querySnapshot.forEach((doc) => {
    total += doc.data().amount;
  });
  return total;
}

export default function WalletManagementPage() {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [msisdn, setMsisdn] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    async function fetchBalance() {
      try {
        const walletBalance = await getWalletBalance()
        setBalance(walletBalance)
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
        toast.error("Failed to fetch wallet balance.")
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(withdrawalAmount)

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid withdrawal amount.")
      return
    }

    if (amount > balance) {
      toast.error("Withdrawal amount cannot exceed the available balance.")
      return
    }
    
    if (!msisdn || !/^\+256\d{9}$/.test(msisdn)) {
      toast.error("Please enter a valid phone number in the format +256xxxxxxxxx.")
      return
    }

    setIsWithdrawing(true)
    toast.info("Processing withdrawal...")

    try {
      // This is where you would call your backend endpoint
      // which then calls the Relworx API.
      // We are mocking the API call here.
      console.log("Withdrawing", { amount, msisdn })
      // Example of backend call
      // const response = await fetch("/api/admin/withdraw", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ amount, msisdn, currency: "UGX" }),
      // });
      //
      // if (!response.ok) {
      //   throw new Error("Withdrawal failed");
      // }
      
      // Mocking a successful withdrawal after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));


      toast.success("Withdrawal initiated successfully!")
      setBalance(prev => prev - amount)
      setWithdrawalAmount("")
      setMsisdn("")
    } catch (error) {
      console.error("Withdrawal error:", error)
      toast.error("An error occurred during withdrawal.")
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (loading) {
    return <div>Loading wallet...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Wallet Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {balance.toLocaleString("en-US", { style: "currency", currency: "UGX" })}
          </p>
          <p className="text-sm text-muted-foreground">
            This balance reflects the total from successful user subscriptions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="msisdn">Recipient Phone Number</Label>
              <Input
                id="msisdn"
                type="text"
                placeholder="+256701234567"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                disabled={isWithdrawing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 500.00"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                disabled={isWithdrawing}
              />
            </div>
            <Button type="submit" disabled={isWithdrawing}>
              {isWithdrawing ? "Processing..." : "Withdraw"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
