"use client"

import Link from "next/link"
import Image from "next/image"
import { formatTimeAgo, formatNumber } from "@/lib/date-utils"
import type { Video } from "@/lib/youtube-api"
import { useState } from "react"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { VideoShareButton } from "@/components/video-share-button"

interface VideoCardProps {
  video: Video
  layout?: "grid" | "list"
}

export function VideoCard({ video, layout = "grid" }: VideoCardProps) {
  const [imageError, setImageError] = useState(false)
  const formattedDate = formatTimeAgo(new Date(video.publishedAt))
  const formattedViews = formatNumber(video.viewCount)

  const fallbackThumbnail = `/placeholder.svg?height=${layout === "list" ? "90" : "180"}&width=${layout === "list" ? "160" : "320"}&text=No+Thumbnail`

  const handleImageError = () => {
    setImageError(true)
  }

  if (layout === "list") {
    return (
      <div className="group relative">
        <Link
          href={`/watch?v=${video.id}`}
          className="flex gap-4 mb-4 hover:bg-accent/50 p-2 rounded-lg transition-colors"
        >
          <div className="relative flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-muted">
            <Image
              src={imageError ? fallbackThumbnail : video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover"
              onError={handleImageError}
              sizes="160px"
              priority={false}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium line-clamp-2">{video.title}</h3>
            <div className="text-sm text-muted-foreground mt-1">
              <p>{video.channelTitle}</p>
              <p>
                {formattedViews} views • {formattedDate}
              </p>
            </div>
          </div>
        </Link>
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <VideoShareButton
                  videoId={video.id}
                  videoTitle={video.title}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start cursor-pointer"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <Link href={`/watch?v=${video.id}`} className="block">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-muted">
          <Image
            src={imageError ? fallbackThumbnail : video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            onError={handleImageError}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            loading="lazy"
          />
        </div>
        <h3 className="text-base font-medium line-clamp-2">{video.title}</h3>
        <div className="text-sm text-muted-foreground mt-1">
          <p>{video.channelTitle}</p>
          <p>
            {formattedViews} views • {formattedDate}
          </p>
        </div>
      </Link>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <VideoShareButton
                videoId={video.id}
                videoTitle={video.title}
                variant="ghost"
                size="sm"
                className="w-full justify-start cursor-pointer"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
