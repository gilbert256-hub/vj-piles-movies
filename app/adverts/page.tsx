"use client"

import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import MobileBottomNav from "@/components/mobile-bottom-nav"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getAdverts, type Advert } from "@/lib/firebase-db"

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAdverts() {
      try {
        const fetchedAdverts = await getAdverts(50)
        setAdverts(fetchedAdverts)
      } catch (error) {
        console.error("Error fetching adverts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdverts()
  }, [])

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <Header />

        <main className="flex-1 px-4 lg:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Adverts & Promotions</h1>
            <p className="text-muted">Check out our latest offers and promotions</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 lg:pb-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video bg-card/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : adverts.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <p>No adverts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 lg:pb-8">
              {adverts.map((advert) => (
                <Link
                  key={advert.id}
                  href={advert.link || "#"}
                  className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={advert.imageUrl || "/placeholder.svg"}
                      alt={advert.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                        {advert.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted mb-3">{advert.description}</p>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      <span>Learn More</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
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
