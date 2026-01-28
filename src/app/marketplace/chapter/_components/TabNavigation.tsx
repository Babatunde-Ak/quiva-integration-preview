import React from 'react';

interface TabNavigationProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ tabs, activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto mb-8 overflow-x-auto no-scrollbar pb-2 md:pb-0 animate-fade-in-up delay-200">
      <div className="flex gap-2 min-w-max px-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-6 py-2 font-mono rounded-full text-sm font-medium transition-all duration-300 active:scale-95 ${
              activeTab === tab 
                ? 'bg-[#FF9F1C] text-[#000] shadow-[0_0_15px_rgba(255,159,28,0.4)] scale-105' 
                : 'text-white hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;