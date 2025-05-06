"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { formatTimeAgo, formatNumber } from "@/lib/date-utils"
import { ThumbsUp, Share2, Flag, MessageSquare, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoCard } from "@/components/video-card"
import type { Video, Comment, Channel } from "@/lib/youtube-api"
import { getVideoDetails, getVideoComments, getChannelDetails, searchVideos } from "@/lib/youtube-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShareModal } from "@/components/share-modal"

export default function WatchPage() {
  const searchParams = useSearchParams()
  const videoId = searchParams.get("v")

  const [video, setVideo] = useState<Video | null>(null)
  const [channel, setChannel] = useState<Channel | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    if (!videoId) return

    setLoading(true)
    setError(null)
    setUsingMock(false)

    const fetchVideoData = async () => {
      try {
        // Fetch video details
        const videoDetails = await getVideoDetails(videoId)
        if (!videoDetails) {
          setError("Video not found")
          setLoading(false)
          return
        }
        setVideo(videoDetails)

        // Fetch channel details
        const channelDetails = await getChannelDetails(videoDetails.channelId)
        setChannel(channelDetails)

        // Fetch comments
        const { comments: videoComments, usingMock: commentsUsingMock } = await getVideoComments(videoId)
        setComments(videoComments)

        // Fetch related videos
        const { videos: related, usingMock: relatedUsingMock } = await searchVideos(
          videoDetails.title.split(" ").slice(0, 3).join(" "),
          undefined,
          8,
        )
        setRelatedVideos(related.filter((v) => v.id !== videoId))

        // Set using mock if any of the requests used mock data
        setUsingMock(commentsUsingMock || relatedUsingMock)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching video data:", err)
        setError("Failed to load video data. Please try again later.")
        setLoading(false)
      }
    }

    fetchVideoData()
  }, [videoId])

  const handleShare = () => {
    setShareModalOpen(true)
  }

  if (!videoId) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Video not found</h1>
        <p>The video ID is missing. Please go back to the homepage.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="aspect-video bg-muted rounded-lg mb-4"></div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <Skeleton className="h-16 w-full mb-4" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/2 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-4">
                <Skeleton className="h-24 w-40 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
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
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Video not found</h1>
        <p>We couldn't find the video you're looking for.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    )
  }

  const formattedDate = formatTimeAgo(new Date(video.publishedAt))
  const formattedViews = formatNumber(video.viewCount)
  const formattedSubscribers = channel ? formatNumber(channel.subscriberCount) : "0"

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg mb-4 relative overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>

          {/* Video Info */}
          <h1 className="text-xl font-bold mb-2">{video.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="text-sm text-muted-foreground">
              {formattedViews} views • {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>

          {/* Channel Info */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={channel?.thumbnailUrl || "/placeholder.svg"} alt={channel?.title} />
              <AvatarFallback>{channel?.title?.charAt(0) || "C"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link href={`/channel/${channel?.id}`} className="font-medium hover:underline">
                {channel?.title || video.channelTitle}
              </Link>
              <div className="text-sm text-muted-foreground">{formattedSubscribers} subscribers</div>
            </div>
            <Button>Subscribe</Button>
          </div>

          {/* Description */}
          <div className="p-4 rounded-lg bg-accent/50 mb-6">
            <div className={`whitespace-pre-line ${!showFullDescription && "line-clamp-3"}`}>{video.description}</div>
            {video.description.split("\n").length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2"
              >
                {showFullDescription ? "Show less" : "Show more"}
              </Button>
            )}
          </div>

          {/* Comments */}
          <Tabs defaultValue="comments">
            <TabsList>
              <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="pt-4">
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.authorProfileImageUrl || "/placeholder.svg"}
                          alt={comment.authorName}
                        />
                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(new Date(comment.publishedAt))}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likeCount}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No comments available for this video.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Videos */}
        <div>
          <h2 className="font-medium mb-4">Related videos</h2>
          {relatedVideos.length > 0 ? (
            <div className="space-y-4">
              {relatedVideos.map((video) => (
                <VideoCard key={video.id} video={video} layout="list" />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No related videos available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {video && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          videoId={videoId}
          videoTitle={video.title}
        />
      )}
    </div>
  )
}
