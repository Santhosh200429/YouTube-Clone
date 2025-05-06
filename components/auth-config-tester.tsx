"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, AlertTriangle } from "lucide-react"
import { useFirebase } from "@/components/firebase-provider"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { getCurrentDomain, getDomainsToAuthorize, isPreviewEnvironment } from "@/lib/auth-utils"

export function AuthConfigTester() {
  const { auth, hasValidConfig } = useFirebase()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: string[]
    error?: any
  } | null>(null)

  const testGoogleSignIn = async () => {
    if (!auth) {
      setResult({
        success: false,
        message: "Firebase auth is not available",
        details: ["Check your Firebase configuration"],
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Create a fresh GoogleAuthProvider instance
      const googleProvider = new GoogleAuthProvider()

      // Add basic scopes
      googleProvider.addScope("email")
      googleProvider.addScope("profile")

      // Set custom parameters
      googleProvider.setCustomParameters({
        prompt: "select_account",
      })

      // Try to sign in with popup
      await signInWithPopup(auth, googleProvider)

      // If we get here, it worked!
      setResult({
        success: true,
        message: "Google Sign-In is configured correctly!",
        details: [
          "Authentication is working properly",
          "Domain is authorized in Firebase",
          "Google Sign-In is enabled in Firebase",
        ],
      })

      // Sign out immediately since this is just a test
      await auth.signOut()
    } catch (error: any) {
      console.error("Google sign-in test error:", error)

      let message = "Google Sign-In configuration test failed"
      let details: string[] = []

      // Handle specific error codes
      if (error.code === "auth/unauthorized-domain") {
        const currentDomain = getCurrentDomain()
        const domainsToAuthorize = getDomainsToAuthorize()

        message = "Domain not authorized for Google Sign-In"
        details = [
          `Your current domain (${currentDomain}) is not authorized in Firebase`,
          "You need to add the following domains to Firebase console:",
          ...domainsToAuthorize.map((d) => `- ${d}`),
        ]
      } else if (error.code === "auth/popup-closed-by-user") {
        message = "Sign-in popup was closed"
        details = ["You closed the popup before completing sign-in", "This is not a configuration error"]
      } else if (error.code === "auth/popup-blocked") {
        message = "Sign-in popup was blocked"
        details = ["Your browser blocked the popup", "Please allow popups for this site"]
      } else if (error.code === "auth/operation-not-allowed") {
        message = "Google Sign-In is not enabled in Firebase"
        details = [
          "You need to enable Google as a sign-in provider in Firebase console",
          "Go to Authentication > Sign-in method > Google",
        ]
      } else {
        details = [error.message || "Unknown error occurred"]
      }

      setResult({
        success: false,
        message,
        details,
        error,
      })
    } finally {
      setLoading(false)
    }
  }

  const isPreview = isPreviewEnvironment()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Sign-In Configuration Tester</CardTitle>
        <CardDescription>Test if your Google Sign-In configuration is working properly</CardDescription>
      </CardHeader>
      <CardContent>
        {isPreview && !process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Preview Environment Detected</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                You're in a preview environment. Google Sign-In may not work due to domain restrictions.
              </p>
              <p className="text-sm">Consider using the Firebase Emulator for testing in preview environments.</p>
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert
            variant={result.success ? "default" : "destructive"}
            className={`mb-4 ${result.success ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" : ""}`}
          >
            {result.success ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle className={result.success ? "text-green-600 dark:text-green-400" : ""}>
              {result.message}
            </AlertTitle>
            <AlertDescription className={result.success ? "text-green-700 dark:text-green-300" : ""}>
              {result.details && result.details.length > 0 && (
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {result.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span>Firebase Configuration</span>
            <span className={hasValidConfig ? "text-green-600" : "text-red-600"}>
              {hasValidConfig ? "Valid" : "Invalid"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Current Domain</span>
            <span className="font-mono text-sm">{getCurrentDomain() || "Unknown"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Environment Type</span>
            <span className={isPreview ? "text-amber-600" : "text-green-600"}>
              {isPreview ? "Preview/Development" : "Production"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Firebase Emulator</span>
            <span
              className={process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ? "text-green-600" : "text-gray-500"}
            >
              {process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testGoogleSignIn} disabled={loading || !hasValidConfig} className="w-full">
          {loading ? "Testing..." : "Test Google Sign-In"}
        </Button>
      </CardFooter>
    </Card>
  )
}
