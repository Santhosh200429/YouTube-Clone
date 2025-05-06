"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { updateProfile } from "firebase/auth"
import { Camera, Loader2 } from "lucide-react"
import type { User } from "firebase/auth"

interface ProfilePhotoUploadProps {
  user: User
}

export function ProfilePhotoUpload({ user }: ProfilePhotoUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Convert file to data URL for simple demo
      // In a real app, you would upload to a storage service like Firebase Storage
      const dataUrl = await readFileAsDataURL(file)

      // Update user profile with new photo URL
      await updateProfile(user, {
        photoURL: dataUrl,
      })

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully.",
      })
    } catch (err) {
      console.error("Error updating profile photo:", err)
      setError("Failed to update profile photo. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="mr-2 h-4 w-4" />
            Change Photo
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground mt-2 text-center">JPEG, PNG or GIF, max 5MB</p>
    </div>
  )
}
