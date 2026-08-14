"use client";

import Picture from "@/components/picture/Index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { hbar } from "../../../../public/dev_images";

export interface Comic {
  rank: number;
  title: string;
  author: string;
  floorPrice: string;
  priceChange: number;
  copies: number;
  sales: number;
  volume: string;
  image: string;
  // Optional fields for enhanced data
  totalComics?: number;
  totalSupply?: number;
  totalViews?: number;
  totalLikes?: number;
  genre?: string[];
  isCollection?: boolean;
  id?: string;
  createdAt?: string;
}

interface ComicsTableProps {
  comics: Comic[];
  title?: string;
  isLoading?: boolean;
}

export function ComicsTable({ 
  comics, 
  title = "Top Collections",
  isLoading = false 
}: ComicsTableProps) {
  // Create paginated dataset - only extend if we have less than 50 items
  const [allComics] = useState<Comic[]>(() => {
    if (comics.length === 0) return [];
    
    if (comics.length >= 50) {
      return comics; // Use actual data if we have enough
    }
    
    // Replicate items to create demo pagination only if needed
    const targetSize = Math.max(50, comics.length);
    return Array.from({ length: targetSize }).map((_, index) => {
      const template = comics[index % comics.length];
      return { ...template, rank: index + 1 };
    });
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [likedComics, setLikedComics] = useState<Set<number>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState("10m");
  const [activeCategory, setActiveCategory] = useState("Top");
  const [selectedGenre, setSelectedGenre] = useState("Action");

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(allComics.length / ITEMS_PER_PAGE);

  const timePeriods = ["10m", "1h", "6h", "1d", "7d", "30d"];
  const categories = ["Top", "Trending", "Genres"];
  const genreFilters = ["Action", "Sci-fi", "Horror", "Romance", "Comedy", "Fantasy", "Slice of Life"];

  const currentTableData = useMemo(() => {
    const first = (currentPage - 1) * ITEMS_PER_PAGE;
    const last = first + ITEMS_PER_PAGE;
    return allComics.slice(first, last);
  }, [currentPage, allComics]);

  const toggleLike = (rank: number) => {
    setLikedComics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rank)) {
        newSet.delete(rank);
      } else {
        newSet.add(rank);
      }
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatPrice = (priceStr: string) => priceStr.replace(" HBAR", "");

  const getPageTitle = () => {
    return activeCategory === "Genres" ? "Genres" : title;
  };

  const getItemLabel = () => {
    return comics.some(c => c.isCollection) ? "Collection" : "Comic";
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="my-8 mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-bold">{title}</h2>
        </div>
        
        <div className="bg-black-500 rounded-lg border border-white/10 p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-16"></div>
                <div className="h-4 bg-white/10 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (allComics.length === 0) {
    return (
      <section className="my-8 mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-bold">{title}</h2>
        </div>
        
        <div className="bg-black-500 rounded-lg border border-white/10 p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Collections Found</h3>
          <p className="text-white/60">Collections will appear here once comics are published.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-8 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-white text-xl sm:text-2xl font-bold">{getPageTitle()}</h2>

        <div className="flex space-x-1 rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              className={`px-2 sm:px-3 py-2 text-xs font-medium rounded transition-colors ${
                period === selectedPeriod
                  ? "text-white"
                  : "text-white/40 hover:text-white"
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 text-sm rounded-full border transition-all ${
                activeCategory === cat
                  ? "bg-transparent border-white/40 text-white"
                  : "bg-transparent border-transparent text-white/40 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeCategory === "Genres" && (
          <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
            {genreFilters.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded ${
                  selectedGenre === genre
                    ? "bg-[#FAA31E] text-black"
                    : "text-white/60 hover:text-white bg-transparent"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-black-500 rounded-lg overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-12 px-2 sm:px-4"></TableHead> {/* Heart Col */}
                
                {/* Conditional Headers */}
                {activeCategory === "Genres" ? (
                  <>
                    <TableHead className="text-white text-sm px-2 sm:px-4">Genre</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">{getItemLabel()}</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4 hidden sm:table-cell"># of items</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4 hidden md:table-cell">Total Supply</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4 hidden lg:table-cell">Total Sales</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">7d Change</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">24h Volume</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="text-white text-sm px-2 sm:px-4">{getItemLabel()}</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">Floor Price</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4 hidden md:table-cell">Total Supply</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4 hidden sm:table-cell">Sales</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">10m Change</TableHead>
                    <TableHead className="text-white text-sm px-2 sm:px-4">24h Volume</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTableData.map((comic) => {
                const isLiked = likedComics.has(comic.rank);
                
                return (
                  <TableRow
                    key={`${comic.id || comic.rank}-${comic.title}`}
                    className="border-white/10 hover:bg-white/5 transition-colors group"
                  >
                    <TableCell className="px-2 sm:px-4">
                      <button onClick={() => toggleLike(comic.rank)} className="focus:outline-none">
                        <Heart
                          className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                            isLiked
                              ? "text-[#F8961C] fill-primary-500"
                              : "text-white/20 hover:text-[#F8961C]"
                          }`}
                        />
                      </button>
                    </TableCell>

                    {activeCategory === "Genres" ? (
                      <>
                        <TableCell className="text-white font-medium px-2 sm:px-4">
                          {comic.genre?.join(', ') || selectedGenre}
                        </TableCell>

                        <TableCell className="px-2 sm:px-4">
                          <div className="flex items-center -space-x-2 sm:-space-x-4">
                            {/* Rendering overlapping images for collection effect */}
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="w-6 h-6 sm:w-10 sm:h-10 rounded-full border-2 border-[#1a1a1a] overflow-hidden bg-gray-800 z-0 hover:z-10 transition-all">
                                <Avatar className="w-full h-full">
                                  <AvatarImage src={comic.image} className="object-cover opacity-80" />
                                  <AvatarFallback className="text-xs">C{i}</AvatarFallback>
                                </Avatar>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-white font-bold px-2 sm:px-4 hidden sm:table-cell">
                          {comic.totalComics || comic.copies}
                        </TableCell>
                        <TableCell className="text-white/80 px-2 sm:px-4 hidden md:table-cell">
                          {comic.totalSupply || comic.copies}
                        </TableCell>
                        <TableCell className="text-white/80 px-2 sm:px-4 hidden lg:table-cell">
                          {comic.sales}
                        </TableCell>
                        
                        <TableCell className="px-2 sm:px-4">
                          <span className={`text-sm flex items-center ${comic.priceChange > 0 ? "text-green-400" : "text-red-400"}`}>
                            {comic.priceChange > 0 ? "+" : ""}{comic.priceChange.toFixed(1)}%
                          </span>
                        </TableCell>

                        <TableCell className="text-white font-light flex items-center gap-1 px-2 sm:px-4">
                          <span className="text-sm sm:text-base">{formatPrice(comic.volume)}</span>
                          <Picture src={hbar} alt="hbar" loading="eager" className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#FAA31E] rounded-lg overflow-hidden flex items-center justify-center relative flex-shrink-0">
                            <Avatar className="w-full h-full transition-colors rounded-none">
                              <AvatarImage src={comic.image} alt={comic.title} className="object-cover" />
                              <AvatarFallback className="bg-black-500 text-white font-bold text-xs">
                                {comic.title.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium text-sm sm:text-base truncate">{comic.title}</p>
                            <p className="text-white/40 text-xs truncate">{comic.author}</p>
                            {comic.isCollection && comic.totalComics && (
                              <p className="text-white/30 text-xs">{comic.totalComics} items</p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="px-2 sm:px-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <span className="text-white font-light flex items-center gap-1">
                              <span className="text-sm sm:text-base">{formatPrice(comic.floorPrice)}</span>
                              <Picture src={hbar} alt="hbar" loading="eager" className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                            </span>
                            <span className={`text-xs flex items-center ${comic.priceChange > 0 ? "text-green-400" : "text-red-400"}`}>
                              {comic.priceChange > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {Math.abs(comic.priceChange).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-white/80 px-2 sm:px-4 hidden md:table-cell">
                          {(comic.totalSupply || comic.copies).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white/80 px-2 sm:px-4 hidden sm:table-cell">{comic.sales}</TableCell>

                        <TableCell className="px-2 sm:px-4">
                          <span className={`text-sm flex items-center ${comic.priceChange > 0 ? "text-green-400" : "text-red-400"}`}>
                            {comic.priceChange > 0 ? "+" : ""}{comic.priceChange.toFixed(1)}%
                          </span>
                        </TableCell>

                        <TableCell className="text-white font-light flex items-center gap-1 px-2 sm:px-4">
                          <span className="text-sm sm:text-base">{formatPrice(comic.volume)}</span>
                          <Picture src={hbar} alt="hbar" loading="eager" className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - only show if we have more than one page */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 px-2 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 sm:px-6 py-2 border text-sm font-medium rounded-lg transition-colors ${
              currentPage === 1
                ? "border-white/10 text-white/20 cursor-not-allowed"
                : "border-primary-500/50 text-[#F8961C] hover:bg-[#FAA31E]/10"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${
                    isActive
                      ? "bg-[#FAA31E]/10 border border-primary-500/50 text-[#F8961C]"
                      : "text-[#F8961C]/70 hover:text-[#F8961C] hover:bg-white/5"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="text-[#F8961C]/50 text-xs px-1">..</span>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="w-8 h-8 flex items-center justify-center text-[#F8961C]/70 hover:text-[#F8961C] text-sm rounded hover:bg-white/5 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-6 sm:px-8 py-2 text-black text-sm font-bold rounded-lg transition-colors shadow-lg ${
              currentPage === totalPages
                ? "bg-gray-600 cursor-not-allowed shadow-none"
                : "bg-[#FAA31E] hover:bg-primary-400 shadow-primary-500/20"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}