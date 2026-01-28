import React from 'react';
import Image from 'next/image';

const AboutView = () => {
  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN (Stack of Story & Creator) */}
        <div className="space-y-6">
          
          {/* Card 1: About This Comic */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] hover:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-white mb-4 font-mono">About This Comic</h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              In a world split between four ancient factions, one young hero discovers a power long forgotten. This volume follows their first steps into destiny — choices, battles, and the awakening of a legend.
            </p>
          </div>

          {/* Card 2: About Creator */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] hover:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 font-mono">About Creator</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600">
                {/* Replace with actual creator avatar */}
                <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                   <Image src="/dev_images/avatar-2.png" alt="Studio Kyra" width={48} height={48} className="object-cover" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold font-mono text-lg">Studio Kyra</span>
              </div>
            </div>

            <p className="text-white/70 font-mono text-sm leading-relaxed">
              Independent mangaka blending cyber-fantasy and emotional storytelling. Creating worlds since 2020.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN (Collection Details) */}
        <div>
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] h-full hover:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 font-mono">Collection Details</h3>
            
            <div className="space-y-4 font-mono text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#1A1A1A] pb-3">
                <span className="text-white/70">Release Date:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">February 2025</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#1A1A1A] pb-3">
                <span className="text-white/70">Total Editions:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">5,000</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#1A1A1A] pb-3">
                <span className="text-white/70">Blockchain:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">Hedera</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-1">
                <span className="text-white/70">Category:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">Manga / Action / Fantasy</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutView;