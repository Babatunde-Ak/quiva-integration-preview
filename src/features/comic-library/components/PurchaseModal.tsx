'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { MainButton } from '@/components/button'
import { coinIcon, creatorIcon } from '../../../../public/dev_images'
import Image from 'next/image'

interface PurchaseNFTModalProps {
  isOpen: boolean
  onClose: () => void
  comicTitle: string
  comicImage: string
  creatorName: string
  creatorAvatar: string
  price: number | string
  tokenId: bigint
  sellerAddress: string
  limitedEdition: string
  onPurchase: () => Promise<any>
  onPurchaseSuccess?: () => void
  isPurchasing?: boolean
  purchaseError?: Error | null
  purchaseSuccess?: boolean
  comicId: string
}

const PurchaseNFTModal: React.FC<PurchaseNFTModalProps> = ({
  isOpen,
  onClose,
  comicTitle,
  comicImage,
  creatorName,
  creatorAvatar,
  price,
  tokenId,
  sellerAddress,
  limitedEdition,
  onPurchase,
  onPurchaseSuccess,
  isPurchasing = false,
  purchaseError = null,
  purchaseSuccess = false,
  comicId
}) => {
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset processing state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(3)
  }

  // Handle purchase with loading state
  const handlePurchase = async () => {
    setIsProcessing(true)
    try {
      await onPurchase()
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBuy = async () => {
    
  }

  // Success Modal
  if (purchaseSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative bg-[#1A1A1A] rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl shadow-secondary-200/10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <img
                src={comicImage}
                alt={comicTitle}
                className="w-32 h-32 object-cover rounded-2xl shadow-2xl"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Purchase Successful! 🎉
              </h2>
              <p className="text-white/70 text-sm">
                You now own <span className="text-white font-semibold">{comicTitle}</span>. 
                It&apos;s been added to your Library and your Wallet.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={onPurchaseSuccess}
                className="w-full bg-secondary-200 hover:bg-primary-400 text-black font-bold py-4 rounded-full transition-all"
              >
                Start Reading
              </button>
              <button 
                onClick={onClose}
                className="w-full bg-transparent border-2 border-white/80 text-white font-semibold py-4 rounded-full hover:bg-white/5 transition-all"
              >
                Go to My Library
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading Modal - Show when purchase is in progress
  if (isPurchasing || isProcessing) {
    const getLoadingMessage = () => {
      if (isProcessing) {
        return 'Initiating purchase...'
      }
      if (isPurchasing) {
        return 'Processing blockchain transaction...'
      }
      return 'Processing purchase...'
    }

    const getLoadingDescription = () => {
      if (isProcessing) {
        return 'Preparing your purchase transaction. This may take a moment.'
      }
      return `We're processing your purchase of ${comicTitle}. This may take a few moments. Please don't refresh the page.`
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative bg-[#1A1A1A] rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl shadow-secondary-200/10">
          <button
            onClick={onClose}
            disabled={isPurchasing}
            className={`absolute top-6 right-6 transition-colors z-10 ${
              isPurchasing ? 'text-white/50 cursor-not-allowed' : 'text-white hover:text-gray-300'
            }`}
          >
            <X size={24} />
          </button>

          <div className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="text-6xl animate-pulse">⏳</div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                {getLoadingMessage()}
              </h2>
              <p className="text-white/60 text-sm leading-relaxed">
                {getLoadingDescription()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error Modal
  if (purchaseError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
        <div className="relative bg-[#1A1A1A] rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl shadow-secondary-200/10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <img
                src={comicImage}
                alt={comicTitle}
                className="w-32 h-32 object-cover rounded-2xl shadow-2xl"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Purchase Failed
                <span className="text-red-500 ml-2">✕</span>
              </h2>
              <p className="text-white/60 text-sm">
                We couldn&apos;t complete the purchase. Please try again or contact support if the issue persists.
              </p>
              {purchaseError.message && (
                <p className="text-red-400 text-xs mt-2">
                  Error: {purchaseError.message}
                </p>
              )}
            </div>

            <div className="pt-4">
              <MainButton 
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full bg-secondary-200 hover:bg-primary-400 text-black font-bold py-4 rounded-full transition-all disabled:opacity-50"
              >
                {isProcessing ? 'Retrying...' : 'Retry Purchase'}
              </MainButton>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default Purchase Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative bg-[#1A1A1A] rounded-3xl max-w-4xl w-full overflow-hidden shadow-xl shadow-secondary-200/10">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="pt-12 pb-6 flex justify-center">
          <img
            src={comicImage}
            alt={comicTitle}
            className="w-32 h-32 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Purchase this comic</h2>
            <p className="text-sm text-white/60">
              You are about to purchase: <span className="text-white font-medium">{comicTitle}</span>
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Creator Info */}
            <div className="flex items-center gap-4 bg-[#2A2A2A] rounded-2xl p-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">
                  <Image
                    src={creatorIcon}
                    alt="Creator Icon"
                    width={56}
                    height={56}
                    className=""
                  />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 mb-1">Creator</p>
                <p className="text-white font-semibold">{creatorName}</p>
              </div>
            </div>

            {/* Limited Edition */}
            <div className="flex items-center gap-4 bg-[#2A2A2A] rounded-2xl p-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">
                  <Image
                    src={coinIcon}
                    alt="Edition Icon"
                    width={56}
                    height={56}
                    className=""
                  />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 mb-1">Limited Edition</p>
                <p className="text-white font-semibold">{limitedEdition}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 bg-[#2A2A2A] rounded-2xl p-4 lg:col-span-2">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">
                  <Image
                    src={coinIcon}
                    alt="Price Icon"
                    width={56}
                    height={56}
                    className=""
                  />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/50 mb-1">Price</p>
                <p className="text-white font-semibold">{formatPrice(price)} HBAR</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <MainButton
              onClick={handlePurchase}
              disabled={isProcessing || isPurchasing}
              className="w-full bg-secondary-200 hover:bg-primary-400 text-black font-normal py-4 rounded-full transition-all disabled:opacity-50"
            >
              {isProcessing || isPurchasing ? 'Processing...' : 'Proceed to Purchase'}
            </MainButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseNFTModal
