"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { initializeFirebase, hasValidConfig } from "@/lib/firebase"
import type { Auth } from "firebase/auth"

// Create a context to provide Firebase auth
type FirebaseContextType = {
  auth: Auth | undefined
  isInitialized: boolean
  hasValidConfig: boolean
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth: undefined,
  isInitialized: false,
  hasValidConfig: false,
})

export function useFirebase() {
  return useContext(FirebaseContext)
}

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | undefined>(undefined)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Set a timeout to ensure we don't block the UI indefinitely
    const timeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.log("Firebase initialization timed out, proceeding anyway")
        setIsInitialized(true)
      }
    }, 2000)

    try {
      // If we don't have valid config, we can still proceed
      if (!hasValidConfig) {
        console.log("Firebase config not found, proceeding without Firebase")
        setIsInitialized(true)
        clearTimeout(timeoutId)
        return
      }

      // Initialize Firebase
      const { auth: firebaseAuth } = initializeFirebase()

      if (firebaseAuth) {
        setAuth(firebaseAuth)
        console.log("Firebase initialized in provider")
      } else {
        console.warn("Firebase auth initialization failed")
        // Add more detailed error information
        if (typeof window !== "undefined") {
          // Only show this in browser, not during SSR
          console.error("Firebase initialization failed. This could be due to invalid configuration or network issues.")
        }
      }

      setIsInitialized(true)
      clearTimeout(timeoutId)
    } catch (err) {
      console.error("Error in FirebaseProvider:", err)

      // Add more detailed error logging
      if (err instanceof Error) {
        console.error(`Firebase initialization error: ${err.message}`)
        if (err.stack) {
          console.error(`Stack trace: ${err.stack}`)
        }
      }

      setIsInitialized(true)
      clearTimeout(timeoutId)
    }

    return () => clearTimeout(timeoutId)
  }, [])

  const value = {
    auth,
    isInitialized,
    hasValidConfig,
  }

  const renderContent = () => {
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading application...</p>
          </div>
        </div>
      )
    }

    if (isInitialized && !hasValidConfig) {
      // We still render children, but the auth context will indicate Firebase is not available
      return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
    }

    return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  }

  return renderContent()
}
