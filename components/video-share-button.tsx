"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareModal } from "@/components/share-modal"

interface VideoShareButtonProps {
  videoId: string
  videoTitle: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function VideoShareButton({
  videoId,
  videoTitle,
  variant = "ghost",
  size = "sm",
  className,
}: VideoShareButtonProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setShareModalOpen(true)}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        videoId={videoId}
        videoTitle={videoTitle}
      />
    </>
  )
}
