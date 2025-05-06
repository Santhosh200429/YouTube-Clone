"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { searchVideos } from "@/lib/youtube-api"
import type { Video } from "@/lib/youtube-api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"

export function SearchInput() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [inputValue, setInputValue] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Video[]>([])
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearchTerm = useDebounce(inputValue, 300)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const handleSearch = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const { videos } = await searchVideos(term, undefined, 5)
      setSearchResults(videos)
    } catch (err) {
      console.error("Search error:", err)
      setError("An error occurred while searching. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
      setShowResults(false)
    }
  }

  const handleClear = () => {
    setInputValue("")
    setSearchResults([])
  }

  // Handle clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch search results when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchTerm, handleSearch])

  return (
    <div className="relative w-full max-w-xl" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="search"
          placeholder="Search"
          className="w-full h-10 pl-10 pr-10 rounded-full border bg-background"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => {
            if (inputValue.trim().length > 0) {
              setShowResults(true)
            }
          }}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-10 top-0 h-10 w-10 rounded-full"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
        <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10 rounded-full">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {showResults && inputValue.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-background shadow-lg">
          {isSearching ? (
            <div className="p-2 space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-16 w-28 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">
              <p>{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {searchResults.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch?v=${video.id}`}
                  className="flex items-start gap-2 p-2 hover:bg-accent transition-colors"
                  onClick={() => setShowResults(false)}
                >
                  <div className="relative h-16 w-28 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                  </div>
                </Link>
              ))}
              <div className="p-2 border-t">
                <Button variant="ghost" className="w-full justify-center text-primary" onClick={handleSubmit}>
                  View all results
                </Button>
              </div>
            </div>
          ) : inputValue.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No results found for "{inputValue}"</p>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <p>Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
