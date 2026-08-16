'use client';

import { ComicsTable } from "@/features/comic-library/components/ComicsTable";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getAllComics } from "@/redux/slices/comicSlice";
import { useEffect, useMemo } from "react";
import { extractComicList, transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData';

const CollectionPage = () => {
  const dispatch = useAppDispatch();
  const { comics, isLoading, error } = useAppSelector((state: any) => state.comic);

  // Fetch comics on component mount
  useEffect(() => {
    dispatch(getAllComics());
  }, [dispatch]);

  // Transform API comics to match Comic interface
  const transformedComics = useMemo(() => {
    return transformApiComicsToComics(extractComicList(comics));
  }, [comics]);

  // Create collections data by grouping comics by collectionId
  const collectionsData = useMemo(() => {
    const apiComics = extractComicList(comics);
    if (!apiComics.length) return [];
    
    // Group comics by collection and create collection summaries
    const collectionsMap = new Map();
    
    apiComics.forEach((comic: any) => {
      const collectionId = comic.collectionId || `standalone_${comic._id}`;
      
      if (!collectionsMap.has(collectionId)) {
        collectionsMap.set(collectionId, {
          ...comic,
          id: collectionId,
          totalComics: 0,
          totalViews: 0,
          totalLikes: 0,
          totalPages: 0,
          isCollection: true,
          // Collection-specific fields for table display
          rank: 0, // Will be set later
          title: comic.title,
          author: comic.creatorId?.username || comic.creatorId?.walletAddress || 'Unknown Creator',
          floorPrice: comic.price ? `${comic.price} HBAR` : '0 HBAR',
          priceChange: 0,
          copies: 0, // Will be updated with totalComics
          sales: 0, // Will be updated with totalLikes
          volume: '0 HBAR', // Will be calculated
          image: comic.bannerImage || comic.coverImageCid || '/dev_images/avatar-2.png'
        });
      }
      
      const collection = collectionsMap.get(collectionId);
      collection.totalComics += 1;
      collection.totalViews += comic.views || 0;
      collection.totalLikes += comic.likes || 0;
      collection.totalPages += comic.totalPages || 0;
      
      // Update display values
      collection.copies = collection.totalComics;
      collection.sales = collection.totalLikes;
      collection.volume = `${(collection.totalViews * 0.1).toFixed(1)} HBAR`;
      
      // Use the latest comic's data for collection metadata
      if (!collection.bannerImage && comic.bannerImage) {
        collection.bannerImage = comic.bannerImage;
        collection.image = comic.bannerImage;
      }
    });
    
    // Convert to array and add ranks
    const collectionsArray = Array.from(collectionsMap.values());
    return collectionsArray
      .sort((a, b) => b.totalViews - a.totalViews) // Sort by popularity
      .map((collection, index) => ({
        ...collection,
        rank: index + 1
      }));
  }, [comics]);

  // Convert individual comics to table format as fallback
  const comicsTableData = useMemo(() => {
    if (!transformedComics.length) return [];
    
    return transformedComics.map((comic, index) => ({
      rank: index + 1,
      title: comic.title,
      author: comic.creatorUsername || comic.creatorWalletAddress || 'Unknown Creator',
      floorPrice: comic.price ? `${comic.price} HBAR` : '0 HBAR',
      priceChange: 0,
      copies: comic.totalPages || 1,
      sales: comic.likes || 0,
      volume: `${((comic.views || 0) * 0.1).toFixed(1)} HBAR`,
      image: comic.bannerImage || comic.image || '/dev_images/avatar-2.png'
    }));
  }, [transformedComics]);

  // Loading state
  if (isLoading && !comics) {
    return (
      <main className="min-h-screen text-white py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-y-2 mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Collection</h1>
            <p className="font-light text-lg">
              Browse through collections by Top, Trending, and Genres.
            </p>
          </div>
          
          {/* Loading skeleton */}
          <div className="bg-black-500 rounded-lg p-8 border border-white/10">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-white/10 rounded w-full"></div>
              <div className="h-12 bg-white/10 rounded w-full"></div>
              <div className="h-12 bg-white/10 rounded w-full"></div>
              <div className="h-12 bg-white/10 rounded w-full"></div>
            </div>
            <p className="text-center text-white/60 mt-4">Loading collections...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen text-white py-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-y-2 mb-10">
            <h1 className="text-4xl font-bold tracking-tight">Collection</h1>
            <p className="font-light text-lg">
              Browse through collections by Top, Trending, and Genres.
            </p>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load Collections</h3>
            <p className="text-red-300/80 mb-4">{error}</p>
            <button
              onClick={() => dispatch(getAllComics())}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col gap-y-2 mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Collection</h1>
          <p className="font-light text-lg">
            Browse through collections by Top, Trending, and Genres.
          </p>
        </div>

        {/* Collections Table */}
        {collectionsData.length > 0 ? (
          <ComicsTable 
            comics={collectionsData} 
            title="All Collections"
          />
        ) : (
          /* Fallback to individual comics if no collections */
          <ComicsTable 
            comics={comicsTableData} 
            title="All Comics"
          />
        )}

      </div>
    </main>
  );
};

export default CollectionPage;
