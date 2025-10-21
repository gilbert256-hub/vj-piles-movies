"use client"

import { ChevronRight } from "lucide-react"
import MovieCard from "./movie-card"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getMoviesByCategory, getSeriesByCategory, getRecentlyAdded, type Movie, type Series } from "@/lib/firebase-db"

interface ContentSectionProps {
  title: string
  category: string
}

export default function ContentSection({ title, category }: ContentSectionProps) {
  const [content, setContent] = useState<(Movie | Series)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        let fetchedContent: (Movie | Series)[] = []

        if (category === "recently-added") {
          fetchedContent = await getRecentlyAdded(8)
        } else if (category === "trending") {
          const [movies, series] = await Promise.all([
            getMoviesByCategory("trending", 4),
            getSeriesByCategory("trending", 4),
          ])
          fetchedContent = [...movies, ...series]
        } else if (category === "popular") {
          fetchedContent = await getMoviesByCategory("popular", 8)
        } else if (category === "top-series") {
          fetchedContent = await getSeriesByCategory("top-series", 8)
        } else {
          const [movies, series] = await Promise.all([
            getMoviesByCategory(category, 4),
            getSeriesByCategory(category, 4),
          ])
          fetchedContent = [...movies, ...series].slice(0, 8)
        }

        setContent(fetchedContent)
      } catch (error) {
        console.error("Error fetching content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [category])

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-card/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (content.length === 0) {
    return null
  }

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">{title}</h2>
        <Link
          href={`/${category}`}
          className="flex items-center gap-1 text-muted hover:text-foreground transition-colors group"
        >
          <span className="text-sm lg:text-base font-medium">All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-7 gap-3 lg:gap-4">
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
    </section>
  )
}
