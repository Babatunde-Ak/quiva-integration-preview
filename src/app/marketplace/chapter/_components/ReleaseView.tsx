import React, { useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';

const ReleaseView = () => {
  const [mintAmount, setMintAmount] = useState(1);

  const handleIncrement = () => setMintAmount(prev => Math.min(prev + 1, 10)); // Max 10 per tx
  const handleDecrement = () => setMintAmount(prev => Math.max(prev - 1, 1));

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* 1. RELEASE SCHEDULE & MINTING BLOCK */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
        <h3 className="text-white/70 font-mono text-sm mb-6">Release Schedule</h3>

        {/* Phase 1: FCFS + OG */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1A1A1A] pb-8">
          <div className="space-y-1">
            <h4 className="text-white font-bold text-lg">FCFS + OG Title Holders</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-xl text-white">100/100</span>
              <span className="text-white/70 text-xs font-bold uppercase tracking-wider">| Limit 5 Episodes per wallet</span>
            </div>
            <p className="text-white/70 text-xs font-mono pt-1">Dec. 12, 2025 12:00PM UTC+1</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <span className="text-white/70 text-xs mr-2">Ends:</span>
              <span className="text-white font-bold font-mono">02:19:08:12</span>
            </div>
            <div className="flex items-center gap-2 bg-[#1A0505] border border-red-900/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-red-500 text-xs font-bold uppercase">Sold Out</span>
            </div>
          </div>
        </div>

        {/* Phase 2: Public Mint */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="space-y-1">
            <h4 className="text-white font-bold text-lg">Public Mint</h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-xl text-white">28/100</span>
            </div>
            <p className="text-white/70 text-xs font-mono pt-1">Dec. 12, 2025 12:00PM UTC+1</p>
          </div>

          <div className="flex items-center gap-2 bg-[#051A05] border border-green-900/30 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-green-500 text-xs font-bold uppercase">Minting now</span>
          </div>
        </div>

        {/* Mint Actions Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          
          {/* Price Info */}
          <div className="space-y-4">
            <div>
                <h4 className="text-white font-bold text-lg mb-1">Mint Fee</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-white/50 text-sm line-through decoration-white/50 decoration-2 flex items-center">
                  FCFS price 0.09 <span className="text-[10px] ml-0.5">H</span>
                </span>
                <span className="text-2xl font-bold text-white flex items-center gap-1">
                  0.19 
                  <span className="flex items-center justify-center w-8 h-8 rounded">
                     <Image src="/hbar.png" alt="H" width={20} height={20} />
                  </span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold mb-1">Protocol Fee</p>
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                0.19 
                <span className="flex items-center justify-center w-8 h-8 rounded">
                    <Image src="/hbar.png" alt="H" width={20} height={20} />
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Button */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             {/* Counter */}
             <div className="flex items-center justify-between bg-[#151515] rounded-lg border border-[#242424] p-1 w-full sm:w-32">
                <button 
                  onClick={handleDecrement}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-gray-400 text-white/70 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold text-white">{mintAmount}</span>
                <button 
                  onClick={handleIncrement}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-white/70 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
             </div>

             {/* Mint Button */}
             <button className="flex-1 sm:w-48 bg-[#FF9F1C] hover:bg-[#FFB045] text-black font-bold py-3 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20">
               Mint
             </button>
          </div>

        </div>
      </div>

      {/* 2. EPISODE INFO BLOCK */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
        <h3 className="text-white font-mono text-lg font-bold mb-6">
          S1:Ep1 “Episode 1: The Last Air bender”
        </h3>
        <p className="text-white/70 font-mono text-sm leading-relaxed max-w-4xl">
          Avatar: The Last Airbender is a legendary comic collection that follows the journey of balance, destiny, and mastery of the elements. Explore iconic moments, timeless characters, and stories that shaped an entire generation—now preserved as digital collectibles. Read, collect, and mint pieces from the Avatar universe while building your streaks and earning rewards along the way.
        </p>
      </div>

    </div>
  );
};

export default ReleaseView;