"use client";

import React, { useState } from 'react';
import { Heart, Share2, MessageSquare, Twitter, Disc, ChevronLeft, Eye, Search, ChevronDown, Flame } from 'lucide-react';
import Image from 'next/image';
import HeroSection from './_components/Hero';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('Comics');

  // Custom CSS for animations that aren't default in Tailwind
  const styles = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
    }
    .delay-100 { animation-delay: 100ms; }
    .delay-200 { animation-delay: 200ms; }
    .delay-300 { animation-delay: 300ms; }
  `;

  // Mock Data
  const comics = [
    { id: 1, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
    { id: 2, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
    { id: 3, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
    { id: 4, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
    { id: 5, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
    { id: 6, title: "The Awakening #1", type: "Edition Supply", supply: 500, minted: 312, price: "15.00 H", image: "/dev_images/avatar-2.png" },
  ];

  const stats = [
    { label: "Total Supply", value: "5,000" },
    { label: "Minted", value: "2,000" },
    { label: "Floor Price", value: "12.00", icon: <Image src="/hbar.png" alt="Helium Logo" width={20} height={20} /> },
    { label: "Total Volume", value: "43,320", icon: <Image src="/hbar.png" alt="Helium Logo" width={20} height={20} /> },
    { label: "Holders", value: "1,204" },
    { label: "Views", value: "18,492", icon: <Eye size={14} className="ml-1 text-white" /> },
    { label: "Likes", value: "3,112", icon: <Heart size={14} className="ml-1 text-red-500 fill-red-500/20" /> },
  ];

  const tabs = ["Comics", "Release", "Holders", "Offers", "Activity", "Collections", "About"];

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans font-mono selection:bg-orange-500 selection:text-white pb-20 overflow-x-hidden">
      <style>{styles}</style>
      
      <HeroSection />

        {/* MARKET STATS */}
        <div className="bg-[#151515] font-mono border border-gray-300 rounded-2xl p-6 mb-12">
          <h2 className="text-white text-lg mb-4">Market Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col group cursor-default">
                <span className="text-xs md:text-sm text-white/50 font-bold uppercase mb-1 ">{stat.label}</span>
                <span className="text-white text-base font-bold flex items-center">
                  {stat.value}
                  {stat.icon && <span className="transform group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto no-scrollbar pb-2 md:pb-0 animate-fade-in-up delay-200">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 font-mono rounded-full text-sm font-medium transition-all duration-300 active:scale-95 ${
                  activeTab === tab 
                    ? 'bg-[#FF9F1C] text-[#000] shadow-[0_0_15px_rgba(255,159,28,0.4)] scale-105' 
                    : 'text-white hover:text-white hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* FILTERS & GRID HEADER */}
        <div className="bg-[#151515] font-mono rounded-3xl p-6 md:p-8 animate-fade-in-up delay-300 min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-bold">200 Minted Comics</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
  {/* Search Input Wrapper */}
  <div className="relative group w-full md:w-auto">
    <Search 
      size={16} 
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" 
    />
    <input 
      type="text" 
      placeholder="Search title, chapter" 
      className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300 placeholder-gray-600"
    />
  </div>

  {/* Filter Button */}
  <button className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto">
    Price low to high
    <ChevronDown size={14} />
  </button>
</div>
          </div>

          {/* CARD GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comics.map((comic) => (
              <div 
                key={comic.id} 
                className="bg-[#0A0A0A] rounded-2xl font-mono p-4 border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                {/* Card Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-900">
                  <img 
                    src={comic.image} 
                    alt={comic.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
                </div>
                
                {/* Card Content */}
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

                {/* Price Button */}
                <button className="w-full text-[#000] bg-[#FF9F1C] hover:bg-[#FFB045] active:scale-[0.98] text-black font-bold py-3 rounded-full flex items-center justify-center gap-1 transition-all duration-200 shadow-md group-hover:shadow-[0_0_15px_rgba(255,159,28,0.4)]">
                  {comic.price} 
                  <Image src="/hbar.png" alt="Helium Logo" width={20} height={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
  );
};

export default Marketplace;