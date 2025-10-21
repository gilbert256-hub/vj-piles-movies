"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import MovieCard from "@/components/movie-card"
import { useEffect, useState } from "react"
import { getMovies, type Movie } from "@/lib/firebase-db"

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const fetchedMovies = await getMovies(50)
        setMovies(fetchedMovies)
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <Header />

        <main className="flex-1 px-4 lg:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Movies</h1>
            <p className="text-muted">Discover and watch amazing movies</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-card/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No movies available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4 pb-24 lg:pb-8">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={{
                    id: movie.id || "",
                    title: movie.title,
                    image: movie.posterUrl,
                    rating: movie.rating,
                    year: movie.releaseYear,
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
