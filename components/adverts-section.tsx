"use client"

import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAdverts, type Advert } from "@/lib/firebase-db"

export default function AdvertsSection() {
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdverts() {
      try {
        const fetchedAdverts = await getAdverts(4)
        setAdverts(fetchedAdverts)
      } catch (error) {
        console.error("Error fetching adverts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdverts()
  }, [])

  if (loading) {
    return (
      <section className="relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold">Featured Promotions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/1] bg-card/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (adverts.length === 0) {
    return null
  }

  return (
    <section className="relative">
      {/* Background Glow Effect */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-primary/10 rounded-full blur-3xl -z-10" />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl lg:text-2xl font-bold">Featured Promotions</h2>
        <Link
          href="/promotions"
          className="flex items-center gap-1 text-muted hover:text-foreground transition-colors group"
        >
          <span className="text-sm lg:text-base font-medium">All</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Adverts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adverts.map((advert) => (
          <Link
            key={advert.id}
            href={advert.linkUrl}
            className="group relative bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <div className="relative">
              {/* Image */}
              <div className="relative aspect-[2/1] overflow-hidden">
                <Image
                  src={advert.imageUrl || "/placeholder.svg"}
                  alt={advert.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4 -mt-8 relative z-10">
                <h3 className="font-bold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {advert.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2">{advert.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
