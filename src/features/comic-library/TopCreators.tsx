"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllCollaborators } from "@/redux/slices/authSlice";

// Types for creator data
interface Creator {
  rank: number;
  name: string;
  penName: string;
  walletAddress: string;
  rating: string;
  sold: number;
  collections: number;
  image: string;
  id: string;
  roles: string[];
  isCreator: boolean;
}

// Transform API data to match the component's expected structure
const transformCreatorData = (apiData: any[]): Creator[] => {
  if (!Array.isArray(apiData)) return [];
  
  return apiData
    .filter((creator) => creator?.role?.includes('creator')) // Only include creators
    .map((creator, index) => {
      const penName = creator?.creatorProfile?.penName || creator?.displayName || "Unknown Creator";
      const displayName = creator?.displayName || creator?.creatorProfile?.penName || "Anonymous";
      
      return {
        rank: index + 1,
        name: displayName,
        penName: penName,
        walletAddress: creator?.walletAddress || "",
        rating: generateMockRating(),
        sold: generateMockSales(),
        collections: generateMockCollections(),
        image: creator?.avatar || getDefaultAvatar(creator?.walletAddress || ""),
        id: creator?._id || `creator-${index}`,
        roles: creator?.role || [],
        isCreator: creator?.role?.includes('creator') || false
      };
    });
};

// Helper functions
const generateMockRating = (): string => {
  const isPositive = Math.random() > 0.3;
  const percentage = Math.floor(Math.random() * 50) + 1;
  return `${isPositive ? '+' : '-'}${percentage}%`;
};

const generateMockSales = (): number => {
  return Math.floor(Math.random() * 1000) + 100;
};

const generateMockCollections = (): number => {
  return Math.floor(Math.random() * 200) + 50;
};

const getDefaultAvatar = (walletAddress: string): string => {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}`;
};

// Filter creators by time period
const filterCreatorsByTimePeriod = (
  creators: Creator[], 
  period: 'today' | 'week' | 'month' | 'all'
): Creator[] => {
  switch (period) {
    case 'today':
      return creators.slice(0, Math.ceil(creators.length * 0.2));
    case 'week':
      return creators.slice(0, Math.ceil(creators.length * 0.5));
    case 'month':
      return creators.slice(0, Math.ceil(creators.length * 0.8));
    case 'all':
    default:
      return creators;
  }
};

// Search creators
const searchCreators = (creators: Creator[], query: string): Creator[] => {
  const lowercaseQuery = query.toLowerCase();
  return creators.filter(creator => 
    creator.name.toLowerCase().includes(lowercaseQuery) ||
    creator.penName.toLowerCase().includes(lowercaseQuery)
  );
};

// Calculate statistics
const calculateCreatorStats = (creators: Creator[]) => {
  const totalCreators = creators.length;
  const totalSales = creators.reduce((sum, creator) => sum + creator.sold, 0);
  const totalCollections = creators.reduce((sum, creator) => sum + creator.collections, 0);
  
  const ratings = creators.map(creator => {
    const match = creator.rating.match(/([+-])(\d+)%/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const value = parseInt(match[2]);
      return sign * value;
    }
    return 0;
  });
  
  const avgRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  return {
    totalCreators,
    totalSales,
    totalCollections,
    avgRating: Math.round(avgRating * 100) / 100
  };
};

// Paginate creators
const paginateCreators = (
  creators: Creator[], 
  page: number, 
  itemsPerPage: number
) => {
  const totalPages = Math.ceil(creators.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCreators = creators.slice(startIndex, endIndex);

  return {
    paginatedCreators,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

export default function TopCreators() {
  const [activeTab, setActiveTab] = useState<'Today' | 'This Week' | 'This Month' | 'All Time'>("Today");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;
  
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state: any) => state.auth);
  
  // Safely get collaborators data with proper fallbacks
  const collaboratorsState = authState?.collaborators || { data: [], isLoading: false, error: null };
  const isLoading = collaboratorsState?.isLoading || false;
  const error = collaboratorsState?.error || null;
  const collaboratorsData = collaboratorsState?.data || [];

  // Fetch creators data on component mount
  useEffect(() => {
    console.log("🚀 Dispatching getAllCollaborators...");
    dispatch(getAllCollaborators());
  }, [dispatch]);

  // Transform and filter creator data
  const allCreators = useMemo(() => {
    console.log("🔄 Processing collaborators data:", collaboratorsData);
    if (!collaboratorsData || !Array.isArray(collaboratorsData) || collaboratorsData.length === 0) {
      console.log("❌ No valid collaborators data");
      return [];
    }
    
    const transformed = transformCreatorData(collaboratorsData);
    console.log("✅ Transformed creators:", transformed);
    return transformed;
  }, [collaboratorsData]);

  // Apply time period filter
  const filteredByTime = useMemo(() => {
    const periodMap = {
      'Today': 'today' as const,
      'This Week': 'week' as const,
      'This Month': 'month' as const,
      'All Time': 'all' as const
    };
    
    return filterCreatorsByTimePeriod(allCreators, periodMap[activeTab]);
  }, [allCreators, activeTab]);

  // Apply search filter
  const searchFilteredCreators = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByTime;
    }
    return searchCreators(filteredByTime, searchQuery);
  }, [filteredByTime, searchQuery]);

  // Apply pagination
  const paginationResult = useMemo(() => {
    return paginateCreators(searchFilteredCreators, currentPage, itemsPerPage);
  }, [searchFilteredCreators, currentPage, itemsPerPage]);

  const { paginatedCreators, totalPages, hasNextPage, hasPrevPage } = paginationResult;

  // Calculate stats
  const stats = useMemo(() => {
    return calculateCreatorStats(searchFilteredCreators);
  }, [searchFilteredCreators]);

  // Reset to first page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const gridLayout =
    "grid grid-cols-[80px_3fr_1fr_1fr_1fr] items-center gap-4 px-6";

  // Debug logging
  console.log("🔍 Current state:", {
    isLoading,
    error,
    collaboratorsDataLength: collaboratorsData?.length,
    allCreatorsLength: allCreators?.length,
    authState: !!authState,
    collaboratorsState: !!collaboratorsState
  });

  // Loading state
  if (isLoading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="w-full bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log("❌ Showing error state:", error);
    return (
      <div className="w-full bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-lg mb-4">
              Error loading creators: {String(error)}
            </div>
            <button 
              onClick={() => dispatch(getAllCollaborators())}
              className="px-4 py-2 bg-[#f59e0b] text-black rounded-lg hover:bg-[#ffb042] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (allCreators.length === 0 && !isLoading) {
    console.log("📭 Showing empty state");
    return (
      <div className="w-full bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-white/60 text-lg mb-4">No creators found</div>
            <p className="text-white/40 text-sm mb-4">
              {collaboratorsData.length > 0 
                ? `Found ${collaboratorsData.length} users, but none have creator role`
                : "No collaborators data available"}
            </p>
            <button 
              onClick={() => dispatch(getAllCollaborators())}
              className="px-4 py-2 bg-[#f59e0b] text-black rounded-lg hover:bg-[#ffb042] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("🎉 Rendering main component with creators:", allCreators.length);

  return (
    <div className="w-full bg-[#0a0a0a] min-h-screen p-4 md:p-8 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 w-full border-b border-white/10 mb-8 min-w-[300px]">
          {(["Today", "This Week", "This Month", "All Time"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
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

        {/* Show message if no results after filtering */}
        {searchFilteredCreators.length === 0 && allCreators.length > 0 ? (
          <div className="text-center py-10">
            <div className="text-white/60 text-lg">No creators found for &quot;{searchQuery}&quot;</div>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-4 px-4 py-2 text-[#f59e0b] border border-[#f59e0b]/50 rounded-lg hover:bg-[#f59e0b]/10 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto pb-6">
              <div className="min-w-[900px]">
                <div
                  className={`${gridLayout} py-4 text-xs tracking-wider text-white/40 mb-4 rounded-2xl border border-white/5`}
                >
                  <div>#</div>
                  <div>Creator</div>
                  <div>Ratings</div>
                  <div>Total Comics Sold</div>
                  <div>Collections</div>
                </div>

                <div className="space-y-3">
                  {paginatedCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className={`${gridLayout} bg-[#111111] hover:bg-[#161616] transition-colors rounded-2xl py-3 border border-white/5 cursor-pointer group`}
                      onClick={() => {
                        // Handle creator click - navigate to creator profile
                        console.log('Selected creator:', creator);
                      }}
                    >
                      {/* Rank */}
                      <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-black font-bold flex items-center justify-center text-sm shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                          {creator.rank}
                        </div>
                      </div>

                      {/* Creator */}
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-[#f59e0b]/30 transition-colors">
                          <AvatarImage
                            src={creator.image}
                            className="object-cover"
                            alt={creator.name}
                          />
                          <AvatarFallback className="bg-gray-800 text-xs">
                            {creator.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-bold text-white text-base truncate">
                            {creator.name}
                          </span>
                          {creator.penName !== creator.name && (
                            <span className="text-white/60 text-sm truncate">
                              @{creator.penName}
                            </span>
                          )}
                          {creator.walletAddress && (
                            <span className="text-white/40 text-xs truncate font-mono">
                              {creator.walletAddress.slice(0, 6)}...{creator.walletAddress.slice(-4)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`text-sm font-semibold ${
                        creator.rating.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {creator.rating}
                      </div>

                      <div className="text-white/80 text-sm font-medium">
                        {creator.sold.toLocaleString()}
                      </div>

                      <div className="text-white/80 text-sm font-medium">
                        {creator.collections.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
          </>
        )}

        {/* Stats Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {stats.totalCreators}
              </div>
              <div className="text-white/60 text-sm">
                {searchQuery ? 'Filtered' : 'Total'} Creators
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {stats.totalSales.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total Comics Sold</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {stats.totalCollections.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total Collections</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-[#f59e0b]">
                {stats.avgRating > 0 ? '+' : ''}{stats.avgRating}%
              </div>
              <div className="text-white/60 text-sm">Avg Rating</div>
            </div>
          </div>
          
          {/* Results info */}
          {searchQuery && (
            <div className="mt-4 text-white/60 text-sm">
              Showing {searchFilteredCreators.length} results for &quot;{searchQuery}&quot;
            </div>
          )}
          
          {/* Debug info */}
          <div className="mt-4 text-white/40 text-xs">
            Debug: {collaboratorsData.length} total users, {allCreators.length} creators
          </div>
        </div>
      </div>
    </div>
  );
}
