import { getTrendingVideos } from "@/lib/youtube-api"
import { VideoCard } from "@/components/video-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"

export default async function TrendingPage() {
  // Get trending videos
  const { videos, usingMock } = await getTrendingVideos(undefined, 15)

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Trending</h1>

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

      {videos.length > 0 ? (
        <div className="space-y-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} layout="list" />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Alert variant="destructive" className="mb-6 inline-block text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Videos Available</AlertTitle>
            <AlertDescription>
              We couldn't retrieve trending videos at this time. This could be due to API limitations or network issues.
              Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
