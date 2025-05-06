"use client"

import { useState } from "react"
import { Check, Copy, Facebook, Mail, Twitter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  videoTitle: string
}

export function ShareModal({ isOpen, onClose, videoId, videoTitle }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const videoUrl = `https://youtube.com/watch?v=${videoId}`
  const encodedTitle = encodeURIComponent(videoTitle)
  const encodedUrl = encodeURIComponent(videoUrl)

  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`,
      color: "bg-[#1877F2] text-white hover:bg-[#0E5FC0]",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "bg-[#1DA1F2] text-white hover:bg-[#0C85D0]",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      color: "bg-[#EA4335] text-white hover:bg-[#D33426]",
    },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="${videoTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy embed code: ", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share video</DialogTitle>
          <DialogDescription>Share this video with friends or embed on your site</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="social" className="mt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {socialLinks.map((platform) => (
                <TooltipProvider key={platform.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-12 w-12 rounded-full ${platform.color}`}
                        onClick={() => window.open(platform.url, "_blank")}
                      >
                        <platform.icon className="h-5 w-5" />
                        <span className="sr-only">Share on {platform.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share on {platform.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-[#25D366] text-white hover:bg-[#1DA851]"
                      onClick={() =>
                        window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, "_blank")
                      }
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="sr-only">Share on WhatsApp</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on WhatsApp</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-[#0A66C2] text-white hover:bg-[#084482]"
                      onClick={() =>
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")
                      }
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      <span className="sr-only">Share on LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-[#FF4500] text-white hover:bg-[#E03D00]"
                      onClick={() =>
                        window.open(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, "_blank")
                      }
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                      </svg>
                      <span className="sr-only">Share on Reddit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on Reddit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input readOnly value={videoUrl} className="h-10" />
              </div>
              <Button type="submit" size="icon" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Click the button to copy the video link to your clipboard
            </div>
          </TabsContent>

          <TabsContent value="embed" className="mt-4">
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={videoTitle}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Input readOnly value={embedCode} className="h-10 font-mono text-xs" />
                </div>
                <Button type="submit" size="icon" onClick={handleCopyEmbed}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy embed code</span>
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Copy this code to embed the video on your website
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
