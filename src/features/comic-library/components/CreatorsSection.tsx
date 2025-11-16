'use client'
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRef } from 'react'
import { CreatorCard } from '@/components/cards/CreatorCard'

interface Creator {
  id: string
  name: string
  stories: number
  readers: string
  avatar: string
}

interface CreatorsSectionProps {
  creators: Creator[]
}

export function CreatorsSection({ creators }: CreatorsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handlePrevSlide = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const handleNextSlide = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <section className="my-8 mt-12 w-full overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-xl font-bold">Top Creators</h2>
          <p className="text-white/50 text-sm font-light">
            Checkout Top Rated Comic Creators/Artist on the Comic Marketplace
          </p>
        </div>  

        <button className='border-2 border-secondary-200 rounded-2xl px-8 py-3 flex items-center hover:bg-black-50 transition-colors'>
          <Rocket className='text-secondary-200' />
          <span className="ml-2 text-xs font-medium text-white">View Rankings</span>
        </button>
      </div>

      {/* Creators Slider */}
      {/* <div
        ref={scrollRef}
        className="flex gap-4 flex-wrap overflow-x-auto scroll-smooth pb-2 no-scrollbar"
      >
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="flex-shrink-0 w-[260px] bg-black-500 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/80 hover:border-gray-600/60 transition-all duration-200 cursor-pointer group"
          >
            
            <div className="flex items-center space-x-3">
              
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12 border-2 border-white/50 border-dashed transition-colors">
                  <AvatarImage
                    src={creator.avatar}
                    alt={creator.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-black-500 text-white font-bold text-sm">
                    {creator.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base mb-1 truncate group-hover:text-secondary-100 transition-colors">
                  {creator.name}
                </h3>
                <p className="text-gray-400 text-sm leading-tight">
                  <span className="font-medium text-white/75">{creator.stories}</span>
                  <span className="text-white/75 mx-1">Issues</span>
                  <span className="text-white/75">|</span>
                  <span className="font-medium ml-1 text-white/75">{creator.readers}</span>
                  <span className="text-white/75 ml-1">Readers</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {creators.slice(0, 12).map((creator, index) => (
          <CreatorCard 
            rank={index+1}
            key={creator.id}
            avatar={creator.avatar}
            name={creator.name}
            totalComics={creator.stories}
            />
        ))}
      </div>

    </section>
  )
}
