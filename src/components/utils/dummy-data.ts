// Images for demo
export const LOCAL_IMAGE = '/dev_images/avatar-2.png';
export const DUMMY_COVER_IMAGE = '/dev_images/avatar-2.png';
export const DUMMY_AVATAR_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&h=100&fit=crop';
export const DUMMY_COMIC_IMAGE = 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=300&h=450&fit=crop';

// Dummy comic data for reader
export const DUMMY_READER_COMIC = {
  id: '2',
  title: 'Avatar - Book of Beginnings',
  coverImage: LOCAL_IMAGE,
  creator: {
    name: 'Studio Kyra',
    avatar: LOCAL_IMAGE
  },
  chapters: [
    {
      chapterNumber: 1,
      title: 'Episode 1: The First Flame',
      pages: Array.from({ length: 22 }, (_, i) => ({
        imageUrl: LOCAL_IMAGE,
        pageNumber: i + 1,
        contentType: 'image'
      }))
    }
  ]
};

// More collections data for ComicCard
export const MORE_COLLECTIONS = [
  {
    id: '1',
    title: 'Episode 1',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.12,
    views: '4.5K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 1
  },
  {
    id: '2',
    title: 'Episode 2',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.11,
    views: '3.8K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 2
  },
  {
    id: '3',
    title: 'Episode 3',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.10,
    views: '2.9K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 3
  },
  {
    id: '4',
    title: 'Episode 4',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.13,
    views: '5.1K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 4
  },
  {
    id: '5',
    title: 'Episode 5',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.14,
    views: '6.2K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 5
  },
  {
    id: '6',
    title: 'Episode 6',
    creator: 'Studio Kyra',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: 0.15,
    views: '7.3K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 6
  }
];

// Top selling comics data for 3x3 grid
export const TOP_SELLING_COMICS = [
  {
    id: '1',
    rank: 1,
    name: 'Find Me',
    image: LOCAL_IMAGE,
    sales: 1245,
    percentageChange: 15.5,
    isPositive: true
  },
  {
    id: '2',
    rank: 2,
    name: 'Lost World',
    image: LOCAL_IMAGE,
    sales: 987,
    percentageChange: 8.2,
    isPositive: true
  },
  {
    id: '3',
    rank: 3,
    name: 'Digital Dreams',
    image: LOCAL_IMAGE,
    sales: 856,
    percentageChange: -3.1,
    isPositive: false
  },
  {
    id: '4',
    rank: 4,
    name: 'Cyber Punk',
    image: LOCAL_IMAGE,
    sales: 734,
    percentageChange: 12.7,
    isPositive: true
  },
  {
    id: '5',
    rank: 5,
    name: 'Neo Tokyo',
    image: LOCAL_IMAGE,
    sales: 621,
    percentageChange: 5.9,
    isPositive: true
  },
  {
    id: '6',
    rank: 6,
    name: 'Future Shock',
    image: LOCAL_IMAGE,
    sales: 589,
    percentageChange: -2.4,
    isPositive: false
  },
  {
    id: '7',
    rank: 7,
    name: 'Star Bound',
    image: LOCAL_IMAGE,
    sales: 543,
    percentageChange: 9.8,
    isPositive: true
  },
  {
    id: '8',
    rank: 8,
    name: 'Moon Light',
    image: LOCAL_IMAGE,
    sales: 487,
    percentageChange: 3.2,
    isPositive: true
  },
  {
    id: '9',
    rank: 9,
    name: 'Cosmic Ride',
    image: LOCAL_IMAGE,
    sales: 432,
    percentageChange: -1.7,
    isPositive: false
  }
];

// More from Adventure comics data
export const MORE_ADVENTURE_COMICS = [
  { 
    id: '1', 
    title: 'Inosuke Degen', 
    creator: 'Chrome Extreme',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.09,
    currentPrice: '3,000',
    views: '4.89K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 1
  },
  { 
    id: '2', 
    title: 'The Son is Also The Father', 
    creator: 'New York A.B.R.C.',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.12,
    currentPrice: '3,500',
    views: '3.75K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 2
  },
  { 
    id: '3', 
    title: 'Spiderman: Mary Jane', 
    creator: 'Catera Marathon',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.08,
    currentPrice: '2,800',
    views: '5.21K',
    image: LOCAL_IMAGE,
    premium: false,
    number: 3
  },
  { 
    id: '4', 
    title: 'John Pryce', 
    creator: 'A.B.R.C.',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.15,
    currentPrice: '4,200',
    views: '2.95K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 4
  },
  { 
    id: '5', 
    title: 'Avatar Returns', 
    creator: 'Studio Zen',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.10,
    currentPrice: '3,200',
    views: '4.12K',
    image: LOCAL_IMAGE,
    premium: false,
    number: 5
  },
  { 
    id: '6', 
    title: 'Fire Nation Tales', 
    creator: 'Element Studio',
    creatorAvatar: LOCAL_IMAGE,
    mintPrice: 0.07,
    currentPrice: '2,500',
    views: '6.34K',
    image: LOCAL_IMAGE,
    premium: true,
    number: 6
  }
];

// Full comic data for ComicDetail component
export const DUMMY_COMIC_DATA = {
  id: '2',
  title: 'Avatar - Book of Beginnings',
  issueNumber: 1,
  author: {
    name: 'Studio Kyra',
    avatar: DUMMY_AVATAR_IMAGE
  },
  coverImage: DUMMY_COMIC_IMAGE,
  description: 'In a world torn between the elements, a young avatar rises to restore balance – not by choice, but by destiny. "Book of Beginnings" marks the first chapter of the Avatar Chronicles, where every mint helps since the legend.',
  tags: ['Fantasy', 'Adventure', 'On-chain Epic'],
  isFree: false,
  publishType: 'nft',
  price: 0.09,
  nftDetails: {
    tokenId: '2',
    maxSupply: 1000,
    currentSupply: 721,
    mintStatus: 'minting'
  },
  tokenId: '2',
  creatorWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
  issueDetails: {
    creators: 'Studio Kyra',
    pages: 32,
    publisher: 'Independent',
    publicationDate: 'December 9, 2024'
  },
  otherIssues: [
    {
      id: 'ep1',
      title: 'Episode 1 : The First Flame',
      image: DUMMY_COMIC_IMAGE,
      date: 'December 2, 2024',
      isFree: false
    },
    {
      id: 'ep2',
      title: 'Episode 2 : Whispers of the Wind',
      image: DUMMY_COMIC_IMAGE,
      date: 'December 9, 2024',
      isFree: false
    },
    {
      id: 'ep3',
      title: 'Episode 3 : Echoes Beneath the Earth',
      image: DUMMY_COMIC_IMAGE,
      date: 'December 16, 2024',
      isFree: false
    }
  ],
  views: 4500,
  likes: 230,
  status: "published",
  
  episodeList: [
    {
      id: 'ep1',
      title: 'Episode 1 : The First Flame',
      time: '8 min',
      stats: {
        floorPrice: 0.085,
        totalMints: '721 / 1,000',
        volume: 45.8
      }
    },
    {
      id: 'ep2',
      title: 'Episode 2 : Whispers of the Wind',
      time: '8 min',
      stats: {
        floorPrice: 0.085,
        totalMints: '721 / 1,000',
        volume: 45.8
      }
    },
    {
      id: 'ep3',
      title: 'Episode 3 : Echoes Beneath the Earth',
      time: '8 min',
      stats: {
        floorPrice: 0.085,
        totalMints: '721 / 1,000',
        volume: 45.8
      }
    }
  ],
  marketStats: {
    floorPrice: 0.085,
    totalMints: '721 / 1,000',
    volume: 45.8
  },
  mintingDetails: {
    mintPrice: 0.09,
    edition: '1,000',
    royalties: '7% to creator'
  },
  collections: '389 Collections',
  studioInfo: {
    name: 'Studio Kyra',
    description: 'Studio Kyra is a visionary town of artists and storytellers dedicated to making the boundaries of digital art and interactive narratives.'
  },
  moreAdventureComics: [
    {
      id: 'ma1',
      title: 'Inosuke degen',
      subtitle: 'Chrome Extreme',
      image: DUMMY_COMIC_IMAGE
    },
    {
      id: 'ma2',
      title: 'The son is also the father',
      subtitle: 'New York A.B.R.C.',
      image: DUMMY_COMIC_IMAGE
    },
    {
      id: 'ma3',
      title: 'Spiderman: Mary Jane',
      subtitle: 'Catera Marathon',
      image: DUMMY_COMIC_IMAGE
    },
    {
      id: 'ma4',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: DUMMY_COMIC_IMAGE
    },
    {
      id: 'ma5',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: DUMMY_COMIC_IMAGE
    },
    {
      id: 'ma6',
      title: 'John Pryce',
      subtitle: 'A.B.R.C.',
      image: DUMMY_COMIC_IMAGE
    }
  ]
};

// Activity data for minting page
export const ACTIVITY_DATA = [
  { username: '@co4edt8', event: 'Minted', price: 0.09, edition: '#001', time: '21s ago' },
  { username: '@co4edt8', event: 'Sold', price: 0.09, edition: '#021', time: '1m ago' },
  { username: '@co4edt8', event: 'Minted', price: 0.09, edition: '#201', time: '20m ago' },
  { username: '@co4edt8', event: 'Minted', price: 0.09, edition: '#1,001', time: '30m ago' },
  { username: '@co4edt8', event: 'Minted', price: 0.09, edition: '#001', time: '21min ago' }
];

// Episode list data
export const EPISODE_LIST = [
  { title: 'Episode 1 : The First Flame', time: '8 min' },
  { title: 'Episode 2 : Whispers of the Wind', time: '8 min' },
  { title: 'Episode 3 : Echoes Beneath the Earth', time: '8 min' }
];

// All data as a single object
export default {
  LOCAL_IMAGE,
  DUMMY_COVER_IMAGE,
  DUMMY_AVATAR_IMAGE,
  DUMMY_COMIC_IMAGE,
  DUMMY_READER_COMIC,
  MORE_COLLECTIONS,
  TOP_SELLING_COMICS,
  MORE_ADVENTURE_COMICS,
  DUMMY_COMIC_DATA,
  ACTIVITY_DATA,
  EPISODE_LIST
};
