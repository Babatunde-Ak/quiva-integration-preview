'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { MainButton } from '@/components/button'
import { avatar2Img, hbar } from '../../../../public/dev_images'
import { formatNumberShorthand } from '@/lib/Formatnumber'

export interface HeroComicData {
  id: string
  title: string
  description?: string
  tags?: string[]
  image: string
  buttonText?: string
  creatorUsername?: string
  creatorWalletAddress?: string
  /** @deprecated use nftId.maxSupply */
  totalIssues?: number
  /** @deprecated use nftId.price */
  floorPrice?: number
  price?: number | string
  status?: string
  nftId?: {
    price?: number
    maxSupply?: number
    [key: string]: any
  }
}

interface HeroComicSliderProps {
  comics: any[]
  autoplayDelay?: number
  onComicClick?: (comic: any) => void
}

export function HeroComicSlider({
  comics,
  autoplayDelay = 5000,
  onComicClick
}: HeroComicSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(0)

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || comics.length <= 1) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % comics.length)
    }, autoplayDelay)

    return () => clearInterval(interval)
  }, [comics.length, autoplayDelay, isAutoPlaying])

  // Handle mouse enter/leave for autoplay pause
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Handle navigation
  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setDirection(-1)
    setCurrentSlide((prev) => prev === 0 ? comics.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % comics.length)
  }

  if (comics.length === 0) return null

  const currentComic = comics[currentSlide]

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  }

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut' as const,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      }
    },
  }

  return (
    <section 
      className="relative w-full h-[400px] sm:h-[500px] md:h-[500px] lg:h-[500px] rounded-t-lg md:rounded-2xl overflow-hidden group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Image with Overlay */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          className="absolute inset-0"
        >
          {/* Using a wrapper div with overflow hidden for scale effect */}
          <motion.div
            className="w-full h-full"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{
              duration: 8,
              ease: 'easeInOut' as const,
            }}
          >
            <img 
              src={currentComic.image}
              alt={currentComic.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black-400/90 via-black-400/60 to-black-400/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black-400/80 via-transparent to-black-400/40" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-start p-4 sm:p-6 md:p-8 lg:p-12 z-10 font-recursive">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="max-w-full sm:max-w-2xl lg:max-w-4xl"
          >
            {/* Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
            >
              {currentComic.title}
            </motion.h1>

            {/* Studio */}
            {(currentComic.creatorUsername || currentComic.creatorWalletAddress) && (
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2 mb-2 sm:mb-3 md:mb-4"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-sm flex items-center justify-center overflow-hidden">
                  <img src={avatar2Img.src} alt="Studio Icon" className="w-full h-full object-cover" />
                </div>

                <div className='flex flex-col justify-center'>
                  <span className="text-white/80 font-light text-xs sm:text-sm">Creator</span>
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {currentComic.creatorUsername || (currentComic.creatorWalletAddress
                      ? `${currentComic.creatorWalletAddress.slice(0, 6)}...${currentComic.creatorWalletAddress.slice(-4)}`
                      : '')}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-white/90 font-light text-xs sm:text-sm md:text-base lg:text-lg mb-4 sm:mb-5 md:mb-6 max-w-full sm:max-w-xl lg:max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-3"
            >
              {currentComic.description}
            </motion.p>

            {/* Stats */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 text-white bg-gray-400/30 backdrop-blur-sm p-2 sm:p-3 md:p-4 lg:px-6 rounded-md md:rounded-lg max-w-full sm:max-w-lg lg:max-w-xl w-fit border border-white/30"
            >
              {(() => {
                const fp = currentComic.nftId?.price ?? currentComic.floorPrice
                return fp !== undefined ? (
                  <div className="flex flex-col border-r border-white/30 pr-2 sm:pr-3 md:pr-4">
                    <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide mb-0.5 sm:mb-1 font-light whitespace-nowrap">Floor Price</span>
                    <span className="text-sm sm:text-base md:text-lg font-semibold flex items-center">
                      {Number(fp).toFixed(3)}
                      <img src={hbar.src} alt="hbar" className="inline w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 ml-1" />
                    </span>
                  </div>
                ) : null
              })()}
              {(() => {
                const supply = currentComic.nftId?.maxSupply ?? currentComic.totalIssues
                return supply !== undefined ? (
                  <div className="flex flex-col border-r border-white/30 pr-2 sm:pr-3 md:pr-4">
                    <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide mb-0.5 sm:mb-1 font-light whitespace-nowrap">Total Issues</span>
                    <span className="text-sm sm:text-base md:text-lg font-semibold">{formatNumberShorthand(supply)}</span>
                  </div>
                ) : null
              })()}
              {currentComic.price !== undefined && (
                <div className="flex flex-col border-r border-white/30 pr-2 sm:pr-3 md:pr-4">
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide mb-0.5 sm:mb-1 font-light">Price</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold flex items-center">
                    {typeof currentComic.price === 'number'
                      ? <>{currentComic.price.toFixed(2)}<img src={hbar.src} alt="hbar" className="inline w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 ml-1" /></>
                      : String(currentComic.price).replace(/\s*HBAR\s*/i, '')}
                    {typeof currentComic.price !== 'number' && (
                      <img src={hbar.src} alt="hbar" className="inline w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 ml-1" />
                    )}
                  </span>
                </div>
              )}
              {currentComic.status && (
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wide mb-0.5 sm:mb-1 font-light">Status</span>
                  <span className="text-sm sm:text-base md:text-lg font-semibold uppercase">{currentComic.status}</span>
                </div>
              )}
            </motion.div>

            {/* Action Button */}
            <motion.div variants={itemVariants}>
              <MainButton onClick={() => onComicClick?.(currentComic)}>
                {currentComic.buttonText || 'View'}
              </MainButton>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {comics.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 transform -translate-x-1/2 flex items-center space-x-1.5 sm:space-x-2 z-20 bg-white/10 backdrop-blur-sm py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 rounded-full">
          {comics.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-3 h-1.5 sm:w-4 sm:h-2 md:w-8 md:h-4 bg-primary-500 rounded-full' 
                  : 'w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-4 md:h-4 bg-white/40 hover:bg-white/60 rounded-full'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows (appear on hover) */}
      {comics.length > 1 && (
        <>
          <motion.button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            aria-label="Previous slide"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </motion.button>
          <motion.button
            onClick={goToNext}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-2.5 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20"
            aria-label="Next slide"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5 md:w-6 md:h-6">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </motion.button>
        </>
      )}
    </section>
  )
}