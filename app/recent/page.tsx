"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import MovieCard from "@/components/movie-card"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { getRecentlyAdded, type Movie, type Series } from "@/lib/firebase-db"

export default function RecentPage() {
  const [content, setContent] = useState<(Movie | Series)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const recentContent = await getRecentlyAdded(50)
        setContent(recentContent)
      } catch (error) {
        console.error("Error fetching recent content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <Header />

        <main className="flex-1 px-4 lg:px-6 py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-primary" />
              <h1 className="text-3xl lg:text-4xl font-bold">Recently Added</h1>
            </div>
            <p className="text-muted">Fresh content added to our library</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No recent content available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {content.map((item) => (
                <MovieCard
                  key={item.id}
                  movie={{
                    id: item.id || "",
                    title: item.title,
                    image: item.posterUrl,
                    rating: item.rating,
                    year: item.releaseYear,
                  }}
                />
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  )
}
