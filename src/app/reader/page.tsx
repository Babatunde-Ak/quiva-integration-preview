'use client'

import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
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
    const [showControls, setShowControls] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);
    const lastPageRef = useRef(1);
    const [showEngagement, setShowEngagement] = useState(false);

    // Media queries
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {currentComic, isLoading} = useAppSelector((state) => state.comic);

    // Get comic ID from URL query params
    const comicId = searchParams.get('id');

    // Use current comic or dummy data
    const activeComic = useDummyData ? DUMMY_READER_COMIC : currentComic;

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

    // Extract all pages from all chapters
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
                        contentType: page.contentType,
                        thumbnailUrl: page.thumbnailUrl
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
    }, [goToNextPage, goToPreviousPage, handleBack]);

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
                            src={activeComic?.coverImage || LOCAL_IMAGE}
                            alt={activeComic?.title || 'Comic Cover'}
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
                                        
                                        {/* Loading indicator for PDFs */}
                                        {!page.imageUrl && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                                                <div className="text-white/30 text-xs">📄</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Arrows */}
            {isMobile && (
                <div className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm">
                        <ChevronLeft size={20}/>
                    </button>
                </div>
            )}
            
            {isMobile && (
                <div className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm">
                        <ChevronRight size={20}/>
                    </button>
                </div>
            )}

            {/* Desktop Navigation Arrows */}
            {!isMobile && (
                <div className={`absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm">
                        <ChevronUp size={24}/>
                    </button>

                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm">
                        <ChevronDown size={24}/>
                    </button>
                </div>
            )}

            {/* Footer - Page Counter and Progress */}
            <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
            }`}>
                <div className="p-3 sm:p-6">
                    {/* Page Counter */}
                    <div className="text-center">
                        <span className={`text-white font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>
                            <span className="text-yellow-500">{currentPage} </span>
                            of{' '}
                            <span className="text-yellow-500">{totalPages}</span>
                        </span>
                    </div>

                    {/* Engagement Sections */}
                    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                        
                        {/* Creator Section */}
                        <div className="flex flex-col items-center justify-center gap-6 mb-8">
                            {/* Avatar Image  */}
                            <div className="w-16 h-16 md:w-18 md:h-18 rounded-full overflow-hidden border-2 border-yellow-500/50 mb-2">
                                <img
                                    src={activeComic?.creator?.avatar || LOCAL_IMAGE}
                                    alt={activeComic?.creator?.name || 'Creator'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Creator Label and Name */}
                            <div className="text-center mb-4">
                                <div className="text-white/60 text-sm mb-1">creator</div>
                                <div className="text-white text-xl md:text-2xl font-bold">
                                    {activeComic?.creator?.name || 'Studio Kyra'}
                                </div>
                            </div>

                            {/* Page Thumbnails - Hidden on mobile */}
                            {!isMobile && (
                                <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2 max-w-full px-4">
                                    {comicPages
                                        .slice(0, isTablet ? 15 : 20)
                                        .map((page, index) => (
                                            <button
                                                key={`thumb-${page.chapterNumber}-${page.pageNumber}`}
                                                onClick={() => scrollToPage(index + 1)}
                                                className={`flex-shrink-0 relative transition-all ${
                                                    currentPage === index + 1
                                                        ? 'ring-2 ring-yellow-500 scale-110'
                                                        : 'opacity-50 hover:opacity-100'
                                                }`}>
                                                {page.contentType === 'image' ? (
                                                    <img
                                                        src={page.imageUrl}
                                                        alt={`Page ${index + 1}`}
                                                        className={`object-cover rounded ${isTablet ? 'w-10 h-12' : 'w-12 h-16'}`}/>
                                                ) : page.thumbnailUrl ? (
                                                    <img
                                                        src={page.thumbnailUrl}
                                                        alt={`Page ${index + 1} preview`}
                                                        className={`object-cover rounded ${isTablet ? 'w-10 h-12' : 'w-12 h-16'}`}/>
                                                ) : (
                                                    <div className={`bg-gray-800 rounded flex items-center justify-center text-xs text-white ${
                                                        isTablet ? 'w-10 h-12' : 'w-12 h-16'
                                                    }`}>
                                                        <span aria-hidden>🌐</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold drop-shadow-lg">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}
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