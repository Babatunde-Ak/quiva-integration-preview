'use client'

import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComicCard } from '@/components/cards/ComicCard'
import { motion } from 'framer-motion'


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

interface Comic {
  id: string
  title: string
  subtitle?: string
  price?: string
  description?: string
  image: string
  premium?: boolean
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
}

interface ComicSectionProps {
  title: string
  subtitle?: string
  comics: Comic[]
  showNavigation?: boolean
  cardSize?: 'small' | 'medium' | 'large'
  isLoading?: boolean,
  onFilterChange?: (filter: string) => void
  defaultFilter?: string
  filters?: {
    id: string
    label: string
  }[]
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
  defaultFilter = 'trending'
}: ComicSectionProps) {

  const [activeFilter, setActiveFilter] = useState<string>(defaultFilter)

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    onFilterChange?.(filter)
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = cardSize === 'small' ? 200 : cardSize === 'medium' ? 280 : 320
      scrollContainerRef.current.scrollBy({
        left: -cardWidth * 2,
        behavior: 'smooth'
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = cardSize === 'small' ? 200 : cardSize === 'medium' ? 280 : 320
      scrollContainerRef.current.scrollBy({
        left: cardWidth * 2,
        behavior: 'smooth'
      })
    }
  }

  const getSkeletonWidth = () => {
    switch (cardSize) {
      case 'small': return 'w-[200px]'
      case 'large': return 'w-[320px]'
      default: return 'w-[280px]'
    }
  }

  const getSkeletonHeight = () => {
    switch (cardSize) {
      case 'small': return 'h-[280px]'
      case 'large': return 'h-[420px]'
      default: return 'h-[350px]'
    }
  }

  return (
    <section className="my-8 mt-12 w-full max-w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 w-full">
        
        <div className="flex flex-col space-y-4">
          {/* Header Section */}
          <div className="space-y-2">
            <h2 className="text-white text-xl font-semibold">
              {title}
            </h2>
            <p className="text-white/50 text-sm font-light">
              {subtitle}
            </p>
          </div>

          {/* Filter Buttons - Mapped from constant */}
          <div className="flex gap-2">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`px-1 py-1 text-sm font-light rounded-lg border-[0.6px] transition-all duration-200 ${
                  activeFilter === filter.id
                    ? ' text-white border-white'
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

      {/* Comics Grid - Simple horizontal scroll within container */}
      <div className="w-full max-w-full overflow-hidden relative">
        {showNavigation && !isLoading && comics.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="z-40 absolute left-0 top-16 bg-black-50 p-3 rounded-full text-white hover:text-white hover:bg-white/20"
                  onClick={scrollLeft}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="z-40 absolute right-0 top-16 bg-black-50 p-3 rounded-full text-white hover:text-white hover:bg-white/20"
                  onClick={scrollRight}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
        <div 
          ref={scrollContainerRef}
          className="relative flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >

            

          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={`flex-shrink-0 ${getSkeletonWidth()}`}>
                <div className="space-y-3">
                  <Skeleton className={`${getSkeletonWidth()} ${getSkeletonHeight()} rounded-lg bg-white/20`} />
                  <Skeleton className="h-4 w-3/4 bg-white/20" />
                  <Skeleton className="h-3 w-1/2 bg-white/20" />
                  <Skeleton className="h-9 w-full bg-white/20" />
                </div>
              </div>
            ))
          ) : (
            // Actual Comics
            comics.map((comic, index) => (
              <div key={comic.id} className="flex-shrink-0">
                <ComicCard 
                  id={comic.id}
                  title={comic.title}
                  price={comic.price}
                  subtitle={comic.subtitle}
                  description={comic.description}
                  image={comic.image}
                  premium={comic.premium}
                  buttonText={comic.buttonText}
                  buttonVariant={comic.buttonVariant}
                  size={cardSize}
                  number={index + 1}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}