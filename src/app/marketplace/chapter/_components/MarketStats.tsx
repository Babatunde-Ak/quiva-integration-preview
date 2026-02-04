import React from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';
import { useAppSelector } from '@/redux/hook';

const MarketStats = () => {
  const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);

  // Extract NFT data with fallbacks
  const nftData = currentComic?.nftId || {};
  const totalSupply = nftData?.maxSupply?.toLocaleString() || "N/A";
  const currentSupply = nftData?.currentSupply?.toLocaleString() || "0";
  const floorPrice = nftData?.price?.toFixed(2) || "0.00";
  const views = currentComic?.views?.toLocaleString() || "0";
  const likes = currentComic?.likes?.toLocaleString() || "0";

  // Calculate volume (price * current supply)
  const totalVolume = nftData?.price && nftData?.currentSupply 
    ? (nftData.price * nftData.currentSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "0";

  // Mock holders data (not in API response)
  const holders = "N/A";

  const stats = [
    { label: "Total Supply", value: totalSupply },
    { label: "Minted", value: currentSupply },
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
    { label: "Holders", value: holders },
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
      
      {isLoading ? (
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