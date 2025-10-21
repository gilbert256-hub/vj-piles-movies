"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import MovieCard from "@/components/movie-card"
import { useEffect, useState } from "react"
import { getSeries, type Series } from "@/lib/firebase-db"

export default function TVSeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSeries() {
      try {
        const fetchedSeries = await getSeries(50)
        setSeries(fetchedSeries)
      } catch (error) {
        console.error("Error fetching series:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSeries()
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <Header />

        <main className="flex-1 px-4 lg:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">TV Series</h1>
            <p className="text-muted">Binge-watch your favorite TV shows</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : series.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No TV series available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {series.map((show) => (
                <MovieCard
                  key={show.id}
                  movie={{
                    id: show.id || "",
                    title: show.title,
                    image: show.posterUrl,
                    rating: show.rating,
                    year: show.releaseYear,
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
