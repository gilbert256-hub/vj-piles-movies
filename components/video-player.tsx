"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  ArrowLeft,
  Loader2,
  Download,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { getMovie, getSeriesById, getEpisodesBySeriesId, type Movie, type Series } from "@/lib/firebase-db"

interface VideoPlayerProps {
  movieId: string
}

function getVideoType(url: string): "youtube" | "vimeo" | "direct" {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }
  if (url.includes("vimeo.com")) {
    return "vimeo"
  }
  return "direct"
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function getVimeoId(url: string): string | null {
  const regExp = /vimeo.*\/(\d+)/i
  const match = url.match(regExp)
  return match ? match[1] : null
}

export default function VideoPlayer({ movieId }: VideoPlayerProps) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const [content, setContent] = useState<Movie | Series | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [videoType, setVideoType] = useState<"youtube" | "vimeo" | "direct">("direct")
  const [contentType, setContentType] = useState<"movie" | "series">("movie")

  useEffect(() => {
    async function fetchContent() {
      try {
        console.log("[v0] Fetching content for ID:", movieId)

        // Try to fetch as movie first
        const movie = await getMovie(movieId)
        if (movie) {
          console.log("[v0] Found movie:", movie)
          setContent(movie)
          setVideoUrl(movie.videoUrl)
          setVideoType(getVideoType(movie.videoUrl))
          setContentType("movie")
          setIsLoading(false)
          return
        }

        // If not a movie, try as series
        const series = await getSeriesById(movieId)
        if (series) {
          console.log("[v0] Found series:", series)
          setContent(series)
          setContentType("series")

          // Get first episode of first season
          const episodes = await getEpisodesBySeriesId(movieId)
          if (episodes.length > 0) {
            console.log("[v0] Found episodes:", episodes)
            setVideoUrl(episodes[0].videoUrl)
            setVideoType(getVideoType(episodes[0].videoUrl))
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error("[v0] Error fetching content:", error)
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [movieId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
    }
  }, [videoType])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    if (isMuted) {
      video.volume = volume || 0.5
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const skip = (seconds: number) => {
    const video = videoRef.current
    if (!video || videoType !== "direct") return

    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, duration))
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && videoType === "direct") {
        setShowControls(false)
      }
    }, 3000)
  }

  const handleDownload = () => {
    if (!videoUrl || !content || videoType !== "direct") {
      alert("Download is only available for direct video links")
      return
    }

    const link = document.createElement("a")
    link.href = videoUrl
    link.download = `${content.title}.mp4`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!content) return

    const shareData = {
      title: content.title,
      text: `Watch ${content.title} on MovieBox`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  if (!content || !videoUrl) {
    return (
      <div className="relative w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Loading video...</p>
        </div>
      </div>
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && videoType === "direct" && setShowControls(false)}
    >
      {videoType === "youtube" && (
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=0&controls=1&rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {videoType === "vimeo" && (
        <iframe
          src={`https://player.vimeo.com/video/${getVimeoId(videoUrl)}?autoplay=0`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}

      {videoType === "direct" && (
        <>
          {/* Video Element */}
          <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" onClick={togglePlay} />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          )}

          {/* Center Play Button */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="icon"
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-white text-sm mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
                  <SkipBack className="w-6 h-6" />
                </Button>

                <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>

                <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hover:bg-white/20">
                  <SkipForward className="w-6 h-6" />
                </Button>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </Button>
                  <div className="w-24">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="w-6 h-6" />
                </Button>

                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Top Bar - Always visible for embedded players */}
      <div
        className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${
          videoType !== "direct" || showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-white text-2xl font-bold">{content.title}</h1>
              <p className="text-white/80 text-sm">
                {content.releaseYear} •{" "}
                {contentType === "movie" && "duration" in content && formatDuration(content.duration)} • {content.genre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
              title="Download"
            >
              <Download className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white hover:bg-white/20"
              title="Share"
            >
              <Share2 className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
