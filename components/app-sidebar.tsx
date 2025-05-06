"use client"

import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Home, Flame, History, Library, Youtube, Menu, Users, Settings, LogIn, User } from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import { SearchInput } from "./search-input"
import { useEffect, useState } from "react"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"
import { useFirebase } from "./firebase-provider"

export function AppSidebar() {
  const { isOpen, toggle, isMobile } = useSidebar()
  const pathname = usePathname()
  const { auth } = useFirebase()

  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      console.log("Firebase auth not available in sidebar")
      setAuthInitialized(true)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser)
          setAuthInitialized(true)
        },
        (error) => {
          console.error("Auth state change error in sidebar:", error)
          setAuthInitialized(true)
        },
      )

      return () => unsubscribe()
    } catch (error) {
      console.error("Firebase auth setup error in sidebar:", error)
      setAuthInitialized(true)
    }
  }, [auth])

  // Update the navItems array to include a profile link
  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Flame, label: "Trending", href: "/trending" },
    { icon: Users, label: "Subscriptions", href: "/subscriptions" },
    { icon: Library, label: "Library", href: "/library" },
    { icon: History, label: "History", href: "/history" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-50 w-full bg-background border-t h-16 flex items-center justify-around px-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              pathname === item.href ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
        <Link
          href="/auth"
          className={cn(
            "flex flex-col items-center justify-center text-xs",
            pathname === "/auth" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <LogIn className="h-5 w-5 mb-1" />
          <span>{user ? "Account" : "Sign In"}</span>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-background border-r",
          isOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex items-center p-4 h-16">
          <Button variant="ghost" size="icon" onClick={toggle} className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          {isOpen && (
            <Link href="/" className="flex items-center">
              <Youtube className="h-6 w-6 text-red-600 mr-2" />
              <span className="font-semibold text-lg">YouTube</span>
            </Link>
          )}
          {!isOpen && (
            <Link href="/">
              <Youtube className="h-6 w-6 text-red-600" />
            </Link>
          )}
        </div>
        <div className="overflow-y-auto h-[calc(100vh-4rem)]">
          <nav className="px-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 mb-1 hover:bg-accent",
                  pathname === item.href ? "bg-accent" : "",
                  isOpen ? "" : "justify-center",
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {isOpen && <span>{item.label}</span>}
              </Link>
            ))}

            <Separator className="my-2" />

            <Link
              href="/auth"
              className={cn(
                "flex items-center rounded-md px-3 py-2 mb-1 hover:bg-accent",
                pathname === "/auth" ? "bg-accent" : "",
                isOpen ? "" : "justify-center",
              )}
            >
              <LogIn className="h-5 w-5 mr-3" />
              {isOpen && <span>{user ? "Account" : "Sign In"}</span>}
            </Link>

            {/* Add a new profile link after the auth link */}
            <Link
              href="/profile"
              className={cn(
                "flex items-center rounded-md px-3 py-2 mb-1 hover:bg-accent",
                pathname === "/profile" ? "bg-accent" : "",
                isOpen ? "" : "justify-center",
              )}
            >
              <User className="h-5 w-5 mr-3" />
              {isOpen && <span>Profile</span>}
            </Link>
          </nav>
          <div className="px-4 pt-4 mt-auto">
            <ThemeToggle />
            {isOpen && user && (
              <div className="mt-4 p-3 bg-accent rounded-md">
                <div className="flex items-center">
                  <div className="bg-background rounded-full h-8 w-8 flex items-center justify-center mr-2">
                    <span className="text-sm font-medium">{user.email?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-30 h-16 bg-background border-b flex items-center px-4",
          isOpen ? "ml-64" : "ml-20",
        )}
      >
        <div className="flex-1 max-w-xl mx-auto">
          <SearchInput />
        </div>
        {authInitialized && (
          <div className="ml-4">
            {user ? (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  <span className="font-medium">{user.email?.charAt(0).toUpperCase()}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
      <div className={cn("pt-16", isOpen ? "ml-64" : "ml-20", isMobile ? "mb-16 ml-0" : "")}></div>
    </>
  )
}
