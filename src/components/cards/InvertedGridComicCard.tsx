'use client'

import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {motion} from 'framer-motion'
import {useRouter} from 'next/navigation'
import {Heart, Eye} from 'lucide-react'
import {useState} from 'react'
import Picture from '../picture/Index'
import {hbar} from '../../../public/dev_images'
import {Comic} from '@/features/comic-library/utils/transformComicData'
import { formatNumberShorthand } from '@/lib/Formatnumber'

interface InvertedGridComicCardProps extends Partial<Comic> {
    // Override/add specific props for the card component
    creator?: string
    creatorAvatar?: string
    mintPrice?: string
    currentPrice?: string
    views?: number
    number?: number
    isLiked?: boolean
    size?: 'small' | 'medium' | 'large'
    free?: boolean
}

export function InvertedGridComicCard({
    id,
    title = "Untitled",
    creatorId,
    creatorAvatar,
    creatorUsername,
    mintPrice = "1,000",
    currentPrice = "3,000",
    views = 4890,
    image = "",
    premium = false,
    free = false,
    number = 1,
    isLiked = false,
    // Access all Comic interface fields
    creatorWalletAddress,
    episodeNumber,
    likes,
    price
} : InvertedGridComicCardProps) {

    const router = useRouter()
    const [liked, setLiked] = useState(isLiked)

    // Use creator name with fallback logic
    const displayCreator = creatorUsername || (creatorWalletAddress 
        ? `${creatorWalletAddress.slice(0, 6)}...${creatorWalletAddress.slice(-4)}`
        : "Creator")

    // Use views from comic data or prop
    const displayViews = formatNumberShorthand(views)

    const handleLike = (e : React.MouseEvent) => {
        e.stopPropagation()
        setLiked(!liked)
    }

    return (
        <motion.div
            className="w-[280px] sm:w-[300px] lg:w-[320px] shrink-0 bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200"
            initial={{
                opacity: 0,
                y: 20
            }}
            animate={{
                opacity: 1,
                y: 0
            }}
            transition={{
                duration: 0.5,
                ease: "easeOut"
            }}
            whileHover={{
                scale: 1,
                transition: {
                    duration: 0.2,
                    ease: "easeInOut"
                }
            }}
            whileTap={{
                scale: 0.98
            }}
            onClick={() => router.push(`/marketplace/chapter?id=${id}`)}>
            
            {/* Content Section */}
            <div className="pt-3 sm:pt-4">
                {/* Title Row */}
                <div className='flex justify-between items-center'>
                    <h3 className="text-white text-base sm:text-lg font-medium mb-2 sm:mb-3 truncate flex-1 mr-2 sm:mr-3">
                        {title}
                    </h3>

                    <div
                        className="w-6 h-6 sm:w-7 sm:h-7 px-3 sm:px-4 bg-secondary-200 rounded-md flex items-center justify-center border-[1px] border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
                        <span className="text-black-200 text-xs sm:text-sm font-semibold">
                            {episodeNumber || number}
                        </span>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className='flex justify-between items-center'>

                    {/* Creator Section */}
                    <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 flex-1 min-w-0 mr-2 sm:mr-4">
                        {/* Creator Avatar */}
                        <div
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {(creatorAvatar || creatorAvatar)
                                ? (<img
                                    src={creatorAvatar || creatorAvatar}
                                    alt="Creator avatar"
                                    className="w-full h-full object-cover"/>)
                                : (
                                    <span className="text-white text-xs font-bold">
                                        {displayCreator.charAt(0).toUpperCase()}
                                    </span>
                                )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white/50 text-[9px] sm:text-[10px]">Creator</p>
                            <p className="text-white text-[10px] sm:text-xs truncate leading-tight">
                                {displayCreator}
                            </p>
                        </div>
                    </div>

                    {/* Right side - Icons and Stats */}
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white flex-shrink-0">
                        <button
                            onClick={handleLike}
                            className={`p-0.5 sm:p-1 transition-colors ${liked
                                ? 'text-red-300'
                                : 'text-white hover:text-red-300'} flex flex-col items-center`}>
                            <Heart
                                size={10}
                                className="sm:w-3 sm:h-3"
                                fill={liked ? 'currentColor' : 'none'}
                                stroke={liked ? 'currentColor' : 'white'}/>
                            <span className="text-[9px] sm:text-[10px] mt-0.5">
                                {likes}
                            </span>
                        </button>

                        <button className="text-white transition-colors flex flex-col items-center p-0.5 sm:p-1">
                            <Eye size={10} className="sm:w-3 sm:h-3" stroke={'white'}/>
                            <span className="text-[9px] sm:text-[10px] mt-0.5">
                                {displayViews}
                            </span>
                        </button>

                        <div className='flex flex-col items-center'>
                            <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                                <span className="hidden sm:inline">Mint Price</span>
                                <span className="sm:hidden">MP</span>
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span className="text-[9px] sm:text-[10px]">{price}</span>
                                <Picture src={hbar} alt="Hedera Logo" className="w-2 h-2 sm:w-3 sm:h-3"/>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Image Container with Number Badge */}
            <div className="relative">
                <motion.img
                    src={image}
                    alt={title}
                    className="w-full h-[180px] sm:h-[200px] object-cover rounded-lg"
                    whileHover={{
                        scale: 1.05,
                        transition: {
                            duration: 0.3,
                            ease: "easeOut"
                        }
                    }}/>
            </div>
        </motion.div>
    )
}