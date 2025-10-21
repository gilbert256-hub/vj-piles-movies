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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addEpisode, getSeries, type Series } from "@/lib/firebase-db"

export default function UploadEpisodePage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSeries, setAvailableSeries] = useState<Series[]>([])
  const [loadingSeries, setLoadingSeries] = useState(true)
  const [formData, setFormData] = useState({
    seriesId: "",
    seasonNumber: "",
    episodeNumber: "",
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    duration: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    async function fetchSeries() {
      try {
        const series = await getSeries()
        setAvailableSeries(series)
      } catch (error) {
        console.error("Error fetching series:", error)
      } finally {
        setLoadingSeries(false)
      }
    }

    if (user && isAdmin) {
      fetchSeries()
    }
  }, [user, isAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addEpisode({
        seriesId: formData.seriesId,
        seasonNumber: Number.parseInt(formData.seasonNumber),
        episodeNumber: Number.parseInt(formData.episodeNumber),
        title: formData.title,
        description: formData.description,
        thumbnailUrl: formData.thumbnailUrl,
        videoUrl: formData.videoUrl,
        duration: Number.parseInt(formData.duration),
      })

      alert("Episode uploaded successfully!")
      setFormData({
        seriesId: "",
        seasonNumber: "",
        episodeNumber: "",
        title: "",
        description: "",
        thumbnailUrl: "",
        videoUrl: "",
        duration: "",
      })
    } catch (error) {
      console.error("Error uploading episode:", error)
      alert("Failed to upload episode. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Upload Episode</h1>
              <p className="text-sm text-muted">Add a new episode to an existing series</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <Label htmlFor="seriesId">Select Series *</Label>
              {loadingSeries ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted">Loading series...</span>
                </div>
              ) : availableSeries.length === 0 ? (
                <div className="py-2">
                  <p className="text-sm text-muted">No series available. Please upload a series first.</p>
                  <Link href="/admin/upload/series" className="text-sm text-primary hover:underline">
                    Upload Series
                  </Link>
                </div>
              ) : (
                <Select
                  value={formData.seriesId}
                  onValueChange={(value) => setFormData({ ...formData, seriesId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeries.map((series) => (
                      <SelectItem key={series.id} value={series.id || ""}>
                        {series.title} ({series.releaseYear})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <p className="text-xs text-muted mt-1">Choose the series this episode belongs to</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="seasonNumber">Season Number *</Label>
                <Input
                  id="seasonNumber"
                  type="number"
                  value={formData.seasonNumber}
                  onChange={(e) => setFormData({ ...formData, seasonNumber: e.target.value })}
                  placeholder="e.g., 1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="episodeNumber">Episode Number *</Label>
                <Input
                  id="episodeNumber"
                  type="number"
                  value={formData.episodeNumber}
                  onChange={(e) => setFormData({ ...formData, episodeNumber: e.target.value })}
                  placeholder="e.g., 5"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="title">Episode Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter episode title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter episode description"
                rows={4}
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
                placeholder="e.g., 45"
                required
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Media Links</h3>

            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail Image URL *</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
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
                placeholder="https://example.com/episode.mp4"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !formData.seriesId}
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
                Upload Episode
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
