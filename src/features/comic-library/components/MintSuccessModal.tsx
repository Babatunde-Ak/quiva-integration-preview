'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LOCAL_IMAGE } from '@/components/utils/dummy-data'
import { useRouter } from 'next/navigation'

interface MintSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onViewComic: () => void
  comicTitle: string
  coverImage: string
  editionNumber: string
  walletAddress?: string
  comicId?: string
  transactionHash?: string
  price?: string
}

const MintSuccessModal: React.FC<MintSuccessModalProps> = ({
  isOpen,
  onClose,
  onViewComic,
  comicTitle,
  coverImage,
  transactionHash,
  price,
  editionNumber = "#721",
  walletAddress = "0xA182...C3D4",
  comicId = "1"
}) => {
  const router = useRouter()
  
  if (!isOpen) return null

  // fallback image if coverImage is invalid
  const imageSrc = coverImage && coverImage !== '' ? coverImage : LOCAL_IMAGE

  // Mint More - Navigate to collection page
  const handleMintMore = () => {
    onClose() // Close the modal first
    // Navigate to the comic's collection/detail page
    router.push(`/marketplace/detail?id=${comicId}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="bg-[#000] border font-mono border-neutral-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Success Visual */}
          <div className="relative w-24 h-32 mx-auto mb-6">
            {/* Main Image */}
            <div className="relative z-10 w-24 h-32 rounded-lg border-2 border-neutral-700 overflow-hidden shadow-lg transform rotate-[-3deg]">
              <img
                src={imageSrc}
                alt={comicTitle}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LOCAL_IMAGE
                }}
              />
            </div>
            {/* Success Icon Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute -bottom-2 -right-2 z-20 bg-neutral-800 border border-neutral-700 rounded-full p-2 shadow-lg"
            >
              <span className="text-xl">🎉</span>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            Mint Successful!
          </h2>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed max-w-xs mx-auto">
            You successfully minted{" "}
            <span className="text-white font-medium">{comicTitle}</span>, 
            Edition <span className="text-white font-medium">{editionNumber}</span> into your wallet:{" "}
            <span className="text-white font-medium">{walletAddress}</span>.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onViewComic}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 rounded-xl transition-colors"
            >
              View Comic
            </button>
            <button
              onClick={handleMintMore}
              className="flex-1 border border-neutral-600 hover:border-neutral-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Mint More
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MintSuccessModal
