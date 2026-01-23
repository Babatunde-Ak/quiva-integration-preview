import React from 'react';
import Image from 'next/image';
import { Eye, Heart } from 'lucide-react';

const MarketStats = () => {
  const stats = [
    { label: "Total Supply", value: "5,000" },
    { label: "Minted", value: "2,000" },
    { label: "Floor Price", value: "12.00", icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> },
    { label: "Total Volume", value: "43,320", icon: <Image src="/hbar.png" alt="HBAR" width={20} height={20} /> },
    { label: "Holders", value: "1,204" },
    { label: "Views", value: "18,492", icon: <Eye size={14} className="ml-1 text-white" /> },
    { label: "Likes", value: "3,112", icon: <Heart size={14} className="ml-1 text-red-500 fill-red-500/20" /> },
  ];

  return (
    <div className="bg-[#151515] mt-5 font-mono border border-[#242424] rounded-2xl p-6 mb-12 animate-fade-in-up delay-200">
      <h2 className="text-white text-lg mb-4 font-bold">Market Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col group cursor-default">
            <span className="text-xs md:text-sm text-white/50 font-bold uppercase mb-1">{stat.label}</span>
            <span className="text-white text-base font-bold flex items-center gap-1">
              {stat.value}
              {stat.icon && <span className="transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketStats;