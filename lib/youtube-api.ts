// YouTube API key from the provided key
const DEFAULT_API_KEY = "AIzaSyCJ8O2jXwimzSmNnsbfSLryCw2AfXhj1EQ"
const BASE_URL = "https://www.googleapis.com/youtube/v3"

import { generateMockData, getMockData } from "./mock-data"

export type Video = {
  id: string
  title: string
  channelTitle: string
  channelId: string
  publishedAt: string
  thumbnailUrl: string
  viewCount: string
  description: string
}

export type Channel = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: string
  videoCount: string
}

export type Comment = {
  id: string
  authorName: string
  authorProfileImageUrl: string
  text: string
  likeCount: string
  publishedAt: string
}

export type ApiStatus = {
  isRateLimited: boolean
  rateLimitHitAt: Date | null
  resetTime: Date | null
  quotaUsed: number
  quotaLimit: number
  usingMockData: boolean
}

// Set to false to use the real YouTube API
const USE_MOCK_DATA = false

// Helper function to get settings from localStorage (client-side only)
function getSettings() {
  // Always use mock data on the server
  if (typeof window === "undefined") {
    return {
      useMockData: false,
      apiKey: DEFAULT_API_KEY,
      apiStatus: {
        isRateLimited: false,
        rateLimitHitAt: null,
        resetTime: null,
        quotaUsed: 0,
        quotaLimit: 10000,
        usingMockData: false,
      },
    }
  }

  const storedApiKey = localStorage.getItem("youtube-api-key")
  const storedManuallyUseMockData = localStorage.getItem("youtube-manually-use-mock-data")
  const storedApiStatus = localStorage.getItem("youtube-api-status")

  let apiStatus: ApiStatus = {
    isRateLimited: false,
    rateLimitHitAt: null,
    resetTime: null,
    quotaUsed: 0,
    quotaLimit: 10000,
    usingMockData: false,
  }

  if (storedApiStatus) {
    try {
      const parsedStatus = JSON.parse(storedApiStatus)

      // Convert string dates back to Date objects
      if (parsedStatus.rateLimitHitAt) {
        parsedStatus.rateLimitHitAt = new Date(parsedStatus.rateLimitHitAt)
      }
      if (parsedStatus.resetTime) {
        parsedStatus.resetTime = new Date(parsedStatus.resetTime)
      }

      apiStatus = parsedStatus
    } catch (error) {
      console.error("Error parsing API status:", error)
    }
  }

  // Check if rate limit should be reset (after 24 hours)
  if (apiStatus.rateLimitHitAt) {
    const resetDate = new Date(apiStatus.rateLimitHitAt)
    resetDate.setHours(resetDate.getHours() + 24)

    if (new Date() > resetDate && apiStatus.isRateLimited) {
      apiStatus.isRateLimited = false
      apiStatus.rateLimitHitAt = null
      apiStatus.resetTime = null
      apiStatus.usingMockData = storedManuallyUseMockData === "true"
      localStorage.setItem("youtube-api-status", JSON.stringify(apiStatus))
    }
  }

  // Use mock data if rate limited or manually set
  const useMockData = apiStatus.isRateLimited || storedManuallyUseMockData === "true"

  return {
    useMockData,
    apiKey: storedApiKey || DEFAULT_API_KEY,
    apiStatus,
  }
}

// Function to handle API errors and update rate limit status
function handleApiError(error: any, quotaUsed = 0) {
  console.error("YouTube API error:", error)

  if (typeof window === "undefined") {
    return
  }

  const { apiStatus } = getSettings()
  const updatedStatus = { ...apiStatus }

  // Update quota used
  updatedStatus.quotaUsed += quotaUsed

  // Check if this is a rate limit or quota error
  const errorResponse = error.response || {}
  const errorData = errorResponse.data || {}
  const errorMessage = errorData.error?.message || error.message || ""
  const errorCode = errorData.error?.code || error.code || 0

  const isQuotaOrRateError =
    errorMessage.includes("quota") ||
    errorMessage.includes("rate limit") ||
    errorCode === 403 ||
    errorMessage.includes("dailyLimitExceeded") ||
    errorMessage.includes("quotaExceeded")

  if (isQuotaOrRateError) {
    updatedStatus.isRateLimited = true
    updatedStatus.rateLimitHitAt = new Date()

    // Set reset time to 24 hours from now
    const resetTime = new Date()
    resetTime.setHours(resetTime.getHours() + 24)
    updatedStatus.resetTime = resetTime
    updatedStatus.usingMockData = true

    console.log("Rate limit or quota exceeded, switching to mock data until", resetTime)
  }

  localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))

  return updatedStatus
}

// Function to update quota usage
function updateQuotaUsage(quotaUsed: number) {
  if (typeof window === "undefined") {
    return
  }

  const { apiStatus } = getSettings()
  const updatedStatus = { ...apiStatus }

  updatedStatus.quotaUsed += quotaUsed
  localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))

  return updatedStatus
}

// Test if an API key is valid
export async function testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const params = new URLSearchParams({
      part: "snippet",
      chart: "mostPopular",
      maxResults: "1",
      key: apiKey,
    })

    const response = await fetch(`${BASE_URL}/videos?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `YouTube API error: ${response.status}`

      if (response.status === 403) {
        return {
          success: false,
          message: "API key is invalid or has insufficient permissions.",
        }
      } else if (response.status === 400) {
        return {
          success: false,
          message: "Invalid API key format.",
        }
      } else {
        return {
          success: false,
          message: errorMessage,
        }
      }
    }

    return {
      success: true,
      message: "API key is valid and working correctly.",
    }
  } catch (error) {
    console.error("Error testing API key:", error)
    return {
      success: false,
      message: "Network error while testing API key. Please check your internet connection.",
    }
  }
}

// Function to refresh mock data
export async function refreshMockData(): Promise<void> {
  try {
    // Generate new mock data
    const newMockData = await generateMockData()

    // Store the new mock data
    localStorage.setItem("youtube-mock-data", JSON.stringify(newMockData))
    localStorage.setItem("youtube-mock-data-updated", new Date().toISOString())

    console.log("Mock data refreshed successfully")
  } catch (error) {
    console.error("Error refreshing mock data:", error)
    throw new Error("Failed to refresh mock data")
  }
}

// Force mock data usage for all API calls
export function forceMockData(force = true) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("youtube-manually-use-mock-data", force ? "true" : "false")

  // Update API status
  const { apiStatus } = getSettings()
  const updatedStatus = { ...apiStatus, usingMockData: force }
  localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))

  console.log(`Mock data usage ${force ? "enabled" : "disabled"}`)
}

export async function getTrendingVideos(
  pageToken?: string,
  maxResults = 20,
  regionCode = "US",
): Promise<{ videos: Video[]; nextPageToken?: string; usingMock: boolean }> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock trending videos data")
    const mockData = getMockData()
    return {
      videos: mockData.trendingVideos,
      nextPageToken: "mock-next-page-token",
      usingMock: true,
    }
  }

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics",
      chart: "mostPopular",
      maxResults: maxResults.toString(),
      regionCode,
      key: apiKey,
    })

    if (pageToken) {
      params.append("pageToken", pageToken)
    }

    const response = await fetch(`${BASE_URL}/videos?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    const videos: Video[] = data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: item.statistics.viewCount || "0",
      description: item.snippet.description,
    }))

    return {
      videos,
      nextPageToken: data.nextPageToken,
      usingMock: false,
    }
  } catch (error) {
    console.error("Error fetching trending videos:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 1)

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      return {
        videos: mockData.trendingVideos,
        nextPageToken: "mock-next-page-token",
        usingMock: true,
      }
    }

    // Return empty array if not rate limited
    return {
      videos: [],
      usingMock: false,
    }
  }
}

export async function searchVideos(
  query: string,
  pageToken?: string,
  maxResults = 20,
  order = "relevance",
  publishedAfter?: string,
): Promise<{ videos: Video[]; nextPageToken?: string; usingMock: boolean }> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock search results data")
    const mockData = getMockData()
    const filteredResults = mockData.searchResults.filter(
      (video) =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase()),
    )

    return {
      videos: filteredResults.length > 0 ? filteredResults : mockData.searchResults.slice(0, 5),
      nextPageToken: "mock-next-page-token",
      usingMock: true,
    }
  }

  try {
    // First, search for video IDs (costs 100 units)
    const searchParams = new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: maxResults.toString(),
      order,
      key: apiKey,
    })

    if (pageToken) {
      searchParams.append("pageToken", pageToken)
    }

    if (publishedAfter) {
      searchParams.append("publishedAfter", publishedAfter)
    }

    const searchResponse = await fetch(`${BASE_URL}/search?${searchParams.toString()}`)

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${searchResponse.status}`,
      }
    }

    const searchData = await searchResponse.json()

    // Update quota usage (search request costs 100 units)
    updateQuotaUsage(100)

    // If no results, return empty array
    if (!searchData.items || searchData.items.length === 0) {
      return {
        videos: [],
        nextPageToken: searchData.nextPageToken,
        usingMock: false,
      }
    }

    // Extract video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    // Then, get video details (costs 1 unit)
    const videoParams = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds,
      key: apiKey,
    })

    const videoResponse = await fetch(`${BASE_URL}/videos?${videoParams.toString()}`)

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${videoResponse.status}`,
      }
    }

    const videoData = await videoResponse.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    // Map search results to video details
    const videos: Video[] = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: item.statistics.viewCount || "0",
      description: item.snippet.description,
    }))

    return {
      videos,
      nextPageToken: searchData.nextPageToken,
      usingMock: false,
    }
  } catch (error) {
    console.error("Error searching videos:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 101) // 100 for search + 1 for video details

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      const filteredResults = mockData.searchResults.filter(
        (video) =>
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          video.description.toLowerCase().includes(query.toLowerCase()),
      )

      return {
        videos: filteredResults.length > 0 ? filteredResults : mockData.searchResults.slice(0, 5),
        nextPageToken: "mock-next-page-token",
        usingMock: true,
      }
    }

    // Return empty array if not rate limited
    return {
      videos: [],
      usingMock: false,
    }
  }
}

export async function getVideoDetails(videoId: string): Promise<Video | null> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock video details data")
    const mockData = getMockData()
    return {
      ...mockData.videoDetails,
      id: videoId || mockData.videoDetails.id,
    }
  }

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics",
      id: videoId,
      key: apiKey,
    })

    const response = await fetch(`${BASE_URL}/videos?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    // If no results, return null
    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]

    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: item.statistics.viewCount || "0",
      description: item.snippet.description,
    }
  } catch (error) {
    console.error("Error fetching video details:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 1)

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      return {
        ...mockData.videoDetails,
        id: videoId || mockData.videoDetails.id,
      }
    }

    // Return null if not rate limited
    return null
  }
}

export async function getVideoComments(
  videoId: string,
  pageToken?: string,
  maxResults = 20,
): Promise<{ comments: Comment[]; nextPageToken?: string; usingMock: boolean }> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock comments data")
    const mockData = getMockData()
    return {
      comments: mockData.comments,
      nextPageToken: "mock-next-page-token",
      usingMock: true,
    }
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      videoId,
      maxResults: maxResults.toString(),
      order: "relevance",
      key: apiKey,
    })

    if (pageToken) {
      params.append("pageToken", pageToken)
    }

    const response = await fetch(`${BASE_URL}/commentThreads?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    const comments: Comment[] = data.items.map((item: any) => {
      const snippet = item.snippet.topLevelComment.snippet
      return {
        id: item.id,
        authorName: snippet.authorDisplayName,
        authorProfileImageUrl: snippet.authorProfileImageUrl,
        text: snippet.textDisplay,
        likeCount: snippet.likeCount,
        publishedAt: snippet.publishedAt,
      }
    })

    return {
      comments,
      nextPageToken: data.nextPageToken,
      usingMock: false,
    }
  } catch (error) {
    console.error("Error fetching video comments:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 1)

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      return {
        comments: mockData.comments,
        nextPageToken: "mock-next-page-token",
        usingMock: true,
      }
    }

    // Return empty array if not rate limited
    return {
      comments: [],
      usingMock: false,
    }
  }
}

export async function getChannelDetails(channelId: string): Promise<Channel | null> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock channel details data")
    const mockData = getMockData()
    return {
      ...mockData.channelDetails,
      id: channelId || mockData.channelDetails.id,
    }
  }

  try {
    const params = new URLSearchParams({
      part: "snippet,statistics",
      id: channelId,
      key: apiKey,
    })

    const response = await fetch(`${BASE_URL}/channels?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${response.status}`,
      }
    }

    const data = await response.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    // If no results, return null
    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]

    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      subscriberCount: item.statistics.subscriberCount || "0",
      videoCount: item.statistics.videoCount || "0",
    }
  } catch (error) {
    console.error("Error fetching channel details:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 1)

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      return {
        ...mockData.channelDetails,
        id: channelId || mockData.channelDetails.id,
      }
    }

    // Return null if not rate limited
    return null
  }
}

export async function getChannelVideos(
  channelId: string,
  pageToken?: string,
  maxResults = 20,
): Promise<{ videos: Video[]; nextPageToken?: string; usingMock: boolean }> {
  const { useMockData, apiKey, apiStatus } = getSettings()

  // Use mock data if specified or rate limited
  if (useMockData || USE_MOCK_DATA) {
    console.log("Using mock channel videos data")
    const mockData = getMockData()
    return {
      videos: mockData.channelVideos,
      nextPageToken: "mock-next-page-token",
      usingMock: true,
    }
  }

  try {
    // First, search for videos by channel ID (costs 100 units)
    const searchParams = new URLSearchParams({
      part: "snippet",
      channelId,
      type: "video",
      maxResults: maxResults.toString(),
      order: "date",
      key: apiKey,
    })

    if (pageToken) {
      searchParams.append("pageToken", pageToken)
    }

    const searchResponse = await fetch(`${BASE_URL}/search?${searchParams.toString()}`)

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${searchResponse.status}`,
      }
    }

    const searchData = await searchResponse.json()

    // Update quota usage (search request costs 100 units)
    updateQuotaUsage(100)

    // If no results, return empty array
    if (!searchData.items || searchData.items.length === 0) {
      return {
        videos: [],
        nextPageToken: searchData.nextPageToken,
        usingMock: false,
      }
    }

    // Extract video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    // Then, get video details (costs 1 unit)
    const videoParams = new URLSearchParams({
      part: "snippet,statistics",
      id: videoIds,
      key: apiKey,
    })

    const videoResponse = await fetch(`${BASE_URL}/videos?${videoParams.toString()}`)

    if (!videoResponse.ok) {
      const errorData = await videoResponse.json()
      throw {
        response: { data: errorData },
        message: errorData.error?.message || `YouTube API error: ${videoResponse.status}`,
      }
    }

    const videoData = await videoResponse.json()

    // Update quota usage (list request costs 1 unit)
    updateQuotaUsage(1)

    // Map search results to video details
    const videos: Video[] = videoData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      viewCount: item.statistics.viewCount || "0",
      description: item.snippet.description,
    }))

    return {
      videos,
      nextPageToken: searchData.nextPageToken,
      usingMock: false,
    }
  } catch (error) {
    console.error("Error fetching channel videos:", error)

    // Handle API error and update rate limit status
    const updatedStatus = handleApiError(error, 101) // 100 for search + 1 for video details

    // If rate limited, fall back to mock data
    if (updatedStatus?.isRateLimited) {
      console.log("Falling back to mock data due to API error")
      const mockData = getMockData()
      return {
        videos: mockData.channelVideos,
        nextPageToken: "mock-next-page-token",
        usingMock: true,
      }
    }

    // Return empty array if not rate limited
    return {
      videos: [],
      usingMock: false,
    }
  }
}
