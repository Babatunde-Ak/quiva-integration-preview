'use client'

import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComicCard } from '@/components/cards/ComicCard'
import { motion } from 'framer-motion'
import { InvertedGridComicCard } from '@/components/cards/InvertedGridComicCard'
import { Comic } from '@/features/comic-library/utils/transformComicData'

const FILTERS = [
  {
    id: 'trending',
    label: 'Trending'
  },
  {
    id: 'popular', 
    label: 'Popular'
  }
]

type FilterType = typeof FILTERS[number]['id']

interface ComicSectionProps {
  title: string
  subtitle?: string
  comics: Comic[]
  showNavigation?: boolean
  cardSize?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  onFilterChange?: (filter: string) => void
  defaultFilter?: string
  filters?: {
    id: string
    label: string
  }[]
  inverted?: boolean
}

export function ComicSection({ 
  title, 
  subtitle,
  comics, 
  showNavigation = true,
  cardSize = "medium",
  isLoading = false,
  filters = FILTERS,
  onFilterChange,
  defaultFilter = 'trending',
  inverted = false
}: ComicSectionProps) {

  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  // Responsive card widths
  const getCardWidth = () => {
    switch (cardSize) {
      case 'small': return { mobile: 250, tablet: 200, desktop: 200 }
      case 'large': return { mobile: 300, tablet: 320, desktop: 320 }
      default: return { mobile: 280, tablet: 280, desktop: 280 }
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidths = getCardWidth()
      // Use mobile width for mobile screens
      const width = window.innerWidth < 640 ? cardWidths.mobile : 
                  window.innerWidth < 1024 ? cardWidths.tablet : cardWidths.desktop
      scrollContainerRef.current.scrollBy({
        left: -width * 1.5, // Scroll 1.5 cards on mobile for better UX
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidths = getCardWidth()
      const width = window.innerWidth < 640 ? cardWidths.mobile : 
                  window.innerWidth < 1024 ? cardWidths.tablet : cardWidths.desktop
      scrollContainerRef.current.scrollBy({
        left: width * 1.5,
        behavior: 'smooth'
      })
    }
  }

  const getSkeletonWidth = () => {
    switch (cardSize) {
      case 'small': return 'w-[250px] sm:w-[200px]'
      case 'large': return 'w-[300px] sm:w-[320px]'
      default: return 'w-[280px]'
    }
  }

  const getSkeletonHeight = () => {
    switch (cardSize) {
      case 'small': return 'h-[240px] sm:h-[280px]'
      case 'large': return 'h-[380px] sm:h-[420px]'
      default: return 'h-[320px] sm:h-[350px]'
    }
  }

  return (
    <section className="my-6 sm:my-8 mt-8 sm:mt-12 w-full max-w-full px-4 sm:px-6 lg:px-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 w-full gap-4">
        
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Header Section */}
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-white text-lg sm:text-xl font-semibold">
              {title}
            </h2>
            {subtitle && (
              <p className="text-white/50 text-sm font-light">
                {subtitle}
              </p>
            )}
          </div>

          {/* Filter Buttons - Responsive */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-light rounded-lg border-[0.6px] transition-all duration-200 ${
                  activeFilter === filter.id
                    ? 'text-white border-white'
                    : 'text-white border-black-50 hover:border-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Comics Horizontal Scroll */}
      <div className="w-full max-w-full overflow-hidden relative">
        
        {/* Navigation Buttons - Hide on small screens */}
        {showNavigation && !isLoading && comics.length > 0 && (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex z-40 absolute left-2 top-1/2 -translate-y-1/2 bg-black-50/80 backdrop-blur-sm p-2 lg:p-3 rounded-full text-white hover:text-white hover:bg-white/20 transition-all"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hidden sm:flex z-40 absolute right-2 top-1/2 -translate-y-1/2 bg-black-50/80 backdrop-blur-sm p-2 lg:p-3 rounded-full text-white hover:text-white hover:bg-white/20 transition-all"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
            </Button>
          </>
        )}

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="relative flex space-x-3 sm:space-x-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
          }}
        >
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`flex-shrink-0 snap-start ${getSkeletonWidth()}`}>
                <div className="space-y-3">
                  <Skeleton className={`${getSkeletonWidth()} ${getSkeletonHeight()} rounded-lg bg-white/20`} />
                  <Skeleton className="h-4 w-3/4 bg-white/20" />
                  <Skeleton className="h-3 w-1/2 bg-white/20" />
                  <Skeleton className="h-8 sm:h-9 w-full bg-white/20" />
                </div>
              </div>
            ))
          ) : inverted ? (
            // Inverted Comics
            comics.map((comic, index) => (
              <div key={comic.id} className="flex-shrink-0 snap-start">
                <InvertedGridComicCard 
                  {...comic}
                  number={index + 1}
                  size={cardSize}
                />
              </div>
            ))
          ) : (
            // Regular Comics
            comics.map((comic, index) => (
              <div key={comic.id} className="flex-shrink-0 snap-start">
                <ComicCard 
                  {...comic}
                  number={index + 1}
                  size={cardSize}
                />
              </div>
            ))
          )}
        </div>

        {/* Mobile Scroll Indicator - Show dots on mobile */}
        {!isLoading && comics.length > 2 && (
          <div className="flex sm:hidden justify-center mt-4 space-x-1">
            {Array.from({ length: Math.min(comics.length - 1, 5) }).map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full bg-white/30"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}