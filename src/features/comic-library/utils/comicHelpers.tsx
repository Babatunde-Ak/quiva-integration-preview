// utils/comicHelpers.ts

import { Comic } from './transformComicData'

/**
 * Ensures that any comic-like object conforms to the Comic interface
 * This is useful for working with sample/mock data that might not have all fields
 */
export function normalizeComic(comic: Partial<Comic> & { id: string; title: string; image: string }): Comic {
    return {
        // Required base fields
        id: comic.id,
        title: comic.title,
        image: comic.image,
        
        // Optional fields with defaults
        description: comic.description,
        subtitle: comic.subtitle,
        price: comic.price,
        premium: comic.premium ?? false,
        buttonText: comic.buttonText ?? 'View',
        buttonVariant: comic.buttonVariant ?? 'default',
        
        // All other optional fields
        episodeNumber: comic.episodeNumber,
        summary: comic.summary,
        bannerImage: comic.bannerImage,
        coverImageCid: comic.coverImageCid,
        creatorId: comic.creatorId,
        creatorWalletAddress: comic.creatorWalletAddress,
        creatorUsername: comic.creatorUsername,
        creatorAvatar: comic.creatorAvatar,
        collectionId: comic.collectionId,
        isMinted: comic.isMinted,
        isPublished: comic.isPublished,
        isVisible: comic.isVisible,
        nftId: comic.nftId,
        nftMetadataCid: comic.nftMetadataCid,
        genre: comic.genre,
        tags: comic.tags,
        maturityRating: comic.maturityRating,
        chapters: comic.chapters,
        totalPages: comic.totalPages,
        collaborators: comic.collaborators,
        status: comic.status,
        views: comic.views,
        likes: comic.likes,
        createdAt: comic.createdAt,
        updatedAt: comic.updatedAt,
        __v: comic.__v
    }
}

/**
 * Normalizes an array of comics
 */
export function normalizeComics(comics: Array<Partial<Comic> & { id: string; title: string; image: string }>): Comic[] {
    return comics.map(normalizeComic)
}