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

export interface ComicMarketStats {
    sales: number
    volume: number
}

/**
 * Transform API comic data to TopComic format for the TopComicsTable component.
 *
 * `stats` carries the real figures, keyed by comic id. Sales used to be the comic's view count -
 * which is why a comic with ten copies could report hundreds of sales - and volume was picked at
 * random from a hard-coded list on every render. A comic with no purchases yet reports zero;
 * nothing here invents a number.
 */
export function transformApiComicsToTopComics(
    apiComics: ApiComic[],
    stats: Record<string, ComicMarketStats> = {}
): TopComic[] {
    return apiComics
        .map((comic, index) => {
            const walletAddr = comic.creatorId.walletAddress
            const author = comic.creatorId.username ||
                (walletAddr.slice(0, 6) + '...' + walletAddr.slice(-4))

            const floorPrice = comic.nftId?.price != null
                ? String(comic.nftId.price)
                : '—'

            const maxSupply = comic.nftId?.maxSupply ?? 0
            const comicStats = stats[comic._id]

            return {
                id: comic._id,
                rank: index + 1,
                title: comic.title,
                author,
                floorPrice,
                // Nothing records a historical floor price, so a change against "24h ago" cannot
                // be computed. The column hides itself rather than showing an invented swing.
                priceChange: undefined,
                copies: maxSupply,
                sales: comicStats?.sales ?? 0,
                // Trimmed to two decimals, then of trailing zeros: 7.5 rather than 7.50.
                volume: String(Number((comicStats?.volume ?? 0).toFixed(2))),
                image: comic.bannerImage,
            }
        })
        .slice(0, 10)
}
