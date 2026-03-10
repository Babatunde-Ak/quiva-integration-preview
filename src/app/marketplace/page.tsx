'use client';

import { ComicSection } from '@/features/comic-library/components/sections/ComicSection'
import { CreatorsSection } from '@/features/comic-library/components/CreatorsSection'
import { HeroComicSlider } from '@/features/comic-library/components/HeroComicSlider'
import { TopComicsTable } from '@/features/comic-library/components/TopComicsTable'
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllComics } from "@/redux/slices/comicSlice"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData'
import { transformApiComicsToTopComics } from '@/features/comic-library/utils/transformtopcomicsdata'
import ComicsCarousel from '@/features/comic-library/components/ComicsCarousel'
import { GridSection } from '@/features/comic-library/components/sections/GridSection'
import { popularFilters } from '@/features/comic-library/data/content'
import { SortComicSection } from '@/features/comic-library/components/sections/SortComicSection'

export default function MainPage() {
  const { comics, isLoading } = useAppSelector((state: any) => state.comic)
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  useEffect(() => {
    dispatch(getAllComics())
  }, [dispatch])

  // Transform API comics to match Comic interface
  const transformedComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return []
    return transformApiComicsToComics(comics.data.comics.data)
  }, [comics])

  // Only comics with a real campaignId (drops) appear in the hero slider
  const dropComics = useMemo(() => transformedComics.filter((c: any) => {
    const campaignId = c.nftId?.campaignId
    return campaignId && campaignId !== '0' && campaignId !== 'string'
  }), [transformedComics])

  const handleSliderComicClick = (comic: any) => {
    router.push(`/marketplace/chapter?id=${comic.id}&tab=Release`)
  }

  // Filter comics with campaignId for "Get all you can read" section
  const campaignComics = useMemo(() => {
    const filtered = transformedComics.filter(comic => {
      const hasCampaign = typeof comic.nftId === 'object' &&
                        comic.nftId?.campaignId !== undefined &&
                        comic.nftId?.campaignId !== null &&
                        comic.nftId?.campaignId !== '';
      return hasCampaign;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('=== Campaign Comics Debug ===');
      console.log('Total transformed comics:', transformedComics.length);
      console.log('Campaign comics found:', filtered.length);
      console.log('Sample raw comic data:', comics?.data?.comics?.data?.[0]);
      console.log('Sample transformed comic:', transformedComics[0]);
      if (filtered.length > 0) {
        console.log('Sample campaign comic:', filtered[0]);
      }
      transformedComics.slice(0, 3).forEach((comic, idx) => {
        const nftIdType = typeof comic.nftId;
        const campaignId = typeof comic.nftId === 'object' && comic.nftId ? comic.nftId.campaignId : undefined;
        console.log(`Comic ${idx}:`, {
          title: comic.title,
          nftIdType,
          nftId: comic.nftId,
          campaignId,
          hasCampaign: campaignId !== undefined && campaignId !== null && campaignId !== '',
        });
      });
    }

    return filtered;
  }, [transformedComics, comics]);

  // Transform API comics to TopComic format for the table
  const topNftComics = useMemo(() => {
    if (!comics?.data?.comics?.data) return []
    return transformApiComicsToTopComics(comics.data.comics.data)
  }, [comics])

  const handleComicSelect = (comic: any) => {
    console.log('Selected comic:', comic);
    // Navigate to the secondary marketplace (chapter) page with the comic ID
    router.push(`/marketplace/chapter?id=${comic.id}&tab=release`);
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
        <div className="w-full max-w-full">
          <HeroComicSlider comics={dropComics.slice(0, 5)} onComicClick={handleSliderComicClick} />
        </div>
      </div>

      {/* Main content sections */}
      <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
        {/* Comics Carousel Section - "Get all you can read" */}
        <div className="w-full">
          <div className="max-w-full">
            {/* <div className="mb-4 px-4 sm:px-6 md:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">Get all you can read</h2>
              <p className="text-white/70 text-sm">Discover our latest releases available now</p>
            </div> */}
            <ComicsCarousel
              comics={campaignComics.length > 0 ? campaignComics : transformedComics.slice(0, 10)}
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
            comics={transformedComics} 
            isLoading={isLoading}
          />
        </div>

        {/* Top selling Comics - Grid Section */}
        <div className="w-full">
          <GridSection
            title="Top selling Comics" 
            subtitle='Highest move in the past hours'
            comics={transformedComics} 
            isLoading={isLoading}
          />
        </div>

        {/* Popular Editions */}
        <div className="w-full">
          <ComicSection 
            title="Popular Editions" 
            subtitle='Check out the best editions'
            comics={transformedComics} 
            isLoading={isLoading}
            inverted={true}
            filters={popularFilters}
          />
        </div>

        {/* Our Creators */}
        <div className="w-full">
          <CreatorsSection />
        </div>

        {/* Today's Pick */}
        <div className="w-full">
          <SortComicSection 
            title="Today's Pick"
            comics={transformedComics}
            onFilterChange={(filter) => console.log('Filter:', filter)}
            onSortChange={(sort) => console.log('Sort:', sort)}
          />
        </div>
      </div>
    </div>
  )
}