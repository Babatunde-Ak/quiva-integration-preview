"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import HeroSection from './_components/Hero';
import MarketStats from './_components/MarketStats';
import TabNavigation from './_components/TabNavigation';
import ComicsView from './_components/ComicsView';
import HoldersView from './_components/HoldersView';
import OffersView from './_components/OffersView';
import ActivityView from './_components/ActivityView';
import CollectionsView from './_components/CollectionsView';
import AboutView from './_components/AboutView';
import ReleaseView from './_components/ReleaseView';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getAllComics, getComicById } from '@/redux/slices/comicSlice';
import { getCollectionById } from '@/redux/slices/collectionSlice';
import { useSearchParams } from 'next/navigation';

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState('Comics');

  const searchParams = useSearchParams();
  const comicId = searchParams.get('id');

  const dispatch = useAppDispatch();

  const {currentComic, comics, isLoading: comicLoading, error: comicError} = useAppSelector((state: any) => state.comic);
  const {currentCollection, isLoading: collectionLoading} = useAppSelector((state: any) => state.collection || {});

  const isLoading = comicLoading || collectionLoading;
  const error = comicError;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all comics first
        await dispatch(getAllComics()).unwrap();
        
        // Then fetch specific comic if ID exists
        if (comicId) {
          const comicResult = await dispatch(getComicById({id: comicId} as any)).unwrap();
          
          // If comic has a collectionId, fetch the collection too
          const collectionId = comicResult?.data?.comic?.collectionId;
          if (collectionId) {
            await dispatch(getCollectionById({id: collectionId} as any)).unwrap();
          }
        }

      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [dispatch, comicId]);
  
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
    <div className="min-h-screen bg-[#111111] text-white font-recursive selection:bg-orange-500 selection:text-white pb-20 overflow-x-hidden">
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
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-white/60">Loading data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error loading data</p>
                <p className="text-white/60 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Content Views */}
          {!isLoading && !error && (
            <>
              {activeTab === 'Comics' && <ComicsView />}
              {activeTab === 'Release' && <ReleaseView />}
              {activeTab === 'Holders' && <HoldersView />}
              {activeTab === 'Offers' && <OffersView />}
              {activeTab === 'Activity' && <ActivityView />}
              {activeTab === 'Collections' && <CollectionsView />}
              {activeTab === 'About' && <AboutView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;