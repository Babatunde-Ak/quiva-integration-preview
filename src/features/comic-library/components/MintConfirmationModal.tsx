'use client'

import React from 'react'
import { X } from 'lucide-react'
import { LOCAL_IMAGE } from '@/components/utils/dummy-data'

interface MintConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  comicTitle: string
  coverImage: string
  price: string
  edition: string
  walletAddress: string
}

const MintConfirmationModal: React.FC<MintConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  comicTitle,
  coverImage,
  price = "0.09 H",
  edition = "#1 of 1000",
  walletAddress = "0xA182...C3D4"
}) => {
  if (!isOpen) return null

  // fallback image if coverImage is invalid
  const imageSrc = coverImage && coverImage !== '' ? coverImage : LOCAL_IMAGE

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Responsive container */}
      <div className="relative bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden w-full max-w-[638px] h-auto max-h-[90vh] min-h-[400px] p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white text-center">
            Mint this Comic
          </h2>
        </div>

        {/* Middle Section with Blurred Background */}
        <div className="relative rounded-xl overflow-hidden flex-1 min-h-[200px] sm:min-h-[250px]">
          {/* Blurred Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${LOCAL_IMAGE}')`,
              filter: 'blur(20px) brightness(0.6)',
              transform: 'scale(1.1)'
            }}
          />
          
          {/* Content on top of blur */}
          <div className="relative z-10 h-full flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 sm:px-8">
            {/* Cover Image - Top on mobile, Left on desktop */}
            <div className="w-28 h-36 sm:w-36 sm:h-48 md:w-40 md:h-52 rounded-lg overflow-hidden shadow-2xl border-2 border-white/30 mb-4 sm:mb-0">
              <img
                src={imageSrc}
                alt={comicTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LOCAL_IMAGE
                }}
              />
            </div>
            
            {/* Comic Info - Stacked on mobile, side by side on desktop */}
            <div className="text-white w-full sm:w-auto">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left">
                {comicTitle}
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
                <div className="text-center sm:text-left">
                  <div className="text-white/70 text-xs mb-1">Price</div>
                  <div className="text-white text-lg sm:text-xl font-bold">{price}</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-white/70 text-xs mb-1">Edition</div>
                  <div className="text-white text-lg sm:text-xl font-bold">{edition}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="text-white/70 text-xs sm:text-sm">Minting to:</div>
                <div className="text-white font-medium bg-black/50 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm w-full sm:w-auto text-center sm:text-left truncate">
                  {walletAddress}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Stacked on mobile, side by side on desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onConfirm}
            className="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 rounded-xl transition-all text-sm sm:text-base"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="w-full sm:flex-1 bg-transparent border border-white/30 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default MintConfirmationModal
