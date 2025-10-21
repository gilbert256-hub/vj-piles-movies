import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import HeroBanner from "@/components/hero-banner"
import ContentSection from "@/components/content-section"
import AdvertsSection from "@/components/adverts-section"
import Footer from "@/components/footer"
import MobileBottomNav from "@/components/mobile-bottom-nav"

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-56">
        <Header />

        <main className="flex-1">
          {/* Hero Banner */}
          <HeroBanner />

          {/* Content Sections */}
          <div className="px-4 lg:px-6 space-y-8 pb-24 lg:pb-8">
            <ContentSection title="🔥Trending in Cinema🎞️" category="trending" />

            <AdvertsSection />

            <ContentSection title="Popular Movies" category="popular" />

            <ContentSection title="Top TV Series" category="top-series" />

            <ContentSection title="Recently Added" category="recently-added" />

            <ContentSection title="Action Movies" category="action" />

            <ContentSection title="Comedy Shows" category="comedy" />
          </div>
        </main>

        <Footer />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
