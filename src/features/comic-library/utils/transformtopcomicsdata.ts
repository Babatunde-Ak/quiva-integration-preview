import { TopComic } from "../components/TopComicsTable"

interface ApiComic {
    _id: string
    creatorId: {
        _id: string
        walletAddress: string
        avatar?: string
    }
    title: string
    description: string
    coverImage: string
    coverImageCid: string
    genre: string[]
    tags: string[]
    chapters: Array<{
        _id: string
        chapterNumber: number
        title: string
        pages: Array<{
        _id: string
        pageNumber: number
        imageUrl: string
        }>
        createdAt: string
    }>
    totalPages: number
    status: string
    publishType: 'free' | 'nft'
    views: number
    likes: number
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
        .filter(comic => comic.publishType === 'nft') // Only NFT comics
        .map((comic, index) => ({
            rank: index + 1,
            title: comic.title,
            author: comic.creatorId.walletAddress.slice(0, 6) + '...' + comic.creatorId.walletAddress.slice(-4), // Shortened wallet address
            floorPrice: generateMockFloorPrice(), // Since API doesn't provide this, generate mock data
            priceChange: generateMockPriceChange(), // Since API doesn't provide this, generate mock data
            copies: comic.totalPages * 100, // Mock calculation based on total pages
            sales: comic.views || Math.floor(Math.random() * 100), // Use views or generate mock data
            volume: generateMockVolume(), // Since API doesn't provide this, generate mock data
            image: comic.coverImage
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