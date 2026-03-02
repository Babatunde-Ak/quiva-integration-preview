// import React, { useState } from 'react';
// import Image from 'next/image';
// import { Search, ChevronDown } from 'lucide-react';
// import useComicPlatform from '@/hook/useMarkeplace';
// import { useHederaWallet } from '@/providers/HashPackProvider';
// import { useAppSelector } from '@/redux/hook';
// import { useRouter } from 'next/navigation';

// const ComicsView = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOrder, setSortOrder] = useState('low-to-high');
//   const router = useRouter();

//   // Get comics from Redux store
//   const { comics: comicsData, isLoading } = useAppSelector((state: any) => state.comic);
//   const { currentCollection } = useAppSelector((state: any) => state.collection || {});

//   // Transform API comics data to match UI structure
//   const comics = comicsData?.data?.comics?.data?.map((comic: any) => ({
//     id: comic._id,
//     title: comic.title || "Untitled Comic",
//     type: "Edition Supply",
//     supply: comic.nftId?.maxSupply || 0,
//     minted: comic.nftId?.currentSupply || 0,
//     price: comic.nftId?.price?.toFixed(2) || "0",
//     image: comic.bannerImage || "/dev_images/avatar-2.png",
//     episodeNumber: comic.episodeNumber,
//     nftId: comic.nftId,
//     collectionId: comic.collectionId
//   })) || [];

//   // Filter comics based on search
//   const filteredComics = comics.filter(comic => 
//     comic.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Sort comics based on price
//   const sortedComics = [...filteredComics].sort((a, b) => {
//     const priceA = parseFloat(a.price);
//     const priceB = parseFloat(b.price);
//     return sortOrder === 'low-to-high' ? priceA - priceB : priceB - priceA;
//   });

//   // const { 
//   //   account,
//   //   signer,
//   // } = useHederaWallet();
    
//   // const { user } = useAppSelector((state: any) => state.wallet);

//   // const { purchaseFromListing, getDirectListing } = useComicPlatform({
//   //   accountId: account || user?.walletAddress || '',
//   //   network: "testnet",
//   //   signer: signer,
//   // });

//   // const handlePurchase = async (comic: any) => {
//   //   try {
//   //     // const currentListing = await getDirectListing(0);
//   //     // console.log('Current Listing:', currentListing);
//   //     const result = await purchaseFromListing({
//   //       listingId: 1,
//   //       quantity: 2,
//   //       pricePerNFT: parseFloat(comic.price)
//   //     });
//   //     console.log('Purchase Result:', result);
      
//   //   } catch (error) {
//   //     console.error('Purchase failed:', error);
//   //   }
//   // };

//   const toggleSortOrder = () => {
//     setSortOrder(prev => prev === 'low-to-high' ? 'high-to-low' : 'low-to-high');
//   };

//   return (
//     <div className="animate-fade-in-up">
//       {/* Header / Filters */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//         <h3 className="text-xl font-bold">
//           {sortedComics.length} Minted Comics
//         </h3>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           {/* Search */}
//           <div className="relative group w-full md:w-auto">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" />
//             <input 
//               type="text" 
//               placeholder="Search title, chapter" 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
//             />
//           </div>

//           {/* Filter Btn */}
//           <button 
//             onClick={toggleSortOrder}
//             className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto"
//           >
//             Price {sortOrder === 'low-to-high' ? 'low to high' : 'high to low'}
//             <ChevronDown size={14} />
//           </button>
//         </div>
//       </div>

//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex items-center justify-center h-[400px]">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//             <p className="text-white/60">Loading comics...</p>
//           </div>
//         </div>
//       )}

//       {/* Grid */}
//       {!isLoading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {sortedComics.map((comic) => (
//             <div 
//             onClick={() => router.push(`/marketplace/detail?id${comic.id}`)}
//             key={comic.id} className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer">
//               <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
//                 <Image src={comic.image} alt={comic.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
//                 <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
//               </div>
              
//               <div className="flex items-start justify-between mb-1">
//                 <h4 className="font-bold text-lg group-hover:text-orange-400 transition-colors">{comic.title}</h4>
//                 <div className="flex items-center gap-1 text-[10px] bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800 group-hover:border-orange-500/30 transition-colors">
//                   <span>Live</span>
//                   <span className="text-orange-500 animate-pulse">🔥</span>
//                 </div>
//               </div>

//               <div className="flex gap-8 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
//                 <div>
//                   <p className="text-[10px] text-gray-500 font-bold mb-0.5">Edition Supply</p>
//                   <p className="text-xs font-bold text-white">{comic.supply}</p>
//                 </div>
//                 <div>
//                   <p className="text-[10px] text-gray-500 font-bold mb-0.5">Minted</p>
//                   <p className="text-xs font-bold text-white">{comic.minted}</p>
//                 </div>
//               </div>

//               <button 
//                 className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] active:scale-[0.98] text-black font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md"
//                 // onClick={() => handlePurchase(comic)}
//               >
//                 {comic.price} <Image src="/hbar.png" alt="HBAR" width={16} height={16} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Empty State */}
//       {!isLoading && sortedComics.length === 0 && (
//         <div className="flex items-center justify-center h-[400px]">
//           <div className="text-center">
//             <p className="text-white/60">No comics found</p>
//             {searchQuery && (
//               <button 
//                 onClick={() => setSearchQuery('')}
//                 className="mt-4 text-orange-500 hover:text-orange-400 transition-colors"
//               >
//                 Clear search
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ComicsView;


import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import { useAppSelector } from '@/redux/hook';
import { useRouter } from 'next/navigation';

interface ComicsViewProps {
  comicId?: string | null;
}

const ComicsView: React.FC<ComicsViewProps> = ({ comicId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('low-to-high');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'campaign'>('all');
  const router = useRouter();

  // Get comics from Redux store
  const { comics: comicsData, currentComic, isLoading } = useAppSelector((state: any) => state.comic);

  // Use full comics list if no comicId, else use single currentComic
  let comicsArray: any[] = [];
  if (comicId && currentComic && currentComic._id) {
    comicsArray = [currentComic];
  } else {
    comicsArray = comicsData?.data?.comics?.data || [];
  }

  // Transform API comics data to match UI structure
  let allComics = comicsArray.map((comic: any) => {
    // FIXED: Proper detection logic
    // A comic has a direct listing if listingId is not null/undefined/empty string
    const hasDirectListing =
      comic.nftId?.listingId !== undefined &&
      comic.nftId?.listingId !== null &&
      String(comic.nftId?.listingId).trim() !== '';
    
    // A comic has a campaign if campaignId exists AND is not null/empty
    const hasCampaign = !!(comic.nftId?.campaignId && 
                          comic.nftId.campaignId !== null && 
                          comic.nftId.campaignId !== '');
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Comic: ${comic.title}`, {
        nftId: comic.nftId,
        listingId: comic.nftId?.listingId,
        campaignId: comic.nftId?.campaignId,
        campaignType: comic.nftId?.campaignType,
        hasDirectListing,
        hasCampaign,
      });
    }
    
    return {
      id: comic._id,
      title: comic.title || "Untitled Comic",
      type: "Edition Supply",
      supply: comic.nftId?.maxSupply || 0,
      minted: comic.nftId?.currentSupply || 0,
      price: comic.nftId?.price?.toFixed(2) || "0",
      image: comic.bannerImage || "/dev_images/avatar-2.png",
      episodeNumber: comic.episodeNumber,
      nftId: comic.nftId,
      collectionId: comic.collectionId,
      // Sale type information
      hasDirectListing,
      hasCampaign,
      listingId: comic.nftId?.listingId,
      campaignId: comic.nftId?.campaignId,
      campaignType: comic.nftId?.campaignType || comic.campaignType || 'unknown',
      // Badge info
      saleType: hasDirectListing ? 'Live' : hasCampaign ? 'Campaign' : 'Coming Soon',
      badgeColor: hasDirectListing ? 'green' : hasCampaign ? 'orange' : 'gray',
    };
  }) || [];


  // If comicId is provided, filter to only that comic
  if (comicId) {
    allComics = allComics.filter(comic => comic.id === comicId);
  }

  // Filter by sale type
  const filteredByType = allComics.filter(comic => {
    if (filterType === 'direct') return comic.hasDirectListing;
    if (filterType === 'campaign') return comic.hasCampaign;
    return true; // 'all'
  });

  // Filter by search query
  const filteredComics = filteredByType.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort comics based on price
  const sortedComics = [...filteredComics].sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    return sortOrder === 'low-to-high' ? priceA - priceB : priceB - priceA;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'low-to-high' ? 'high-to-low' : 'low-to-high');
  };

  const handleComicClick = (comic: any) => {
    // Navigate to the appropriate page based on sale type
    if (comic.hasCampaign) {
      // Go to marketplace with Release tab for campaigns
      router.push(`/marketplace?id=${comic.id}&tab=release`);
    } else if (comic.hasDirectListing) {
      // Go to detail page for direct listings
      router.push(`/marketplace/detail?id=${comic.id}`);
    } else {
      // Coming soon - just show detail
      router.push(`/marketplace/detail?id=${comic.id}`);
    }
  };

  const getBadgeStyles = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-[#051A05] border-green-900/30 text-green-500';
      case 'orange':
        return 'bg-[#1A0A05] border-orange-900/30 text-orange-500';
      case 'gray':
      default:
        return 'bg-[#1A1A1A] border-gray-800 text-gray-500';
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-bold">
          {sortedComics.length} Minted Comics
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search title, chapter" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 focus:outline-none focus:border-orange-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Types</option>
            <option value="direct">Direct Listing</option>
            <option value="campaign">Campaign</option>
          </select>

          {/* Sort Btn */}
          <button 
            onClick={toggleSortOrder}
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            Price {sortOrder === 'low-to-high' ? 'low to high' : 'high to low'}
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading comics...</p>
          </div>
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedComics.map((comic) => (
            <div 
              onClick={() => handleComicClick(comic)}
              key={comic.id} 
              className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
                <Image 
                  src={comic.image} 
                  alt={comic.title} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
              </div>
              
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-lg group-hover:text-orange-400 transition-colors truncate flex-1">
                  {comic.title}
                </h4>
                <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border ${getBadgeStyles(comic.badgeColor)} transition-colors ml-2 shrink-0`}>
                  <span className="font-semibold text-white">{comic.saleType}</span>
                  {comic.saleType === 'Live' && <span className="animate-pulse">🔥</span>}
                  {comic.saleType === 'Campaign' && <span className="animate-pulse">🔥</span>}
                </div>
              </div>

              <div className="flex gap-8 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold mb-0.5">Edition Supply</p>
                  <p className="text-xs font-bold text-white">{comic.supply}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold mb-0.5">Minted</p>
                  <p className="text-xs font-bold text-white">{comic.minted}</p>
                </div>
              </div>

              {/* Action Button */}
              {comic.hasDirectListing && (
                <button 
                  className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] active:scale-[0.98] text-black font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComicClick(comic);
                  }}
                >
                  {comic.price} <Image src="/hbar.png" alt="HBAR" width={16} height={16} />
                </button>
              )}

              {comic.hasCampaign && (
                <button 
                  className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComicClick(comic);
                  }}
                >
                  Mint from {comic.price} <Image src="/hbar.png" alt="HBAR" width={16} height={16} />
                </button>
              )}

              {!comic.hasDirectListing && !comic.hasCampaign && (
                <button 
                  className="w-full bg-gray-700 cursor-not-allowed text-gray-400 font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200"
                  disabled
                >
                  Coming Soon
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedComics.length === 0 && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-white/60 mb-4">No comics found</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                Clear search
              </button>
            )}
            {filterType !== 'all' && (
              <button 
                onClick={() => setFilterType('all')}
                className="ml-4 text-orange-500 hover:text-orange-400 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && sortedComics.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#242424]">
            <p className="text-white/50 text-xs mb-1">Total Comics</p>
            <p className="text-white font-bold text-xl">{allComics.length}</p>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-green-900/30">
            <p className="text-green-500/70 text-xs mb-1">Direct Listings</p>
            <p className="text-green-500 font-bold text-xl">
              {allComics.filter(c => c.hasDirectListing).length}
            </p>
          </div>
          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-orange-900/30">
            <p className="text-orange-500/70 text-xs mb-1">Campaigns</p>
            <p className="text-orange-500 font-bold text-xl">
              {allComics.filter(c => c.hasCampaign).length}
            </p>
          </div>
        </div>
      )}

      {/* Debug Info in Development */}
      {process.env.NODE_ENV === 'development' && allComics.length > 0 && (
        <div className="mt-4 bg-[#0A0A0A] rounded-lg p-4 border border-yellow-500/30 max-h-60 overflow-auto">
          <p className="text-yellow-500 font-mono text-xs mb-2">Debug: Comic Detection</p>
          <div className="space-y-2">
            {allComics.slice(0, 3).map((comic: any) => (
              <div key={comic.id} className="text-xs font-mono text-white/50 border-b border-gray-800 pb-2">
                <p className="text-white">{comic.title}</p>
                <p>listingId: {comic.listingId || 'null'}</p>
                <p>campaignId: {comic.campaignId || 'null'}</p>
                <p>campaignType: {comic.campaignType}</p>
                <p>hasDirectListing: {String(comic.hasDirectListing)}</p>
                <p>hasCampaign: {String(comic.hasCampaign)}</p>
                <p className="text-orange-500">→ {comic.saleType}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComicsView