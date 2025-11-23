'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Comic {
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
  onComicSelect?: (comic: Comic) => void
  placeholder?: string
  className?: string
}

// Mock data - replace with your actual data
const mockTrendingSearches: TrendingItem[] = [
  { id: '1', title: 'Black Cover', image: '/api/placeholder/40/40', percentageChange: 8.40 },
  { id: '2', title: 'Black Cover', image: '/api/placeholder/40/40', percentageChange: 8.40 },
  { id: '3', title: 'Black Cover', image: '/api/placeholder/40/40', percentageChange: 8.40 },
  { id: '4', title: 'Black Cover', image: '/api/placeholder/40/40', percentageChange: 8.40 },
  { id: '5', title: 'Black Cover', image: '/api/placeholder/40/40', percentageChange: 8.40 }
]

const mockTrendingGenres = [
  { id: '1', title: 'Action', percentageChange: 8.40 },
  { id: '2', title: 'Horror', percentageChange: 8.40 },
  { id: '3', title: 'Sci-Fi', percentageChange: 8.40 },
  { id: '4', title: 'Romance', percentageChange: 6.20 },
  { id: '5', title: 'Comedy', percentageChange: 4.80 }
]

const mockSearchResults: Comic[] = [
  {
    id: '1',
    title: 'Black Cover',
    creator: 'Artist Name',
    image: '/api/placeholder/60/60',
    floorPrice: '4.89',
    totalSupply: 500,
    volume24h: '300K',
    sales: 50,
    percentageChange: 4.60
  },
  {
    id: '2',
    title: 'Black Cover',
    creator: 'Artist Name',
    image: '/api/placeholder/60/60',
    floorPrice: '4.89',
    totalSupply: 500,
    volume24h: '300K',
    sales: 50,
    percentageChange: 4.60
  },
  {
    id: '3',
    title: 'Black Cover',
    creator: 'Artist Name',
    image: '/api/placeholder/60/60',
    floorPrice: '4.89',
    totalSupply: 500,
    volume24h: '300K',
    sales: 50,
    percentageChange: 4.60
  }
]

export function SearchBar({ 
  onSearch, 
  onComicSelect, 
  placeholder = "Search name, genre, creator, collection",
  className = ""
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Comic[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setSearchResults([])
        setIsSearching(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputFocus = () => {
    setIsOpen(true)
    if (!searchQuery) {
      setIsSearching(false)
      setSearchResults([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      setIsSearching(true)
      // Simulate search - replace with actual search logic
      setTimeout(() => {
        setSearchResults(mockSearchResults.filter(comic => 
          comic.title.toLowerCase().includes(value.toLowerCase())
        ))
      }, 300)
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
    
    onSearch?.(value)
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    inputRef.current?.focus()
  }

  const handleTrendingClick = (title: string) => {
    setSearchQuery(title)
    setIsSearching(true)
    setSearchResults(mockSearchResults)
  }

  const handleComicClick = (comic: Comic) => {
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
    setIsSearching(false)
    onComicSelect?.(comic)
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="bg-black-200 font-light border border-gray-300 rounded-full pl-10 pr-12 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
        />
        {(searchQuery || isOpen) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {!isSearching ? (
              // Trending Content
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trending Search */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Trending Search
                    </h3>
                    <div className="space-y-2">
                      {mockTrendingSearches.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleTrendingClick(item.title)}
                          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">D</span>
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white text-sm">{item.title}</p>
                          </div>
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <TrendingUp size={12} />
                            <span>{item.percentageChange}%</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Genres */}
                  <div>
                    <h3 className="text-white text-sm font-medium mb-3">
                      Trending Genres
                    </h3>
                    <div className="space-y-2">
                      {mockTrendingGenres.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => handleTrendingClick(genre.title)}
                          className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">📚</span>
                            </div>
                            <span className="text-white text-sm">{genre.title}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-400 text-xs">
                            <TrendingUp size={12} />
                            <span>{genre.percentageChange}%</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Search Results
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found under "{searchQuery}"
                  </h3>
                </div>
                
                {/* Results Header */}
                <div className="grid grid-cols-12 gap-3 text-gray-400 text-xs font-medium border-b border-gray-700 pb-2 mb-3">
                  <div className="col-span-1">#</div>
                  <div className="col-span-3">Collection</div>
                  <div className="col-span-2">Floor Price</div>
                  <div className="col-span-2">Total Supply</div>
                  <div className="col-span-2">24h Volume</div>
                  <div className="col-span-2">Sales</div>
                </div>

                {/* Results List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((comic, index) => (
                    <button
                      key={comic.id}
                      onClick={() => handleComicClick(comic)}
                      className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
                    >
                      <div className="col-span-1 text-white text-sm">{index + 1}</div>
                      
                      <div className="col-span-3 flex items-center gap-3">
                        <img 
                          src={comic.image} 
                          alt={comic.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="text-left">
                          <p className="text-white text-sm font-medium">{comic.title}</p>
                          <p className="text-gray-400 text-xs">{comic.creator}</p>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <span className="text-white text-sm">{comic.floorPrice}</span>
                          <span className="text-green-400 text-xs">▲ {comic.percentageChange}%</span>
                        </div>
                        <span className="text-gray-400 text-xs">HBAR</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-white text-sm">{comic.totalSupply.toLocaleString()}</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-white text-sm">{comic.volume24h} H</span>
                      </div>
                      
                      <div className="col-span-2">
                        <span className="text-white text-sm">{comic.sales}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
