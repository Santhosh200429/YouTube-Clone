"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthConfigTester } from "@/components/auth-config-tester"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { getDomainsToAuthorize } from "@/lib/auth-utils"

export default function AuthSettingsPage() {
  const [activeTab, setActiveTab] = useState("config")

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Settings</h1>

      <Tabs defaultValue="config" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="domains">Authorized Domains</TabsTrigger>
          <TabsTrigger value="test">Test Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Firebase Authentication Configuration</CardTitle>
              <CardDescription>Manage your Firebase authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Environment Variables</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Your Firebase authentication configuration is managed through environment variables. Make sure these
                    are properly set in your deployment environment.
                  </p>
                  <p className="text-sm">Required environment variables:</p>
                  <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto">
                    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
                    <br />
                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
                    <br />
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
                    <br />
                    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
                    <br />
                    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
                    <br />
                    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
                  </pre>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication Methods</h3>
                <p className="text-sm text-muted-foreground">
                  You need to enable authentication methods in your Firebase console. Go to Authentication &gt; Sign-in
                  method and enable the methods you want to use.
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Email/Password: Basic authentication method</li>
                  <li>Google: Allows users to sign in with their Google accounts</li>
                  <li>Other providers: Facebook, Twitter, GitHub, etc.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Best Practices</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Never hardcode API keys in your client-side code</li>
                  <li>Use Firebase Security Rules to protect your data</li>
                  <li>Enable email verification for new accounts</li>
                  <li>Consider implementing multi-factor authentication for sensitive operations</li>
                  <li>Regularly audit your authentication logs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Authorized Domains</CardTitle>
              <CardDescription>Manage domains that are authorized to use Google Sign-In</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Domain Authorization</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Google Sign-In requires that your domains are authorized in the Firebase console. This is a security
                    measure to prevent phishing attacks.
                  </p>
                  <p className="text-sm">
                    Go to Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains and add the
                    following domains:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                    {getDomainsToAuthorize().map((domain, index) => (
                      <li key={index} className="font-mono bg-muted px-2 py-1 rounded text-xs mt-1 inline-block ml-4">
                        {domain}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Common Domain Types</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium">Production Domains</h4>
                    <p className="text-sm text-muted-foreground">Your main application domain (e.g., yourdomain.com)</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Development Domains</h4>
                    <p className="text-sm text-muted-foreground">Local development server (localhost)</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Preview Domains</h4>
                    <p className="text-sm text-muted-foreground">Deployment previews (e.g., your-app.vercel.app)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Firebase Emulator</h3>
                <p className="text-sm text-muted-foreground">
                  For local development, you can use the Firebase Emulator to bypass domain restrictions. Set{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true</code> in your
                  environment variables.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <div className="grid gap-6 md:grid-cols-2">
            <AuthConfigTester />

            <Card>
              <CardHeader>
                <CardTitle>Troubleshooting Guide</CardTitle>
                <CardDescription>Common issues and their solutions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">auth/unauthorized-domain</h3>
                  <p className="text-sm text-muted-foreground">
                    Your domain is not authorized in Firebase. Add it to the Authorized domains list in Firebase
                    Authentication settings.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">auth/popup-blocked</h3>
                  <p className="text-sm text-muted-foreground">
                    The browser blocked the sign-in popup. Make sure popups are allowed for your domain.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">auth/operation-not-allowed</h3>
                  <p className="text-sm text-muted-foreground">
                    The authentication method is not enabled in Firebase. Enable it in the Firebase console.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">auth/network-request-failed</h3>
                  <p className="text-sm text-muted-foreground">
                    Network error during authentication. Check your internet connection and try again.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Preview Environments</h3>
                  <p className="text-sm text-muted-foreground">
                    Google Sign-In may not work in preview environments due to domain restrictions. Use email/password
                    authentication or the Firebase Emulator instead.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
