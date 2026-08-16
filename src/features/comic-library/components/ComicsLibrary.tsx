'use client'

import {ComicCard} from "@/components/cards/ComicCard"
import {ChevronDown, Loader2} from "lucide-react"
import {useState, useEffect} from "react"
import EmptyState from "../utils/EmptyState"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getAllComics } from "@/redux/slices/comicSlice"
import { extractComicList, transformApiComicsToComics } from "../utils/transformComicData"

const ComicsLibrary = ({
    title = "All"
}) => {
    const dispatch = useAppDispatch()
    const { comics, isLoading } = useAppSelector((state: any) => state.comic)

    const [filterBy, setFilterBy] = useState("All")
    const [sortBy, setSortBy] = useState("Recently Added")

    useEffect(() => {
        dispatch(getAllComics())
    }, [dispatch])

    const filterOptions = ["All", "Premium", "Free", "Completed", "Reading"]
    const sortOptions = ["Recently Added", "Alphabetical", "Most Pages", "Oldest First"]

    // Transform API comics to the format expected by ComicCard
    const allComics = (() => {
        const comicsList = extractComicList(comics)
        if (!comicsList.length) return []
        try {
            return transformApiComicsToComics(comicsList)
        } catch {
            return comicsList
        }
    })()

    // Filter and sort logic
    const filteredAndSortedComics = allComics.filter((comic: any) => {
        if (filterBy === "All")
            return true
        if (filterBy === "Premium")
            return comic.premium || comic.isMinted
        if (filterBy === "Free")
            return !comic.premium && !comic.isMinted
        return true
    }).sort((a: any, b: any) => {
        switch (sortBy) {
            case "Alphabetical":
                return (a.title || '').localeCompare(b.title || '')
            case "Most Pages":
                return (b.totalPages || 0) - (a.totalPages || 0)
            case "Oldest First":
                return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            default: // Recently Added
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" />
                    <p className="text-white/60 text-sm">Loading comics...</p>
                </div>
            </div>
        )
    }

    return (
        <section className="space-y-6">
            {/* Header with Filters */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-white text-xl font-bold">{title}</h2>

                <div className="flex items-center space-x-4">
                    {/* Filter Dropdown */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">Filter By:</span>
                        <div className="relative">
                            <select
                                value={filterBy}
                                onChange={(e) => setFilterBy(e.target.value)}
                                className="bg-black-500 border border-gray-700 text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:border-orange-500 focus:outline-none appearance-none cursor-pointer">
                                {filterOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none"/>
                        </div>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">Sort By:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-3 py-1.5 pr-8 focus:border-orange-500 focus:outline-none appearance-none cursor-pointer">
                                {sortOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {filteredAndSortedComics.length === 0
                ? (<EmptyState/>)
                : (
                    <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12">
                        {filteredAndSortedComics.map((comic: any) => (<ComicCard key={comic.id} {...comic}/>))}
                    </div>
                )}
        </section>
    )
}


export default ComicsLibrary
