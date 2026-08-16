import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import Link from 'next/link';
import { Comic } from '@/features/comic-library/utils/transformComicData';

interface ComicsCarouselProps {
  comics: Comic[];
  autoPlayInterval?: number;
  showSearch?: boolean;
  onComicSelect?: (comic: Comic) => void;
  onSearch?: (query: string) => void;
}

type VisibleCard = {
  comic: Comic;
  originalIndex: number;
  position: number;
  isCenter: boolean;
};

const ComicsCarousel: React.FC<ComicsCarouselProps> = ({
  comics,
  autoPlayInterval = 5000,
  showSearch = true,
  onComicSelect,
  onSearch,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (comics.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((previousIndex) =>
      Math.min(previousIndex, comics.length - 1),
    );
  }, [comics.length]);

  useEffect(() => {
    if (!isAutoPlaying || comics.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentIndex((previousIndex) =>
        previousIndex === comics.length - 1
          ? 0
          : previousIndex + 1,
      );
    }, autoPlayInterval);

    return () => window.clearInterval(interval);
  }, [autoPlayInterval, comics.length, isAutoPlaying]);

  const goToPrevious = () => {
    if (comics.length === 0) return;

    setIsAutoPlaying(false);

    setCurrentIndex((previousIndex) =>
      previousIndex === 0
        ? comics.length - 1
        : previousIndex - 1,
    );
  };

  const goToNext = () => {
    if (comics.length === 0) return;

    setIsAutoPlaying(false);

    setCurrentIndex((previousIndex) =>
      previousIndex === comics.length - 1
        ? 0
        : previousIndex + 1,
    );
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= comics.length) return;

    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const visibleCards = useMemo<VisibleCard[]>(() => {
    if (comics.length === 0) return [];

    let positions: number[];

    if (comics.length === 1) {
      positions = [0];
    } else if (comics.length === 2) {
      positions = [-1, 0];
    } else if (comics.length === 3) {
      positions = [-1, 0, 1];
    } else if (comics.length === 4) {
      positions = [-1, 0, 1, 2];
    } else {
      positions = [-2, -1, 0, 1, 2];
    }

    return positions.map((position) => {
      const originalIndex =
        (currentIndex + position + comics.length) % comics.length;

      return {
        comic: comics[originalIndex],
        originalIndex,
        position,
        isCenter: position === 0,
      };
    });
  }, [comics, currentIndex]);

  const indicatorIndexes = useMemo(() => {
    const maximumIndicators = 4;

    if (comics.length <= maximumIndicators) {
      return comics.map((_, index) => index);
    }

    const maximumStart = comics.length - maximumIndicators;

    const start = Math.min(
      Math.max(currentIndex - 1, 0),
      maximumStart,
    );

    return Array.from(
      { length: maximumIndicators },
      (_, offset) => start + offset,
    );
  }, [comics, currentIndex]);

  const getCardStyle = (
    position: number,
    isCenter: boolean,
  ): React.CSSProperties => {
    if (isCenter) {
      return {
        transform: 'translateX(0) scale(1)',
        zIndex: 30,
        opacity: 1,
        filter: 'none',
      };
    }

    const distance = Math.abs(position);
    const direction = position < 0 ? -1 : 1;

    const horizontalOffset = distance === 1 ? 55 : 108;
    const scale = distance === 1 ? 0.92 : 0.84;

    // Blur applies only to side cards.
    const blur = distance === 1 ? 3 : 6;

    return {
      transform: `translateX(${direction * horizontalOffset}%) scale(${scale})`,
      zIndex: 30 - distance * 10,
      opacity: distance === 1 ? 0.9 : 0.75,
      filter: `blur(${blur}px)`,
    };
  };

  if (comics.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-gray-900">
        <p className="text-gray-400">
          No comics available
        </p>
      </div>
    );
  }

  const activeComic = comics[currentIndex];

  const activeBackground =
    activeComic.bannerImage || activeComic.image;

  const safeBackgroundUrl = activeBackground.replace(
    /"/g,
    '\\"',
  );

  return (
    <>
      <div className="relative z-10 my-8 mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-medium text-white md:text-3xl">
            Get all you can read
          </h2>

          {showSearch && (
            <SearchBar
              placeholder="Search comics/creators"
              onSearch={onSearch}
              onComicSelect={onComicSelect}
              className="w-full sm:w-72 md:w-96"
            />
          )}
        </div>
      </div>

      <section className="relative isolate min-h-[470px] w-full overflow-hidden rounded-2xl border border-white/20 bg-[#141414] sm:min-h-[520px] lg:min-h-[580px]">
        {/* Clear selected-comic background */}
        <div className="absolute inset-0 overflow-hidden bg-[#141414]">
          <div
            key={activeComic.id}
            data-carousel-background
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-out"
            style={{
              backgroundImage: `url("${safeBackgroundUrl}")`,
              filter: 'none',
              transform: 'none',
              opacity: 1,
            }}
          />

          {/* Required dark overlay, #141414 at 32% */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.32)',
            }}
          />
        </div>

        <div className="relative z-10 flex min-h-[470px] flex-col items-center justify-center px-4 py-8 sm:min-h-[520px] sm:px-8 lg:min-h-[580px] lg:px-12">
          <div className="relative flex h-[310px] w-full items-center justify-center sm:h-[370px] lg:h-[430px]">
            {visibleCards.map(
              ({
                comic,
                originalIndex,
                position,
                isCenter,
              }) => (
                <Link
                  href={`/marketplace/chapter?id=${comic.id}`}
                  key={`${comic.id}-${position}`}
                  aria-label={
                    isCenter
                      ? `Open ${comic.title}`
                      : `Select ${comic.title}`
                  }
                  className="absolute block transform-gpu transition-all duration-700 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  style={getCardStyle(position, isCenter)}
                  onClick={(event) => {
                    if (!isCenter) {
                      event.preventDefault();
                      goToSlide(originalIndex);
                      return;
                    }

                    onComicSelect?.(comic);
                  }}
                >
                  <div className="group relative h-[280px] w-[220px] overflow-hidden rounded-2xl border border-white/50 bg-[#141414]/30 shadow-2xl sm:h-[331px] sm:w-[260px] lg:h-[413px] lg:w-[324px]">
                    <img
                      src={comic.image}
                      alt={comic.title}
                      className="h-full w-full object-cover"
                    />

                    {!isCenter && (
                      <div className="absolute inset-0 bg-[#141414]/25" />
                    )}

                    {isCenter && (
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/80" />
                    )}
                  </div>
                </Link>
              ),
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 sm:mt-5">
            <button
              type="button"
              onClick={goToPrevious}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              aria-label="Previous comic"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5">
              {indicatorIndexes.map((index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'border border-primary-300 bg-primary-500'
                      : 'border border-white/60 bg-transparent hover:border-white hover:bg-white/20'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={
                    index === currentIndex
                      ? 'true'
                      : undefined
                  }
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goToNext}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              aria-label="Next comic"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <Link
            href="/marketplace/collections"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary-500 transition hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            See all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default ComicsCarousel;