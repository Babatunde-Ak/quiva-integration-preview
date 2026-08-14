'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Picture from '@/components/picture/Index'
import { hbar } from '../../../../../public/dev_images'
import { Heart } from 'lucide-react'

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
}


export function MintComicCard({ 
  id,
  title, 
  creator = "Creator",
  creatorAvatar,
  mintPrice = "1,000",
  currentPrice = "3,000", 
  views = "4.89K",
  image, 
  premium = false,
  free = false,
  number = 1,
  isLiked = false
}: ComicCardProps) {

  const router = useRouter()
  const [liked, setLiked] = useState(isLiked)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
  }

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
      onClick={() => router.push(`/chapter/${id}`)}
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
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
            <div
            className={`p-0.5 sm:p-1 transition-colors bg-primary-400 text-black-200 flex flex-col items-center`}
            >
                <Heart size={10} className="sm:w-3 sm:h-3" fill='black' stroke='black' />
            </div>
          </div>
        
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
                <span className="text-[9px] sm:text-[10px]">{views}</span>
                <Picture src={hbar} alt="Hedera Logo" className="w-2 h-2 sm:w-3 sm:h-3"/>
              </div>
            </div>

            <div className='flex flex-col items-center'>
              <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                <span className="hidden sm:inline">Floor Price</span>
                <span className="sm:hidden">FP</span>
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className="text-[9px] sm:text-[10px]">{views}</span>
                <Picture src={hbar} alt="Hedera Logo" className="w-2 h-2 sm:w-3 sm:h-3"/>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  )
}