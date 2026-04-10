'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppSelector } from '@/redux/hook'
import { transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData'
import { formatNumberShorthand } from '@/lib/Formatnumber'

interface SearchComic {
  id: string
  title: string
  creator: string
  image: string
  floorPrice: string
  totalSupply: number
  volume24h: string
  sales: number
  percentageChange: number
}

interface TrendingItem {
  id: string
  title: string
  image: string
  percentageChange: number
}

interface SearchBarProps {
  onSearch?: (query: string) => void
  onComicSelect?: (comic: SearchComic) => void
  placeholder?: string
  className?: string
}

const mockTrendingGenres = [
  { id: '1', title: 'Action', percentageChange: 8.40 },
  { id: '2', title: 'Horror', percentageChange: 8.40 },
  { id: '3', title: 'Sci-Fi', percentageChange: 8.40 },
  { id: '4', title: 'Romance', percentageChange: 6.20 },
  { id: '5', title: 'Comedy', percentageChange: 4.80 },
]

export function SearchBar({
  onSearch,
  onComicSelect,
  placeholder = "Search name, genre, creator, collection",
  className = "",
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchComic[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalInputRef = useRef<HTMLInputElement>(null)

  // Pull comics from Redux
  const rawComics = useAppSelector((state: any) => state.comic.comics)

  // Transform and map to SearchComic shape
  const allComics: SearchComic[] = useMemo(() => {
    const data = rawComics?.data?.comics?.data
    if (!data) return []
    return transformApiComicsToComics(data).map(c => ({
      id: c.id,
      title: c.title,
      creator: c.creatorUsername || (c.creatorWalletAddress
        ? `${c.creatorWalletAddress.slice(0, 6)}...${c.creatorWalletAddress.slice(-4)}`
        : 'Creator'),
      image: c.image || '',
      floorPrice: c.price ?? '0',
      totalSupply: (c.nftId as any)?.maxSupply ?? 0,
      volume24h: c.views ? formatNumberShorthand(c.views) : '0',
      sales: c.likes ?? 0,
      percentageChange: 0,
    }))
  }, [rawComics])

  // Trending = top 5 by views
  const trendingComics: TrendingItem[] = useMemo(() => {
    return [...allComics]
      .sort((a, b) => Number(b.volume24h) - Number(a.volume24h))
      .slice(0, 5)
      .map(c => ({ id: c.id, title: c.title, image: c.image, percentageChange: c.percentageChange }))
  }, [allComics])

  // Focus modal input when it opens
  useEffect(() => {
    if (isOpen) setTimeout(() => modalInputRef.current?.focus(), 50)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim()) {
      setIsSearching(true)
      const q = value.toLowerCase()
      setSearchResults(
        allComics.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.creator.toLowerCase().includes(q)
        )
      )
    } else {
      setIsSearching(false)
      setSearchResults([])
    }

    onSearch?.(value)
  }

  const handleTrendingClick = (title: string) => {
    setSearchQuery(title)
    setIsSearching(true)
    const q = title.toLowerCase()
    setSearchResults(allComics.filter(c => c.title.toLowerCase().includes(q)))
    onSearch?.(title)
  }

  const handleComicClick = (comic: SearchComic) => {
    handleClose()
    onComicSelect?.(comic)
  }

  return (
    <>
      {/* Trigger input */}
      <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(true)}
          className="bg-black-200 font-light border border-gray-300 rounded-full pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none w-full text-sm cursor-pointer"
        />
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-[580px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Search header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Search className="text-white/50 w-4 h-4 shrink-0" />
                <input
                  ref={modalInputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
                />
                <button
                  onClick={handleClose}
                  className="text-white/50 hover:text-white transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-[420px] overflow-y-auto">
                {!isSearching ? (
                  // Trending
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trending Search */}
                    <div>
                      <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp size={13} /> Trending Search
                      </h3>
                      <div className="space-y-1">
                        {trendingComics.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleTrendingClick(item.title)}
                            className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-8 h-8 rounded-md object-cover bg-white/10"
                            />
                            <span className="flex-1 text-left text-white text-sm truncate">{item.title}</span>
                            <span className="text-green-400 text-xs flex items-center gap-0.5 shrink-0">
                              <TrendingUp size={11} />
                              {item.percentageChange}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending Genres */}
                    <div>
                      <h3 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
                        Trending Genres
                      </h3>
                      <div className="space-y-1">
                        {mockTrendingGenres.map(genre => (
                          <button
                            key={genre.id}
                            onClick={() => handleTrendingClick(genre.title)}
                            className="flex items-center justify-between w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-sm">
                                📚
                              </div>
                              <span className="text-white text-sm">{genre.title}</span>
                            </div>
                            <span className="text-green-400 text-xs flex items-center gap-0.5">
                              <TrendingUp size={11} />
                              {genre.percentageChange}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Search Results
                  <div className="p-5">
                    <p className="text-white/50 text-xs mb-4">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found under &quot;{searchQuery}&quot;
                    </p>

                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 text-white/40 text-[11px] font-medium pb-2 mb-1 border-b border-white/10 px-2">
                      <div />
                      <div>Floor Price</div>
                      <div>Total Supply</div>
                      <div>24h Volume</div>
                      <div>Sale</div>
                    </div>

                    {searchResults.length === 0 ? (
                      <p className="text-white/30 text-sm text-center py-8">No results found</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map(comic => (
                          <button
                            key={comic.id}
                            onClick={() => handleComicClick(comic)}
                            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center w-full px-2 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            {/* Title + image */}
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={comic.image}
                                alt={comic.title}
                                className="w-10 h-10 rounded-md object-cover bg-white/10 shrink-0"
                              />
                              <span className="text-white text-sm font-medium truncate">{comic.title}</span>
                            </div>

                            {/* Floor Price */}
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-1">
                                <span className="text-white text-sm">{comic.floorPrice}</span>
                                <span className="text-white/40 text-xs">H</span>
                              </div>
                              {comic.percentageChange > 0 && (
                                <span className="text-green-400 text-[11px]">▲ {comic.percentageChange}%</span>
                              )}
                            </div>

                            {/* Total Supply */}
                            <div className="text-white text-sm font-medium">{comic.totalSupply.toLocaleString()}</div>

                            {/* 24h Volume */}
                            <div className="flex items-center gap-1">
                              <span className="text-white text-sm">{comic.volume24h}</span>
                              <span className="text-white/40 text-xs">H</span>
                            </div>

                            {/* Sale */}
                            <div className="text-white text-sm font-medium">{comic.sales}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
