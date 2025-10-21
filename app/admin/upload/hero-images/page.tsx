"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { addHeroImage } from "@/lib/firebase-db"

export default function UploadHeroImages() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      await addHeroImage({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
      })

      alert("Hero image uploaded successfully!")
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
      })
      router.push("/admin")
    } catch (error) {
      console.error("Error uploading hero image:", error)
      alert("Failed to upload hero image. Please try again.")
    } finally {
      setIsUploading(false)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                  Upload Hero Image
                </h1>
                <p className="text-sm text-muted mt-1">Add images to the homepage hero slider</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image URL */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Label htmlFor="imageUrl" className="text-base font-semibold mb-2 block">
              Hero Image URL *
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/hero-image.jpg"
              className="bg-input border-border"
              required
            />
            <p className="text-xs text-muted mt-2">Recommended size: 1920x450px</p>
          </div>

          {/* Title */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Label htmlFor="title" className="text-base font-semibold mb-2 block">
              Title *
            </Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter hero image title"
              className="bg-input border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Label htmlFor="description" className="text-base font-semibold mb-2 block">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter a brief description"
              className="bg-input border-border min-h-[100px]"
              required
            />
          </div>

          {/* Link URL */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Label htmlFor="linkUrl" className="text-base font-semibold mb-2 block">
              Link URL (Optional)
            </Label>
            <Input
              id="linkUrl"
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="/watch/123 or external URL"
              className="bg-input border-border"
            />
            <p className="text-xs text-muted mt-2">Where should users go when they click "Play Now"?</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-[image:var(--gradient-brand)] hover:opacity-90 text-white font-semibold"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Hero Image
                </>
              )}
            </Button>
            <Link href="/admin">
              <Button type="button" variant="outline" disabled={isUploading}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
