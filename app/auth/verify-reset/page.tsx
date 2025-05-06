"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, Check, Youtube, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase } from "@/components/firebase-provider"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"

export default function VerifyResetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const oobCode = searchParams.get("oobCode") // Firebase's reset code from URL

  const { auth, hasValidConfig } = useFirebase()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Verify the reset code when the component mounts
  useEffect(() => {
    if (!auth) {
      setVerifying(false)
      setError("Authentication is not available. Please try again later.")
      return
    }

    if (!oobCode) {
      setVerifying(false)
      setError("No reset code found in the URL. Please make sure you clicked the complete link from your email.")
      return
    }

    const verifyCode = async () => {
      try {
        // Verify the code and get the associated email
        const email = await verifyPasswordResetCode(auth, oobCode)
        setEmail(email)
        setVerifying(false)
      } catch (err: any) {
        console.error("Error verifying reset code:", err)
        setVerifying(false)

        switch (err.code) {
          case "auth/expired-action-code":
            setError("This password reset link has expired. Please request a new one.")
            break
          case "auth/invalid-action-code":
            setError("This password reset link is invalid or has already been used. Please request a new one.")
            break
          case "auth/user-disabled":
            setError("This account has been disabled. Please contact support.")
            break
          case "auth/user-not-found":
            setError("Account not found. The user may have been deleted.")
            break
          case "auth/network-request-failed":
            setError("Network error. Please check your internet connection and try again.")
            break
          default:
            setError("This password reset link is invalid or has expired. Please request a new one.")
        }
      }
    }

    verifyCode()
  }, [auth, oobCode])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !oobCode) {
      setError("Invalid password reset link. Please request a new one.")
      return
    }

    // Enhanced password validation
    if (!newPassword) {
      setError("Please enter a new password.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    // Check for password strength
    const hasLetter = /[A-Za-z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)

    if (!(hasLetter && (hasNumber || hasSpecial))) {
      setError("Password should contain letters and at least numbers or special characters for better security.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Confirm the password reset
      await confirmPasswordReset(auth, oobCode, newPassword)
      setSuccess("Your password has been reset successfully! You can now log in with your new password.")

      // Redirect to login page after a delay
      setTimeout(() => {
        router.push("/auth")
      }, 3000)
    } catch (err: any) {
      console.error("Password reset error:", err)

      switch (err.code) {
        case "auth/expired-action-code":
          setError("This password reset link has expired. Please request a new one.")
          break
        case "auth/invalid-action-code":
          setError("This password reset link is invalid. Please request a new one.")
          break
        case "auth/user-disabled":
          setError("This account has been disabled. Please contact support.")
          break
        case "auth/user-not-found":
          setError("Account not found. The user may have been deleted.")
          break
        case "auth/weak-password":
          setError("Please choose a stronger password with at least 6 characters.")
          break
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection and try again.")
          break
        default:
          setError(err.message || "Failed to reset password. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              {verifying
                ? "Verifying your reset link..."
                : email
                  ? `Create a new password for ${email}`
                  : "Enter your new password below"}
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
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                  <div className="mt-2">Redirecting to login page...</div>
                </AlertDescription>
              </Alert>
            )}

            {verifying ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : email && !success ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            ) : !success ? (
              <div className="text-center py-4">
                <p className="mb-4">The password reset link is invalid or has expired.</p>
                <Button asChild variant="outline">
                  <Link href="/auth/reset-password">Request New Reset Link</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
          {!success && (
            <CardFooter className="flex justify-start">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
