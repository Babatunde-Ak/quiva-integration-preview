'use client'

import React, { useState } from 'react'
import { ChevronDown, ListFilter, Zap, CircleDollarSign, LayoutGrid } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ComicCard } from '@/components/cards/ComicCard'
import { motion } from 'framer-motion'
import { Comic } from '../../utils/transformComicData'

const FILTERS = [
    { id: 'category', label: 'Category', icon: <LayoutGrid size={20} /> },
    { id: 'price', label: 'Price Range', icon: <CircleDollarSign size={20} /> },
    { id: 'sale', label: 'Sale Type', icon: <Zap size={20}/> }
]

const SORT_OPTIONS = [
    { id: 'recent', label: 'Recently Added' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' }
]


interface MarketplaceComicsProps {
    title: string
    comics: Comic[]
    isLoading?: boolean
    onFilterChange?: (filterId: string) => void
    onSortChange?: (sortId: string) => void
    defaultSort?: string
}

export function SortComicSection({
    title,
    comics,
    isLoading = false,
    onFilterChange,
    onSortChange,
    defaultSort = 'recent'
}: MarketplaceComicsProps) {

    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [currentSort, setCurrentSort] = useState(defaultSort)
    const [showSortDropdown, setShowSortDropdown] = useState(false)

    const handleFilterToggle = (filterId: string) => {
        const newFilters = activeFilters.includes(filterId)
            ? activeFilters.filter(id => id !== filterId)
            : [...activeFilters, filterId]
        
        setActiveFilters(newFilters)
        onFilterChange?.(filterId)
    }

    const handleSortChange = (sortId: string) => {
        setCurrentSort(sortId)
        setShowSortDropdown(false)
        onSortChange?.(sortId)
    }

    const getSortLabel = () => {
        return SORT_OPTIONS.find(option => option.id === currentSort)?.label || 'Recently Added'
    }

    return (
        <section className="w-full max-w-full my-8 mt-12 px-4 sm:px-6 lg:px-0">
            {/* Section Header */}
            <div className="mb-6">
                <h1 className="text-white text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                    {title}
                </h1>

                {/* Filters and Sort Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                        {FILTERS.map((filter) => (
                            <motion.button
                                key={filter.id}
                                onClick={() => handleFilterToggle(filter.id)}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                                    activeFilters.includes(filter.id)
                                        ? 'text-white border-white'
                                        : 'bg-transparent text-white border-black-50 hover:border-white'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="hidden sm:inline">{filter.icon}</span>
                                <span className="truncate">{filter.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center justify-between sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-black-200 text-white text-xs sm:text-sm rounded-lg hover:bg-black-100 transition-colors border border-black-50 w-full sm:w-auto min-w-0"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="hidden sm:inline">
                                    <ListFilter size={16} className="text-white" />
                                </span>
                                <span className="truncate">
                                    Sort By: <span className="hidden sm:inline">{getSortLabel()}</span>
                                    <span className="sm:hidden">{getSortLabel().split(':')[0]}</span>
                                </span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform flex-shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showSortDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-black-200 border border-black-50 rounded-lg shadow-xl z-20"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleSortChange(option.id)}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-black-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                            currentSort === option.id ? 'text-white bg-black-50' : 'text-white/70'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comics Grid */}
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 h-[28rem] sm:h-[32rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {isLoading ? (
                        // Skeleton Loading State
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="w-full">
                                <div className="space-y-3">
                                    <Skeleton className="w-full h-[200px] sm:h-[260px] rounded-lg bg-white/10" />
                                    <div className="p-3 sm:p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/10" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3 w-12 bg-white/10" />
                                                <Skeleton className="h-4 w-16 bg-white/10" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-2 sm:gap-3">
                                                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 bg-white/10" />
                                                <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 bg-white/10" />
                                                <Skeleton className="h-4 w-14 sm:w-16 bg-white/10" />
                                            </div>
                                            <Skeleton className="h-4 w-16 sm:w-20 bg-white/10" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Actual Comics
                        comics.map((comic, index) => (
                            <motion.div
                                key={comic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <ComicCard 
                                    id={comic.id}
                                    title={comic.title}
                                    creator={comic?.creatorUsername || ""}
                                    creatorUsername={comic?.creatorUsername || ""}
                                    creatorAvatar={comic.creatorAvatar}
                                    currentPrice={comic.price}
                                    views={comic.views}
                                    image={comic.image}
                                    premium={comic.premium}
                                    free={comic.premium ? false : true}
                                    number={index + 1}
                                    isLiked={false}
                                    likes={comic.likes}
                                />
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showSortDropdown && (
                <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortDropdown(false)}
                />
            )}
        </section>
    )
}