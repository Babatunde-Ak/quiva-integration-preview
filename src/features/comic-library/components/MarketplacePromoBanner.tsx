'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, Volume2, VolumeX } from 'lucide-react'

/**
 * Quiva's landscape promotional video. Intentionally separate from HeroComicSlider:
 * a lack of active NFT drops must not hide the promotional banner.
 */
export default function MarketplacePromoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const userPaused = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let isVisible = false

    const updatePlayback = () => {
      if (!isVisible || reducedMotion.matches || userPaused.current || document.hidden) {
        video.pause()
        return
      }
      // Muted inline playback is normally permitted. If the browser blocks it,
      // the visible Play button below lets the visitor start playback manually.
      void video.play().catch(() => setIsPlaying(false))
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        updatePlayback()
      },
      { threshold: 0.2 }
    )

    observer.observe(video)
    reducedMotion.addEventListener('change', updatePlayback)
    document.addEventListener('visibilitychange', updatePlayback)

    return () => {
      observer.disconnect()
      reducedMotion.removeEventListener('change', updatePlayback)
      document.removeEventListener('visibilitychange', updatePlayback)
      video.pause()
    }
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      userPaused.current = false
      void video.play().catch(() => setIsPlaying(false))
    } else {
      userPaused.current = true
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setIsMuted(nextMuted)
  }

  return (
    <section
      className="relative isolate aspect-[53/29] w-full overflow-hidden rounded-2xl border border-white/10 bg-black"
      aria-label="Quiva promotional video banner"
      data-testid="marketplace-promo-banner"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        poster="/videos/quiva-marketplace-banner-poster.jpg"
        playsInline
        muted
        loop
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        aria-label="Quiva branded promotional animation"
      >
        <source src="/videos/quiva-marketplace-banner.mp4" type="video/mp4" />
        Your browser does not support HTML5 video.
      </video>

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 p-1.5 text-white backdrop-blur-sm sm:bottom-5 sm:right-5">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={isPlaying ? 'Pause promotional video' : 'Play promotional video'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={isMuted ? 'Unmute promotional video' : 'Mute promotional video'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </section>
  )
}
