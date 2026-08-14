'use client'

import {motion} from 'framer-motion'
import {TrendingUp, TrendingDown} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CollectionRankingCardProps {
    id: string
    rank : number
    name : string
    image : string
    sales : number
    percentageChange : number
    isPositive?: boolean
}

export function CollectionCard({
    id,
    rank,
    name,
    image,
    sales,
    percentageChange,
    isPositive = true
} : CollectionRankingCardProps) {

    const router =  useRouter()

    const formatPercentage = (value : number) => {
        const sign = isPositive
            ? '+'
            : '-'
        return `${sign}${Math
            .abs(value)
            .toFixed(2)}%`
    }

    return (
        <motion.div
            className="flex items-center gap-4 p-3 border-b-[0.6px] border-black-50 bg-transparent rounded-lg hover:bg-black-200 transition-all duration-200 cursor-pointer"
            whileHover={{
                scale: 1.02
            }}
            whileTap={{
                scale: 0.98
            }} 
            onClick={() => router.push(`/marketplace/chapter?id=${id}`)}
        >
            {/* Rank Number */}
            <div className="flex-shrink-0">
                <span className="text-white text-lg font-bold w-6 text-left">
                    {rank}
                </span>
            </div>

            {/* Collection Image */}
            <div className="flex-shrink-0">
                <img src={image} alt={name} className="w-12 h-12 rounded-lg object-cover"/>
            </div>

            {/* Collection Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-white text-lg font-semibold truncate">
                    {name}
                </h3>
                <p className="text-white text-sm font-light">
                    {sales}
                    {' '}
                    Sales
                </p>
            </div>

            {/* Percentage Change */}
            <div className="flex-shrink-0 flex items-center gap-1">
                {isPositive
                    ? (<TrendingUp size={16} className="text-green-400"/>)
                    : (<TrendingDown size={16} className="text-red-400"/>)}
                <span
                    className={`text-sm font-medium ${isPositive
                    ? 'text-green-400'
                    : 'text-red-400'}`}>
                    {formatPercentage(percentageChange)}
                </span>
            </div>
        </motion.div>
    )
}
export default CollectionCard;
