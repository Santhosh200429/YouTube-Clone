"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Trash, RefreshCw, Check, AlertCircle, Info, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { testApiKey, refreshMockData } from "@/lib/youtube-api"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { formatTimeAgo } from "@/lib/date-utils"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [apiKey, setApiKey] = useState("")
  const [manuallyUseMockData, setManuallyUseMockData] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isRefreshingMock, setIsRefreshingMock] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // API status information
  const [apiStatus, setApiStatus] = useState({
    isRateLimited: false,
    rateLimitHitAt: null as Date | null,
    resetTime: null as Date | null,
    quotaUsed: 0,
    quotaLimit: 10000,
    usingMockData: true,
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("youtube-api-key")
    const storedManuallyUseMockData = localStorage.getItem("youtube-manually-use-mock-data")

    // Load API status
    const storedApiStatus = localStorage.getItem("youtube-api-status")

    if (storedApiKey) {
      setApiKey(storedApiKey)
    }

    if (storedManuallyUseMockData !== null) {
      setManuallyUseMockData(storedManuallyUseMockData === "true")
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

        setApiStatus(parsedStatus)
      } catch (error) {
        console.error("Error parsing API status:", error)
      }
    }
  }, [])

  const handleSaveSettings = () => {
    setIsSaving(true)

    try {
      // Save API key to localStorage
      if (apiKey.trim()) {
        localStorage.setItem("youtube-api-key", apiKey.trim())
      } else {
        localStorage.removeItem("youtube-api-key")
      }

      // Save mock data preference
      localStorage.setItem("youtube-manually-use-mock-data", String(manuallyUseMockData))

      // Update API status
      const updatedStatus = {
        ...apiStatus,
        usingMockData: manuallyUseMockData || apiStatus.isRateLimited,
      }
      localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))
      setApiStatus(updatedStatus)

      toast({
        title: "Settings saved",
        description: "Your YouTube API settings have been saved successfully.",
      })

      // Refresh the page to apply new settings
      router.refresh()
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearSettings = () => {
    localStorage.removeItem("youtube-api-key")
    localStorage.removeItem("youtube-manually-use-mock-data")

    // Reset API status but keep quota information
    const resetStatus = {
      isRateLimited: false,
      rateLimitHitAt: null,
      resetTime: null,
      quotaUsed: 0,
      quotaLimit: 10000,
      usingMockData: true,
    }
    localStorage.setItem("youtube-api-status", JSON.stringify(resetStatus))

    setApiKey("")
    setManuallyUseMockData(true)
    setTestResult(null)
    setApiStatus(resetStatus)

    toast({
      title: "Settings cleared",
      description: "Your YouTube API settings have been reset to defaults.",
    })

    router.refresh()
  }

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: "Please enter an API key to test.",
      })
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await testApiKey(apiKey.trim())
      setTestResult({
        success: result.success,
        message: result.message,
      })

      // If successful, update quota used
      if (result.success) {
        const updatedStatus = {
          ...apiStatus,
          quotaUsed: apiStatus.quotaUsed + 1, // Testing uses 1 quota unit
        }
        localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))
        setApiStatus(updatedStatus)
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "An unexpected error occurred while testing the API key.",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleResetRateLimit = () => {
    const updatedStatus = {
      ...apiStatus,
      isRateLimited: false,
      rateLimitHitAt: null,
      resetTime: null,
      usingMockData: manuallyUseMockData,
    }
    localStorage.setItem("youtube-api-status", JSON.stringify(updatedStatus))
    setApiStatus(updatedStatus)

    toast({
      title: "Rate limit reset",
      description: "The application will now attempt to use the YouTube API again.",
    })
  }

  const handleRefreshMockData = async () => {
    setIsRefreshingMock(true)

    try {
      await refreshMockData()
      toast({
        title: "Mock data refreshed",
        description: "The mock data has been refreshed with new content.",
      })
    } catch (error) {
      console.error("Error refreshing mock data:", error)
      toast({
        variant: "destructive",
        title: "Error refreshing mock data",
        description: "There was a problem refreshing the mock data. Please try again.",
      })
    } finally {
      setIsRefreshingMock(false)
    }
  }

  // Calculate if the rate limit should be automatically reset (after 24 hours)
  useEffect(() => {
    if (apiStatus.rateLimitHitAt) {
      const resetDate = new Date(apiStatus.rateLimitHitAt)
      resetDate.setHours(resetDate.getHours() + 24)

      if (new Date() > resetDate && apiStatus.isRateLimited) {
        handleResetRateLimit()
      }
    }
  }, [apiStatus.rateLimitHitAt, apiStatus.isRateLimited])

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>YouTube API Configuration</CardTitle>
            <CardDescription>Configure your YouTube Data API key and data source preferences.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>About YouTube API Keys</AlertTitle>
              <AlertDescription>
                To use the YouTube Data API, you need an API key from the Google Cloud Console. Without a valid key, the
                application will use mock data instead.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="api-key">YouTube API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your YouTube API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your API key is stored locally in your browser and is not sent to our servers.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="use-mock-data">Manually Use Mock Data</Label>
                <p className="text-sm text-muted-foreground">Use sample data instead of making real API calls</p>
              </div>
              <Switch id="use-mock-data" checked={manuallyUseMockData} onCheckedChange={setManuallyUseMockData} />
            </div>

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div>
              <Button variant="outline" onClick={handleClearSettings} disabled={isSaving}>
                <Trash className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestApiKey} disabled={isSaving || isTesting || !apiKey.trim()}>
                {isTesting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Test API Key
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Settings
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Status</CardTitle>
            <CardDescription>Current status of your YouTube API usage and rate limits.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>API Quota Usage</Label>
                  <span className="text-sm font-medium">
                    {apiStatus.quotaUsed} / {apiStatus.quotaLimit}
                  </span>
                </div>
                <Progress value={(apiStatus.quotaUsed / apiStatus.quotaLimit) * 100} />
                <p className="text-xs text-muted-foreground mt-1">
                  YouTube API has a default quota limit of 10,000 units per day.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block mb-1">Current Data Source</Label>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${apiStatus.usingMockData ? "bg-amber-500" : "bg-green-500"}`}
                    ></div>
                    <span>{apiStatus.usingMockData ? "Mock Data" : "YouTube API"}</span>
                  </div>
                </div>

                <div>
                  <Label className="block mb-1">Rate Limited</Label>
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${apiStatus.isRateLimited ? "bg-red-500" : "bg-green-500"}`}
                    ></div>
                    <span>{apiStatus.isRateLimited ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {apiStatus.isRateLimited && apiStatus.rateLimitHitAt && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Rate Limit Information</AlertTitle>
                  <AlertDescription>
                    <p>Rate limit was hit {formatTimeAgo(apiStatus.rateLimitHitAt)}.</p>
                    <p>The system will automatically try to use the YouTube API again after 24 hours.</p>
                    <p>You can also manually reset the rate limit status below.</p>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {apiStatus.isRateLimited && (
                  <Button variant="outline" onClick={handleResetRateLimit} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Rate Limit Status
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleRefreshMockData}
                  className="flex-1"
                  disabled={isRefreshingMock}
                >
                  {isRefreshingMock ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Mock Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-lg font-medium">How to Get a YouTube API Key</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Go to the{" "}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </li>
            <li>Create a new project or select an existing one</li>
            <li>Navigate to "APIs & Services" &gt; "Library"</li>
            <li>Search for "YouTube Data API v3" and enable it</li>
            <li>Go to "APIs & Services" &gt; "Credentials"</li>
            <li>Click "Create Credentials" &gt; "API Key"</li>
            <li>Copy your new API key and paste it in the field above</li>
            <li>Optional: Restrict the API key to only the YouTube Data API</li>
          </ol>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h2 className="text-lg font-medium">API Quota Information</h2>
            <p>
              The YouTube Data API has a default quota limit of 10,000 units per day. Different API operations consume
              different amounts of quota:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Search request: 100 units</li>
              <li>Video list request: 1 unit per video</li>
              <li>Comment list request: 1 unit</li>
              <li>Channel list request: 1 unit</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              For more information, see the{" "}
              <a
                href="https://developers.google.com/youtube/v3/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube Data API documentation
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
