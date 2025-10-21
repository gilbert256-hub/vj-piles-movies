"use client"

import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import VideoPlayer from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Play, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getMovie, getSeriesById, getRelatedMovies, getRelatedSeries, type Movie, type Series } from "@/lib/firebase-db"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading, hasActiveSubscription } = useAuth()
  const [content, setContent] = useState<Movie | Series | null>(null)
  const [relatedContent, setRelatedContent] = useState<(Movie | Series)[]>([])
  const [loadingContent, setLoadingContent] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      if (!params.id) return

      try {
        const movieId = params.id as string

        // Try to fetch as movie first
        const movie = await getMovie(movieId)
        if (movie) {
          setContent(movie)
          const related = await getRelatedMovies(movieId, movie.genre, 6)
          setRelatedContent(related)
          setLoadingContent(false)
          return
        }

        // If not a movie, try as series
        const series = await getSeriesById(movieId)
        if (series) {
          setContent(series)
          const related = await getRelatedSeries(movieId, series.genre, 6)
          setRelatedContent(related)
          setLoadingContent(false)
        }
      } catch (error) {
        console.error("Error fetching content:", error)
        setLoadingContent(false)
      }
    }

    if (user && hasActiveSubscription) {
      fetchContent()
    }
  }, [params.id, user, hasActiveSubscription])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || loadingContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-gray-900/50 border-gray-800 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-500" />
            </div>
            <CardTitle className="text-white text-2xl">Subscription Required</CardTitle>
            <CardDescription className="text-gray-400">
              You need an active subscription to watch this content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">Subscribe now to get unlimited access to thousands of movies and series.</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/subscribe")} className="w-full bg-red-600 hover:bg-red-700">
                View Subscription Plans
              </Button>
              <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <VideoPlayer movieId={params.id as string} />

      {relatedContent.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">More Like This {content && `(${content.genre})`}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedContent.map((item) => (
              <Link key={item.id} href={`/watch/${item.id}`} className="group">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={item.posterUrl || "/placeholder.svg?height=450&width=300"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-white">{item.rating.toFixed(1)}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-white/80 mt-1">{item.releaseYear}</p>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm font-medium line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted">{item.releaseYear}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
