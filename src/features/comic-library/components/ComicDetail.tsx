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

      <div className="max-w-7xl mx-auto">
            {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-8 mb-12">
                    {/* Cover Image */}
           <div className="relative">
            <div className="w-full max-w-md mx-auto lg:mx-0 aspect-[3/4] rounded-tl-3xl rounded-br-3xl shadow-2xl overflow-hidden">
              <img
                src={coverImage}
                alt={`${title} Issue ${issueNumber}`}
                className="w-full h-full object-cover"
              />
            </div>
            
                        {/* Status Badge */}
            {(isFree || publishType === 'free') && (
              <div className="absolute top-0 left-10 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                Free
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
            )}
            
                       {/* Action Buttons */}
            <div className="flex gap-3 mt-6 justify-center lg:justify-start">
              <Button 
                onClick={onPreviewIssue}
                variant="outline"
                className="!text-white border-white bg-transparent rounded-full w-full hover:bg-white/10"
              >
                Preview Issue
              </Button>
              <Button 
                onClick={onEnlargeCover}
                variant="outline"
                className="!text-white border-white bg-transparent rounded-full w-full hover:bg-white/10"
              >
                Enlarge Cover
              </Button>
            </div>
          </div>
        </div>
      </div>

            {/* Comic Info */}
          <div className="space-y-6">
                              {/* Tags */} 
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index}
                  className="bg-white/30 hover:bg-white/40 text-white rounded-full font-light p-2 px-3"
                >
                  {tag}
                </Badge>
              ))}
            </div>

                        {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {title}: Issue #{issueNumber}
            </h1>

            {/* Read Button */}
            <MainButton 
              onClick={onReadIssue}
              disabled={isReadButtonDisabled}
              className={`transition-all duration-200 ${getReadButtonStyle()}`}
            >
              {getReadButtonContent()}
            </MainButton>
            
                       {/* Access Status Info */}
            {getAccessStatusInfo()}

                       {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full border border-dashed object-cover"
              />
              <div className='flex font-light text-sm gap-1'>
                <p className="">By</p>
                <p className="">{author.name}</p>
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

               {/* Issue Details */}
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-[0.5fr_1fr] gap-8 mb-12">
            <div></div>
            <div>
              <h3 className="text-lg font-normal mb-4">Issue Details</h3>
              <div className="grid grid-cols-2 gap-4 lg:gap-8 w-full">
                <div className="flex items-center gap-3 bg-gray-400 py-4 px-8 rounded-2xl">
                  <User className="w-5 h-5 text-secondary-200" />
                  <div>
                    <p className="text-white font-light text-xs">Creators</p>
                    <p className="font-semibold">{issueDetails.creators}</p>
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
                </div>
                
                                {/* Show price for NFT comics */}
                {publishType === 'nft' && price && (
                  <div className="flex items-center gap-3 bg-gray-400 py-4 px-8 rounded-2xl col-span-2">
                    <ShoppingCart className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-white font-light text-xs">NFT Price</p>
                      <p className="font-semibold">{formatPrice(price)} HBAR</p>
                    </div>
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

        <hr className='border-white/10 my-16'/>
        
               {/* Other Issues */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Other Issues in this comic</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {otherIssues.map((issue) => (
              <div key={issue.id} className="group cursor-pointer">
                <div className="relative">
                  <img
                    src={issue.image}
                    alt={issue.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  {issue.isFree && (
                    <div className="absolute top-0 left-5 bg-green-600 text-white px-2 py-1 text-sm">
                      Free
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-secondary-200 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">{issue.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComicDetail
