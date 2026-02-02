// utils/transformComicData.ts

interface ApiComic {
    _id : string
    title : string
    description : string
    bannerImage : string
    genre : string[]
    tags : string[]
    totalPages : number
    status : string
    publishType : 'free' | 'nft'
    views : number
    likes : number
    publishedAt : string
}

interface Comic {
    id : string
    title : string
    price?: string
    subtitle?: string
    description?: string
    image : string
    premium?: boolean
    buttonText?: string
    buttonVariant?: 'default' | 'outline'
}

export function transformApiComicToComic(apiComic : ApiComic) : Comic {
    return {
        id: apiComic._id,
        title: apiComic.title,
        description: apiComic.description,
        image: apiComic.bannerImage,
        subtitle: apiComic
            .genre
            .join(', '),
        premium: apiComic.publishType === 'nft',
        price: apiComic.publishType === 'nft'
            ? 'NFT'
            : 'Free',
        buttonText: apiComic.publishType === 'nft'
            ? 'Read Now'
            : 'Read Now',
        buttonVariant: apiComic.publishType === 'nft'
            ? 'default'
            : 'outline'
    }
}

export function transformApiComicsToComics(apiComics : ApiComic[]) : Comic[] {
    return apiComics.map(transformApiComicToComic)
}