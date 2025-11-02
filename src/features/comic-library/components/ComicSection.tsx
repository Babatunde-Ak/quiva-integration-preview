'use client'

import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComicCard } from '@/components/cards/ComicCard'

interface Comic {
  id: string
  title: string
  price?: string
  subtitle?: string
  description?: string
  image: string
  premium?: boolean
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
}

interface ComicSectionProps {
  title: string
  comics: Comic[]
  showNavigation?: boolean
  cardSize?: 'small' | 'medium' | 'large'
  isLoading?: boolean
}

export function ComicSection({ 
  title, 
  comics, 
  showNavigation = true,
  cardSize = "medium",
  isLoading = false
}: ComicSectionProps) {
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
        <h2 className="text-white text-xl font-bold">{title}</h2>
        {showNavigation && !isLoading && comics.length > 0 && (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Comics Grid - Simple horizontal scroll within container */}
      <div className="w-full max-w-full overflow-hidden">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
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
            comics.map((comic) => (
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
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}