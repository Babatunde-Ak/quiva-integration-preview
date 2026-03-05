'use client';

import { ComicSection } from '@/features/comic-library/components/sections/ComicSection'
import { CreatorsSection } from '@/features/comic-library/components/CreatorsSection'
import { HeroComicSlider } from '@/features/comic-library/components/HeroComicSlider'
import { TopComicsTable } from '@/features/comic-library/components/TopComicsTable'
import { 
  trendingComics, 
  featuredComics, 
  upcomingComics, 
  creators, 
  topComics, 
  heroComics 
} from '@/features/comic-library/data/sampleData'

import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllComics } from "@/redux/slices/comicSlice"
import { useEffect, useMemo } from "react"
import { transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData'
import { transformApiComicsToTopComics } from '@/features/comic-library/utils/transformtopcomicsdata'
import ComicsCarousel from '@/features/comic-library/components/ComicsCarousel'
import { GridSection } from '@/features/comic-library/components/sections/GridSection'
import { popularFilters } from '@/features/comic-library/data/content'
import { SortComicSection } from '@/features/comic-library/components/sections/SortComicSection'
import { normalizeComics } from '@/features/comic-library/utils/comicHelpers';

export default function MainPage() {
  const { comics, isLoading } = useAppSelector((state: any) => state.comic)
  const dispatch = useAppDispatch()
  
  useEffect(() => {
    dispatch(getAllComics())
  }, [dispatch])

  // Transform API comics to match Comic interface
  const transformedComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return []
    return transformApiComicsToComics(comics.data.comics.data)
  }, [comics])

  // Transform API comics to TopComic format for the table
  const topNftComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return topComics // Fallback to sample data
    return transformApiComicsToTopComics(comics.data.comics.data)
  }, [comics])

  // Normalize sample data to match Comic interface
  const normalizedTrendingComics = useMemo(() => normalizeComics(trendingComics as any), [])
  const normalizedUpcomingComics = useMemo(() => normalizeComics(upcomingComics as any), [])

  const handleComicSelect = (comic: any) => {
    console.log('Selected comic:', comic);
    // Handle comic selection - navigate to comic detail page
    // For example: router.push(`/comics/${comic.id}`);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Handle search functionality
    // For example: filterComics(query) or navigate to search results
  };

  return (
    <div className="w-full min-h-full">
      {/* Hero section - Constrained container */}
      <div className="w-full mb-6 sm:mb-8 md:mb-10 lg:mb-12">
        <div className="w-full max-w-full ">
          <HeroComicSlider comics={transformedComics.slice(0, 5)} />
        </div>
      </div>

      {/* Main content sections */}
      <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {/* Comics Carousel Section */}
        <div className="w-full">
          <div className="max-w-full">
            <ComicsCarousel
              comics={transformedComics.length > 0 ? transformedComics.slice(0, 10) : normalizedTrendingComics}
              autoPlayInterval={4000}
              showSearch={true}
              onComicSelect={handleComicSelect}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Top Comics Table */}
        <div className="w-full">
          <TopComicsTable comics={topNftComics} />
        </div>

        {/* Trending & Popular Collections */}
        <div className="w-full">
          <ComicSection 
            title="Trending & Popular Collections" 
            subtitle='Highest sales in the past hours'
            comics={transformedComics.length > 0 ? transformedComics : normalizedUpcomingComics} 
            isLoading={isLoading}
          />
        </div>

        {/* Top selling Comics - Grid Section */}
        <div className="w-full">
          <GridSection
            title="Top selling Comics" 
            subtitle='Highest move in the past hours'
            comics={transformedComics.length > 0 ? transformedComics : normalizedUpcomingComics} 
            isLoading={isLoading}
          />
        </div>

        {/* Popular Editions */}
        <div className="w-full">
          <ComicSection 
            title="Popular Editions" 
            subtitle='Check out the best editions'
            comics={transformedComics.length > 0 ? transformedComics : normalizedUpcomingComics} 
            isLoading={isLoading}
            inverted={true}
            filters={popularFilters}
          />
        </div>

        {/* Our Creators */}
        <div className="w-full">
          <CreatorsSection creators={creators} />
        </div>

        {/* Today's Pick */}
        <div className="w-full">
          <SortComicSection 
            title="Today's Pick"
            comics={transformedComics.length > 0 ? transformedComics : normalizedUpcomingComics}
            onFilterChange={(filter) => console.log('Filter:', filter)}
            onSortChange={(sort) => console.log('Sort:', sort)}
          />
        </div>
      </div>
    </div>
  )
}