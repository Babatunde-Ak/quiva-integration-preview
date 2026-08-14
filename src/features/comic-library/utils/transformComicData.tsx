// utils/transformComicData.ts

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

// Base interface with only required fields
interface BaseComic {
    id: string
    title: string
    image: string
    description?: string
    subtitle?: string
    price?: string
    premium?: boolean
    buttonText?: string
    buttonVariant?: 'default' | 'outline'
}

// Full interface with all API fields (all optional except base fields)
interface Comic extends BaseComic {
    episodeNumber?: number
    summary?: string

    bannerImage?: string
    coverImageCid?: string

    creatorId?: string
    creatorWalletAddress?: string
    creatorUsername?: string
    creatorAvatar?: string

    collectionId?: string
    isMinted?: boolean
    isPublished?: boolean
    isVisible?: boolean
    nftId?: NFTId
    nftMetadataCid?: string

    genre?: string[]
    tags?: string[]
    maturityRating?: string

    chapters?: Array<{
        _id: string
        chapterNumber: number
        title: string
        pages: any[]
        createdAt: string
    }>
    totalPages?: number

    collaborators?: Array<{
        _id: string
        walletAddress: string
        username?: string
    }>

    status?: string
    views?: number
    likes?: number

    createdAt?: string
    updatedAt?: string

    __v?: number
}

export type { Comic, BaseComic, ApiComic, NFTId }

function isComicArray(value: unknown): value is ApiComic[] {
    return Array.isArray(value)
}

export function extractComicList(payload: unknown): ApiComic[] {
    if (isComicArray(payload)) return payload

    if (!payload || typeof payload !== 'object') return []

    const root = payload as Record<string, any>
    const data = root.data
    const rootComics = root.comics
    const dataComics = data?.comics

    if (isComicArray(dataComics?.data)) return dataComics.data
    if (isComicArray(dataComics)) return dataComics
    if (isComicArray(rootComics?.data)) return rootComics.data
    if (isComicArray(rootComics)) return rootComics
    if (isComicArray(data?.data)) return data.data
    if (isComicArray(data)) return data

    return []
}

/**
 * Cleans genre strings that may be malformed JSON artifacts from the API
 * e.g. ["[\"action\"", "\"fantasy\"]"] → ["action", "fantasy"]
 */
function parseGenres(genre: string[]): string[] {
    return genre.flatMap((g) => {
        // Strip leading/trailing [ ] " and backslash escapes
        const cleaned = g.replace(/^\[?\\?"?|\\?"?\]?$/g, '').trim()
        return cleaned ? [cleaned] : []
    })
}

export function transformApiComicToComic(apiComic: ApiComic): Comic {
    const genres = parseGenres(apiComic.genre)
    const price = apiComic.nftId?.price != null
        ? `${apiComic.nftId.price}`
        : undefined

    return {
        // Base/Required Fields
        id: apiComic._id,
        title: apiComic.title,
        image: apiComic.bannerImage,
        description: apiComic.summary,
        subtitle: genres.join(', '),
        premium: apiComic.isMinted,
        price,
        buttonText: apiComic.isMinted ? 'View NFT' : 'Read Now',
        buttonVariant: apiComic.isMinted ? 'default' : 'outline',

        // Extended Fields
        episodeNumber: apiComic.episodeNumber,
        summary: apiComic.summary,
        bannerImage: apiComic.bannerImage,
        coverImageCid: apiComic.coverImageCid,

        // Creator Info
        creatorId: apiComic.creatorId._id,
        creatorWalletAddress: apiComic.creatorId.walletAddress,
        creatorUsername: apiComic.creatorId.username,
        creatorAvatar: apiComic.creatorId.avatar,

        // Collection & NFT Info
        collectionId: apiComic.collectionId,
        isMinted: apiComic.isMinted,
        isPublished: apiComic.isPublished,
        isVisible: apiComic.isVisible,
        nftId: apiComic.nftId,
        nftMetadataCid: apiComic.nftMetadataCid,

        // Metadata
        genre: genres,
        tags: apiComic.tags,
        maturityRating: apiComic.maturityRating,

        // Chapters & Pages
        chapters: apiComic.chapters,
        totalPages: apiComic.totalPages,

        // Collaborators
        collaborators: apiComic.collaborators,

        // Status & Metrics
        status: apiComic.status,
        views: apiComic.views,
        likes: apiComic.likes,

        // Dates
        createdAt: apiComic.createdAt,
        updatedAt: apiComic.updatedAt,

        __v: apiComic.__v
    }
}

export function transformApiComicsToComics(apiComics: ApiComic[]): Comic[] {
    return apiComics.map(transformApiComicToComic)
}
