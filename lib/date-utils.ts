/**
 * Format a date to show how long ago it was (e.g., "2 days ago")
 * This is a fallback implementation in case date-fns fails to load
 */
export function formatTimeAgo(date: Date | string): string {
  try {
    // Try to use the native Intl API first
    if (typeof Intl !== "undefined" && Intl.RelativeTimeFormat) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
      const now = new Date()
      const diffDate = typeof date === "string" ? new Date(date) : date

      const diffInSeconds = Math.floor((now.getTime() - diffDate.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, "second")
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60)
      if (diffInMinutes < 60) {
        return rtf.format(-diffInMinutes, "minute")
      }

      const diffInHours = Math.floor(diffInMinutes / 60)
      if (diffInHours < 24) {
        return rtf.format(-diffInHours, "hour")
      }

      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) {
        return rtf.format(-diffInDays, "day")
      }

      const diffInMonths = Math.floor(diffInDays / 30)
      if (diffInMonths < 12) {
        return rtf.format(-diffInMonths, "month")
      }

      const diffInYears = Math.floor(diffInMonths / 12)
      return rtf.format(-diffInYears, "year")
    }

    // Fallback to a simple implementation
    const now = new Date()
    const diffDate = typeof date === "string" ? new Date(date) : date
    const diffInSeconds = Math.floor((now.getTime() - diffDate.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  } catch (error) {
    // If all else fails, return a formatted date string
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      return dateObj.toLocaleDateString()
    } catch (e) {
      return "Unknown date"
    }
  }
}

/**
 * Format a number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: string | number): string {
  try {
    const numValue = typeof num === "string" ? Number.parseInt(num, 10) : num
    return numValue.toLocaleString()
  } catch (error) {
    return String(num)
  }
}
