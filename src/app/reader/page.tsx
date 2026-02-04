'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  ThumbsUp,
  Share2,
  ArrowUp,
  ChevronLeft,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getComicById, clearCurrentComic } from '@/redux/slices/comicSlice';
//  IMPORT FOR COMPATIBILITY
import { ComicCard } from '@/components/cards/ComicCard';
import CollectionCard from '@/components/cards/TopSellingCard';
import { Footer } from '@/components/global/comic-library/Footer';
import {
  LOCAL_IMAGE,
  DUMMY_READER_COMIC,
  TOP_SELLING_COMICS
} from '@/components/utils/dummy-data';

const COMICS_PER_PAGE = 3;

const ComicReaderViewer = () => {
  const [useDummyData, setUseDummyData] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentComicSet, setCurrentComicSet] = useState(1);

  const isMounted = useRef(true);
  const comicsContainerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);

  const comicId = searchParams.get('id');

  //  images as fallback - updated to use bannerImage from API
  const images = {
    //  comic data if available, otherwise fallback images
    cover: currentComic?.bannerImage || currentComic?.coverImage || "/dev_images/Rectangle3051.png",
    avatar: currentComic?.creatorId?.avatar || "/dev_images/Rectangle3048.png",
    //  hardcoded images for other sections
    inosuke: "/dev_images/Image2.png",
    cross: "/dev_images/Group427320759.png",
    mj: "/dev_images/Grouup9.png",
  };

  /* data fetching */

  useEffect(() => {
    if (comicId) dispatch(getComicById({ id: comicId } as any));
    return () => {
      dispatch(clearCurrentComic());
      isMounted.current = false;
    };
  }, [comicId, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentComic && comicId && isMounted.current) {
        setUseDummyData(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentComic, comicId]);

  const activeComic = useMemo(() => {
    const comic = useDummyData ? DUMMY_READER_COMIC : currentComic;
    if (!comic) return null;
    
    // Map API data structure to expected format
    const creator = comic.creatorId 
      ? {
          name: comic.creatorId.username || 'Unknown Creator',
          avatar: comic.creatorId.avatar || images.avatar,
          walletAddress: comic.creatorId.walletAddress,
        }
      : comic.creator ?? {
          name: 'Studio Kyra',
          avatar: images.avatar,
        };
    
    return {
      ...comic,
      creator,
      // Ensure coverImage is properly mapped from bannerImage
      coverImage: comic.bannerImage || comic.coverImage,
      // Add additional helpful properties
      title: comic.title || 'Untitled Comic',
      episodeNumber: comic.episodeNumber || 1,
    };
  }, [useDummyData, currentComic, images.avatar]);

  const comicPages = useMemo(() => {
    if (!activeComic?.chapters) return [];
    const pages = [];
    activeComic.chapters.forEach((chapter: any) => {
      if (chapter.pages && Array.isArray(chapter.pages)) {
        chapter.pages.forEach((page: any) => {
          pages.push({
            imageUrl: page.imageUrl || LOCAL_IMAGE,
            pageNumber: page.pageNumber,
            chapterNumber: chapter.chapterNumber,
            chapterTitle: chapter.title,
            contentType: page.contentType
          });
        });
      }
    });
    // Return all available pages (not limited to 15)
    return pages;
  }, [activeComic]);

  const totalPages = comicPages.length;
  const totalComicSets = Math.ceil(totalPages / COMICS_PER_PAGE);

  // Calculates current page number 
  const currentPageNumber = useMemo(() => {
    return (currentComicSet - 1) * COMICS_PER_PAGE + 1;
  }, [currentComicSet]);

  // Gets the current set of 3 comics
  const visibleComicPages = useMemo(() => {
    const startIndex = (currentComicSet - 1) * COMICS_PER_PAGE;
    const endIndex = Math.min(startIndex + COMICS_PER_PAGE, totalPages);
    return comicPages.slice(startIndex, endIndex);
  }, [comicPages, currentComicSet, totalPages]);

  /* scroll logic  */

  useEffect(() => {
    const handleScroll = () => {
      if (!isMounted.current) return;
      setIsScrolling(true);
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      
      setTimeout(() => setIsScrolling(false), 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToNextSet = useCallback(() => {
    if (currentComicSet < totalComicSets) {
      setCurrentComicSet(prev => prev + 1);
      // Scroll to top of comics section when changing to next set
      if (comicsContainerRef.current) {
        comicsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentComicSet, totalComicSets]);

  const goToPreviousSet = useCallback(() => {
    if (currentComicSet > 1) {
      setCurrentComicSet(prev => prev - 1);
      // Scroll to top of comics section when changing to previous set
      if (comicsContainerRef.current) {
        comicsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentComicSet]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /*  loading  */

  if (isLoading && !useDummyData) {
    return (
      <div className="fixed inset-0 bg-[#161614] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!activeComic) return null;

  /* RENDER  */

  return (
    <div className="relative bg-[#0a0a0a] min-h-screen text-white">

      {/* BANNER */}
      <div className="relative w-full overflow-hidden min-h-[380px]">
        <div className="absolute inset-0">
          <img
            src={activeComic.coverImage || images.cover}
            alt={activeComic.title}
            className="w-full h-full object-cover blur-2xl scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8">
          <button
            onClick={() => router.push(`/marketplace/detail?id=${comicId}`)}
            className="flex items-center gap-2 bg-[#000] px-4 py-2 rounded-full border border-white/10"
          >
            <ChevronLeft size={16} />
            Back to Collection
          </button>
        </div>
      </div>

      {/* COVER Image */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[190px] z-30">
        <div className="w-[279px] h-[356px] rounded-xl overflow-hidden shadow-2xl">
          <img 
            src={activeComic.coverImage || images.cover} 
            alt={activeComic.title}
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/*  READING PANEL*/}
      <div ref={comicsContainerRef} className="relative bg-[#1a1a1a] min-h-screen max-w-[80%] mx-auto rounded-t-2xl overflow-hidden mt-[240px]">
        {/* PROGRESS BAR */}
        <div className="absolute top-0 left-0 right-0 z-50 h-1">
          <div
            className="h-full bg-yellow-500 transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* READING CONTROLS */}
        <div className="sticky top-0 z-40 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-white/5 pt-2">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="text-center">
              {/*  Page 1 of 15 */}
              <div className="text-white text-sm md:text-base font-medium mb-3">
                Page <span className="text-white">{currentPageNumber}</span> of <span className="text-white">{totalPages}</span>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={goToPreviousSet}
                  disabled={currentComicSet === 1}
                  className="bg-black/80 backdrop-blur-sm text-white px-5 py-2.5 shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/40 rounded-2xl min-w-[90px]"
                >
                  <ArrowUp className="w-4 h-4 transform -rotate-90 mx-auto" />
                </button>
                
                {/*  "#1" */}
                <div className="text-white text-lg font-bold px-5 py-2.5 bg-black/40 rounded-xl">
                  #{currentComicSet}
                </div>
                
                <button
                  onClick={goToNextSet}
                  disabled={currentComicSet === totalComicSets}
                  className="bg-black/80 backdrop-blur-md text-white px-5 py-2.5 shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/40 rounded-2xl min-w-[90px]"
                >
                  <ArrowUp className="w-4 h-4 transform rotate-90 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* COMIC PAGES */}
        <div className="pt-6">
          {visibleComicPages.map((page, index) => {
            const actualPageNumber = (currentComicSet - 1) * COMICS_PER_PAGE + index + 1;
            return (
              <div key={index} className="flex items-center justify-center w-full mb-3 sm:mb-6 last:mb-0">
                <div className="w-full px-2 sm:px-4">
                  <div className="relative w-full mx-auto">
                  
                    <img
                      src={page.imageUrl}
                      alt={`${activeComic.title} - Page ${actualPageNumber}`}
                      className="w-[90%] sm:w-[80%] h-auto object-contain rounded-lg shadow-lg min-h-[calc(70vh-80px)] max-h-[80vh] sm:min-h-[calc(80vh-100px)] sm:max-h-[90vh] md:min-h-[calc(160vh-200px)] md:max-h-[180vh] mx-auto"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* BACK TO TOP BUTTON */}
          <button
            onClick={scrollToTop}
            className="fixed right-8 sm:right-12 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-md transition-all hover:bg-black/30"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderTopColor: 'rgba(255, 255, 255, 0.3)',
              borderRightColor: 'rgba(255, 255, 255, 0.3)',
              borderBottomColor: 'rgba(255, 255, 255, 0.1)',
              borderLeftColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
          </button>
        </div>
      </div>

      {/*  CREATOR SECTION  */}
     
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-[#0a0a0a]">
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 overflow-hidden border-2 border-yellow-500/50">
            <img
              src={activeComic.creator?.avatar || images.avatar}
              alt={activeComic.creator?.name || 'Creator'}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center -mt-1">
            <div className="text-white/60 text-xs mb-0.5">creator</div>
            <div className="text-white text-lg md:text-xl font-bold">
              {activeComic.creator?.name || 'Unknown Creator'}
            </div>
            {activeComic.creator?.walletAddress && (
              <div className="text-white/40 text-xs mt-1 font-mono">
                {activeComic.creator.walletAddress.slice(0, 6)}...{activeComic.creator.walletAddress.slice(-4)}
              </div>
            )}
          </div>
          
          <div className="text-center mt-2">
            <div className="text-white/60 text-xs mb-2">
              Share this series and show support for the creator
            </div>
            <div className="flex items-center justify-center gap-3">
              <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all text-sm border border-white/40 min-w-[100px] justify-center">
                <ThumbsUp className="w-3 h-3" />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full transition-all text-sm border border-white/40 min-w-[100px] justify-center">
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MORE EPISODES SECTION  */}
    
      <div className="bg-[#0a0a0a]">
        <div className="bg-[#1a1a1a] max-w-[80%] mx-auto rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">More Episodes</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Episode 1 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.inosuke}
                    alt="Episode 1"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 1</div>
              </div>
            </div>

            {/* Episode 2 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.cross}
                    alt="Episode 2"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 2</div>
              </div>
            </div>

            {/* Episode 3 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.mj}
                    alt="Episode 3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 3</div>
              </div>
            </div>

            {/* Episode 4 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.inosuke}
                    alt="Episode 4"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 4</div>
              </div>
            </div>

            {/* Episode 5 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.cross}
                    alt="Episode 5"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 5</div>
              </div>
            </div>

            {/* Episode 6 Card */}
            <div className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="px-3 pt-3">
                <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                  <img
                    src={images.mj}
                    alt="Episode 6"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="p-4">
                <div className="text-white text-lg font-bold">Episode 6</div>
              </div>
            </div>
          </div>
        </div>

        {/*TOP SELLING  SECTION */}
        <div className="max-w-[80%] mx-auto p-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">Top selling comics</h2>
          </div>
          <div className="text-white/60 text-sm mb-6 text-left">highest moves in the past hour</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_SELLING_COMICS.map((comic) => (
              <CollectionCard
                key={comic.id}
                id={comic.id}
                rank={comic.rank}
                name={comic.name}
                image={comic.image}
                sales={comic.sales}
                percentageChange={comic.percentageChange}
                isPositive={comic.isPositive}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER  */}
      <Footer />
    </div>
  );
};

export default ComicReaderViewer;