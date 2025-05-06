/**
 * Utility functions for authentication
 */

/**
 * Checks if the current environment is a preview environment
 * @returns boolean indicating if this is a preview environment
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return false

  const hostname = window.location.hostname

  // Check for common preview domains
  const previewDomains = ["vercel.app", "netlify.app", "github.io", "now.sh", "preview.app", "ngrok.io", "localhost"]

  // If using Firebase emulator, don't consider it a preview environment
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    return false
  }

  return previewDomains.some((domain) => hostname.includes(domain) || hostname === "localhost")
}

/**
 * Gets the current domain for display in error messages
 * @returns The current domain or null if not in browser
 */
export function getCurrentDomain(): string | null {
  if (typeof window === "undefined") return null
  return window.location.hostname
}

/**
 * Checks if the current domain is likely to be authorized in Firebase
 * @returns boolean indicating if the domain is likely authorized
 */
export function isDomainLikelyAuthorized(): boolean {
  if (typeof window === "undefined") return false

  const hostname = window.location.hostname

  // If using Firebase emulator, consider it authorized
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    return true
  }

  // Check if the domain is likely to be authorized
  // This is a heuristic and not a guarantee
  const likelyAuthorizedDomains = [
    // Common production domains
    "yourdomain.com",
    "yourapp.com",
    // Local development
    "localhost",
  ]

  return likelyAuthorizedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
}

/**
 * Gets the Firebase auth domain from environment variables
 * @returns The Firebase auth domain or null if not configured
 */
export function getFirebaseAuthDomain(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null
}

/**
 * Gets the list of domains that should be authorized in Firebase
 * @returns array of domains that should be authorized
 */
export function getDomainsToAuthorize(): string[] {
  if (typeof window === "undefined") return []

  const hostname = window.location.hostname
  const domains = [hostname]

  // Add common variations of the domain
  if (hostname !== "localhost") {
    // Add www subdomain if not present
    if (!hostname.startsWith("www.")) {
      domains.push(`www.${hostname}`)
    }

    // Add root domain if this is a subdomain
    const parts = hostname.split(".")
    if (parts.length > 2) {
      const rootDomain = parts.slice(parts.length - 2).join(".")
      domains.push(rootDomain)
    }
  }

  return domains
}

/**
 * Determines if Google Sign-In should be disabled based on the current domain
 * @returns boolean indicating if Google Sign-In should be disabled
 */
export function shouldDisableGoogleSignIn(): boolean {
  // If using Firebase emulator, don't disable Google Sign-In
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    return false
  }

  // In preview environments, disable Google Sign-In
  if (isPreviewEnvironment()) {
    return true
  }

  // If the domain is likely authorized, don't disable Google Sign-In
  if (isDomainLikelyAuthorized()) {
    return false
  }

  // By default, disable Google Sign-In in unknown environments
  return true
}
