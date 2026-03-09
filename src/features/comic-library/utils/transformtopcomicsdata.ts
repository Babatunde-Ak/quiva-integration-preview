// utils/transformTopComicsData.ts

import { TopComic } from "../components/TopComicsTable"

interface NFTId {
    _id: string
    price: number
    metadataCid: string
    tokenId: string
    contractAddress: string
    maxSupply: number
    campaignType: string
    campaignId: string
    listingId: string
    metadataTopicIds: string
    transactionId: string
}

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
        username?: string
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
    nftId?: NFTId
    nftMetadataCid?: string
}

/**
 * Transform API comic data to TopComic format for the TopComicsTable component
 */
export function transformApiComicsToTopComics(apiComics: ApiComic[]): TopComic[] {
    return apiComics
        .map((comic, index) => {
            const walletAddr = comic.creatorId.walletAddress
            const author = comic.creatorId.username ||
                (walletAddr.slice(0, 6) + '...' + walletAddr.slice(-4))

            const floorPrice = comic.nftId?.price != null
                ? String(comic.nftId.price)
                : '—'

            const maxSupply = comic.nftId?.maxSupply ?? 0

            return {
                id: comic._id,
                rank: index + 1,
                title: comic.title,
                author,
                floorPrice,
                priceChange: generateMockPriceChange(),
                copies: maxSupply,
                sales: comic.views || 0,
                volume: generateMockVolume(),
                image: comic.bannerImage,
            }
        })
        .slice(0, 10)
}

function generateMockPriceChange(): number {
    return Math.floor(Math.random() * 200) - 100
}

function generateMockVolume(): string {
    const volumes = ['1.2', '2.4', '3.6', '4.8', '5.1', '6.3', '7.5', '8.7']
    return volumes[Math.floor(Math.random() * volumes.length)]
}
