'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { hbar } from '../../../public/dev_images'
import Picture from '../picture/Index'

interface CreatorProfileCardProps {
  rank?: number
  avatar: string
  name: string
  isVerified?: boolean
  totalComics: number
  onClick?: () => void
}

export function CreatorCard({ 
  rank = 1,
  avatar,
  name,
  isVerified = true,
  totalComics,
  onClick
}: CreatorProfileCardProps) {

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <motion.div 
      className="flex flex-col items-center p-6 bg-black-200 border-[0.65px] border-black-50 shadow-[1px_1px_0_0_black] rounded-xl cursor-pointer relative"
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.2, ease: "easeInOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4">
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-[0.65px] border-black-200 shadow-[1px_1px_0_0_black] ">
          <span className="text-black-200 text-xs font-bold">{rank}</span>
        </div>
      </div>

      {/* Avatar with Verification Badge */}
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-700">
          <img 
            src={avatar} 
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-900">
            <Picture src={hbar} alt="Hedera Logo" className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Creator Name */}
      <h3 className="text-white text-lg font-semibold mb-2 text-center">
        {name}
      </h3>

      {/* Stats */}
      <div className="text-center">
        <p className="text-white/60 text-sm font-light">
          Total Comic Sold: <span className="text-white font-light">{formatNumber(totalComics)} Comics</span>
        </p>
      </div>
    </motion.div>
  )
}