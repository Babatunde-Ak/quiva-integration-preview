'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Heart, Eye } from 'lucide-react'
import { useState } from 'react'
import Picture from '../picture/Index'
import { hbar } from '../../../public/dev_images'

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

export function ComicCard({ 
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
      className="w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ 
        scale: 1,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push(`/marketplace/detail?id=${id}`)}
    >
      {/* Image Container with Number Badge */}
      <div className="relative">
        <motion.img 
          src={image} 
          alt={title}
          className="w-full h-[200px] object-cover rounded-lg"
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        />
        
        {/* Premium/Free Badge */}
        {(premium || free) && (
          <div className="absolute top-3 left-3 z-10">
            <Badge 
              className={`text-xs font-medium border-none rounded-2xl ${
                premium 
                  ? 'bg-gradient-to-r from-white/20 to-[#1E1E1E] text-white' 
                  : 'bg-gray-600 text-white'
              }`}
            >
              {premium ? (
                <span className="flex items-center gap-1">
                  Premium
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
      <div className="pt-4">
        {/* Title Row */}
        <div className='flex justify-between items-center'>
          <h3 className="text-white text-lg font-medium mb-3 truncate flex-1 mr-3">
            {title}
          </h3>

          <div className="w-7 h-7 px-4 bg-secondary-200 rounded-md flex items-center justify-center border-[1px] border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
            <span className="text-black-200 text-sm font-semibold">{number}</span>
          </div>
        </div>

        {/* Bottom Row */}
        <div className='flex justify-between items-center'>

          {/* Creator Section */}
          <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
            {/* Creator Avatar */}
            <div className="w-8 h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
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
              <p className="text-white/50 text-[10px]">Creator</p>
              <p className="text-white text-xs truncate leading-tight">{creator}</p>
            </div>
          </div>

          {/* Right side - Icons and Stats */}
          <div className="flex items-center gap-3 text-xs text-white flex-shrink-0">
            <button 
              onClick={handleLike}
              className={`p-1 transition-colors ${liked ? 'text-red-300' : 'text-white hover:text-red-300'} flex flex-col items-center`}
            >
              <Heart size={12} fill={liked ? 'currentColor' : 'none'} stroke={liked ? 'currentColor' : 'white'} />
              <span>{mintPrice}</span>
            </button>
            
            <button className="text-white transition-colors flex flex-col items-center">
              <Eye size={12} stroke={'white'}/>
              <span className="mx-2">{currentPrice}</span>
            </button>

            <div className='flex flex-col items-center'>
              <span className="text-white text-xs font-light">Mint Price</span>
              <span>{views} <Picture src={hbar} alt="Hedera Logo" className="w-3 h-3"/></span>
            </div>
          </div>
        </div>
        
      </div>
    </motion.div>
  )
}