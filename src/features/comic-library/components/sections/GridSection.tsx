'use client'

import React, {useRef, useState} from 'react'
import {Skeleton} from '@/components/ui/skeleton'
import {motion} from 'framer-motion'
import CollectionCard from '@/components/cards/TopSellingCard'

const FILTERS = [
    {
        id: 'trending',
        label: 'Trending'
    }, {
        id: 'popular',
        label: 'Popular'
    }
]

interface Comic {
    id : string
    title : string
    subtitle?: string
    price?: string
    description?: string
    image : string
    premium?: boolean
    buttonText?: string
    buttonVariant?: 'default' | 'outline'
}

interface ComicSectionProps {
    title : string
    subtitle?: string
    comics : Comic[]
    showNavigation?: boolean
    cardSize?: 'small' | 'medium' | 'large'
    isLoading?: boolean,
    onFilterChange?: (filter : string) => void
    defaultFilter?: string
    filters?: {
        id: string 
        label: string
    }[]
}

export function GridSection({
    title,
    subtitle,
    comics,
    showNavigation = true,
    cardSize = "medium",
    isLoading = false,
    filters = FILTERS,
    onFilterChange,
    defaultFilter = 'trending'
} : ComicSectionProps) {

    const [activeFilter,
        setActiveFilter] = useState < string > (defaultFilter)

    const handleFilterChange = (filter : string) => {
        setActiveFilter(filter)
        onFilterChange
            ?.(filter)
    }

    const getSkeletonWidth = () => {
        switch (cardSize) {
            case 'small':
                return 'w-[200px]'
            case 'large':
                return 'w-[320px]'
            default:
                return 'w-[280px]'
        }
    }

    const getSkeletonHeight = () => {
        switch (cardSize) {
            case 'small':
                return 'h-[280px]'
            case 'large':
                return 'h-[420px]'
            default:
                return 'h-[350px]'
        }
    }

    return (
        <section className="my-8 mt-12 w-full max-w-full">
            {/* Section Header */}
            <div className="flex flex-wrap gap-2 items-center justify-between mb-4 w-full">

                <div className="flex flex-col space-y-4">
                    {/* Header Section */}
                    <div className="space-y-2">
                        <h2 className="text-white text-xl font-semibold">
                            {title}
                        </h2>
                        <p className="text-white/50 text-sm font-light">
                            {subtitle}
                        </p>
                    </div>

                    {/* Filter Buttons - Mapped from constant */}
                    <div className="flex gap-2">
                        {filters.map((filter) => (
                            <motion.button
                                key={filter.id}
                                onClick={() => handleFilterChange(filter.id)}
                                className={`px-1 py-1 text-sm font-light rounded-lg border-[0.6px] transition-all duration-200 ${activeFilter === filter.id
                                ? ' text-white border-white'
                                : 'text-white border-black-50 hover:border-white'}`}
                                whileHover={{
                                scale: 1.02
                            }}
                                whileTap={{
                                scale: 0.98
                            }}>
                                {filter.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Comics Grid - Simple horizontal scroll within container */}
            <div className="w-full max-w-full overflow-hidden relative">
                <div
                    className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">

                    {isLoading
                        ? (
                        // Skeleton Loading State
                        Array.from({length: 4}).map((_, index) => (
                            <div key={index} className={`flex-shrink-0 ${getSkeletonWidth()}`}>
                                <div className="space-y-3">
                                    <Skeleton
                                        className={`${getSkeletonWidth()} ${getSkeletonHeight()} rounded-lg bg-white/20`}/>
                                    <Skeleton className="h-4 w-3/4 bg-white/20"/>
                                    <Skeleton className="h-3 w-1/2 bg-white/20"/>
                                    <Skeleton className="h-9 w-full bg-white/20"/>
                                </div>
                            </div>
                        )))
                        : (
                        // Actual Comics
                        comics.map((comic, index) => (
                            <div key={comic.id} className="flex-shrink-0">
                                <CollectionCard
                                    id={comic.id}
                                    name={comic.title}
                                    sales={500}
                                    image={comic.image}
                                    percentageChange={5.2}
                                    rank={index + 1}/>
                            </div>
                        )))}
                </div>
            </div>
        </section>
    )
}