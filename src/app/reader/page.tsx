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
import { Footer } from '@/components/global/comic-library/Footer';
import { useNftOwnershipCheck } from '@/hook/userNFTOwnershipCheck';
import { useHederaWallet } from '@/providers/HashPackProvider';

const COMICS_PER_PAGE = 3;

const ComicReaderViewer = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentComicSet, setCurrentComicSet] = useState(1);

  const isMounted = useRef(true);
  const comicsContainerRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);
  const { account } = useHederaWallet();
  const { user: walletUser } = useAppSelector((state: any) => state.wallet);
  const { checkOwnership } = useNftOwnershipCheck();

  const comicId = searchParams.get('id');

  //  images as fallback - updated to use bannerImage from API
  const images = {
    cover: currentComic?.bannerImage || currentComic?.coverImage || "/dev_images/Rectangle3051.png",
    avatar: currentComic?.creatorId?.avatar || "/dev_images/Rectangle3048.png",
  };

  /* data fetching */

  useEffect(() => {
    if (comicId) dispatch(getComicById({ id: comicId } as any));
    return () => {
      dispatch(clearCurrentComic());
      isMounted.current = false;
    };
  }, [comicId, dispatch]);

  // Guard: verify wallet owns the NFT before allowing read access
  useEffect(() => {
    if (!currentComic) return;

    const tokenId = currentComic?.nftId?.tokenId;
    if (!tokenId) return; // no NFT gate, allow read

    const userWalletAddress = account || walletUser?.walletAddress;
    if (!userWalletAddress) {
      router.replace(`/marketplace/detail?id=${comicId}`);
      return;
    }

    checkOwnership(userWalletAddress, tokenId).then((result) => {
      if (!result.hasNft) {
        router.replace(`/marketplace/detail?id=${comicId}`);
      }
    });
  }, [currentComic, account, walletUser?.walletAddress]);

  const activeComic = useMemo(() => {
    const comic = currentComic;
    if (!comic) return null;
    
    // Map API data structure to expected format
    const creator = comic.creatorId 
      ? {
          name: comic?.creatorId?.username || 'Unknown Creator',
          avatar: comic?.creatorId?.avatar || images.avatar,
          walletAddress: comic?.creatorId?.walletAddress,
        }
      : comic.creator ?? {
          name: 'Unknown Creator',
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
  }, [currentComic, images.avatar]);

  const comicPages = useMemo(() => {
    if (!activeComic?.chapters) return [];
    const pages = [];
    activeComic.chapters.forEach((chapter: any) => {
      if (chapter.pages && Array.isArray(chapter.pages)) {
        chapter.pages.forEach((page: any) => {
          pages.push({
            imageUrl: page.imageUrl || "/dev_images/Rectangle3051.png",
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

  if (isLoading) {
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
      {activeComic?.chapters && activeComic.chapters.length > 0 && (
        <div className="bg-[#0a0a0a]">
          <div className="bg-[#1a1a1a] max-w-[80%] mx-auto rounded-2xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">More Episodes</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeComic.chapters.map((chapter: any, idx: number) => (
                <div key={chapter._id || idx} className="group bg-[#111] rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="px-3 pt-3">
                    <div className="aspect-video w-full overflow-hidden bg-gray-800 relative border border-white/5 rounded-xl">
                      <img
                        src={chapter.pages?.[0]?.imageUrl || images.cover}
                        alt={chapter.title || `Episode ${chapter.chapterNumber}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-white text-lg font-bold">{chapter.title || `Episode ${chapter.chapterNumber}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER  */}
      <Footer />
    </div>
  );
};

export default ComicReaderViewer;