"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { addMovie } from "@/lib/firebase-db"

const DISPLAY_CATEGORIES = [
  { id: "trending", label: "🔥 Trending in Cinema" },
  { id: "popular", label: "Popular Movies" },
  { id: "recently-added", label: "Recently Added" },
]

export default function UploadMoviePage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    videoUrl: "",
    trailerUrl: "",
    rating: "",
    duration: "",
    genre: "",
    releaseYear: "",
    displayCategories: [] as string[],
    isFeatured: false,
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      displayCategories: prev.displayCategories.includes(categoryId)
        ? prev.displayCategories.filter((c) => c !== categoryId)
        : [...prev.displayCategories, categoryId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting movie with isFeatured:", formData.isFeatured)
      console.log("[v0] Full form data:", formData)

      await addMovie({
        title: formData.title,
        description: formData.description,
        posterUrl: formData.posterUrl,
        videoUrl: formData.videoUrl,
        trailerUrl: formData.trailerUrl,
        rating: Number.parseFloat(formData.rating),
        duration: Number.parseInt(formData.duration),
        genre: formData.genre,
        releaseYear: Number.parseInt(formData.releaseYear),
        displayCategories: formData.displayCategories,
        isFeatured: formData.isFeatured,
      })

      alert("Movie uploaded successfully!")
      setFormData({
        title: "",
        description: "",
        posterUrl: "",
        videoUrl: "",
        trailerUrl: "",
        rating: "",
        duration: "",
        genre: "",
        releaseYear: "",
        displayCategories: [],
        isFeatured: false,
      })
    } catch (error) {
      console.error("Error uploading movie:", error)
      alert("Failed to upload movie. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Upload Movie</h1>
              <p className="text-sm text-muted">Add a new movie to the platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <Label htmlFor="title">Movie Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter movie title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter movie description"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="genre">Genre *</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  placeholder="e.g., Action, Drama"
                  required
                />
              </div>

              <div>
                <Label htmlFor="releaseYear">Release Year *</Label>
                <Input
                  id="releaseYear"
                  type="number"
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                  placeholder="e.g., 2024"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating *</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="e.g., 8.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 120"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Display Settings</h3>

            <div className="space-y-3">
              <Label>Where should this movie appear? *</Label>
              {DISPLAY_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={formData.displayCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
              <p className="text-xs text-muted">Select at least one category</p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
              />
              <label
                htmlFor="isFeatured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Feature in hero slider
              </label>
            </div>
            <p className="text-xs text-muted">Featured content will appear in the main banner carousel</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Media Links</h3>

            <div>
              <Label htmlFor="posterUrl">Poster Image URL *</Label>
              <Input
                id="posterUrl"
                type="url"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                placeholder="https://example.com/poster.jpg"
                required
              />
            </div>

            <div>
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://example.com/movie.mp4"
                required
              />
            </div>

            <div>
              <Label htmlFor="trailerUrl">Trailer URL (Optional)</Label>
              <Input
                id="trailerUrl"
                type="url"
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                placeholder="https://example.com/trailer.mp4"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || formData.displayCategories.length === 0}
            className="w-full bg-[image:var(--gradient-brand)] hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Movie
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
