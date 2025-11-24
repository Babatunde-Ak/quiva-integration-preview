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
import { hbar } from "../../../../public/dev_images"; // Ensure this path is correct

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
}

interface ComicsTableProps {
  comics: Comic[];
}

export function ComicsTable({ comics }: ComicsTableProps) {
  // Replicate the items to create 50 items so Pagination works for demo
  const [allComics] = useState<Comic[]>(() => {
    return Array.from({ length: 50 }).map((_, index) => {
      const template = comics[index % comics.length];
      return {
        ...template,
        rank: index + 1,
      };
    });
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [likedComics, setLikedComics] = useState<Set<number>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState("10m");
  const [activeCategory, setActiveCategory] = useState("Top");

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(allComics.length / ITEMS_PER_PAGE);

  // Pagination Helper
  const currentTableData = useMemo(() => {
    const first = (currentPage - 1) * ITEMS_PER_PAGE;
    const last = first + ITEMS_PER_PAGE;
    return allComics.slice(first, last);
  }, [currentPage, allComics]);

  // Toggle Like
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

  // Pagination Handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const timePeriods = ["10m", "1h", "6h", "1d", "7d", "30d"];
  const categories = ["Top", "Trending", "Genres"];

  // Helper to clean price strings (remove " HBAR" to show icon instead)
  const formatPrice = (priceStr: string) => priceStr.replace(" HBAR", "");

  return (
    <section className="my-8 mt-12">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-2xl font-bold">Top</h2>

        {/* Time Period Selector */}
        <div className="flex space-x-1 rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
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

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-sm rounded-full border transition-all ${
              activeCategory === cat
                ? "bg-transparent border-white/40 text-white"
                : "bg-transparent border-transparent text-white/40 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-black-500 rounded-lg overflow-hidden border border-b-2 border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent px-4 py-4">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-white text-sm pl-4">Comic</TableHead>
              <TableHead className="text-white text-sm">Floor Price</TableHead>
              <TableHead className="text-white text-sm">Total Supply</TableHead>
              <TableHead className="text-white text-sm">Sales</TableHead>
              <TableHead className="text-white text-sm">10m Change</TableHead>
              <TableHead className="text-white text-sm">24h Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTableData.map((comic) => {
              const isLiked = likedComics.has(comic.rank);
              return (
                <TableRow
                  key={comic.rank}
                  className="border-white/10 hover:bg-white/5 px-4 py-4 font-light text-base group transition-colors"
                >
                  {/* Like Button */}
                  <TableCell className="pl-4">
                    <button
                      onClick={() => toggleLike(comic.rank)}
                      className="focus:outline-none"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isLiked
                            ? "text-orange-500 fill-orange-500"
                            : "text-white/20 hover:text-orange-500"
                        }`}
                      />
                    </button>
                  </TableCell>

                  {/* Comic Info */}
                  <TableCell className="flex items-center space-x-3 ml-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg overflow-hidden flex items-center justify-center relative">
                      <Avatar className="w-full h-full transition-colors rounded-none">
                        <AvatarImage
                          src={comic.image}
                          alt={comic.title}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-black-500 text-white font-bold">
                          {comic.title.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="text-white font-medium">{comic.title}</p>
                      <p className="text-white/40 text-xs">{comic.author}</p>
                    </div>
                  </TableCell>

                  {/* Floor Price */}
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {/* Price and Icon */}
                      <span className="text-white font-light flex items-center gap-1">
                        {formatPrice(comic.floorPrice)}
                        <span>
                          <Picture
                            src={hbar}
                            alt="hbar"
                            loading="eager"
                            className="w-6 h-6"
                          />
                        </span>
                      </span>

                      {/* Percentage Change Indicator */}
                      <span
                        className={`text-xs flex items-center ${
                          comic.priceChange > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {comic.priceChange > 0 ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        {Math.abs(comic.priceChange)}%
                      </span>
                    </div>
                  </TableCell>

                  {/* Supply / Copies */}
                  <TableCell className="text-white/80">
                    {comic.copies.toLocaleString()}
                  </TableCell>

                  {/* Sales */}
                  <TableCell className="text-white/80">{comic.sales}</TableCell>

                  {/* 10m Change (Separate Column) */}
                  <TableCell>
                    <span
                      className={`text-sm flex items-center ${
                        comic.priceChange > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {comic.priceChange > 0 ? "+" : ""}
                      {comic.priceChange}%
                    </span>
                  </TableCell>

                  {/* Volume */}
                  <TableCell className="text-white font-light flex items-center gap-1">
                    {formatPrice(comic.volume)}
                    <span>
                      <Picture
                        src={hbar}
                        alt="hbar"
                        loading="eager"
                        className="w-6 h-6"
                      />
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-8 px-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-6 py-2 border text-sm font-medium rounded-lg transition-colors ${
            currentPage === 1
              ? "border-white/10 text-white/20 cursor-not-allowed"
              : "border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
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
                    ? "bg-orange-500/10 border border-orange-500/50 text-orange-500"
                    : "text-orange-500/70 hover:text-orange-500 hover:bg-white/5"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <span className="text-orange-500/50 text-xs px-1">..</span>
          <button
            onClick={() => handlePageChange(totalPages)}
            className="w-8 h-8 flex items-center justify-center text-orange-500/70 hover:text-orange-500 text-sm rounded hover:bg-white/5 transition-colors"
          >
            {totalPages}
          </button>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-8 py-2 text-black text-sm font-bold rounded-lg transition-colors shadow-lg ${
            currentPage === totalPages
              ? "bg-gray-600 cursor-not-allowed shadow-none"
              : "bg-orange-500 hover:bg-orange-400 shadow-orange-500/20"
          }`}
        >
          Next
        </button>
      </div>
    </section>
  );
}
