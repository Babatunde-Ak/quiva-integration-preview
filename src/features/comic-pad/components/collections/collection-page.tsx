'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Search } from 'lucide-react';
import { avatarAang, runningBoy } from '../../../../../public/dev_images';
import { MainButton } from '@/components/button';

interface Collection {
    id: string;
    title: string;
    description: string;
    coverImage: string;
    episodes: {
        id: string;
        thumbnail: string;
        maturityRating : string;
        title : string;
        totalPages : number;
        summary : string;
    }[];
    totalEpisodes: number;
}

interface PublishedCollectionsProps {
    onGoBack?: () => void;
    onCreateNew?: () => void;
    collections?: Collection[];
    isLoading?: boolean;
}

const PublishedCollections: React.FC<PublishedCollectionsProps> = ({
  onGoBack,
  onCreateNew,
  collections = [],
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

    const filteredCollections = collections.length === 0 ? [] : collections.filter(collection =>
        collection?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-8">
      <div className="bg-black-200 border border-black-50 rounded-lg p-6 sm:p-12 lg:p-16 text-center w-full max-w-md">
        {/* Collection Preview Image */}
        <div className="mb-6 sm:mb-8 px-4 sm:px-8 py-3 sm:py-4 bg-black-100 rounded-lg flex items-center justify-center gap-0">
          <img
            src={runningBoy.src}
            alt="Collection preview"
            className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-cover mx-auto"
          />
          <img
            src={avatarAang.src}
            alt="Collection preview" 
            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-cover -ml-4 sm:-ml-6 lg:-ml-8"
          />
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Create new collection
          </h3>
          <p className="text-white/40 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
            Publish your collection&apos;s metadata, artwork, and creator details to the blockchain.
          </p>
          
          <Button
            onClick={onCreateNew}
            variant="outline"
            className="mt-4 sm:mt-6 border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 bg-transparent rounded-full px-4 sm:px-6 py-2 text-sm"
          >
            Create now
          </Button>
        </div>
      </div>
    </div>
  );

  // Collection Card Component
  const CollectionCard = ({ collection }: { collection: Collection }) => (
    <div className="bg-black-100 border border-black-50 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Cover Image */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <img
            src={collection.coverImage}
            alt={collection.title}
            className="w-full h-48 sm:h-56 lg:w-64 lg:h-56 object-cover rounded-lg mx-auto lg:mx-0"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {collection.title}
            </h3>
            <p className="text-white/50 text-sm sm:text-base">
              {collection.description}
            </p>
          </div>

          {/* Episode Thumbnails */}
          <div className="flex items-center gap-2 sm:gap-4 bg-black-200 p-2 sm:p-3 rounded-lg w-fit overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-3 min-w-max">
              {collection.episodes.slice(0, 4).map((episode, index) => (
                <div key={episode.id} className="relative flex-shrink-0">
                  <img
                    src={episode.thumbnail}
                    alt={`Episode ${index + 1}`}
                    className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded"
                  />
                </div>
              ))}
              {collection.totalEpisodes > 4 && (
                <div className="text-white/60 text-xs sm:text-sm ml-1 sm:ml-2 whitespace-nowrap">
                  + {collection.totalEpisodes - 4} more
                </div>
              )}
            </div>
          </div>

          {/* View Episodes Button */}
          <div className="pt-2">
            <MainButton className="w-full sm:w-auto" 
            onClick={() => router.push(`/comic-pad/collections/${collection.id}`)}
            >
              View Episodes
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-white p-3 sm:p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            <span>Go back</span>
          </button>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
            Published Collections
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base">
            Collections you&apos;ve published on-chain and made available to readers.
          </p>
        </div>

        {/* Show empty state if no collections */}
        {(Array.isArray(collections) ? collections.length : 0) === 0 && !isLoading && <EmptyState />}

        {/* Collections List */}
        {(Array.isArray(collections) ? collections.length : 0) > 0 && (
          <div className='bg-black-200 border border-black-50 rounded-lg p-3 sm:p-4'>
            {/* Search and Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8  gap-4 lg:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  You have {(Array.isArray(collections) ? collections.length : 0)} collection{(Array.isArray(collections) ? collections.length : 0) !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={16} />
                  <Input
                    placeholder="Search Series"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black-400 border-black-50 text-white placeholder-white/40 pl-10 w-full sm:w-64 rounded-full text-sm"
                  />
                </div>

                {/* Create New Button */}
                <Button
                  onClick={onCreateNew}
                  variant="outline"
                  className="border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 bg-transparent rounded-full whitespace-nowrap text-sm px-4 py-2"
                >
                  Create new collection
                </Button>
              </div>
            </div>

            {/* Collections Grid */}
            <div className="space-y-4 sm:space-y-6">
              {filteredCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>

            {/* No Search Results */}
            {searchTerm && filteredCollections.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <p className="text-white/60 text-sm sm:text-base">
                  No collections found matching &quot;{searchTerm}&quot;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="text-white/60 text-sm sm:text-base">Loading collections...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishedCollections;
