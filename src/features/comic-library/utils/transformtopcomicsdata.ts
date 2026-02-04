// utils/transformTopComicsData.ts

import { TopComic } from "../components/TopComicsTable"

interface ApiComic {
    _id: string
    creatorId: {
        _id: string
        walletAddress: string
        username?: string
        avatar?: string
    }
    collectionId: string
    title: string
    coverImageCid: string
    episodeNumber: number
    summary: string
    bannerImage: string
    maturityRating: string
    collaborators: Array<{
        _id: string
        walletAddress: string
    }>
    genre: string[]
    tags: string[]
    chapters: Array<{
        _id: string
        chapterNumber: number
        title: string
        pages: any[]
        createdAt: string
    }>
    totalPages: number
    status: string
    views: number
    likes: number
    isMinted: boolean
    isPublished?: boolean
    isVisible: boolean
    createdAt: string
    updatedAt: string
    __v: number
    nftId?: string
    nftMetadataCid?: string
}

/**
 * Transform API comic data to TopComic format for the TopComicsTable component
 */
export function transformApiComicsToTopComics(apiComics: ApiComic[]): TopComic[] {
    return apiComics
        .map((comic, index) => ({
            rank: index + 1,
            title: comic.title,
            author: comic.creatorId.username || 
                    (comic.creatorId.walletAddress.slice(0, 6) + '...' + comic.creatorId.walletAddress.slice(-4)),
            floorPrice: generateMockFloorPrice(),
            priceChange: generateMockPriceChange(),
            copies: comic.totalPages * 100, // Mock calculation based on total pages
            sales: comic.views || Math.floor(Math.random() * 100),
            volume: generateMockVolume(),
            image: comic.bannerImage,
            id: comic._id
        }))
        .slice(0, 10) // Limit to top 10
}

/**
 * Generate mock floor price (since not available in API)
 */
function generateMockFloorPrice(): string {
    const prices = ['0.05', '0.1', '0.15', '0.2', '0.25', '0.3', '0.4', '0.5']
    return prices[Math.floor(Math.random() * prices.length)]
}

/**
 * Generate mock price change percentage (since not available in API)
 */
function generateMockPriceChange(): number {
    return Math.floor(Math.random() * 200) - 100 // Random number between -100 and 100
}

/**
 * Generate mock volume (since not available in API)
 */
function generateMockVolume(): string {
    const volumes = ['1.2', '2.4', '3.6', '4.8', '5.1', '6.3', '7.5', '8.7']
    return volumes[Math.floor(Math.random() * volumes.length)]
}