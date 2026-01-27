import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Search } from 'lucide-react';
import Picture from '@/components/picture/Index';
import { bgSlider } from '../../../../public/dev_images';
import Link from 'next/link';

interface Comic {
  id: string;
  title: string;
  image: string;
  description?: string;
}

interface ComicsCarouselProps {
  comics: any[];
  autoPlayInterval?: number;
  showSearch?: boolean;
  onComicSelect?: (comic: Comic) => void;
  onSearch?: (query: string) => void;
}

const ComicsCarousel: React.FC<ComicsCarouselProps> = ({
  comics,
  autoPlayInterval = 5000,
  showSearch = true,
  onComicSelect,
  onSearch
}) => {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(comics.length / 2));
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || comics.length <= 1) return;

    const interval = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prevIndex) => 
        prevIndex === comics.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, comics.length, autoPlayInterval]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setDirection('prev');
    setCurrentIndex(currentIndex === 0 ? comics.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setDirection('next');
    setCurrentIndex(currentIndex === comics.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setDirection(index > currentIndex ? 'next' : 'prev');
    setCurrentIndex(index);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleComicClick = (comic: Comic, index: number) => {
    if (index !== currentIndex) {
      goToSlide(index);
    } else {
      onComicSelect?.(comic);
    }
  };

  // Get visible cards with their positions
  const getVisibleCards = () => {
    const visibleCards = [];
    const totalCards = Math.min(5, comics.length); // Show max 5 cards
    const sideCards = Math.floor(totalCards / 2);

    for (let i = -sideCards; i <= sideCards; i++) {
      let index = currentIndex + i;
      
      // Handle wrapping
      if (index < 0) index = comics.length + index;
      if (index >= comics.length) index = index - comics.length;
      
      visibleCards.push({
        comic: comics[index],
        originalIndex: index,
        position: i, // -2, -1, 0, 1, 2
        isCenter: i === 0
      });
    }
    
    return visibleCards;
  };

  // Calculate card styles based on position
  const getCardStyle = (position: number, isCenter: boolean) => {
    const absPos = Math.abs(position);
    
    if (isCenter) {
      return {
        transform: 'translateX(0) scale(1.1) translateZ(0)',
        zIndex: 30,
        opacity: 1,
        filter: 'blur(0px)',
      };
    }
    
    const offset = position * 120; // Horizontal spacing
    const scale = 1 - (absPos * 0.15); // Progressive scaling
    const opacity = 1 - (absPos * 0.1); // Progressive opacity
    const blur = absPos * 2; // Progressive blur
    const rotateY = position * 8; // Slight 3D rotation
    
    return {
      transform: `translateX(${offset}px) scale(${scale}) rotateY(${rotateY}deg) translateZ(0)`,
      zIndex: 30 - absPos,
      opacity: Math.max(opacity, 0.3),
      filter: `blur(${blur}px)`,
    };
  };

  if (comics.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400">No comics available</p>
      </div>
    );
  }

  return (
    <>
     {/* Header */}
      <div className="relative z-10 my-8 mt-12">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-medium text-white">
            Get all you can read
          </h2>
          
          {showSearch && (
            <div className="relative rounded-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <input
                type="text"
                placeholder="Search comics/creators"
                value={searchQuery}
                onChange={handleSearch}
                className="bg-black-200 font-light border border-gray-300 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72 md:w-96 text-sm"
              />
            </div>
          )}
        </div>
      </div>
    <div className="w-full read_all-slider rounded-2xl p-8 relative overflow-hidden">
      {/* Background pattern/texture */}
      <div className='absolute inset-0'>
        <Picture
          src={bgSlider}
          alt='bg what'
          loading='eager'
          className='w-full h-full object-fill'
        />
      </div>

      

      {/* Carousel Container */}
      <div className="relative">
        <div className="relative overflow-visible">
          {/* Comics Display Container */}
          <div className="relative h-80 md:h-96 flex items-center justify-center perspective-1000">
            {/* Cards Container - Card Deck Style */}
            <div className="relative w-full h-full flex items-center justify-center">
              {getVisibleCards().map(({ comic, originalIndex, position, isCenter }) => (
                <Link href={`/marketplace/chapter?id=${comic?.id}`}
                  key={`${comic?.id}-${originalIndex}`}
                  className={`absolute cursor-pointer transform-gpu transition-all duration-700 ease-out ${
                    isCenter ? 'hover:scale-105' : 'hover:scale-95'
                  }`}
                  style={getCardStyle(position, isCenter)}
                  onClick={() => handleComicClick(comic, originalIndex)}
                >
                  <div className="group relative border border-white rounded-2xl overflow-hidden shadow-2xl w-64 h-72">
                    <img
                      src={comic?.image}
                      alt={comic?.title}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    
                    {/* Dark gradient overlay on image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black-100/60 via-black-100/20 to-black-100/40" />
                    
                    {/* Dark overlay that's always present but gets darker on hover */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/60 transition-all duration-300" />
                    
                    {/* Original overlay gradient for title readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Comic title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                      <h3 className="font-bold text-white text-lg leading-tight transition-all duration-700">
                        {comic?.title}
                      </h3>
                      {comic?.description && isCenter && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-2 transition-all duration-700">
                          {comic?.description}
                        </p>
                      )}
                    </div>

                    {/* Center card highlight border */}
                    {isCenter && (
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-primary-400 shadow-lg shadow-primary-500/30 transition-all duration-700" />
                    )}

                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation with arrows and dots */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className="flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover-text-white transition-all duration-200 backdrop-blur-sm hover:scale-110"
            aria-label="Previous comic"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex items-center space-x-2">
            {comics.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary-500 scale-125'
                    : 'border border-white/50 bg-transparent hover:bg-gray-300 hover:scale-110'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            className="flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover-text-white transition-all duration-200 backdrop-blur-sm hover:scale-110"
            aria-label="Next comic"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ComicsCarousel;