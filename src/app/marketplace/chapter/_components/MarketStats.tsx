// import React from 'react';
// import Image from 'next/image';
// import { Eye, Heart } from 'lucide-react';
// import { useAppSelector } from '@/redux/hook';
// import { useReadContract } from 'wagmi';

// // Hedera ID to EVM 0x address converter
// const toEvmAddress = (hederaId: string): `0x${string}` => {
//   if (!hederaId) return '0x0000000000000000000000000000000000000000';
//   const num = parseInt(hederaId.split(".")[2], 10);
//   return `0x${num.toString(16).padStart(40, "0")}`;
// };

// const COMIC_SALES_EVM = toEvmAddress("0.0.7829668");

// // Minimal ABI to read the stats directly from your QuivaComicSales contract
// const COMIC_SALES_ABI = [
//   {
//     "inputs": [{"type": "uint256", "name": "campaignId"}],
//     "name": "getCampaign",
//     "outputs": [
//       {"type": "string"}, {"type": "address"}, {"type": "uint8"},
//       {"type": "uint256"}, {"type": "uint256", "name": "maxSupply"},
//       {"type": "uint256", "name": "totalMinted"}, {"type": "bool"}
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   },
//   {
//     "inputs": [{"type": "uint256", "name": "listingId"}],
//     "name": "getDirectListing",
//     "outputs": [
//       {"type": "string"}, {"type": "address"}, {"type": "uint256"},
//       {"type": "uint256", "name": "available"}, {"type": "bool"}
//     ],
//     "stateMutability": "view",
//     "type": "function"
//   }
// ] as const;

// const MarketStats = () => {
//   const { currentComic, isLoading: isComicLoading } = useAppSelector((state: any) => state.comic);

//   // Extract necessary IDs
//   const nftId = currentComic?.nftId || {};
//   const isDirectListing = nftId.campaignType === 'direct_listing';
  
//   const campaignId = !isDirectListing && nftId.campaignId ? BigInt(nftId.campaignId) : undefined;
//   const listingId = isDirectListing && nftId.listingId ? BigInt(nftId.listingId) : undefined;

//   // 1. Fetch Campaign Data (If applicable)
//   const { data: campaignData, isLoading: isCampaignLoading } = useReadContract({
//     address: COMIC_SALES_EVM,
//     abi: COMIC_SALES_ABI,
//     functionName: 'getCampaign',
//     args: campaignId !== undefined ? [campaignId] : undefined,
//     query: { enabled: !!campaignId }
//   });

//   // 2. Fetch Direct Listing Data (If applicable)
//   const { data: listingData, isLoading: isListingLoading } = useReadContract({
//     address: COMIC_SALES_EVM,
//     abi: COMIC_SALES_ABI,
//     functionName: 'getDirectListing',
//     args: listingId !== undefined ? [listingId] : undefined,
//     query: { enabled: !!listingId }
//   });

//   // 3. Calculate exact on-chain sold count
//   let onChainSoldCount = 0;
//   if (isDirectListing && listingData) {
//     const maxSupply = Number(nftId.maxSupply || 0);
//     const available = Number(listingData[3]); // Index 3 is 'available' in the tuple
//     onChainSoldCount = Math.max(0, maxSupply - available);
//   } else if (!isDirectListing && campaignData) {
//     onChainSoldCount = Number(campaignData[5]); // Index 5 is 'totalMinted' in the tuple
//   }

//   // Format UI Data
//   const totalSupply = nftId?.maxSupply?.toLocaleString() || "N/A";
//   const displayMintedSupply = onChainSoldCount.toLocaleString();
//   const floorPrice = nftId?.price?.toFixed(2) || "0.00";
//   const views = currentComic?.views?.toLocaleString() || "0";
//   const likes = currentComic?.likes?.toLocaleString() || "0";

//   // Calculate volume (price * exact units sold)
//   const totalVolume = nftId?.price && onChainSoldCount > 0
//     ? (nftId.price * onChainSoldCount).toLocaleString(undefined, { maximumFractionDigits: 2 })
//     : "0";

//   const isStatsLoading = isComicLoading || isCampaignLoading || isListingLoading;

//   const stats = [
//     { label: "Total Supply", value: totalSupply },
//     { label: "Minted", value: displayMintedSupply }, // Now accurately reflects sales
//     { 
//       label: "Floor Price", 
//       value: floorPrice,
//       icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> 
//     },
//     { 
//       label: "Total Volume", 
//       value: totalVolume,
//       icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> 
//     },
//     { label: "Holders", value: "N/A" },
//     { 
//       label: "Views", 
//       value: views,
//       icon: <Eye size={14} className="ml-1 text-white" /> 
//     },
//     { 
//       label: "Likes", 
//       value: likes,
//       icon: <Heart size={14} className="ml-1 text-red-500 fill-red-500/20" /> 
//     },
//   ];

//   return (
//     <div className="bg-[#151515] mt-5 font-mono border border-[#242424] rounded-2xl p-6 mb-12 animate-fade-in-up delay-200">
//       <h2 className="text-white text-lg mb-4 font-bold">Market Stats</h2>
      
//       {isStatsLoading ? (
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
//           {Array.from({ length: 7 }).map((_, idx) => (
//             <div key={idx} className="flex flex-col">
//               <div className="h-4 w-20 bg-gray-800 animate-pulse rounded mb-2" />
//               <div className="h-6 w-16 bg-gray-800 animate-pulse rounded" />
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
//           {stats.map((stat, idx) => (
//             <div key={idx} className="flex flex-col group cursor-default">
//               <span className="text-xs md:text-sm text-white/50 font-bold uppercase mb-1">
//                 {stat.label}
//               </span>
//               <span className="text-white text-base font-bold flex items-center gap-1">
//                 {stat.value}
//                 {stat.icon && (
//                   <span className="transform group-hover:scale-110 transition-transform duration-300">
//                     {stat.icon}
//                   </span>
//                 )}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default MarketStats;

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import { useAppSelector } from '@/redux/hook';
import { useMirrorNodeQueries } from '@/hook/useMirrorNodeQueries';

const COMIC_CORE_HEDERA_ID = "0.0.7806656"; // The Treasury where unsold NFTs sit

const MarketStats = () => {
  const { currentComic, isLoading: isComicLoading } = useAppSelector((state: any) => state.comic);
  const [onChainSoldCount, setOnChainSoldCount] = useState<number>(0);
  const [holdersCount, setHoldersCount] = useState<number>(0);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  
  const { fetchAllTokenNfts } = useMirrorNodeQueries();

  useEffect(() => {
    const loadOnChainStats = async () => {
      const tokenId = currentComic?.nftId?.tokenId;
      
      if (!tokenId) {
        setOnChainSoldCount(0);
        setHoldersCount(0);
        return;
      }

      setIsStatsLoading(true);
      try {
        // Fetch all minted editions of this specific comic token
        const nftsData = await fetchAllTokenNfts(tokenId);
        
        let nftsList: any[] = [];
        if (Array.isArray(nftsData)) nftsList = nftsData;
        else if (nftsData?.nfts && Array.isArray(nftsData.nfts)) nftsList = nftsData.nfts;
        
        // ✨ THE FIX: Count actual sales by checking wallet ownership
        // Filter out all NFTs that are still sitting in the ComicCore treasury
        const soldNfts = nftsList.filter((nft) => nft.account_id !== COMIC_CORE_HEDERA_ID);
        
        setOnChainSoldCount(soldNfts.length);

        // 🎁 BONUS: Calculate unique holders from the sold NFTs!
        const uniqueHolders = new Set(soldNfts.map((nft) => nft.account_id));
        setHoldersCount(uniqueHolders.size);

      } catch (error) {
        console.error('Error fetching on-chain stats:', error);
        setOnChainSoldCount(0);
        setHoldersCount(0);
      } finally {
        setIsStatsLoading(false);
      }
    };

    if (currentComic) {
      loadOnChainStats();
    }
  }, [currentComic, fetchAllTokenNfts]);

  // Extract NFT data with fallbacks
  const nftData = currentComic?.nftId || {};
  const totalSupply = nftData?.maxSupply?.toLocaleString() || "N/A";

  const displayMintedSupply = onChainSoldCount.toLocaleString();
  const floorPrice = nftData?.price?.toFixed(2) || "0.00";
  const views = currentComic?.views?.toLocaleString() || "0";
  const likes = currentComic?.likes?.toLocaleString() || "0";

  // Calculate volume (price * exact units sold on-chain)
  const totalVolume = nftData?.price && onChainSoldCount > 0
    ? (nftData.price * onChainSoldCount).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";

  const stats = [
    { label: "Total Supply", value: totalSupply },
    { label: "Minted", value: displayMintedSupply },
    { 
      label: "Floor Price", 
      value: floorPrice,
      icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> 
    },
    { 
      label: "Total Volume", 
      value: totalVolume,
      icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> 
    },
    { label: "Holders", value: holdersCount.toString() }, // Now fully dynamic!
    { 
      label: "Views", 
      value: views,
      icon: <Eye size={14} className="ml-1 text-white" /> 
    },
    { 
      label: "Likes", 
      value: likes,
      icon: <Heart size={14} className="ml-1 text-red-500 fill-red-500/20" /> 
    },
  ];

  return (
    <div className="bg-[#151515] mt-5 font-mono border border-[#242424] rounded-2xl p-6 mb-12 animate-fade-in-up delay-200">
      <h2 className="text-white text-lg mb-4 font-bold">Market Stats</h2>
      
      {isComicLoading || isStatsLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="h-4 w-20 bg-gray-800 animate-pulse rounded mb-2" />
              <div className="h-6 w-16 bg-gray-800 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : (
        // Actual stats
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col group cursor-default">
              <span className="text-xs md:text-sm text-white/50 font-bold uppercase mb-1">
                {stat.label}
              </span>
              <span className="text-white text-base font-bold flex items-center gap-1">
                {stat.value}
                {stat.icon && (
                  <span className="transform group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketStats;