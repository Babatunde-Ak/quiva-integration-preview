import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Eye } from 'lucide-react';

const CollectionsView = () => {
  // 1. CONFIGURATION
  const itemsPerPage = 6;
  
  // 2. MOCK DATA GENERATOR (Creating enough data to demonstrate pagination)
  // We generate 50 items to show meaningful pagination
  const allCollections = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: i % 3 === 0 ? "Inosuke degen" : i % 3 === 1 ? "The son is also the father" : "Spiderman: Mary Jane",
    count: (i % 5) + 1,
    image: "/dev_images/avatar-2.png", // Replace with your actual image path
    creator: i % 2 === 0 ? "Estevao" : "Mia den",
    creatorAvatar: "/dev_images/avatar-2.png",
    likes: (1000 + i * 5).toLocaleString(),
    views: (3000 + i * 12).toLocaleString(),
    price: "4.89K"
  }));

  // 3. STATE
  const [currentPage, setCurrentPage] = useState(1);

  // 4. CALCULATIONS
  const totalPages = Math.ceil(allCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = allCollections.slice(startIndex, startIndex + itemsPerPage);

  // 5. HANDLERS
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // 6. PAGINATION RENDER LOGIC (Smart Ellipsis)
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Always show Page 1
    buttons.push(
      <PageButton key={1} page={1} active={currentPage === 1} onClick={() => handlePageClick(1)} />
    );

    // Logic for ellipses and middle pages
    if (currentPage > 3) {
      buttons.push(<span key="start-dots" className="text-gray-500 self-end mb-2">..</span>);
    }

    // Show pages around current
    // We want to show current-1 and current+1, but bounded by 1 and totalPages
    const startWindow = Math.max(2, currentPage - 1);
    const endWindow = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startWindow; i <= endWindow; i++) {
      buttons.push(
        <PageButton key={i} page={i} active={currentPage === i} onClick={() => handlePageClick(i)} />
      );
    }

    if (currentPage < totalPages - 2) {
      buttons.push(<span key="end-dots" className="text-gray-500 self-end mb-2">..</span>);
    }

    // Always show Last Page (if total > 1)
    if (totalPages > 1) {
      buttons.push(
        <PageButton key={totalPages} page={totalPages} active={currentPage === totalPages} onClick={() => handlePageClick(totalPages)} />
      );
    }

    return buttons;
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <h3 className="text-xl font-bold text-white mb-8 font-mono">
        Collections {currentPage} <span className="text-gray-500 text-sm ml-2">(Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, allCollections.length)} of {allCollections.length})</span>
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 min-h-[500px]">
        {currentItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 cursor-pointer h-fit"
          >
            {/* Cover Image */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 bg-gray-900">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
            </div>

            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-white truncate pr-2">{item.title}</h4>
              <span className="flex items-center justify-center bg-[#FF9F1C] text-black font-bold text-xs w-6 h-6 rounded-md shadow-lg shadow-orange-500/20">
                {item.count}
              </span>
            </div>

            {/* Creator & Stats Row */}
            <div className="flex items-end justify-between">
              
              {/* Creator Info */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-700">
                   <Image src={item.creatorAvatar} alt={item.creator} fill className="object-cover" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/50">Creator</span>
                    <span className="text-sm font-bold text-white">{item.creator}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-1">
                 {/* Icons Row */}
                 <div className="flex items-center gap-3 text-white">
                    <div className="flex items-center gap-1">
                        <Heart size={12} className="fill-current" />
                        <span className="text-[10px] font-bold">{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye size={12} className="fill-current" />
                        <span className="text-[10px] font-bold">{item.views}</span>
                    </div>
                 </div>
                 {/* Price */}
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/70">Mint Price</span>
                    <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white">{item.price}</span>
                        <span className="flex items-center justify-center w-8 h-8 rounded">
                             <Image src="/hbar.png" alt="H" width={20} height={20} />
                        </span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#242424] pt-8">
        
        {/* Previous Button */}
        <button 
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-6 py-2 rounded-lg border border-[#FF9F1C] text-[#FF9F1C] font-bold text-sm transition-all
            ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF9F1C] hover:text-black'}`}
        >
            Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2 text-sm font-bold font-mono">
            {renderPaginationButtons()}
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-8 py-2 rounded-lg bg-[#FF9F1C] text-black font-bold text-sm transition-all min-w-[100px]
            ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-700' : 'hover:bg-[#FFB045]'}`}
        >
            Next
        </button>

      </div>
    </div>
  );
};

// Helper Subcomponent for Page Buttons
const PageButton = ({ page, active, onClick }: { page: number; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 flex items-center justify-center rounded transition-colors duration-200
      ${active 
        ? 'border border-[#FF9F1C] text-[#FF9F1C] bg-transparent' // Active State
        : 'text-[#FF9F1C] hover:bg-[#242424]' // Inactive State
      }`}
  >
    {page}
  </button>
);

export default CollectionsView;