'use client'

import React from 'react'
import { X } from 'lucide-react'
import { LOCAL_IMAGE } from '@/components/utils/dummy-data'
import { useRouter } from 'next/navigation'

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onViewComic: () => void
  comicTitle: string
  coverImage: string
  editionNumber: string
  walletAddress: string
  comicId?: string
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  isOpen,
  onClose,
  onViewComic,
  comicTitle,
  coverImage,
  editionNumber = "#721",
  walletAddress = "0xA182...C3D4",
  comicId = "1"
}) => {
  const router = useRouter()
  
  if (!isOpen) return null

  // fallback image if coverImage is invalid
  const imageSrc = coverImage && coverImage !== '' ? coverImage : LOCAL_IMAGE

  // Handle Mint More - Navigate to collection page
  const handleMintMore = () => {
    onClose() // Close the modal first
    // Navigate to the comic's collection/detail page
    router.push(`/marketplace/detail?id=${comicId}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div 
        className="relative bg-[#1A1A1A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          width: '638px',
          height: '449px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Mint Successful!
          </h2>
        </div>

        {/*  Comic Cover Image */}
        <div className="flex justify-center">
          <div className="w-36 h-48 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
            <img
              src={imageSrc}
              alt={comicTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = LOCAL_IMAGE
              }}
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Success Message */}
        <div className="text-center mb-2">
          <p className="text-white/70 text-sm">
            You successfully minted <span className="text-white font-semibold">{comicTitle}</span>, 
            Edition <span className="text-white font-semibold">{editionNumber}</span> into your wallet:{" "}
            <span className="text-white font-medium">{walletAddress}</span>.
          </p>
        </div>

        {/* Action Buttons  */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onViewComic}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 rounded-xl transition-all"
          >
            View Comic
          </button>
          <button
            onClick={handleMintMore}
            className="flex-1 bg-transparent border border-white/30 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-all"
          >
            Mint More
          </button>
        </div>
      </div>
    </div>
  )
}

export default MintSuccessModal
