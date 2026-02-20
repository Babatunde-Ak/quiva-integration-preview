import React from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/redux/hook';

const AboutView = () => {
  // Get data from Redux store
  const { currentComic } = useAppSelector((state: any) => state.comic);
  const { currentCollection } = useAppSelector((state: any) => state.collection || {});

  // Extract data with fallbacks
  const comicSummary = currentComic?.summary || "";
  
  const creatorName = currentCollection?.creatorId?.username || 
    currentComic?.creatorId?.username ||
    (currentCollection?.creatorId?.walletAddress 
      ? `${currentCollection.creatorId.walletAddress.slice(0, 6)}...${currentCollection.creatorId.walletAddress.slice(-4)}`
      : currentComic?.creatorId?.walletAddress
      ? `${currentComic.creatorId.walletAddress.slice(0, 6)}...${currentComic.creatorId.walletAddress.slice(-4)}`
      : "Unknown Creator");

  const creatorAvatar = currentCollection?.creatorId?.avatar || 
    currentComic?.creatorId?.avatar || 
    "/dev_images/avatar-2.png";

  const creatorSummary = currentCollection?.description || "";

  const collectionTitle = currentCollection?.title || currentComic?.title || "Collection";
  const genres = currentCollection?.genre || currentComic?.genre || [];
  const genreDisplay = Array.isArray(genres) && genres.length > 0 ? genres.join(' / ') : "N/A";

  // Format release date
  const releaseDate = currentComic?.createdAt 
    ? new Date(currentComic.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "N/A";

  const totalEditions = currentComic?.nftId?.maxSupply?.toLocaleString() || "N/A";

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN (Stack of Story & Creator) */}
        <div className="space-y-6">
          
          {/* Card 1: About This Comic */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] hover:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-white mb-4 font-mono">About This Comic</h3>
            <p className="text-white/70 font-mono text-sm leading-relaxed">
              {comicSummary}
            </p>
          </div>

          {/* Card 2: About Creator */}
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] hover:border-gray-700 transition-colors">
            <h3 className="text-xl font-bold text-white mb-6 font-mono">About Creator</h3>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-600">
                {creatorAvatar ? (
                  <Image 
                    src={creatorAvatar} 
                    alt={creatorName} 
                    width={48} 
                    height={48} 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {creatorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold font-mono text-lg">{creatorName}</span>
              </div>
            </div>

            <p className="text-white/70 font-mono text-sm leading-relaxed">
              {creatorSummary}
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
                <span className="text-white font-bold mt-1 sm:mt-0">{releaseDate}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#1A1A1A] pb-3">
                <span className="text-white/70">Total Editions:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">{totalEditions}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#1A1A1A] pb-3">
                <span className="text-white/70">Blockchain:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">Hedera</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-1">
                <span className="text-white/70">Category:</span>
                <span className="text-white font-bold mt-1 sm:mt-0">{genreDisplay}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutView;