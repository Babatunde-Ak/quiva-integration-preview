export const genres = [
    {
        id: 'action',
        name: 'Action & Adventure'
    }, {
        id: 'fantasy',
        name: 'Fantasy'
    }, {
        id: 'scifi',
        name: 'Science Fiction'
    }, {
        id: 'romance',
        name: 'Romance'
    }, {
        id: 'horror',
        name: 'Horror'
    }, {
        id: 'mystery',
        name: 'Mystery & Thriller'
    }, {
        id: 'slice',
        name: 'Slice of Life'
    }, {
        id: 'comedy',
        name: 'Comedy'
    }, {
        id: 'historical',
        name: 'Historical & Biographical'
    }, {
        id: 'superhero',
        name: 'Superhero'
    }, {
        id: 'supernatural',
        name: 'Supernatural'
    }, {
        id: 'drama',
        name: 'Drama'
    }
];

export const mockCollections = [
    {
        id: '1',
        title: 'Galactic Ronin',
        description: 'Read through the fun adventure and real life drama that happens in the world.',
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=cro" +
                "p&w=800&q=80",
        episodes: [
            {
                id: 'e1',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e2',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e3',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e4',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e5',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }
        ],
        totalEpisodes: 8
    }, {
        id: '2',
        title: 'Galactic Ronin',
        description: 'Read through the fun adventure and real life drama that happens in the world.',
        coverImage: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=cro" +
                "p&w=800&q=80",
        episodes: [
            {
                id: 'e1',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e2',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e3',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }, {
                id: 'e4',
                thumbnail: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg"
            }
        ],
        totalEpisodes: 7
    }
];

interface Episode {
    id : string;
    title : string;
    thumbnail : string;
    description?: string;
    publishDate?: string;
}

interface Collection {
    id : string;
    title : string;
    description : string;
    coverImage : string;
    episodes : Episode[];
}

export const dummyCollections : Collection[] = [
    {
        id: '1',
        title: 'Galactic Ronin',
        description: 'Read through the fun adventure and real life drama that happens in the world of ' +
                'space samurais and cosmic warriors.',
        coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=cro' +
                'p',
        episodes: [
            {
                id: 'ep1',
                title: 'The Awakening',
                thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=300&fit=cro' +
                        'p',
                description: 'A young warrior discovers his destiny among the stars.',
                publishDate: '2024-01-15'
            }, {
                id: 'ep2',
                title: 'Cosmic Blade',
                thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=300&fit=cro' +
                        'p',
                description: 'The legendary sword chooses its wielder.',
                publishDate: '2024-01-22'
            }, {
                id: 'ep3',
                title: 'Nebula Battle',
                thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=300&fit=cro' +
                        'p',
                description: 'An epic battle unfolds in the heart of a dying star.',
                publishDate: '2024-01-29'
            }, {
                id: 'ep4',
                title: 'The Void Walker',
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=cro' +
                        'p',
                description: 'Journey through dimensions unknown.',
                publishDate: '2024-02-05'
            }, {
                id: 'ep5',
                title: 'Honor\'s Edge',
                thumbnail: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=200&h=300&fit=cro' +
                        'p',
                description: 'The code of the ronin is put to the ultimate test.',
                publishDate: '2024-02-12'
            }
        ]
    }, {
        id: '2',
        title: 'Mystic Chronicles',
        description: 'Follow the enchanting journey of young mages discovering their powers in a world' +
                ' where magic and technology collide.',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=cro' +
                'p',
        episodes: [
            {
                id: 'mc1',
                title: 'First Spell',
                thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=cro' +
                        'p',
                description: 'A young apprentice casts their first magic spell.',
                publishDate: '2024-02-01'
            }, {
                id: 'mc2',
                title: 'The Academy',
                thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=300&fit=cro' +
                        'p',
                description: 'Entering the prestigious Arcane Academy.',
                publishDate: '2024-02-08'
            }, {
                id: 'mc3',
                title: 'Digital Grimoire',
                thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=cro' +
                        'p',
                description: 'Ancient magic meets cutting-edge technology.',
                publishDate: '2024-02-15'
            }
        ]
    }, {
        id: '3',
        title: 'Urban Legends',
        description: 'Gritty tales from the neon-lit streets where heroes and villains clash in the sh' +
                'adows of towering skyscrapers.',
        coverImage: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=300&h=400&fit=cro' +
                'p',
        episodes: [
            {
                id: 'ul1',
                title: 'Night Patrol',
                thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=200&h=300&fit=cro' +
                        'p',
                description: 'The city never sleeps, and neither do its guardians.',
                publishDate: '2024-01-10'
            }, {
                id: 'ul2',
                title: 'Neon Noir',
                thumbnail: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&h=300&fit=crop',
                description: 'A mystery unfolds in the electric glow of the city.',
                publishDate: '2024-01-17'
            }, {
                id: 'ul3',
                title: 'Shadow Networks',
                thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=300&fit=cro' +
                        'p',
                description: 'Underground connections that run deeper than the subway.',
                publishDate: '2024-01-24'
            }, {
                id: 'ul4',
                title: 'Digital Ghost',
                thumbnail: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=200&h=300&fit=crop',
                description: 'When artificial intelligence develops a conscience.',
                publishDate: '2024-01-31'
            }
        ]
    }, {
        id: '4',
        title: 'Dragon Hearts',
        description: 'In a realm where dragons and humans share an ancient bond, young dragonriders mu' +
                'st save their world from an approaching darkness.',
        coverImage: 'https://images.unsplash.com/photo-1578662015628-bb24c4d06b3f?w=300&h=400&fit=cro' +
                'p',
        episodes: [
            {
                id: 'dh1',
                title: 'The Hatching',
                thumbnail: 'https://images.unsplash.com/photo-1578662015628-bb24c4d06b3f?w=200&h=300&fit=cro' +
                        'p',
                description: 'A dragon egg reveals its chosen rider.',
                publishDate: '2024-02-03'
            }, {
                id: 'dh2',
                title: 'First Flight',
                thumbnail: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=300&fit=cro' +
                        'p',
                description: 'Taking to the skies for the first time.',
                publishDate: '2024-02-10'
            }
        ]
    }, {
        id: '5',
        title: 'Cyber Samurai',
        description: 'Ancient warrior traditions meet futuristic technology in this cyberpunk tale of ' +
                'honor, code, and digital warfare.',
        coverImage: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=300&h=400&fit=crop',
        episodes: [] // Empty for testing empty state
    }
];
