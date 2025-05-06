"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { VideoCard } from "@/components/video-card"
import type { Video } from "@/lib/youtube-api"
import { searchVideos } from "@/lib/youtube-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState("relevance")
  const [timeFilter, setTimeFilter] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchVideos = useCallback(
    async (reset = false) => {
      if (!query) return

      if (reset) {
        setLoading(true)
        setVideos([])
        setNextPageToken(undefined)
        setError(null)
        setUsingMock(false)
      } else if (loading || !nextPageToken) {
        return
      } else {
        setLoading(true)
      }

      // Calculate publishedAfter based on timeFilter
      let publishedAfter: string | undefined
      if (timeFilter) {
        const now = new Date()
        if (timeFilter === "hour") {
          now.setHours(now.getHours() - 1)
        } else if (timeFilter === "day") {
          now.setDate(now.getDate() - 1)
        } else if (timeFilter === "week") {
          now.setDate(now.getDate() - 7)
        } else if (timeFilter === "month") {
          now.setMonth(now.getMonth() - 1)
        } else if (timeFilter === "year") {
          now.setFullYear(now.getFullYear() - 1)
        }
        publishedAfter = now.toISOString()
      }

      try {
        const {
          videos: newVideos,
          nextPageToken: newToken,
          usingMock: isMockData,
        } = await searchVideos(query, reset ? undefined : nextPageToken, 20, sortBy, publishedAfter)

        setVideos((prev) => (reset ? newVideos : [...prev, ...newVideos]))
        setNextPageToken(newToken)
        setUsingMock(isMockData)
      } catch (err) {
        console.error("Error searching videos:", err)
        setError("An error occurred while searching. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [query, sortBy, timeFilter, nextPageToken, loading],
  )

  // Initial search when query, sortBy, or timeFilter changes
  useEffect(() => {
    if (query) {
      fetchVideos(true)
    }
  }, [query, sortBy, timeFilter, fetchVideos])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && nextPageToken) {
          fetchVideos()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, nextPageToken, fetchVideos])

  if (!query) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Search YouTube</h1>
        <p>Enter a search term in the search bar above</p>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Search results for "{query}"</h1>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="date">Upload date</SelectItem>
              <SelectItem value="viewCount">View count</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any time</SelectItem>
              <SelectItem value="hour">Last hour</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {usingMock && (
        <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">Using Mock Data</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Currently displaying mock data instead of live YouTube content. The YouTube API quota has been exceeded or
            manually set to use mock data.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} layout="list" />
        ))}
      </div>

      {loading && (
        <div className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>{videos.length > 0 ? "Loading more videos..." : "Searching for videos..."}</p>
        </div>
      )}

      {!loading && videos.length === 0 && !error && (
        <div className="py-12 text-center">
          <p>No videos found for "{query}"</p>
        </div>
      )}

      {/* Invisible element for intersection observer */}
      {nextPageToken && !loading && <div ref={loadMoreRef} className="h-10" />}
    </div>
  )
}
