"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { onAuthStateChanged, type User } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase" // Import auth from our firebase.ts file

export default function LibraryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      if (!auth) {
        setLoading(false)
        return
      }

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Firebase auth error:", error)
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="container py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Library</h1>
        <p className="mb-6">Sign in to access your library</p>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Your Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Watch Later</h2>
          <p className="text-muted-foreground mb-4">Videos you've saved to watch later</p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
            <p className="text-muted-foreground">No videos yet</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Liked Videos</h2>
          <p className="text-muted-foreground mb-4">Videos you've liked</p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
            <p className="text-muted-foreground">No videos yet</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Playlists</h2>
          <p className="text-muted-foreground mb-4">Your created playlists</p>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2">
            <p className="text-muted-foreground">No playlists yet</p>
          </div>
          <Button variant="outline" className="w-full">
            Create Playlist
          </Button>
        </div>
      </div>
    </div>
  )
}
