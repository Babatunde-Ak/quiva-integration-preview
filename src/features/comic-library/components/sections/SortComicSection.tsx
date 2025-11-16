'use client'

import React, { useState } from 'react'
import { ChevronDown, ListFilter, Zap, CircleDollarSign, LayoutGrid } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ComicCard } from '@/components/cards/ComicCard'
import { motion } from 'framer-motion'

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

interface Comic {
    id: string
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
}

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
        <section className="w-full max-w-full my-8 mt-12">
            {/* Section Header */}
            <div className="mb-6">
                <h1 className="text-white text-2xl font-semibold mb-6">
                    {title}
                </h1>

                {/* Filters and Sort Row */}
                <div className="flex items-center justify-between w-full">
                    {/* Filter Buttons */}
                    <div className="flex gap-3">
                        {FILTERS.map((filter) => (
                            <motion.button
                                key={filter.id}
                                onClick={() => handleFilterToggle(filter.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                                    activeFilters.includes(filter.id)
                                        ? 'text-white border-white'
                                        : 'bg-transparent text-white border-black-50 hover:border-white'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span>{filter.icon}</span>
                                {filter.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-black-200 text-white text-sm rounded-lg hover:bg-black-100 transition-colors border border-black-50"
                        >
                            <span><ListFilter size={16} className="text-white" /></span>
                            <span>Sort By: {getSortLabel()}</span>
                            <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showSortDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-black-200 border border-black-50 rounded-lg shadow-xl z-10"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-[32rem] overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        // Skeleton Loading State
                        Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="w-full">
                                <div className="space-y-3">
                                    <Skeleton className="w-full h-[260px] rounded-lg bg-white/10" />
                                    <div className="p-4 space-y-3">
                                        <Skeleton className="h-5 w-3/4 bg-white/10" />
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-8 w-8 rounded-full bg-white/10" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3 w-12 bg-white/10" />
                                                <Skeleton className="h-4 w-16 bg-white/10" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-3">
                                                <Skeleton className="h-6 w-6 bg-white/10" />
                                                <Skeleton className="h-6 w-6 bg-white/10" />
                                                <Skeleton className="h-4 w-16 bg-white/10" />
                                            </div>
                                            <Skeleton className="h-4 w-20 bg-white/10" />
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
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <ComicCard 
                                    id={comic.id}
                                    title={comic.title}
                                    creator={comic.creator}
                                    creatorAvatar={comic.creatorAvatar}
                                    mintPrice={comic.mintPrice}
                                    currentPrice={comic.currentPrice}
                                    views={comic.views}
                                    image={comic.image}
                                    premium={comic.premium}
                                    free={comic.free}
                                    number={index+1}
                                    isLiked={comic.isLiked}
                                />
                            </motion.div>
                        ))
                    )}
                </div>

            </div>

            {/* Click outside to close dropdown */}
            {showSortDropdown && (
                <div 
                    className="fixed inset-0 z-5" 
                    onClick={() => setShowSortDropdown(false)}
                />
            )}
        </section>
    )
}
