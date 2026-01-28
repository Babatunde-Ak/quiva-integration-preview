'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { LOCAL_IMAGE } from '@/components/utils/dummy-data'
import { useNFTMarketplace } from '@/hook/useMarkeplace';
import { useHederaWallet } from '@/providers/HashPackProvider'
import { useAppSelector } from '@/redux/hook'

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

  
      const { 
            account,
            isConnected, 
            // connector,
            provider,
            signer,
            connectWallet 
        } = useHederaWallet();
    
        const { user } = useAppSelector((state:any) => state.wallet);
        
        const { 
            listNFT,
            createCollection,
            mintNFTs, 
            purchaseNFT,
            status, 
            error 
        } = useNFTMarketplace({
            accountId: account || user?.walletAddress || '',
            network: "testnet",
            // marketplaceContractId: "0.0.7750266", // Your deployed marketplace contract
           marketplaceContractId:"0.0.7774217",
            signer: signer,
           
        });
    

  const handleMintComic = async () => {

    try {
       await purchaseNFT({ listingId: 0, priceInHbar: 30 })
       console.log('Minting successful');
   } catch (error) {
        console.error('Minting failed:', error);
    
   }
 

  
  };

  // fallback image if coverImage is invalid
  const imageSrc = coverImage && coverImage !== '' ? coverImage : LOCAL_IMAGE

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
                    (e.target as HTMLImageElement).src = LOCAL_IMAGE
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
                    
                      <img 
                        src="/hbar.png" 
                        alt="HBAR" 
                        width={20} 
                        height={20} 
                        className="inline-block"
                      />
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
                    {walletAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              // onClick={onConfirm}
              onClick={handleMintComic}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 rounded-xl transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={onClose}
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
