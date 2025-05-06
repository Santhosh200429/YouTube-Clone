/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns Boolean indicating if the email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 * @param password Password to validate
 * @returns Object with validation results and feedback message
 */
export function validatePassword(password: string): {
  isValid: boolean
  message: string
  strength: "weak" | "medium" | "strong"
} {
  if (!password) {
    return {
      isValid: false,
      message: "Password is required",
      strength: "weak",
    }
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long",
      strength: "weak",
    }
  }

  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (!hasLetter) {
    return {
      isValid: false,
      message: "Password must contain at least one letter",
      strength: "weak",
    }
  }

  if (hasLetter && !hasNumber && !hasSpecial) {
    return {
      isValid: true,
      message: "Consider adding numbers or special characters for a stronger password",
      strength: "weak",
    }
  }

  if (password.length < 8) {
    return {
      isValid: true,
      message: "Consider using a longer password for better security",
      strength: "medium",
    }
  }

  if (hasLetter && hasNumber && hasSpecial && password.length >= 8) {
    return {
      isValid: true,
      message: "Strong password",
      strength: "strong",
    }
  }

  return {
    isValid: true,
    message: "Password meets minimum requirements",
    strength: "medium",
  }
}

/**
 * Translates Firebase auth error codes to user-friendly messages
 * @param errorCode Firebase auth error code
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Sign in errors
    "auth/invalid-email": "Invalid email address format.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again or reset your password.",
    "auth/too-many-requests": "Too many unsuccessful attempts. Please try again later or reset your password.",

    // Sign up errors
    "auth/email-already-in-use": "An account with this email already exists. Please log in instead.",
    "auth/weak-password":
      "Password is too weak. Please use at least 6 characters with a mix of letters, numbers, and symbols.",
    "auth/operation-not-allowed": "Account creation is currently disabled. Please try again later.",

    // Password reset errors
    "auth/expired-action-code": "This password reset link has expired. Please request a new one.",
    "auth/invalid-action-code":
      "This password reset link is invalid or has already been used. Please request a new one.",

    // General errors
    "auth/network-request-failed": "Network error. Please check your internet connection and try again.",
    "auth/internal-error": "An internal error has occurred. Please try again later.",
    "auth/invalid-credential": "The provided credential is invalid or has expired.",
    "auth/invalid-verification-code": "The verification code is invalid. Please try again.",
    "auth/invalid-verification-id": "The verification ID is invalid. Please try again.",
    "auth/missing-verification-code": "The verification code is missing. Please try again.",
    "auth/missing-verification-id": "The verification ID is missing. Please try again.",
    "auth/quota-exceeded": "Quota exceeded. Please try again later.",
    "auth/timeout": "The operation has timed out. Please try again.",
    "auth/user-token-expired": "Your session has expired. Please log in again.",
    "auth/web-storage-unsupported": "Web storage is not supported or is disabled. Please enable cookies.",
    "auth/unauthorized-domain": "This domain is not authorized for authentication. Please contact the administrator.",
    "auth/popup-blocked": "Authentication popup was blocked by your browser. Please allow popups for this site.",
    "auth/popup-closed-by-user":
      "The authentication popup was closed before completing the sign-in process. Please try again.",
  }

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again."
}
