// utils/transformComicData.ts

interface ApiComic {
    _id: string
    creatorId: {
        _id: string
        walletAddress: string
        username?: string
        avatar?: string
    }
    price?: string
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
    // Basic Info
    episodeNumber?: number
    summary?: string
    price?: string
    
    // Images
    bannerImage?: string
    coverImageCid?: string
    
    // Creator Info
    creatorId?: string
    creatorWalletAddress?: string
    creatorUsername?: string
    creatorAvatar?: string
    
    // Collection & NFT Info
    collectionId?: string
    isMinted?: boolean
    isPublished?: boolean
    isVisible?: boolean
    nftId?: string
    nftMetadataCid?: string
    
    // Metadata
    genre?: string[]
    tags?: string[]
    maturityRating?: string
    
    // Chapters & Pages
    chapters?: Array<{
        _id: string
        chapterNumber: number
        title: string
        pages: any[]
        createdAt: string
    }>
    totalPages?: number
    
    // Collaborators
    collaborators?: Array<{
        _id: string
        walletAddress: string
    }>
    
    // Status & Metrics
    status?: string
    views?: number
    likes?: number
    
    // Dates
    createdAt?: string
    updatedAt?: string
    
    // Version
    __v?: number
}

export type { Comic, BaseComic, ApiComic }

export function transformApiComicToComic(apiComic: ApiComic): Comic {
    return {
        // Base/Required Fields
        id: apiComic._id,
        title: apiComic.title,
        image: apiComic.bannerImage,
        description: apiComic.summary,
        subtitle: apiComic.genre.join(', '),
        premium: apiComic.isMinted,
        price: apiComic?.price ? apiComic?.price : "1",
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
        genre: apiComic.genre,
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
        
        // Version
        __v: apiComic.__v
    }
}

export function transformApiComicsToComics(apiComics: ApiComic[]): Comic[] {
    return apiComics.map(transformApiComicToComic)
}