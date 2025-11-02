'use client';

import { MainButton } from '@/components/button'
import { ComicSection } from '@/features/comic-library/components/ComicSection'
import { CreatorsSection } from '@/features/comic-library/components/CreatorsSection'
import { FeaturedComic } from '@/features/comic-library/components/FeaturedComic'
import { HeroComicSlider } from '@/features/comic-library/components/HeroComicSlider'
import { TopComicsTable } from '@/features/comic-library/components/TopComicsTable'
import { 
  trendingComics, 
  featuredComics, 
  upcomingComics, 
  creators, 
  topComics, 
  mintComics, 
  FeaturesComics, 
  heroComics 
} from '@/features/comic-library/data/sampleData'

import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllComics } from "@/redux/slices/comicSlice"
import { useEffect, useMemo } from "react"
import { transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData'
import { transformApiComicsToTopComics } from '@/features/comic-library/utils/transformtopcomicsdata';

export default function MainPage() {
  const { comics, isLoading } = useAppSelector((state) => state.comic)
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(getAllComics())
  }, [dispatch])

  // Transform API comics to match Comic interface
  const transformedComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return []
    return transformApiComicsToComics(comics.data.comics.data)
  }, [comics])

  const freeComics = useMemo(() => 
    transformedComics.filter(comic => !comic.premium),
    [transformedComics]
  )

  const nftComics = useMemo(() => 
    transformedComics.filter(comic => comic.premium),
    [transformedComics]
  )

  // Transform API comics to TopComic format for the table
  const topNftComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return topComics // Fallback to sample data
    return transformApiComicsToTopComics(comics.data.comics.data)
  }, [comics])

  return (
    <div className="w-full">
      {/* Hero section */}
      <div className="mb-8">
        <HeroComicSlider comics={heroComics} />
      </div>

      {/* Trending Comics - Use API data or fallback */}
      <ComicSection 
        title="Trending Comics"
        comics={transformedComics.length > 0 ? transformedComics.slice(0, 50) : trendingComics} 
        isLoading={isLoading}
      />

      {/* Featured Comics - Use NFT comics from API */}
      <ComicSection 
        title="Featured Comics"
        comics={nftComics.length > 0 ? nftComics : featuredComics}
        showNavigation={true} 
        isLoading={isLoading}
      />

      {/* Upcoming Comics - Use free comics from API */}
      <ComicSection 
        title="Upcoming Comics" 
        comics={freeComics.length > 0 ? freeComics : upcomingComics} 
        isLoading={isLoading}
      />

      {/* Featured Comic Banner */}
      <div className="my-8">
        <FeaturedComic comics={FeaturesComics} />
      </div>

      {/* Our Creators */}
      <CreatorsSection creators={creators} />

      {/* Top Comics Table - Use API NFT comics */}
      <TopComicsTable comics={topNftComics} />

      {/* Mint These Comics - Use NFT comics */}
      <ComicSection 
        title="Mint These Comics"
        comics={nftComics.length > 0 ? nftComics : mintComics} 
        isLoading={isLoading}
      />

      {/* Explore More Button */}
      <div className="flex justify-center mt-12">
        <MainButton>
          Explore More Comics
        </MainButton>
      </div>
    </div>
  )
}