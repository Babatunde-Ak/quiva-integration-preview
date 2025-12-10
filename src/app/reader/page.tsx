
'use client'

import React, {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    Heart,
    Share2,
    Bookmark,
    Home,
    ChevronUp,
    TrendingUp
} from 'lucide-react';
import {useSearchParams, useRouter} from 'next/navigation';
import {useAppDispatch, useAppSelector} from '@/redux/hook';
import {getComicById, clearCurrentComic} from '@/redux/slices/comicSlice';

// image for demo
const LOCAL_IMAGE = '/dev_images/avatar-2.png';

// Dummy comic data using  images
const DUMMY_READER_COMIC = {
  id: '2',
  title: 'Avatar - Book of Beginnings',
  coverImage: LOCAL_IMAGE,
  creator: {
    name: 'Studio Kyra',
    avatar: LOCAL_IMAGE
  },
  chapters: [
    {
      chapterNumber: 1,
      title: 'Episode 1: The First Flame',
      pages: Array.from({ length: 22 }, (_, i) => ({
        imageUrl: LOCAL_IMAGE,
        pageNumber: i + 1,
        contentType: 'image'
      }))
    }
  ]
}

// More collections data
const MORE_COLLECTIONS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Episode ${i + 1}`,
  image: LOCAL_IMAGE,
  time: '',
  price: ''
}));

// Top selling comics data
const TOP_SELLING_COMICS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  title: ['Find Me', 'Lost World', 'Digital Dreams', 'Cyber Punk', 'Neo Tokyo', 'Future Shock', 'Star Bound', 'Moon Light', 'Cosmic Ride'][i],
  creator: ['Studio Alpha', 'Pixel Arts', 'Digital Inc', 'Cyber Studio', 'Neo Arts', 'Future Lab', 'Star Works', 'Moon Studio', 'Cosmic Arts'][i],
  avatar: LOCAL_IMAGE,
  seriesCount: Math.floor(Math.random() * 20) + 1,
  isUp: Math.random() > 0.3,
  changePercent: Math.floor(Math.random() * 30) + 5
}));

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
        // lets make sure creator object exists
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
            
            // will Only update if page actually changed
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
            {/* Site Logo  */}
            <div className="fixed top-3 left-4 z-50">
                <div className="text-white text-lg font-bold">QUIVA</div>
            </div>

            {/* Navbar  */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-[#161614]/90 backdrop-blur-md border-b border-white/10 pt-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-end py-2">
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-black text-sm font-medium px-4 py-1.5 rounded-md transition-colors">
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Banner */}
            <div 
                className="relative h-[30vh] min-h-[220px] max-h-[280px] overflow-visible"
                style={{
                    marginTop: '60px', 
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

                {/* Comic Cover Image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
                    <div className="relative w-40 h-60 md:w-48 md:h-72 rounded-xl overflow-hidden shadow-2xl border-2 border-white/30">
                        <img
                            src={activeComic.coverImage || LOCAL_IMAGE}
                            alt={activeComic.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Page Progress and Navigation */}
            <div className="relative z-30 mt-4">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="text-center mb-3">
                        <div className="text-white text-base md:text-lg font-medium">
                            Page <span className="text-yellow-500">{currentPage}</span> of <span className="text-yellow-500">{totalPages}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/20"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full shadow-xl disabled:opacity-30 hover:bg-black transition-all hover:scale-105 border border-white/20"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Comics Area */}
            <div className="bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-[#161614]">
                <div
                    ref={scrollContainerRef}
                    className="pt-8 pb-20"
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Comic Pages */}
                    <div className="max-w-3xl mx-auto px-4 space-y-6 md:space-y-8">
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

                    {/* Engagement Sections  */}
                    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                        
                        {/* Creator Section */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-yellow-500/50">
                                    <img
                                        src={activeComic.creator?.avatar || LOCAL_IMAGE}
                                        alt={activeComic.creator?.name || 'Creator'}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="text-white/60 text-sm mb-1">creator</div>
                                    <div className="text-white text-lg md:text-xl font-bold">
                                        {activeComic.creator?.name || 'Studio Kyra'}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="text-white/60 text-sm mb-3 text-center md:text-right">
                                    share this series
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all">
                                        <span className="text-lg"></span>
                                        <span className="text-sm">Like</span>
                                    </button>
                                    <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all">
                                        <span className="text-lg"></span>
                                        <span className="text-sm">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* More Collections Section -  */}
                        <div className="mb-12">
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                                More collections
                            </h2>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {MORE_COLLECTIONS.map((collection) => (
                                    <div 
                                        key={collection.id}
                                        className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all cursor-pointer hover:scale-[1.02] border border-white/10"
                                        onClick={() => router.push(`/reader?id=${collection.id}`)}
                                    >
                                        <div className="relative h-40">
                                            <img
                                                src={collection.image}
                                                alt={collection.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
                                                {collection.title}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="font-medium text-white mb-1">{collection.title}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-yellow-500 text-sm font-medium">
                                                    {collection.price}
                                                </span>
                                                <div className="text-white/40 text-xs">
                                                    ● {collection.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {TOP_SELLING_COMICS.map((comic) => (
                                    <div 
                                        key={comic.id}
                                        className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all cursor-pointer border border-white/10"
                                        onClick={() => router.push(`/marketplace/detail?id=${comic.id}`)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-yellow-500/30">
                                                <img
                                                    src={comic.avatar}
                                                    alt={comic.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-white text-sm mb-1 line-clamp-1">
                                                    {comic.title}
                                                </h3>
                                                <div className="text-white/60 text-xs mb-2">
                                                    {comic.creator}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-white text-xs">
                                                        {comic.seriesCount} series
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-xs ${
                                                        comic.isUp ? 'text-green-500' : 'text-red-500'
                                                    }`}>
                                                        <TrendingUp className={`w-3 h-3 ${comic.isUp ? '' : 'rotate-180'}`} />
                                                        <span>{comic.isUp ? '+' : '-'}{comic.changePercent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-6 border-t border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div>
                                    <div className="text-white text-lg font-bold mb-3">QUIVA</div>
                                    <p className="text-white/60 text-xs">
                                        The premier platform for digital comics and NFT collectibles.
                                    </p>
                                </div>
                                
                                <div>
                                    <h3 className="text-white font-medium text-sm mb-3">Marketplace</h3>
                                    <ul className="space-y-1.5">
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Browse Comics</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Top Sellers</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">New Releases</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Collections</a></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-white font-medium text-sm mb-3">Community</h3>
                                    <ul className="space-y-1.5">
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">For Creators</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Community Hub</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Events</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Blog</a></li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-white font-medium text-sm mb-3">Support</h3>
                                    <ul className="space-y-1.5">
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Help Center</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Contact Us</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Terms of Service</a></li>
                                        <li><a href="#" className="text-white/60 hover:text-white text-xs">Privacy Policy</a></li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="text-center text-white/40 text-xs pt-6 border-t border-white/10">
                                © {new Date().getFullYear()} Quiva Comics. All rights reserved.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
