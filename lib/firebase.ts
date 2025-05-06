// Simplified Firebase initialization with better error handling
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth"

// Check if we have Firebase credentials
const hasValidConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your-api-key" &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

// Firebase configuration
const firebaseConfig = hasValidConfig
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : null

// Initialize Firebase only if we have valid config
let app: FirebaseApp | undefined = undefined
let auth: Auth | undefined = undefined

// Safe initialization function with better error handling
function initializeFirebase() {
  // Skip initialization if not in browser
  if (typeof window === "undefined") {
    console.log("Skipping Firebase initialization in server-side rendering")
    return { app: undefined, auth: undefined }
  }

  // Skip if already initialized
  if (app && auth) {
    return { app, auth }
  }

  // Skip if no valid config
  if (!firebaseConfig) {
    console.warn("Firebase configuration is missing or invalid. Check your environment variables.")
    return { app: undefined, auth: undefined }
  }

  try {
    // Initialize Firebase app
    if (!getApps().length) {
      console.log("Initializing new Firebase app")
      app = initializeApp(firebaseConfig)
    } else {
      console.log("Using existing Firebase app")
      app = getApps()[0]
    }

    // Initialize Auth
    try {
      auth = getAuth(app)
      console.log("Firebase Auth initialized successfully")
    } catch (authError) {
      console.error("Failed to initialize Firebase Auth:", authError)
      return { app, auth: undefined }
    }

    // Connect to emulator if needed
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && auth) {
      try {
        connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
        console.log("Connected to Firebase Auth emulator")
      } catch (emulatorError) {
        console.error("Failed to connect to Firebase Auth emulator:", emulatorError)
        // Continue with production auth since emulator connection failed
      }
    }

    return { app, auth }
  } catch (error) {
    console.error("Firebase initialization error:", error)

    // More detailed error information
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`)
      console.error(`Error stack: ${error.stack}`)

      // Check for common initialization errors
      if (error.message.includes("API key")) {
        console.error("Invalid API key. Check your NEXT_PUBLIC_FIREBASE_API_KEY environment variable.")
      } else if (error.message.includes("project")) {
        console.error("Invalid project configuration. Check your Firebase project settings.")
      } else if (error.message.includes("network")) {
        console.error("Network error during Firebase initialization. Check your internet connection.")
      }
    }

    return { app: undefined, auth: undefined }
  }
}

// Export the initialization function instead of directly initializing
export { initializeFirebase, hasValidConfig }
export { auth }
