"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

// Mock Data Generator
const generateMockArtists = () => {
  return Array.from({ length: 70 }).map((_, i) => ({
    rank: i + 1,
    name:
      [
        "Jaydon Ekstrom Bothman",
        "Ruben Carder",
        "Alfredo Septimus",
        "Davis Franci",
        "Livia Rosser",
        "Kianna Donin",
        "Phillip Lipshutz",
        "Maria Rosser",
        "Kianna Stanton",
        "Angel Lubin",
        "Allison Torff",
        "Davis Workman",
        "Lindsey Lipshutz",
        "Randy Carder",
        "Lydia Culhane",
        "Rayna Bator",
        "Jocelyn Westervelt",
        "Marilyn Torff",
        "Skylar Levin",
        "Terry Dorwart",
      ][i % 20] || `Artist ${i + 1}`,
    rating: "+41%",
    sold: 602,
    collections: 124 - (i % 20) * 2,
    image: `https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg`,
  }));
};

export default function TopCreators() {
  const [activeTab, setActiveTab] = useState("Today");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const allArtists = generateMockArtists();
  const totalPages = Math.ceil(allArtists.length / itemsPerPage);

  const currentArtists = allArtists.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const gridLayout =
    "grid grid-cols-[80px_3fr_1fr_1fr_1fr] items-center gap-4 px-6";

  return (
    <div className="w-full bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-4 w-full border-b border-white/10 mb-8 min-w-[300px]">
          {["Today", "This Week", "This Month", "All Time"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm md:text-lg font-semibold transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-white" />
              )}
            </button>
          ))}
        </div>

        <div className="w-full overflow-x-auto pb-6">
          <div className="min-w-[900px]">
            <div
              className={`${gridLayout} py-4 text-xs tracking-wider text-white/40 mb-4 rounded-2xl border border-white/5`}
            >
              <div>#</div>
              <div>Artist</div>
              <div>Ratings</div>
              <div>Total Comic Sold</div>
              <div>Collections</div>
            </div>

            <div className="space-y-3">
              {currentArtists.map((artist) => (
                <div
                  key={artist.rank}
                  className={`${gridLayout} bg-[#111111] hover:bg-[#161616] transition-colors rounded-2xl py-3 border border-white/5`}
                >
                  {/* Rank */}
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-black font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20">
                      {artist.rank}
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-transparent">
                      <AvatarImage
                        src={artist.image}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-800 text-xs">
                        {artist.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-white text-base truncate">
                      {artist.name}
                    </span>
                  </div>

                  <div className="text-[#f59e0b] text-sm">{artist.rating}</div>

                  <div className="text-white/80 text-sm">{artist.sold}</div>

                  <div className="text-white/80 text-sm">
                    {artist.collections}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between mt-6 pt-4 px-2 select-none">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-2.5 rounded-xl border text-sm font-semibold transition-colors flex items-center gap-2 ${
              currentPage === 1
                ? "border-white/10 text-white/20 cursor-not-allowed"
                : "border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/10"
            }`}
          >
            Previous
          </button>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-sm transition-colors ${
                    isActive
                      ? "bg-[#f59e0b]/10 border border-[#f59e0b]/50 text-[#f59e0b]"
                      : "text-[#f59e0b]/70 hover:bg-white/5 hover:text-[#f59e0b]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {totalPages > 5 && (
              <span className="text-[#f59e0b] pb-2 px-1">..</span>
            )}

            {totalPages > 5 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded text-sm transition-colors ${
                  currentPage === totalPages
                    ? "bg-[#f59e0b]/10 border border-[#f59e0b]/50 text-[#f59e0b]"
                    : "text-[#f59e0b]/70 hover:bg-white/5 hover:text-[#f59e0b]"
                }`}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-8 py-2.5 rounded-xl text-black text-sm font-bold shadow-lg transition-colors ${
              currentPage === totalPages
                ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-[#ff9f1c] shadow-orange-500/20 hover:bg-[#ffb042]"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
