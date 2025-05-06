"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  signOut,
} from "firebase/auth"
import { AlertCircle, Check, Loader2, Mail, LogOut, Trash2, AlertTriangle } from "lucide-react"
import type { User } from "firebase/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut(user.auth)
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      router.push("/")
    } catch (err) {
      console.error("Error signing out:", err)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendVerificationEmail = async () => {
    setVerifyingEmail(true)
    setError(null)
    setSuccess(null)

    try {
      await sendEmailVerification(user)
      setSuccess("Verification email sent. Please check your inbox.")
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and follow the instructions.",
      })
    } catch (err: any) {
      console.error("Error sending verification email:", err)

      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.")
      } else {
        setError("Failed to send verification email. Please try again.")
      }
    } finally {
      setVerifyingEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast({
        title: "Password required",
        description: "Please enter your password to delete your account.",
        variant: "destructive",
      })
      return
    }

    setDeletingAccount(true)

    try {
      // Re-authenticate user before deleting account
      const credential = EmailAuthProvider.credential(user.email!, deletePassword)

      await reauthenticateWithCredential(user, credential)

      // Delete user account
      await deleteUser(user)

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })

      setDeleteDialogOpen(false)
      router.push("/")
    } catch (err: any) {
      console.error("Error deleting account:", err)

      if (err.code === "auth/wrong-password") {
        toast({
          title: "Incorrect password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setDeletingAccount(false)
    }
  }

  return (
    <div className="space-y-6">
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

      <div>
        <h3 className="text-lg font-medium">Email Verification</h3>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {user.emailVerified
                ? "Your email has been verified."
                : "Your email is not verified. Please verify your email to access all features."}
            </p>
          </div>
          {!user.emailVerified && (
            <Button variant="outline" size="sm" onClick={handleSendVerificationEmail} disabled={verifyingEmail}>
              {verifyingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {verifyingEmail ? "Sending..." : "Send Verification Email"}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications about account activity and updates
              </p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium">Account Actions</h3>
        <div className="mt-4 space-y-4">
          <div>
            <Button variant="outline" onClick={handleSignOut} disabled={loading} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <p className="mt-1 text-sm text-muted-foreground">Sign out of your account on this device</p>
          </div>

          <div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from
                    our servers.
                  </DialogDescription>
                </DialogHeader>

                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    All your data, including profile information, will be permanently deleted.
                  </AlertDescription>
                </Alert>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="delete-password">Confirm your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || !deletePassword}
                  >
                    {deletingAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
