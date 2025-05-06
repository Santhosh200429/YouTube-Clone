"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { updateProfile, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import type { User } from "firebase/auth"
import { isValidEmail } from "@/lib/validation"

interface ProfileFormProps {
  user: User
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast()

  const [displayName, setDisplayName] = useState(user.displayName || "")
  const [email, setEmail] = useState(user.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailChangeMode, setEmailChangeMode] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: displayName,
        })
      }

      // Update email if changed and password provided
      if (email !== user.email && emailChangeMode) {
        if (!currentPassword) {
          setError("Please enter your current password to change your email")
          setLoading(false)
          return
        }

        if (!isValidEmail(email)) {
          setError("Please enter a valid email address")
          setLoading(false)
          return
        }

        // Re-authenticate user before changing email
        try {
          const credential = EmailAuthProvider.credential(user.email!, currentPassword)
          await reauthenticateWithCredential(user, credential)

          // Now update email
          await updateEmail(user, email)
          setEmailChangeMode(false)
          setCurrentPassword("")
        } catch (authError: any) {
          console.error("Authentication error:", authError)
          if (authError.code === "auth/wrong-password") {
            setError("Incorrect password. Please try again.")
          } else {
            setError("Failed to authenticate. Please try again.")
          }
          setLoading(false)
          return
        }
      }

      setSuccess("Profile updated successfully")
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (err: any) {
      console.error("Error updating profile:", err)

      if (err.code === "auth/requires-recent-login") {
        setError("For security reasons, please sign in again before updating your email.")
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use by another account.")
      } else {
        setError("Failed to update profile. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-600 dark:text-green-400">Success</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          disabled={!emailChangeMode}
        />
        {!emailChangeMode && (
          <Button type="button" variant="outline" size="sm" onClick={() => setEmailChangeMode(true)}>
            Change Email
          </Button>
        )}
      </div>

      {emailChangeMode && email !== user.email && (
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            required={email !== user.email}
          />
          <p className="text-xs text-muted-foreground">
            For security reasons, please enter your current password to change your email
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
