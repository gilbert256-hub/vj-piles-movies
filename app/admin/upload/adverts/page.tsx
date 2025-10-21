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
import { addAdvert } from "@/lib/firebase-db"

export default function UploadAdvertPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    position: "featured",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addAdvert({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        position: formData.position,
      })

      alert("Advert uploaded successfully!")
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        position: "featured",
      })
    } catch (error) {
      console.error("Error uploading advert:", error)
      alert("Failed to upload advert. Please try again.")
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
              <h1 className="text-xl font-bold">Upload Advert</h1>
              <p className="text-sm text-muted">Add promotional content to the platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <Label htmlFor="title">Advert Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter advert title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter advert description"
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <select
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="featured">Featured Section</option>
                <option value="sidebar">Sidebar</option>
                <option value="banner">Top Banner</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Media Links</h3>

            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/advert.jpg"
                required
              />
            </div>

            <div>
              <Label htmlFor="linkUrl">Link URL *</Label>
              <Input
                id="linkUrl"
                type="url"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://example.com/promotion"
                required
              />
              <p className="text-xs text-muted mt-1">Where users will be redirected when clicking the advert</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
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
                Upload Advert
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
