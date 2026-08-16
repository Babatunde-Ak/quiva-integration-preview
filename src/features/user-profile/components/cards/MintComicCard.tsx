'use client'

import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Picture from '@/components/picture/Index'
import { hbar } from '../../../../../public/dev_images'
import { useHederaWallet } from '@/providers/HashPackProvider'
import { useNftOwnershipCheck } from "@/hook/userNFTOwnershipCheck";
import { useAccount } from 'wagmi'
interface ComicCardProps {
  id?: string
  title: string
  creator?: string
  creatorAvatar?: string
  mintPrice?: string
  currentPrice?: string
  views?: string
  image: string
  premium?: boolean
  free?: boolean
  number?: number
  isLiked?: boolean
  price?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  size?: 'small' | 'medium' | 'large'
  tokenId?: string
}


export function MintComicCard({ 
  id,
  title, 
  creator = "Creator",
  creatorAvatar,
  mintPrice = "1,000",
  currentPrice = "3,000", 
  image, 
  premium = false,
  free = false,
  number = 1,
  tokenId
}: ComicCardProps) {

  const router = useRouter()
  const { account, user } = useHederaWallet();
  const { address } = useAccount();
  const { checkOwnership } = useNftOwnershipCheck();

  const handleReadClick = async () => {
    console.log('📖 Start Reading clicked');
    
    // Prefer the active Wagmi account, while preserving HashPack as a fallback.
    const userWalletAddress = address || account || user?.walletAddress;
    
    // Get comic's token ID from prop
    const comicTokenId = tokenId;
    
    console.log('🔍 Checking read access:', {
      userWallet: userWalletAddress,
      comicTokenId,
      comicTitle: title
    });

    if (!userWalletAddress) {
      alert("Please connect your wallet to read this comic!");
      return;
    }

    if (!comicTokenId) {
      console.warn('⚠️ No tokenId found for this comic');
      alert("This comic is not available as an NFT yet.");
      return;
    }

    try {
      // ✅ Check if user owns this NFT by checking their wallet
      const ownershipResult = await checkOwnership(userWalletAddress, comicTokenId);
      
      console.log('🎯 Ownership result:', ownershipResult);

      if (ownershipResult.hasNft) {
        // User owns the NFT - allow full reading
        console.log(`✅ User owns NFT! Serial numbers: ${ownershipResult.serialNumbers.join(', ')}`);
        router.push(`/reader?id=${id}`);
      } else {
        // User doesn't own the NFT - show mint page
        console.log('❌ User does not own this NFT');
        alert("You need to own this NFT to read the full comic. Please mint to unlock!");
      }
    } catch (error) {
      console.error('❌ Error checking NFT ownership:', error);
      alert("Error checking NFT ownership. Please try again.");
    }
  };

  return (
    <motion.div 
      className="w-full max-w-[360px] sm:max-w-[320px] md:max-w-[300px] lg:max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        scale: 1,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      whileTap={{ scale: 0.98 }}
      //onClick={() => router.push(`/chapter/${id}`)}
      onClick={handleReadClick}
    >
      {/* Image Container with Number Badge */}
      <div className="relative">
        <motion.img 
          src={image} 
          alt={title}
          className="w-full h-[180px] sm:h-[200px] md:h-[220px] lg:h-[200px] object-cover rounded-lg"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        />
        
        {/* Premium/Free Badge */}
        {(premium || free) && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
            <Badge 
              className={`text-xs font-medium border-none rounded-2xl ${
                premium 
                  ? 'bg-gradient-to-r from-white/20 to-[#1E1E1E] text-white' 
                  : 'bg-gray-600 text-white'
              }`}
            >
              {premium ? (
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">Premium</span>
                  <span className="sm:hidden">P</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#E9872B">
                    <path d="M7 14l3-3 7 7-3 3-7-7z"/>
                    <path d="M5.5 7.5l3-3L17 13l-3 3L5.5 7.5z"/>
                  </svg>
                </span>
              ) : (
                'Free'
              )}
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="pt-3 sm:pt-4">
        {/* Title Row */}
        <div className='flex justify-between items-center'>
          <h3 className="text-white text-base sm:text-lg font-medium mb-2 sm:mb-3 truncate flex-1 mr-2 sm:mr-3">
            {title}
          </h3>

          <div className="w-6 h-6 sm:w-7 sm:h-7 px-3 sm:px-4 bg-secondary-200 rounded-md flex items-center justify-center border-[1px] border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
            <span className="text-black-200 text-xs sm:text-sm font-semibold">{number}</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className='flex justify-between items-center'>

          {/* Creator Section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mr-2 sm:mr-4">
            {/* Creator Avatar */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
              {creatorAvatar ? (
                <img 
                  src={creatorAvatar} 
                  alt="Creator avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {creator.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white/50 text-[9px] sm:text-[10px]">Creator</p>
              <p className="text-white text-[10px] sm:text-xs truncate leading-tight">{creator}</p>
            </div>
          </div>

          {/* Right side - Icons and Stats */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white flex-shrink-0">

            <div className='flex flex-col items-center'>
              <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                <span className="hidden sm:inline">Mint Price</span>
                <span className="sm:hidden">MP</span>
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[9px] sm:text-[10px]">{mintPrice}</span>
                <Picture src={hbar} alt="Hedera Logo" className="w-2 h-2 sm:w-3 sm:h-3"/>
              </div>
            </div>

            <div className='flex flex-col items-center'>
              <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                <span className="hidden sm:inline">Floor Price</span>
                <span className="sm:hidden">FP</span>
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[9px] sm:text-[10px]">{currentPrice}</span>
                <Picture src={hbar} alt="Hedera Logo" className="w-2 h-2 sm:w-3 sm:h-3"/>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  )
}
