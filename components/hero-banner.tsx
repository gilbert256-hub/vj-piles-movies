"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { getFeaturedContent, type Movie, type Series } from "@/lib/firebase-db"

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [featuredContent, setFeaturedContent] = useState<(Movie | Series)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedContent() {
      try {
        const content = await getFeaturedContent(5)
        if (content.length > 0) {
          setFeaturedContent(content)
        }
      } catch (error) {
        console.error("Error fetching featured content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedContent()
  }, [])

  useEffect(() => {
    if (featuredContent.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredContent.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [featuredContent.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredContent.length) % featuredContent.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredContent.length)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[300px] lg:h-[450px] overflow-hidden mb-8 bg-card/50 animate-pulse rounded-2xl" />
    )
  }

  if (featuredContent.length === 0) {
    return null
  }

  const currentItem = featuredContent[currentIndex]

  return (
    <div className="relative w-full h-[300px] lg:h-[450px] overflow-hidden mb-8 rounded-2xl border-4 border-accent shadow-lg shadow-accent/20">
      {/* Banner Image */}
      <div className="absolute inset-0">
        <Image
          src={currentItem.posterUrl || "/placeholder.svg"}
          alt={currentItem.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-4 lg:px-6 pb-8 lg:pb-12">
        <h2 className="text-2xl lg:text-4xl font-bold mb-2 max-w-2xl text-balance">{currentItem.title}</h2>
        <p className="text-muted text-base lg:text-lg mb-4 max-w-xl line-clamp-2">{currentItem.description}</p>
        <Link href={`/watch/${currentItem.id}`}>
          <Button
            size="lg"
            className="w-fit bg-[image:var(--gradient-brand)] hover:opacity-90 text-white font-semibold"
          >
            <Play className="w-5 h-5 mr-2" />
            Play Now
          </Button>
        </Link>
      </div>

      {/* Navigation Arrows */}
      {featuredContent.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredContent.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-accent w-8" : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
