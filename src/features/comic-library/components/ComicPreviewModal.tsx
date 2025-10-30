'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Loader2, Eye, Heart, Clock, Coins } from 'lucide-react'

const ComicPreviewModal = ({ 
  isOpen, 
  onClose, 
  previewComic, 
  isLoading 
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    setCurrentPageIndex(0)
    setCurrentChapterIndex(0)
  }, [previewComic])

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-sm">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (!previewComic) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="text-center">
          <p className="text-white/80 text-lg mb-4">No preview available</p>
          <button
            onClick={onClose}
            className="bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const currentChapter = previewComic.chapters?.[currentChapterIndex]
  const currentPage = currentChapter?.pages?.[currentPageIndex]
  const totalPages = currentChapter?.pages?.length || 0
  const hasNFT = previewComic.nftId || previewComic.publishType === 'nft'

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1)
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1)
      setCurrentPageIndex(previewComic.chapters[currentChapterIndex - 1].pages.length - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1)
    } else if (currentChapterIndex < previewComic.chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1)
      setCurrentPageIndex(0)
    }
  }

  const isFirstPage = currentChapterIndex === 0 && currentPageIndex === 0
  const isLastPage = 
    currentChapterIndex === previewComic.chapters.length - 1 && 
    currentPageIndex === totalPages - 1

  return (
    <div className="fixed inset-0 z-50 bg-black-500/95 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-white text-xl font-bold">
              {previewComic.title}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
              <span className="text-white/80">
                by {previewComic.creatorId?.username || 'Unknown'}
              </span>
              <span>Chapter {currentChapter?.chapterNumber}: {currentChapter?.title}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {previewComic.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {previewComic.likes || 0}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Previous Button */}
        <button
          onClick={handlePrevPage}
          disabled={isFirstPage}
          className={`absolute left-4 z-10 p-3 rounded-full transition-all ${
            isFirstPage
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Page Display */}
        <div className="max-w-5xl w-full h-full flex items-center justify-center">
          {currentPage?.imageUrl ? (
            <img
              src={currentPage.imageUrl}
              alt={`Page ${currentPage.pageNumber}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <div className="text-white/60 text-center">
              <p>No content available for this page</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextPage}
          disabled={isLastPage}
          className={`absolute right-4 z-10 p-3 rounded-full transition-all ${
            isLastPage
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : 'bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm'
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer */}
      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Top Row - Page Counter and Stats */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-sm">
              Page {currentPageIndex + 1} of {totalPages}
            </div>
            
            <div className="flex items-center gap-3">
              {/* NFT Info */}
              {hasNFT && previewComic.nftId && (
                <>
                  {previewComic.nftId.price && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600/20 rounded-lg">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">
                        {previewComic.nftId.price} HBAR
                      </span>
                    </div>
                  )}
                  
                  {previewComic.nftId.maxSupply && (
                    <div className="text-white/60 text-sm">
                      {previewComic.nftId.currentSupply || 0} / {previewComic.nftId.maxSupply} minted
                    </div>
                  )}
                </>
              )}

              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  previewComic.publishType === 'free' 
                    ? 'bg-green-500/20 text-green-400' 
                    : previewComic.publishType === 'nft'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-yellow-600/20 text-yellow-400'
                }`}>
                  {previewComic.publishType === 'free' ? 'FREE' : 
                   previewComic.publishType === 'nft' ? 'NFT' : 'PREMIUM'}
                </span>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  previewComic.status === 'published' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : previewComic.status === 'draft'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {previewComic.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row - Chapter Navigation and Metadata */}
          <div className="flex items-center justify-between">
            {/* Chapter Navigation */}
            {previewComic.chapters?.length > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm mr-2">Chapter:</span>
                {previewComic.chapters.map((chapter, index) => (
                  <button
                    key={chapter._id}
                    onClick={() => {
                      setCurrentChapterIndex(index)
                      setCurrentPageIndex(0)
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      index === currentChapterIndex
                        ? 'bg-yellow-600 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {chapter.chapterNumber}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-white/60 text-sm">
                {previewComic.totalPages} total pages
              </div>
            )}

            {/* Additional Info */}
            {previewComic.genre && previewComic.genre.length > 0 && (
              <div className="flex items-center gap-2">
                {previewComic.genre.slice(0, 3).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* NFT Mint Status */}
          {hasNFT && previewComic.nftId?.mintStatus && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-white/40" />
                <span className="text-white/60">Mint Status:</span>
                <span className={`font-medium ${
                  previewComic.nftId.mintStatus === 'minted' 
                    ? 'text-green-400' 
                    : previewComic.nftId.mintStatus === 'pending'
                    ? 'text-yellow-400'
                    : 'text-gray-400'
                }`}>
                  {previewComic.nftId.mintStatus.toUpperCase()}
                </span>
                {previewComic.nftId.royaltyPercentage && (
                  <span className="text-white/40 ml-4">
                    Royalty: {previewComic.nftId.royaltyPercentage}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComicPreviewModal