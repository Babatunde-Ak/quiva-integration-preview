'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HbarIcon } from '@/components/ui/HbarIcon'
import useWagmiMarketplace from '@/hook/useWagmiMarketplace';
import useMirrorNodeQueries from '@/hook/useMirrorNodeQueries';
import { useHederaWallet } from '@/providers/HashPackProvider'
import { useAppSelector } from '@/redux/hook'

interface MintConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (txHash: string) => void
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
  price = "0",
  edition = "",
  walletAddress = ""
}) => {
  const { account } = useHederaWallet();
  const { user } = useAppSelector((state:any) => state.wallet);
  const { currentComic } = useAppSelector((state: any) => state.comic);
  const {
    purchaseFromListing,
    isProcessing,
    error: marketplaceError,
    statusMessage,
    isConnected: isWagmiConnected,
    address,
  } = useWagmiMarketplace();
  const { fetchDirectListing } = useMirrorNodeQueries();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null

  const handleMintComic = async () => {
    setLocalError(null);
    try {
      // Fetch authoritative listing price from mirror node to avoid insufficient-payment mismatches
      const listingId = Number(currentComic?.nftId?.listingId || 0);
      if (!listingId) {
        throw new Error('This comic does not have an active marketplace listing.');
      }

      let pricePerNFT = parseFloat(String(price)) || 0;
      try {
        const listingInfo = await fetchDirectListing(listingId);
        if (listingInfo?.pricePerNFT) {
          pricePerNFT = parseFloat(String(listingInfo.pricePerNFT));
        }
      } catch (err) {
        console.warn('Failed to fetch listing info; falling back to local price', err);
      }

      const result = await purchaseFromListing({
        listingId: listingId,
        quantity: Math.max(1, Number(currentComic?.nftId?.quantity || 1)),
        pricePerNFT: pricePerNFT,
      })
      
      if (result?.transactionId) {
        onConfirm(result.transactionId)
      }
    } catch (error: any) {
      const message = error?.message || 'Minting failed. Please try again.';
      setLocalError(message);
      console.error('Minting failed:', error);
    }
  };

  // fallback image if coverImage is invalid
  const imageSrc = coverImage && coverImage !== '' ? coverImage : "/dev_images/Rectangle3051.png"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="bg-[#000] border font-mono border-neutral-800 rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white">
              Mint this Comic
            </h2>
          </div>

          {/* Middle Section  */}
          <div className="relative rounded-xl overflow-hidden mb-8">
            {/* Blurred Background Image  */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${imageSrc}')`,  
                filter: 'blur(20px) brightness(0.6)',
                transform: 'scale(1.1)'
              }}
            />
            
            {/* Content on top of blur */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4">
              {/* Cover Image  */}
              <div className="w-28 h-36 sm:w-32 sm:h-40 rounded-lg overflow-hidden shadow-2xl border-2 border-neutral-700">
                <img
                  src={imageSrc} 
                  alt={comicTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/dev_images/Rectangle3051.png"
                  }}
                />
              </div>
              
              {/* Comic Info */}
              <div className="text-white w-full sm:w-auto text-left">
                {/* Comic title  */}
                <h3 className="text-lg sm:text-xl font-bold mb-4 whitespace-nowrap">
                  {comicTitle.replace(/\s*#\d+/, '')}
                </h3>
                
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                  <div>
                    <div className="text-white/70 text-xs mb-1">Price</div>
                    <div className="text-white text-xl font-bold flex items-center gap-1">
                      {price.replace(' H', '')}
                    
                      <HbarIcon size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="text-white/70 text-xs mb-1">Edition</div>
                    <div className="text-white text-xl font-bold">{edition}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-2">
                  <div className="text-white/70 text-sm">Minting to:</div>
                  <div className="text-white font-medium text-sm truncate">
                    {address || walletAddress || account || user?.walletAddress || 'Connect a wallet'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(localError || marketplaceError) && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm text-red-200" role="alert">
              {localError || marketplaceError}
            </div>
          )}

          {!isWagmiConnected && (
            <p className="mb-4 text-sm text-amber-300">
              Connect a Wagmi-compatible wallet before confirming this purchase.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleMintComic}
              disabled={isProcessing}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-60 text-black font-medium py-3 rounded-xl transition-colors"
            >
              {isProcessing ? statusMessage || 'Processing...' : 'Confirm'}
            </button>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 border border-neutral-600 hover:border-neutral-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default MintConfirmationModal

