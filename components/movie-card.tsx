"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { useState } from "react"

interface Movie {
  id: number
  title: string
  image: string
  rating: number
  year: number
}

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/watch/${movie.id}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-card mb-2 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl max-w-[180px]">
          <Image
            src={movie.image || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
          />
          {/* Hover Overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center animate-in fade-in duration-200">
              <div className="text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Play Now</p>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{movie.title}</h3>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
