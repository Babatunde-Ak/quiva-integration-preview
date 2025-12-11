'use client'

import React from 'react'
import { ChevronLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Import ComicCard
import { ComicCard } from '@/components/cards/ComicCard'
// Import dummy dat
import { LOCAL_IMAGE, MORE_ADVENTURE_COMICS } from '@/components/utils/dummy-data'

interface ComicIssue {
  id: string
  title: string
  image: string
  date: string
  isFree?: boolean
}

interface ComicDetailProps {
  title: string
  issueNumber: number
  author: {
    name: string
    avatar: string
  }
  coverImage: string
  description: string
  tags: string[]
  isFree?: boolean
  publishType?: string
  price?: number | string
  isVerifyingAccess?: boolean
  hasNFTAccess?: boolean | null
  issueDetails: {
    creators: string
    pages: number
    publisher: string
    publicationDate: string
  }
  otherIssues: ComicIssue[]
  activeTab?: string
  onTabChange?: (tab: string) => void
  onBack?: () => void
  onReadIssue?: () => void
  onResell?: () => void
  onPreviewIssue?: () => void
  onEnlargeCover?: () => void
}

const ComicDetail = ({
  title,
  issueNumber,
  author,
  coverImage,
  description,
  tags,
  isFree = false,
  publishType = 'free',
  price = 0,
  isVerifyingAccess = false,
  hasNFTAccess = null,
  issueDetails,
  otherIssues,
  activeTab = 'details',
  onTabChange,
  onBack,
  onReadIssue,
  onResell,
  onPreviewIssue,
  onEnlargeCover
}: ComicDetailProps) => {
  
  const getReadButtonContent = () => {
    if (isFree || publishType === 'free') {
      return 'Start Read'
    }
    
    if (isVerifyingAccess) {
      return 'Verifying...'
    }
    
    if (hasNFTAccess === true) {
      return 'Start Read'
    }
    
    if (hasNFTAccess === false) {
      return 'Purchase to Read'
    }
    
    return 'Start Read'
  }
  
  const isReadButtonDisabled = isVerifyingAccess

  return (
    <div className="min-h-screen bg-[#161614] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-white/5 p-1.5 text-xs"
        >
          <ChevronLeft className="w-3 h-3 mr-1.5" />
          Back to Collection
        </Button>
      </div>

      {/* HERO BANNER SECTION with  image as blurred background */}
      <div 
        className="relative px-4 py-8 md:py-10 overflow-hidden"
        style={{
          backgroundImage: `url('${LOCAL_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        
        <div className="relative max-w-6xl mx-auto z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
           
            <div className="w-full lg:w-auto flex justify-center lg:justify-start">
              <div className="w-48 md:w-56 lg:w-64 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src={coverImage || LOCAL_IMAGE}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
          
            <div className="flex-1 min-h-[200px] lg:min-h-[220px] flex flex-col justify-end">
         
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center lg:text-left">
                {title} #{issueNumber}
              </h1>
              
              {/* Author Info */}
              <div className="mb-3 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-yellow-500/50">
                    <img
                      src={author.avatar || LOCAL_IMAGE}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-white text-sm md:text-base font-semibold">
                      {author.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-white/60" />
                      <span className="text-white/70 text-xs font-medium">creator</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4 justify-center lg:justify-start">
                {tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-2">
                <button
                  onClick={onReadIssue}
                  disabled={isReadButtonDisabled}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    hasNFTAccess === false || publishType === 'nft' 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-black' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } ${isReadButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getReadButtonContent()}
                </button>
                
                <button
                  onClick={onResell}
                  className="px-6 py-2.5 rounded-full text-sm font-medium bg-transparent border border-white/30 text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  Resell
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT BELOW HERO BANNER */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About Comic, Episode List, About Creator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Comic Details Button */}
            <div className="flex space-x-3">
              <button
                onClick={() => onTabChange?.('details')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'details' 
                    ? 'bg-yellow-600 text-black' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Comic Details
              </button>
              <button
                onClick={() => onTabChange?.('activity')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'activity' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                Activity
              </button>
            </div>

            {/* About the Comic Section */}
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h2 className="text-lg font-bold mb-3">About the Comic</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                {description}
              </p>
            </div>

            {/* Episode List  */}
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h2 className="text-lg font-bold mb-3">Episode List</h2>
              <div className="space-y-3">
                {[
                  { title: 'Episode 1 : The First Flame', time: '8 min' },
                  { title: 'Episode 2 : The First Flame', time: '8 min' },
                  { title: 'Episode 3 : The First Flame', time: '8 min' }
                ].map((episode, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-0" 
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="text-sm font-medium">{episode.title}</h3>
                        <p className="text-white/60 text-xs">Time: {episode.time}</p>
                      </div>
                    </div>
                    <span className="bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
                      open 🔓
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* About Creator */}
            <div className="bg-white/5 rounded-lg p-5 border border-white/10">
              <h2 className="text-lg font-bold mb-3">About Creator</h2>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-yellow-500/50">
                  <img
                    src={author.avatar || LOCAL_IMAGE}
                    alt={author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">{author.name}</h3>
                  <p className="text-white/70 text-sm">
                    Studio Kyra is a visionary town of artists and storytellers dedicated to making the boundaries of digital art and interactive narratives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* NFT Details Card  */}
          <div className="lg:col-span-1">
          
            <div className="lg:mt-[60px]"> 
              <div className="bg-white/5 rounded-lg p-5 border border-white/10 sticky top-6">
                {/* Minting Details */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-4">Minting Details</h3>
                  
                  {/* Labels row */}
                  <div className="grid grid-cols-3 gap-4 mb-1">
                    <div className="text-white/70 text-xs">mint price</div>
                    <div className="text-white/70 text-xs text-center">Edition</div>
                    <div className="text-white/70 text-xs text-right">Royalties</div>
                  </div>
                  
                  {/* Values row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-white text-sm font-bold">0.09H</div>
                    <div className="text-white text-sm font-bold text-center">1,000</div>
                    <div className="text-white text-sm font-bold text-right">7% to creator</div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-white/50 text-xs mb-1">Blockchain</div>
                    <div className="text-white text-xs font-medium">Hedera</div>
                  </div>
                </div>

                {/* Market Stats */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-white mb-4">Market Stats</h3>
                  
                  {/* Labels row */}
                  <div className="grid grid-cols-3 gap-4 mb-1">
                    <div className="text-white/70 text-xs">floor price</div>
                    <div className="text-white/70 text-xs text-center">Total Mints</div>
                    <div className="text-white/70 text-xs text-right">Volume</div>
                  </div>
                  
                  {/* Values row */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-white text-sm font-bold">0.085H</div>
                    <div className="text-white text-sm font-bold text-center">721/1,000</div>
                    <div className="text-white text-sm font-bold text-right">45.8H</div>
                  </div>
                </div>

              
                <div>
                  <div className="text-white/50 text-xs mb-1">Collectors</div>
                  <div className="text-white text-xl font-bold">389</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  More from Adventure Section - Using ComicCard component */}
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-6">More from Adventure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MORE_ADVENTURE_COMICS.map((comic) => (
              <ComicCard
                key={comic.id}
                id={comic.id}
                title={comic.title}
                creator={comic.creator}
                creatorAvatar={comic.creatorAvatar}
                mintPrice={comic.mintPrice}
                currentPrice={comic.currentPrice}
                views={comic.views}
                image={comic.image}
                premium={comic.premium}
                number={comic.number}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComicDetail
