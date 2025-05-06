"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, Check, LogOut, Youtube, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirebase } from "@/components/firebase-provider"
import { getAuthErrorMessage } from "@/lib/validation"
import { isPreviewEnvironment, getDomainsToAuthorize, shouldDisableGoogleSignIn } from "@/lib/auth-utils"
import type { User } from "firebase/auth"

// Import Firebase auth functions only when needed
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth"

export default function AuthPage() {
  const router = useRouter()
  const { auth, hasValidConfig } = useFirebase()

  const [activeTab, setActiveTab] = useState("login")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [currentDomain, setCurrentDomain] = useState<string | null>(null)
  const [isPreview, setIsPreview] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [googleSignInAttempted, setGoogleSignInAttempted] = useState(false)
  const [disableGoogleSignIn, setDisableGoogleSignIn] = useState(true) // Default to disabled until we check

  // Get the current domain and determine if Google Sign-In should be disabled
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      setCurrentDomain(hostname)
      setIsPreview(isPreviewEnvironment())
      setDisableGoogleSignIn(shouldDisableGoogleSignIn())
    }
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase auth is not available")
      setAuthInitialized(true)
      return () => {}
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setAuthInitialized(true)
        if (currentUser) {
          setSuccess(`Logged in as ${currentUser.email}`)
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Firebase auth state error:", error)
      setAuthInitialized(true)
      setError("Failed to initialize authentication. Please try again later.")
      return () => {}
    }
  }, [auth])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      setError("Firebase is not properly configured. Please check your environment variables.")
      return
    }

    // Add validation
    if (!loginEmail.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!loginPassword) {
      setError("Please enter your password.")
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(loginEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Set persistence based on remember me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      // Sign in
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      setSuccess("Successfully logged in!")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(getAuthErrorMessage(err.code) || err.message || "Failed to log in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) {
      setError("Firebase is not properly configured. Please check your environment variables.")
      return
    }

    // Add validation
    if (!signupEmail.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!signupPassword) {
      setError("Please enter a password.")
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    // Password strength validation
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Set persistence based on remember me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      // Create account
      await createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      setSuccess("Account created successfully! You are now logged in.")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(getAuthErrorMessage(err.code) || err.message || "Failed to create account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleSignInAttempted(true)

    // Completely prevent Google Sign-In in unauthorized domains
    if (disableGoogleSignIn) {
      setError(
        `Google Sign-In is not available on this domain (${currentDomain}). Please use email/password authentication instead, or add this domain to your Firebase authorized domains list.`,
      )
      return
    }

    if (!auth) {
      setError("Firebase is not properly configured. Please check your environment variables.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Set persistence based on remember me checkbox
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)

      // Create a fresh GoogleAuthProvider instance each time
      const googleProvider = new GoogleAuthProvider()

      // Add scopes if needed
      googleProvider.addScope("email")
      googleProvider.addScope("profile")

      // Set custom parameters
      googleProvider.setCustomParameters({
        prompt: "select_account",
      })

      // Sign in with popup
      await signInWithPopup(auth, googleProvider)
      setSuccess("Successfully logged in with Google!")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (err: any) {
      console.error("Google sign-in error:", err)

      // Handle unauthorized domain error specifically
      if (err.code === "auth/unauthorized-domain") {
        const domainsToAuthorize = getDomainsToAuthorize()
        setError(
          `Your domain (${currentDomain}) is not authorized for Google sign-in. Please add the following domains to the Firebase console: ${domainsToAuthorize.join(", ")}`,
        )
        // Update the disableGoogleSignIn state to prevent future attempts
        setDisableGoogleSignIn(true)
      } else {
        setError(getAuthErrorMessage(err.code) || err.message || "Failed to log in with Google. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!auth) {
      setError("Firebase is not properly configured. Please check your environment variables.")
      return
    }

    setLoading(true)
    try {
      await signOut(auth)
      setSuccess("Successfully logged out!")
      setUser(null)
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message || "Failed to log out. Please try again.")
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
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Firebase Configuration</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    To use authentication features, you need to set up Firebase environment variables.
                  </p>
                  <p className="text-sm">
                    Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file with the following
                    variables:
                  </p>
                  <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto">
                    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
                    <br />
                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
                    <br />
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
                    <br />
                    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
                    <br />
                    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
                    <br />
                    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
                  </pre>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-muted-foreground mt-4">
                For detailed setup instructions, please refer to the README-AUTH.md file.
              </p>
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

  // If Firebase auth is not initialized yet, show a loading state
  if (!authInitialized) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Initializing authentication...</p>
        </div>
      </div>
    )
  }

  // Add a special alert for auth/operation-not-allowed error
  const showAuthMethodDisabledAlert =
    error && (error.includes("not enabled in Firebase") || error.includes("operation-not-allowed"))

  const showUnauthorizedDomainAlert = error && error.includes("not authorized for Google sign-in")

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center mb-4">
            <Youtube className="h-8 w-8 text-red-600 mr-2" />
            <span className="text-2xl font-bold">YouTube Clone</span>
          </Link>
          <p className="text-muted-foreground text-center">
            Sign in to access your account, like videos, and subscribe to channels.
          </p>
        </div>

        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
              <CardDescription>You are currently logged in.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="bg-muted rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL || "/placeholder.svg"}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <h3 className="text-lg font-medium">{user.displayName || "User"}</h3>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={handleLogout} disabled={loading} variant="outline" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Log in or create a new account to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              {disableGoogleSignIn && (
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Google Sign-In Unavailable</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Google Sign-In is not available on this domain ({currentDomain}).</p>
                    <p className="text-sm">To enable Google Sign-In:</p>
                    <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                      <li>Go to the Firebase console</li>
                      <li>Navigate to Authentication &gt; Settings</li>
                      <li>Under "Authorized domains", add this domain:</li>
                      <li className="ml-6 list-none font-mono bg-muted px-2 py-1 rounded text-xs mt-1">
                        {currentDomain}
                      </li>
                      <li>Save your changes</li>
                    </ol>
                    <p className="text-sm mt-2">
                      For local development, you can use the Firebase Emulator by setting{" "}
                      <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true</code> in
                      your .env.local file.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {showAuthMethodDisabledAlert && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Method Not Enabled</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      The authentication method you're trying to use is not enabled in your Firebase project.
                    </p>
                    <p className="text-sm">To fix this issue:</p>
                    <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                      <li>Go to the Firebase console</li>
                      <li>Navigate to Authentication &gt; Sign-in method</li>
                      <li>Enable Email/Password and/or Google authentication</li>
                      <li>Save your changes</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              {showUnauthorizedDomainAlert && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Unauthorized Domain</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Your current domain is not authorized for Google sign-in.</p>
                    <p className="text-sm">To fix this issue:</p>
                    <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                      <li>Go to the Firebase console</li>
                      <li>Navigate to Authentication &gt; Settings</li>
                      <li>Under "Authorized domains", add the following domains:</li>
                      {getDomainsToAuthorize().map((domain, index) => (
                        <li key={index} className="ml-6 list-none font-mono bg-muted px-2 py-1 rounded text-xs mt-1">
                          {domain}
                        </li>
                      ))}
                      <li>Save your changes</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              {error && !showAuthMethodDisabledAlert && !showUnauthorizedDomainAlert && (
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

              <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">{showLoginPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="remember-me"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <Label htmlFor="remember-me" className="text-sm font-normal">
                            Remember me
                          </Label>
                        </div>
                        <div className="text-right">
                          <Link href="/auth/reset-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                      {loading ? "Logging in..." : "Log In"}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-muted-foreground text-sm">or continue with</span>
                    </div>
                  </div>

                  {disableGoogleSignIn ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled={true}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-5 w-5 mr-2"
                        style={{ fill: "currentcolor" }}
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google Sign-In (Not Available)
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-5 w-5 mr-2"
                        style={{ fill: "currentcolor" }}
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">{showSignupPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember-me-signup"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <Label htmlFor="remember-me-signup" className="text-sm font-normal">
                        Remember me
                      </Label>
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-2 text-muted-foreground text-sm">or continue with</span>
                    </div>
                  </div>

                  {disableGoogleSignIn ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled={true}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-5 w-5 mr-2"
                        style={{ fill: "currentcolor" }}
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google Sign-In (Not Available)
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-5 w-5 mr-2"
                        style={{ fill: "currentcolor" }}
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to YouTube Clone's{" "}
                <Link href="#" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
