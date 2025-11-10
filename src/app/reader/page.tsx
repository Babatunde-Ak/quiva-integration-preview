'use client'

import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
    X,
    ZoomIn,
    ZoomOut,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Menu,
    MoreHorizontal
} from 'lucide-react';
import {useSearchParams, useRouter} from 'next/navigation';
import {useAppDispatch, useAppSelector} from '@/redux/hook';
import {getComicById, clearCurrentComic} from '@/redux/slices/comicSlice';

const ComicReaderViewer = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(1);
    const scrollContainerRef = useRef(null);
    const [showControls, setShowControls] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const hideControlsTimeout = useRef(null);
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);
    const lastTouchTime = useRef(0);

    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const {currentComic, isLoading} = useAppSelector((state) => state.comic);

    // Get comic ID from URL query params
    const comicId = searchParams.get('id');

    // Responsive breakpoint detection
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Fetch comic data on mount
    useEffect(() => {
        if (comicId) {
            dispatch(getComicById({id: comicId} as any));
        }

        // Cleanup on unmount
        return () => {
            dispatch(clearCurrentComic());
        };
    }, [comicId, dispatch]);

    // Extract all pages from all chapters
    const comicPages = useMemo(() => {
        if (!currentComic?.chapters) return [];
        
        const pages = [];
        currentComic.chapters.forEach((chapter) => {
            if (chapter.pages && Array.isArray(chapter.pages)) {
                chapter.pages.forEach((page) => {
                    pages.push({
                        imageUrl: page.imageUrl,
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
    }, [currentComic]);

    const totalPages = comicPages.length;

    // Auto-hide controls with different timings for mobile/desktop
    const resetHideControlsTimer = () => {
        setShowControls(true);
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }
        hideControlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, isMobile ? 2000 : 3000); // Shorter timeout on mobile
    };

    useEffect(() => {
        resetHideControlsTimer();
        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, [isMobile]);

    // Track scroll position to update current page
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const handleScroll = () => {
            resetHideControlsTimer();
            const scrollTop = container.scrollTop;
            const pageHeight = window.innerHeight;
            const page = Math.round(scrollTop / pageHeight) + 1;
            setCurrentPage(Math.min(Math.max(1, page), totalPages));
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [totalPages]);

    // Touch gesture handling
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !isMobile) return;

        const handleTouchStart = (e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            if (!touchStartX.current || !touchStartY.current) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchStartX.current - touchEndX;
            const deltaY = touchStartY.current - touchEndY;

            // Determine if it's a horizontal or vertical swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe - show/hide controls
                if (Math.abs(deltaX) > 50) {
                    resetHideControlsTimer();
                }
            } else {
                // Vertical swipe - page navigation
                if (Math.abs(deltaY) > 50) {
                    if (deltaY > 0 && currentPage < totalPages) {
                        // Swipe up - next page
                        scrollToPage(currentPage + 1);
                    } else if (deltaY < 0 && currentPage > 1) {
                        // Swipe down - previous page
                        scrollToPage(currentPage - 1);
                    }
                }
            }

            touchStartX.current = null;
            touchStartY.current = null;
        };

        // Double tap to toggle controls
        const handleTouchStart2 = (e) => {
            const currentTime = new Date().getTime();
            const tapGap = currentTime - lastTouchTime.current;
            
            if (tapGap < 300 && tapGap > 0) {
                // Double tap
                setShowControls(prev => !prev);
            }
            
            lastTouchTime.current = currentTime;
        };

        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchstart', handleTouchStart2);
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchstart', handleTouchStart2);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, currentPage, totalPages]);

    // Scroll to specific page
    const scrollToPage = (pageNumber) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        const pageHeight = window.innerHeight;
        container.scrollTo({
            top: (pageNumber - 1) * pageHeight,
            behavior: 'smooth'
        });
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            scrollToPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            scrollToPage(currentPage - 1);
        }
    };

    const handleZoomIn = () => {
        if (zoom < 3) setZoom(prev => Math.min(3, prev + (isMobile ? 0.5 : 0.25)));
    };
    
    const handleZoomOut = () => {
        if (zoom > 0.5) setZoom(prev => Math.max(0.5, prev - (isMobile ? 0.5 : 0.25)));
    };
    
    const handleClose = () => {
        router.back();
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(prev => !prev);
    };

    // Keyboard navigation (desktop only)
    useEffect(() => {
        if (isMobile) return; // Disable keyboard nav on mobile
        
        const handleKeyPress = (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                e.preventDefault();
                goToNextPage();
            }
            if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                goToPreviousPage();
            }
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, totalPages, isMobile]);

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-center px-4">
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-500 animate-spin mx-auto mb-4"/>
                    <p className="text-white/60 text-sm font-medium">Loading comic...</p>
                </div>
            </div>
        );
    }

    // Error states
    if (!comicId) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="text-4xl sm:text-6xl mb-4">❌</div>
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-2">Invalid Comic ID</h3>
                    <p className="text-white/60 text-sm mb-6">
                        No comic ID provided in the URL.
                    </p>
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all text-sm sm:text-base">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    if (!currentComic || comicPages.length === 0) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                    <div className="text-4xl sm:text-6xl mb-4">📚</div>
                    <h3 className="text-white text-lg sm:text-xl font-bold mb-2">No Pages Found</h3>
                    <p className="text-white/60 text-sm mb-6">
                        This comic doesn't have any pages yet or couldn't be loaded.
                    </p>
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all text-sm sm:text-base">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative bg-black flex flex-col overflow-hidden h-screen"
            onMouseMove={!isMobile ? resetHideControlsTimer : undefined}
            onClick={!isMobile ? resetHideControlsTimer : undefined}>
            
            {/* Mobile Header */}
            {isMobile && (
                <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/95 to-transparent transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    <div className="flex items-center justify-between p-3">
                        <button
                            className="text-white p-2 rounded-full hover:bg-white/10"
                            onClick={handleClose}>
                            <X size={20}/>
                        </button>
                        
                        <div className="flex-1 text-center">
                            <h2 className="text-white font-medium text-sm truncate px-2">
                                {currentComic.title}
                            </h2>
                        </div>
                        
                        <button
                            className="text-white p-2 rounded-full hover:bg-white/10"
                            onClick={toggleMobileMenu}>
                            <MoreHorizontal size={20}/>
                        </button>
                    </div>
                    
                    {/* Chapter info */}
                    {comicPages[currentPage - 1] && (
                        <div className="text-center pb-3">
                            <p className="text-xs text-white/60">
                                Chapter {comicPages[currentPage - 1].chapterNumber} - {comicPages[currentPage - 1].chapterTitle}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Desktop Header */}
            {!isMobile && (
                <div className={`absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
                                onClick={handleClose}
                                title="Close reader">
                                <X size={24}/>
                            </button>
                            <div className="text-white">
                                <h2 className="font-bold text-lg">{currentComic.title}</h2>
                                {comicPages[currentPage - 1] && (
                                    <p className="text-sm text-white/60">
                                        Chapter {comicPages[currentPage - 1].chapterNumber} - {comicPages[currentPage - 1].chapterTitle}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => router.push(`/marketplace/detail?id=${comicId}`)}
                            className="text-white hover:text-yellow-500 transition-colors px-4 py-2 rounded-full hover:bg-white/10 text-sm font-medium">
                            Back to Details
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                                className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">
                                <ZoomOut size={20}/>
                            </button>

                            <span className="text-white text-sm font-medium min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>

                            <button
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed">
                                <ZoomIn size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {isMobile && showMobileMenu && (
                <div className="absolute inset-0 z-40 bg-black/95 flex items-center justify-center">
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handleZoomOut}
                                disabled={zoom <= 0.5}
                                className="text-white p-3 rounded-full bg-white/10 disabled:opacity-30">
                                <ZoomOut size={24}/>
                            </button>
                            
                            <span className="text-white text-lg font-medium min-w-[80px]">
                                {Math.round(zoom * 100)}%
                            </span>
                            
                            <button
                                onClick={handleZoomIn}
                                disabled={zoom >= 3}
                                className="text-white p-3 rounded-full bg-white/10 disabled:opacity-30">
                                <ZoomIn size={24}/>
                            </button>
                        </div>
                        
                        <button
                            onClick={() => router.push(`/marketplace/detail?id=${comicId}`)}
                            className="text-white px-6 py-3 rounded-full bg-yellow-600 hover:bg-yellow-700 font-medium">
                            Back to Details
                        </button>
                        
                        <button
                            onClick={toggleMobileMenu}
                            className="text-white/60 hover:text-white transition-colors">
                            Close Menu
                        </button>
                    </div>
                </div>
            )}

            {/* Vertical Scroll Container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>

                {comicPages.map((page, index) => {
                    if (page.contentType === 'image') {
                        return (
                            <div
                                key={`${page.chapterNumber}-${page.pageNumber}`}
                                className="w-full h-screen flex items-center justify-center snap-start snap-always bg-black">
                                <div className="w-full h-full flex items-center justify-center px-2 sm:px-4">
                                    <img
                                        src={page.imageUrl}
                                        alt={`Chapter ${page.chapterNumber} - Page ${page.pageNumber}`}
                                        className={`max-w-full max-h-full object-contain transition-transform duration-300 ${
                                            isMobile ? 'w-full' : ''
                                        }`}
                                        style={{
                                            transform: `scale(${zoom})`,
                                            transformOrigin: 'center center'
                                        }}
                                        loading={index > currentPage + 2 ? 'lazy' : 'eager'}
                                    />
                                </div>
                            </div>
                        );
                    }

                    return (
                       <div
                            key={`${page.chapterNumber}-${page.pageNumber}`}
                            className="w-full h-screen snap-start snap-always bg-black overflow-hidden">
                            <div className="w-full h-full p-2 sm:p-4">
                                <div 
                                    className="w-full h-full relative"
                                    style={{ 
                                        transform: `scale(${zoom})`, 
                                        transformOrigin: 'center center'
                                    }}>
                                    {/* Iframe container */}
                                    <div className="w-full h-full relative overflow-hidden rounded">
                                        <iframe
                                            src={`${page.imageUrl}#view=FitH&toolbar=0&navpanes=0&statusbar=0&scrollbar=0`}
                                            title={`Chapter ${page.chapterNumber} - Page ${page.pageNumber}`}
                                            className="w-full h-full border-0"
                                            loading={index > currentPage + 2 ? 'lazy' : 'eager'}
                                            style={{ 
                                                width: 'calc(100% + 40px)',
                                                height: 'calc(100% + 40px)',
                                                marginRight: '-40px',
                                                marginBottom: '-40px',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none'
                                            }}
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
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            {/* Mobile Side Navigation */}
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

                    {/* Progress Bar */}
                    <div className="mt-2 sm:mt-4 w-full max-w-md mx-auto">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 transition-all duration-300"
                                style={{
                                    width: `${(currentPage / totalPages) * 100}%`
                                }}/>
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
                            {comicPages.length > (isTablet ? 15 : 20) && (
                                <div className={`flex-shrink-0 flex items-center justify-center text-white/60 text-xs ${
                                    isTablet ? 'w-10 h-12' : 'w-12 h-16'
                                }`}>
                                    +{comicPages.length - (isTablet ? 15 : 20)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ComicReaderViewer;