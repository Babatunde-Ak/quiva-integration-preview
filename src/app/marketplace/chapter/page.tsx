"use client";

import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import HeroSection from './_components/Hero';
import MarketStats from './_components/MarketStats';
import TabNavigation from './_components/TabNavigation';
import ComicsView from './_components/ComicsView';
import HoldersView from './_components/HoldersView';
import OffersView from './_components/OffersView';
import ActivityView from './_components/ActivityView';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('Comics');

  const tabs = ["Comics", "Release", "Holders", "Offers", "Activity", "Collections", "About"];

  // Custom CSS for animations
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
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans font-mono selection:bg-orange-500 selection:text-white pb-20 overflow-x-hidden">
      <style>{styles}</style>

      <HeroSection />

      <div className="max-w-7xl mx-auto px-4">
        <MarketStats />
        
        <TabNavigation 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Dynamic Content Area */}
        <div className="bg-[#151515] font-mono rounded-3xl p-6 md:p-8 animate-fade-in-up delay-300 min-h-[600px] border border-[#242424]">
          {activeTab === 'Comics' && <ComicsView />}
          {activeTab === 'Holders' && <HoldersView />}
          {activeTab === 'Offers' && <OffersView />}
          {activeTab === 'Activity' && <ActivityView />}
          
          {/* Placeholder for other tabs */}
          {!['Comics', 'Holders', 'Offers', 'Activity'].includes(activeTab) && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              {activeTab} content coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;