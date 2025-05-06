"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useFirebase } from "@/components/firebase-provider"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { ProfileForm } from "@/components/profile-form"
import { PasswordChangeForm } from "@/components/password-change-form"
import { AccountSettings } from "@/components/account-settings"
import { Loader2, AlertCircle, User } from "lucide-react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { auth, hasValidConfig } = useFirebase()

  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      // If not logged in, redirect to auth page
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access your profile",
          variant: "destructive",
        })
        router.push("/auth")
      }
    })

    return () => unsubscribe()
  }, [auth, router, toast])

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!hasValidConfig) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Firebase authentication is not properly configured. Please check your environment variables.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>Please sign in to view your profile.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/auth")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile sidebar */}
        <div className="w-full md:w-64 flex flex-col items-center">
          <div className="relative mb-4">
            {user.photoURL ? (
              <Image
                src={user.photoURL || "/placeholder.svg"}
                alt="Profile"
                width={128}
                height={128}
                className="rounded-full"
              />
            ) : (
              <div className="bg-muted flex items-center justify-center rounded-full w-32 h-32">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold">{user.displayName || "User"}</h2>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          <ProfilePhotoUpload user={user} />
        </div>

        {/* Profile content */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your profile information and email address</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <AccountSettings user={user} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
