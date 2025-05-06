"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoCard } from "@/components/video-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info } from "lucide-react"
import type { Channel, Video } from "@/lib/youtube-api"
import { getChannelDetails, getChannelVideos } from "@/lib/youtube-api"
import { formatNumber } from "@/lib/date-utils"

export default function ChannelPage() {
  const params = useParams()
  const channelId = params.id as string

  const [channel, setChannel] = useState<Channel | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState("videos")
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [usingMock, setUsingMock] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const fetchChannelVideos = useCallback(
    async (reset = false) => {
      if (!channelId) return

      if (reset) {
        setLoadingMore(false)
        setNextPageToken(undefined)
      } else if (loadingMore || !nextPageToken) {
        return
      } else {
        setLoadingMore(true)
      }

      try {
        const {
          videos: channelVideos,
          nextPageToken: newToken,
          usingMock: isMockData,
        } = await getChannelVideos(channelId, reset ? undefined : nextPageToken)

        setVideos((prev) => (reset ? channelVideos : [...prev, ...channelVideos]))
        setNextPageToken(newToken)
        setUsingMock(isMockData || usingMock) // Keep using mock flag if it was already true
      } catch (err) {
        console.error("Error fetching channel videos:", err)
        setError("Failed to load channel videos. Please try again later.")
      } finally {
        setLoadingMore(false)
      }
    },
    [channelId, nextPageToken, loadingMore, usingMock],
  )

  useEffect(() => {
    if (!channelId) return

    setLoading(true)
    setError(null)
    setUsingMock(false)

    const fetchChannelData = async () => {
      try {
        // Fetch channel details
        const channelDetails = await getChannelDetails(channelId)
        if (!channelDetails) {
          setError("Channel not found")
          setLoading(false)
          return
        }
        setChannel(channelDetails)

        // Fetch initial videos
        const { videos: channelVideos, usingMock: isMockData } = await getChannelVideos(channelId)
        setVideos(channelVideos)
        setUsingMock(isMockData)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching channel data:", err)
        setError("Failed to load channel data. Please try again later.")
        setLoading(false)
      }
    }

    fetchChannelData()
  }, [channelId])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && nextPageToken && activeTab === "videos") {
          fetchChannelVideos()
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
  }, [loadingMore, nextPageToken, fetchChannelVideos, activeTab])

  if (loading) {
    return (
      <div className="container py-6">
        <div className="mb-8">
          <Skeleton className="h-32 w-full rounded-lg mb-4" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        <Skeleton className="h-10 w-64 mb-6" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-video rounded-lg mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Channel not found</h1>
        <p>We couldn't find the channel you're looking for.</p>
      </div>
    )
  }

  const formattedSubscribers = formatNumber(channel.subscriberCount)

  return (
    <div className="container py-6">
      {usingMock && (
        <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-600 dark:text-amber-400">Using Mock Data</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Some content on this page is using mock data instead of live YouTube content. The YouTube API quota has been
            exceeded or manually set to use mock data.
          </AlertDescription>
        </Alert>
      )}

      {/* Channel Banner */}
      <div className="relative aspect-[6/1] rounded-lg overflow-hidden bg-accent mb-4">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Channel Banner</div>
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start mb-8">
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-accent">
          <Image src={channel.thumbnailUrl || "/placeholder.svg"} alt={channel.title} fill className="object-cover" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">{channel.title}</h1>
          <div className="text-muted-foreground">
            {formattedSubscribers} subscribers • {channel.videoCount} videos
          </div>
          <p className="mt-2 text-sm line-clamp-2 md:max-w-2xl">{channel.description}</p>
        </div>
        <Button>Subscribe</Button>
      </div>

      {/* Channel Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="videos" className="pt-6">
          {videos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {loadingMore && (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading more videos...</p>
                </div>
              )}

              {/* Invisible element for intersection observer */}
              {nextPageToken && !loadingMore && <div ref={loadMoreRef} className="h-10" />}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">This channel has no videos.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="about" className="pt-6">
          <div className="max-w-3xl">
            <h2 className="text-lg font-medium mb-2">Description</h2>
            <p className="whitespace-pre-line mb-6">{channel.description}</p>

            <h2 className="text-lg font-medium mb-2">Stats</h2>
            <ul className="space-y-1 text-muted-foreground">
              <li>Joined YouTube: January 1, 2020</li>
              <li>{formatNumber(channel.videoCount)} videos</li>
              <li>{formattedSubscribers} subscribers</li>
              <li>10,245,678 total views</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
