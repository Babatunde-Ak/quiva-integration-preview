
'use client'

import React from 'react'
import { ChevronLeft, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  //  Adventure Comics Data 
  const moreAdventureComics = [
    { 
      id: 1, 
      title: 'Inosuke Degen', 
      creatorName: 'Chrome Extreme',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.09H',
      image: '/dev_images/avatar-2.png'
    },
    { 
      id: 2, 
      title: 'The Son is Also The Father', 
      creatorName: 'New York A.B.R.C.',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.12H',
      image: '/dev_images/avatar-2.png'
    },
    { 
      id: 3, 
      title: 'Spiderman: Mary Jane', 
      creatorName: 'Catera Marathon',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.08H',
      image: '/dev_images/avatar-2.png'
    },
    { 
      id: 4, 
      title: 'John Pryce', 
      creatorName: 'A.B.R.C.',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.15H',
      image: '/dev_images/avatar-2.png'
    },
    { 
      id: 5, 
      title: 'Avatar Returns', 
      creatorName: 'Studio Zen',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.10H',
      image: '/dev_images/avatar-2.png'
    },
    { 
      id: 6, 
      title: 'Fire Nation Tales', 
      creatorName: 'Element Studio',
      creatorAvatar: '/dev_images/avatar-2.png',
      mintPrice: '0.07H',
      image: '/dev_images/avatar-2.png'
    }
  ]

  //   image for comic cover and banner
  const localCoverImage = '/dev_images/avatar-2.png'

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
          backgroundImage: `url('${localCoverImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        
        <div className="relative max-w-6xl mx-auto z-10">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Left: Cover Image - Using image */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-start">
              <div className="w-48 md:w-56 lg:w-64 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src={localCoverImage}
                  alt={title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            
            {/* Right: Comic Info and Actions */}
            <div className="flex-1 min-h-[200px] lg:min-h-[220px] flex flex-col justify-end">
              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center lg:text-left">
                {title} #{issueNumber}
              </h1>
              
              {/* Author Info */}
              <div className="mb-3 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-1 justify-center lg:justify-start">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-yellow-500/50">
                    <img
                      src={author.avatar}
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
                      {/* <div className="w-8 h-8 rounded-lg bg-yellow-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>*/}
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
                    src={author.avatar}
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

        
        <div className="mt-10">
          <h2 className="text-lg font-bold mb-4">More from Adventure</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moreAdventureComics.map((comic) => (
              <div key={comic.id} className="bg-white/5 rounded-lg overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02] group border border-white/10">
             
                <div className="h-32 relative">
                  <img
                    src={comic.image}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold mb-2 line-clamp-1">{comic.title}</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img
                          src={comic.creatorAvatar}
                          alt={comic.creatorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white/70 text-xs">creator</div>
                        <div className="text-white text-xs font-medium">{comic.creatorName}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white/70 text-xs">Mint Price</div>
                      <div className="text-white text-sm font-bold">{comic.mintPrice}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComicDetail  }
  otherIssues: ComicIssue[]
  onBack?: () => void
  onReadIssue?: () => void
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
  onBack,
  onReadIssue,
  onPreviewIssue,
  onEnlargeCover
}: ComicDetailProps) => {
  
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(3)
  }
  
  const getReadButtonContent = () => {
    // If it's a free comic, always allow reading
    if (isFree || publishType === 'free') {
      return (
        <span className="flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5" />
          Read Issue
        </span>
      )
    }
    
    // If verifying access
    if (isVerifyingAccess) {
      return (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Verifying Access...
        </span>
      )
    }
    
    // If user has access
    if (hasNFTAccess === true) {
      return (
        <span className="flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Read Issue
        </span>
      )
    }
    
    // If user doesn't have access
    if (hasNFTAccess === false) {
      return (
        <span className="flex items-center justify-center gap-2 hover:bg-primary-400">
          <ShoppingCart className="w-5 h-5 " />
          Purchase to Read
        </span>
      )
    }
    
    return 'Read Issue'
  }
  
  const getReadButtonStyle = () => {
    if (hasNFTAccess === true) {
      return "bg-green-600 hover:bg-green-700"
    }
    if (hasNFTAccess === false) {
      return "bg-secondary-200 hover:bg-primary-400"
    }
    return "bg-secondary-200 hover:bg-primary-400"
  }
  
  const isReadButtonDisabled = isVerifyingAccess || (publishType === 'nft' && hasNFTAccess === null)

  const getAccessStatusInfo = () => {
    if (publishType === 'free' || isFree) {
      return (
        <div className="bg-green-600/10 border border-green-600/50 rounded-xl p-4">
          <p className="text-green-400 text-sm text-center">
            🎉 This comic is free to read! Enjoy unlimited access.
          </p>
        </div>
      )
    }

    if (isVerifyingAccess) {
      return (
        <div className="bg-blue-600/10 border border-blue-600/50 rounded-xl p-4">
          <p className="text-blue-400 text-sm text-center">
            🔍 Checking your access permissions...
          </p>
        </div>
      )
    }

    if (hasNFTAccess === true) {
      return (
        <div className="bg-green-600/10 border border-green-600/50 rounded-xl p-4">
          <p className="text-green-400 text-sm text-center">
            ✅ You own this NFT! Enjoy unlimited access to this comic.
          </p>
        </div>
      )
    }

    if (hasNFTAccess === false) {
      return (
        <div className="bg-secondary-200/10 border border-secondary-200/50 rounded-xl p-4 space-y-2">
          <p className="text-secondary-200 text-sm text-center">
            🔒 This is a premium NFT comic. Purchase to unlock full access.
          </p>
          {price && (
            <p className="text-secondary-300 text-xs text-center">
              Price: {formatPrice(price)} HBAR
            </p>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-black-500 text-white p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-gray-800 p-2"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
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
            )}
            {publishType === 'nft' && !isFree && (
              <div className="absolute top-0 left-10 bg-black-400 text-white px-3 py-1 text-sm font-medium">
                NFT
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

            <hr className='border-white/10 my-16'/>

            {/* About Section */}
            <div>
              <h2 className="text-xl font-light mb-3">About This Comic</h2>
              <p className="text-white/30 leading-relaxed">
                {description}
              </p>
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
                </div>
                <div className="flex items-center gap-3 bg-gray-400 py-4 px-8 rounded-2xl">
                  <BookOpen className="w-5 h-5 text-secondary-200" />
                  <div>
                    <p className="text-white font-light text-xs">Issue Length</p>
                    <p className="font-semibold">{issueDetails.pages} pages</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-400 py-4 px-8 rounded-2xl">
                  <FileText className="w-5 h-5 text-secondary-200" />
                  <div>
                    <p className="text-white font-light text-xs">Publisher</p>
                    <p className="font-semibold">{issueDetails.publisher}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-400 py-4 px-8 rounded-2xl">
                  <Calendar className="w-5 h-5 text-secondary-200" />
                  <div>
                    <p className="text-white font-light text-xs">Publication Date</p>
                    <p className="font-semibold">{issueDetails.publicationDate}</p>
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
                )}
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

export default ComicDetail;


