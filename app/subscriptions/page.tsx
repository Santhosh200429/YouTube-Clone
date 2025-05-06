"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { onAuthStateChanged, type User } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase" // Import auth from our firebase.ts file

export default function SubscriptionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      if (!auth) {
        setLoading(false)
        return
      }

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Firebase auth error:", error)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="container py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Subscriptions</h1>
        <p className="mb-6">Sign in to see updates from your favorite YouTube channels</p>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Subscriptions</h1>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Your subscriptions</h2>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>

        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-2">No subscriptions found</p>
          <p className="text-sm text-muted-foreground mb-4">Channels you subscribe to will show up here</p>
          <Button asChild variant="outline">
            <Link href="/">Browse channels</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
