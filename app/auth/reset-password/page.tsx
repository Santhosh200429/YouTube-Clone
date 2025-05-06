"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Check, Youtube, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase } from "@/components/firebase-provider"
import { sendPasswordResetEmail } from "firebase/auth"

export default function ResetPasswordPage() {
  const { auth, hasValidConfig } = useFirebase()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      setError("Firebase is not properly configured. Please check your environment variables.")
      return
    }

    // Add validation
    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Remove the custom URL configuration to use Firebase's default URL
      await sendPasswordResetEmail(auth, email)

      setSuccess("Password reset email sent! Check your inbox for further instructions.")
      setEmail("") // Clear the email field after successful submission
    } catch (err: any) {
      console.error("Password reset error:", err)

      // Provide more specific error messages based on Firebase error codes
      switch (err.code) {
        case "auth/invalid-email":
          setError("Invalid email address format.")
          break
        case "auth/user-not-found":
          setError("No account found with this email address.")
          break
        case "auth/too-many-requests":
          setError("Too many requests. Please try again later.")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.")
          break
        case "auth/unauthorized-continue-uri":
          setError("Domain not authorized. Please contact support or try using a different device/browser.")
          break
        case "auth/missing-android-pkg-name":
        case "auth/missing-continue-uri":
        case "auth/missing-ios-bundle-id":
        case "auth/invalid-continue-uri":
          setError("Configuration error. Please contact support.")
          break
        default:
          setError(err.message || "Failed to send password reset email. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 10000) // Clear success message after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [success])

  // If Firebase is not configured, show a configuration message
  if (!hasValidConfig) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration Required</CardTitle>
              <CardDescription>Firebase authentication is not properly configured.</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Firebase Configuration</AlertTitle>
                <AlertDescription>
                  To use authentication features, you need to set up Firebase environment variables.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center mb-4">
            <Youtube className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-2xl font-bold">YouTube Clone</span>
          </Link>
          <p className="text-muted-foreground text-center">Reset your password to regain access to your account.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-600 dark:text-green-400">Success</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href="/auth">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
