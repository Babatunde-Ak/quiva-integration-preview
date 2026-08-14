// Mock data for the Quiva marketplace - replace with your API calls

export const featuredComics = [
    {
        id: "comic_001",
        title: "Cyber Samurai Chronicles",
        description: "A thrilling cyberpunk adventure featuring ancient warriors in a futuristic world where tradition meets technology.",
        creator: "AkiraArt",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Action", "Cyberpunk", "Sci-Fi"],
        price: 25,
        isListed: true,
        featured: true
    },
    {
        id: "comic_002",
        title: "Mystic Realms",
        description: "Journey through enchanted lands filled with magic, mythical creatures, and ancient secrets waiting to be discovered.",
        creator: "FantasyMaster",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Fantasy", "Adventure", "Magic"],
        price: 18,
        isListed: true,
        featured: true
    }
];

export const allComics = [
    ...featuredComics,
    {
        id: "comic_003",
        title: "Space Pirates Legacy",
        description: "Epic space adventures with rogues, rebels, and intergalactic treasures.",
        creator: "SpaceArt",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Sci-Fi", "Adventure", "Action"],
        price: 22,
        isListed: true
    },
    {
        id: "comic_004",
        title: "Urban Legends",
        description: "Modern mythology meets street art in this gripping urban fantasy series.",
        creator: "UrbanMyth",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Urban Fantasy", "Drama", "Mystery"],
        price: 20,
        isListed: true
    },
    {
        id: "comic_005",
        title: "Mecha Warriors",
        description: "Giant robots and brave pilots defend humanity in this action-packed series.",
        creator: "MechaStudio",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Mecha", "Action", "Sci-Fi"],
        price: 30,
        isListed: true
    },
    {
        id: "comic_006",
        title: "Elemental Masters",
        description: "Young heroes discover their powers over the classical elements.",
        creator: "ElementalArt",
        creatorAvatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
        progress: 0,
        genres: ["Fantasy", "Young Adult", "Adventure"],
        price: 16,
        isListed: true
    }
];

export const mockUser = {
    id: "user_001",
    name: "Yuna",
    displayName: "Yuna Dean",
    avatar: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80",
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
        featuredComics[0], 
        allComics[2]
    ],
    mintedComics: [featuredComics[1]],
    favoriteComics: [
        featuredComics[0], 
        allComics[3]
    ],
    listedComics: [featuredComics[1]]
};