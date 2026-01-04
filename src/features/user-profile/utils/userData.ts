// Updated mock data for different card types

const baseComicData = [
    {
        id: "comic_001",
        title: "Cyber Samurai Chronicles",
        description: "A thrilling cyberpunk adventure featuring ancient warriors in a futuristic world where tradition meets technology.",
        creator: "AkiraArt",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
        progress: 45,
        genres: ["Action", "Cyberpunk", "Sci-Fi"],
        mintPrice: "1,200",
        listingPrice: "2,500", 
        views: "4.89K",
        number: 1,
        isLiked: true,
        isListed: true
    },
    {
        id: "comic_002", 
        title: "Mystic Realms",
        description: "Journey through enchanted lands filled with magic, mythical creatures, and ancient secrets waiting to be discovered.",
        creator: "FantasyMaster",
        creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 20,
        genres: ["Fantasy", "Adventure", "Magic"],
        mintPrice: "800",
        listingPrice: "1,800",
        views: "3.2K", 
        number: 2,
        isLiked: false,
        isListed: false
    },
    {
        id: "comic_003",
        title: "Space Pirates Legacy",
        description: "Epic space adventures with rogues, rebels, and intergalactic treasures across the galaxy.",
        creator: "SpaceArt",
        creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=800&q=80",
        progress: 75,
        genres: ["Sci-Fi", "Adventure", "Action"],
        mintPrice: "1,500",
        listingPrice: "3,200",
        views: "6.1K",
        number: 3,
        isLiked: true,
        isListed: true
    },
    {
        id: "comic_004",
        title: "Urban Legends",
        description: "Modern mythology meets street art in this gripping urban fantasy series set in contemporary cities.",
        creator: "UrbanMyth",
        creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
        progress: 30,
        genres: ["Urban Fantasy", "Drama", "Mystery"],
        mintPrice: "900",
        listingPrice: "2,100",
        views: "2.8K",
        number: 4,
        isLiked: true,
        isListed: false
    },
    {
        id: "comic_005",
        title: "Mecha Warriors",
        description: "Giant robots and brave pilots defend humanity in this action-packed series full of mechanical wonders.",
        creator: "MechaStudio",
        creatorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=800&q=80",
        image: "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?auto=format&fit=crop&w=800&q=80",
        progress: 60,
        genres: ["Mecha", "Action", "Sci-Fi"],
        mintPrice: "1,800",
        listingPrice: "4,000",
        views: "7.5K",
        number: 5,
        isLiked: false,
        isListed: true
    }
];

export const mockUser = {
    id: "user_001",
    name: "Yuna",
    displayName: "Yuna Dean",
    avatar: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg",
    joinDate: "November 2024",
    bio: "I love to read fanfiction and action series. Passionate collector of NFT comics and digital art.",
    stats: {
        totalComics: 32,
        portfolioValue: 234096,
        mintedComics: 12
    }
};

export const mockUserComics = {
    currentReads: [
        baseComicData[0], // Cyber Samurai Chronicles - 45% progress
        baseComicData[2], // Space Pirates Legacy - 75% progress  
        baseComicData[4]  // Mecha Warriors - 60% progress
    ],
    mintedComics: [
        baseComicData[1], // Mystic Realms
        baseComicData[3]  // Urban Legends
    ],
    favoriteComics: [
        baseComicData[0], // Cyber Samurai Chronicles
        baseComicData[2], // Space Pirates Legacy
        baseComicData[3]  // Urban Legends
    ],
    listedComics: [
        baseComicData[0], // Cyber Samurai Chronicles
        baseComicData[2], // Space Pirates Legacy
        baseComicData[4]  // Mecha Warriors
    ]
};

// For testing empty states, you can use this instead:
export const mockUserComicsEmpty = {
    currentReads: [],
    mintedComics: [],
    favoriteComics: [],
    listedComics: []
};

export default {
    mockUser,
    mockUserComics,
    mockUserComicsEmpty
};