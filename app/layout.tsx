import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/sidebar-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseProvider } from "@/components/firebase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "A YouTube clone built with Next.js and the YouTube Data API",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FirebaseProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AppSidebar />
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </SidebarProvider>
          </FirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
