'use client'

import React from 'react'
import {  User, Calendar, BookOpen, FileText, ChevronLeft, Loader2, Lock, CheckCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MainButton } from '@/components/button'

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
                className="text-white border-white bg-transparent rounded-full w-full hover:bg-white/10"
              >
                Preview Issue
              </Button>
              <Button 
                onClick={onEnlargeCover}
                variant="outline"
                className="text-white border-white bg-transparent rounded-full w-full hover:bg-white/10"
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


