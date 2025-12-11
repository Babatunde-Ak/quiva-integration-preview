'use client'

import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    ThumbsUp,
    Share2,
} from 'lucide-react';
import {useSearchParams, useRouter} from 'next/navigation';
import {useAppDispatch, useAppSelector} from '@/redux/hook';
import {getComicById, clearCurrentComic} from '@/redux/slices/comicSlice';
// Import card components
import { ComicCard } from '@/components/cards/ComicCard';
import CollectionCard from '@/components/cards/TopSellingCard';
// Import footer
import { Footer } from '@/components/global/comic-library/Footer';
// Import dummy data
import {
    LOCAL_IMAGE,
    DUMMY_READER_COMIC,
    MORE_COLLECTIONS,
    TOP_SELLING_COMICS
} from '@/components/utils/dummy-data';

const ComicReaderViewer = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [useDummyData, setUseDummyData] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    const lastPageRef = useRef(1);
    const [showEngagement, setShowEngagement] = useState(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {currentComic, isLoading} = useAppSelector((state) => state.comic);

    // Get comic ID from URL query params
    const comicId = searchParams.get('id');

    // Fetch comic data on mount
    useEffect(() => {
        if (comicId) {
            dispatch(getComicById({id: comicId} as any));
        }

        return () => {
            dispatch(clearCurrentComic());
            isMounted.current = false;
        };
    }, [comicId, dispatch]);

    // Auto-using dummy data for development
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!currentComic && comicId && isMounted.current) {
                setUseDummyData(true);
            }
        }, 500)
        
        return () => clearTimeout(timer)
    }, [currentComic, comicId])

    //  dummy or real comic data
    const activeComic = useMemo(() => {
        const comic = useDummyData ? DUMMY_READER_COMIC : currentComic;
        // creator object exists
        if (comic && !comic.creator) {
            return {
                ...comic,
                creator: {
                    name: 'Studio Kyra',
                    avatar: LOCAL_IMAGE
                }
            };
        }
        return comic;
    }, [useDummyData, currentComic]);

    // Extracts all pages from all chapters
    const comicPages = useMemo(() => {
        if (!activeComic?.chapters) return [];
        
        const pages = [];
        activeComic.chapters.forEach((chapter) => {
            if (chapter.pages && Array.isArray(chapter.pages)) {
                chapter.pages.forEach((page) => {
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
        return pages;
    }, [activeComic]);

    const totalPages = comicPages.length;

    // Track scroll position
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            if (!isMounted.current) return;
            
            setIsScrolling(true);
            
            const scrollTop = container.scrollTop;
            const pageHeight = window.innerHeight;
            
            // Calculate current page
            const page = Math.floor(scrollTop / pageHeight) + 1;
            const newPage = Math.min(Math.max(1, page), totalPages);
            
          
            if (newPage !== lastPageRef.current) {
                setCurrentPage(newPage);
                lastPageRef.current = newPage;
            }
            
            // Show engagement section when we're near the end
            if (newPage >= totalPages - 2) {
                setShowEngagement(true);
            }
            
            setTimeout(() => setIsScrolling(false), 100);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [totalPages]);

    // Scroll to specific page
    const scrollToPage = useCallback((pageNumber: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const pageHeight = window.innerHeight;
        const targetScroll = (pageNumber - 1) * pageHeight;
        
        
        const maxScroll = totalPages * pageHeight;
        const safeScroll = Math.min(targetScroll, maxScroll);
        
        container.scrollTo({
            top: safeScroll,
            behavior: 'smooth'
        });
    }, [totalPages]);

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            scrollToPage(currentPage + 1);
        }
    }, [currentPage, totalPages, scrollToPage]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            scrollToPage(currentPage - 1);
        }
    }, [currentPage, scrollToPage]);

    const handleBack = () => {
        router.push(`/marketplace/detail?id=${comicId}`);
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                goToNextPage();
            }
            if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                goToPreviousPage();
            }
            if (e.key === 'Escape') {
                handleBack();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, totalPages, goToNextPage, goToPreviousPage]);

    // Loading state
    if (isLoading && !useDummyData) {
        return (
            <div className="fixed inset-0 bg-[#161614] flex items-center justify-center">
                <div className="text-center px-4">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3"/>
                    <p className="text-white/60 text-xs font-medium">Loading comic...</p>
                </div>
            </div>
        );
    }

    if (!activeComic || comicPages.length === 0) {
        return (
            <div className="fixed inset-0 bg-[#161614] flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="text-3xl mb-3">📚</div>
                    <h3 className="text-white text-base font-bold mb-2">No Comic Found</h3>
                    <p className="text-white/60 text-xs mb-4">
                        This comic doesn't exist or has no pages.
                    </p>
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-medium px-4 py-2 rounded transition-all">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-[#161614] min-h-screen">
           
            <div 
                className="relative h-[40vh] min-h-[280px] max-h-[350px] overflow-visible"
                style={{
                    marginTop: '0',
                    backgroundImage: `url('${LOCAL_IMAGE}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-lg"></div>
                
                {/* Back Button - Top left of banner */}
                <button
                    onClick={handleBack}
                    className="absolute top-4 left-4 z-20 bg-black/80 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-black transition-colors flex items-center gap-1.5"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Collection
                </button>

                {/* Comic Cover Image  */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-[-60px] md:bottom-[-70px]">
                    <div className="relative w-48 h-64 md:w-56 md:h-72 lg:w-64 lg:h-80 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
                        <img
                            src={activeComic.coverImage || LOCAL_IMAGE}
                            alt={activeComic.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

         
            <div className="h-20 md:h-24"></div>

            {/* Comic Reading Background */}
            <div className="bg-[#1a1a1a] py-8 md:py-10">
                {/* Page Progress and Navigation  */}
                <div className="relative z-30">
                    <div className="max-w-2xl mx-auto px-4">
                        <div className="text-center mb-6">
                            <div className="text-white text-base md:text-lg font-medium">
                                Page <span className="text-yellow-500">{currentPage}</span> of <span className="text-yellow-500">{totalPages}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage === 1}
                                className="bg-black/80 backdrop-blur-sm text-white p-3 rounded-full shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            
                            <div className="text-white text-xl font-bold px-4 py-2 bg-black/40 rounded-lg">
                                #{currentPage}
                            </div>
                            
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="bg-black/80 backdrop-blur-sm text-white p-3 rounded-full shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                
                <div className="h-8"></div>
            </div>

            {/* Comics Area */}
            <div className="bg-[#1a1a1a]">
                <div
                    ref={scrollContainerRef}
                    className="pt-4 pb-20"
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Comic Pages */}
                    <div className="max-w-3xl mx-auto px-4 space-y-8">
                        {comicPages.map((page, index) => (
                            <div key={index} className="flex items-center justify-center">
                                <div className="w-full">
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
                                        <img
                                            src={page.imageUrl}
                                            alt={`Page ${page.pageNumber}`}
                                            className="w-full h-auto max-h-[75vh] object-contain"
                                        />
                                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                                            Page {page.pageNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Engagement Sections */}
                    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                        
                        {/* Creator Section */}
                        <div className="flex flex-col items-center justify-center gap-6 mb-8">
                            {/* Avatar Image  */}
                            <div className="w-16 h-16 md:w-18 md:h-18 overflow-hidden border-2 border-yellow-500/50 mb-2">
                                <img
                                    src={activeComic.creator?.avatar || LOCAL_IMAGE}
                                    alt={activeComic.creator?.name || 'Creator'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Creator Label and Name */}
                            <div className="text-center mb-4">
                                <div className="text-white/60 text-sm mb-1">creator</div>
                                <div className="text-white text-xl md:text-2xl font-bold">
                                    {activeComic.creator?.name || 'Studio Kyra'}
                                </div>
                            </div>

                            {/* Share Section */}
                            <div className="text-center">
                                <div className="text-white/60 text-sm mb-3">
                                    Share this series and show support for the creator
                                </div>
                                <div className="flex items-center justify-center gap-4">
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full transition-all">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span className="text-sm">Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full transition-all">
                                        <Share2 className="w-4 h-4" />
                                        <span className="text-sm">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* More Collections Section */}
                        <div className="mb-12">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                                More collections
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {MORE_COLLECTIONS.map((collection) => (
                                    <ComicCard
                                        key={collection.id}
                                        id={collection.id}
                                        title={collection.title}
                                        creator={collection.creator}
                                        creatorAvatar={collection.creatorAvatar}
                                        mintPrice={collection.mintPrice}
                                        currentPrice={collection.currentPrice}
                                        views={collection.views}
                                        image={collection.image}
                                        premium={collection.premium}
                                        number={collection.number}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Top Selling Comics Section */}
                        <div className="mb-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-white">
                                    Top selling comics
                                </h2>
                                <div className="text-white/60 text-sm">
                                    highest moves in the past hour
                                </div>
                            </div>
                            
                            {/* 3x3 Grid Layout */}
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
                </div>
            </div>

            {/* imported Footer component */}
            <Footer />

            {/* Demo Mode Indicator */}
            {useDummyData && (
                <div className="fixed bottom-4 right-4 z-30 bg-yellow-600 text-black text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
                    Demo Mode
                </div>
            )}
        </div>
    );
};

export default ComicReaderViewer;
