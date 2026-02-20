import React, { useState } from 'react';
import Image from 'next/image';
import { Search, ChevronDown } from 'lucide-react';
import useComicPlatform from '@/hook/useMarkeplace';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppSelector } from '@/redux/hook';
import { useRouter } from 'next/navigation';

const ComicsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('low-to-high');
  const router = useRouter();

  // Get comics from Redux store
  const { comics: comicsData, isLoading } = useAppSelector((state: any) => state.comic);
  const { currentCollection } = useAppSelector((state: any) => state.collection || {});

  // Transform API comics data to match UI structure
  const comics = comicsData?.data?.comics?.data?.map((comic: any) => ({
    id: comic._id,
    title: comic.title || "Untitled Comic",
    type: "Edition Supply",
    supply: comic.nftId?.maxSupply || 0,
    minted: comic.nftId?.currentSupply || 0,
    price: comic.nftId?.price?.toFixed(2) || "0",
    image: comic.bannerImage || "/dev_images/avatar-2.png",
    episodeNumber: comic.episodeNumber,
    nftId: comic.nftId,
    collectionId: comic.collectionId
  })) || [];

  // Filter comics based on search
  const filteredComics = comics.filter(comic => 
    comic.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort comics based on price
  const sortedComics = [...filteredComics].sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);
    return sortOrder === 'low-to-high' ? priceA - priceB : priceB - priceA;
  });

  // const { 
  //   account,
  //   signer,
  // } = useHederaWallet();
    
  // const { user } = useAppSelector((state: any) => state.wallet);

  // const { purchaseFromListing, getDirectListing } = useComicPlatform({
  //   accountId: account || user?.walletAddress || '',
  //   network: "testnet",
  //   signer: signer,
  // });

  // const handlePurchase = async (comic: any) => {
  //   try {
  //     // const currentListing = await getDirectListing(0);
  //     // console.log('Current Listing:', currentListing);
  //     const result = await purchaseFromListing({
  //       listingId: 1,
  //       quantity: 2,
  //       pricePerNFT: parseFloat(comic.price)
  //     });
  //     console.log('Purchase Result:', result);
      
  //   } catch (error) {
  //     console.error('Purchase failed:', error);
  //   }
  // };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'low-to-high' ? 'high-to-low' : 'low-to-high');
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

          {/* Filter Btn */}
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
            onClick={() => router.push(`/marketplace/detail?id${comic.id}`)}
            key={comic.id} className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
                <Image src={comic.image} alt={comic.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
              </div>
              
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-lg group-hover:text-orange-400 transition-colors">{comic.title}</h4>
                <div className="flex items-center gap-1 text-[10px] bg-[#1A1A1A] px-2 py-1 rounded border border-gray-800 group-hover:border-orange-500/30 transition-colors">
                  <span>Live</span>
                  <span className="text-orange-500 animate-pulse">🔥</span>
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

              <button 
                className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] active:scale-[0.98] text-black font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md"
                // onClick={() => handlePurchase(comic)}
              >
                {comic.price} <Image src="/hbar.png" alt="HBAR" width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedComics.length === 0 && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-white/60">No comics found</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-orange-500 hover:text-orange-400 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComicsView;