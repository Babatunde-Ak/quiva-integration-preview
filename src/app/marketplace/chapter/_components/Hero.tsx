"use client";

import React from 'react';
import { ChevronLeft, Flame, X } from 'lucide-react';
import Image from 'next/image';

const HeroSection = () => {
  // Replace this with your actual image URL
  const coverImage = "/Naruto.jpg"; 

  return (
    <div className="relative font-mono w-full bg-[#111111] overflow-hidden">
      
      {/* 1. Cinematic Background Layer */}
      {/* This creates the blurred, glowing backdrop effect seen in the screenshot */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[10px] opacity-30 scale-110"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
        {/* Gradient overlay to ensure text readability */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/90 to-[#111111]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/90 via-transparent to-[#111111]/90" /> */}
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        
        {/* Navigation - Top Left */}
        <div className="mb-8">
          <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full hover:bg-[#000] border border-white/5 backdrop-blur-md bg-white/10 transition-all duration-300 text-sm font-medium text-white active:scale-95">
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Go Back
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Cover Art */}
          <div className="w-full lg:w-[400px] flex-shrink-0 mx-auto lg:mx-0">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
              <img 
                src={coverImage} 
                alt="Avatar Cover" 
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex-1 w-full pt-2 lg:pt-4">
            
            {/* Title Section */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-mono text-white mb-4 leading-tight tracking-tight">
              Avatar - Book of Beginnings
            </h1>

            {/* Creator Row */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-600 border border-white/20 shadow-lg overflow-hidden">
                <Image src="/dev_images/avatar-2.png" alt="Helium Logo" width={32} height={32} />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-sm text-white/70">Creator</span>
                <span className="text-base font-bold text-white">Studio Kyra</span>
              </div>
            </div>

            {/* Tags Row */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['Fantasy', 'Adventure', 'On-chain Epic'].map((tag) => (
                <span 
                  key={tag} 
                  className="px-4 py-1.5 rounded-lg bg-[#1A1A1A] border border-white/10 text-xs sm:text-sm font-medium text-gray-300 border-white/30 text-white cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Status & Timer Box (Glassmorphism) */}
            <div className="w-full max-w-xl bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              
              {/* Status */}
              <div className="flex items-center gap-3 pr-6 pb-2 sm:pb-0 w-full sm:w-auto">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/70 mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-white">Live</span>
                    <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Sales Start */}
              <div className="px-0 sm:px-6 py-2 sm:py-0 w-full sm:w-auto">
                <p className="text-[10px] uppercase text-white/70 mb-0.5">Sales Start</p>
                <p className="text-base font-bold text-white font-mono">DEC 12, 2025</p>
              </div>

              {/* Countdown */}
              <div className="pl-0 sm:pl-6 pt-2 sm:pt-0 w-full sm:w-auto">
                <p className="text-[10px] uppercase text-white/70 mb-0.5">Countdown</p>
                <p className="text-base font-bold text-white font-mono tracking-wide">02 : 14 : 08 : 12</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button className="px-8 py-3.5 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/30 hover:text-black hover:border-white transition-all duration-300 active:scale-95 text-center">
                Add to Favourite
              </button>
              
              <div className="flex gap-4 justify-center sm:justify-start">
                <button className="p-3.5 rounded-full border border-white/30 text-white hover:bg-white hover:text-[#000] hover:border-white transition-all duration-300 active:scale-95 group">
                    <svg 
                        viewBox="0 0 24 24" 
                        className="w-5 h-5 fill-current group-hover:scale-110 transition-transform duration-300"
                        aria-hidden="true"
                        >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </button>
                <button className="p-3.5 rounded-full border border-white/30 text-white hover:bg-[#5865F2] hover:border-[#5865F2] hover:text-white transition-all duration-300 active:scale-95 group">
                  <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                     <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2763-3.68-.2763-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.0991.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;