export const SELLER = {
  handle: '@KiraCollector',
  displayName: 'KiraCollector',
  initials: 'KR',
  verified: true,
  rating: '100%',
  stats: {
    comicsSold: 24,
    totalSales: 8,
    reAccepted: '100%',
    activeDays: '142d',
  },
}

export const COMIC = {
  id: '42-of-NFT',
  title: 'The First Descent',
  series: 'Shadow Realm',
  episode: 'Episode 01',
  creator: 'Studio Kira',
  image: '/naruto.jpg',
  backgroundImage: '/bg.png',
  editionNumber: 42,
  totalEditions: 847,
  currentPrice: 142,
  currency: 'ℏ',
  usdPrice: '18.40',
  floorPrice: 142,
  floorStatus: 'At floor — fair price',
  floorPercent: 100,
  activity: [
    { type: 'Minted', user: '@OriginalFan', date: 'Apr 2025', amount: 0.09 },
    { type: 'Sold', user: '@WaveCollector', date: 'Jun 2025', amount: 88 },
    { type: 'Sold', user: '@KiraCollector', date: 'Mar 2026', amount: 128 },
  ],
  onHatiko: '7% royalty to Studio Kira on every resale',
}

export const OFFER_STATS = {
  listed: { value: 142, currency: 'ℏ' },
  floorPrice: { value: 142, currency: 'ℏ' },
  topBalance: { value: 620, currency: 'ℏ' },
  highestBid: { value: 135, currency: 'ℏ' },
}

export const OFFER_AMOUNT = 120

export const OFFER_EXPIRY_OPTIONS = ['24 hours', '3 days', '7 days', '30 days']

export const FLOOR_OPTIONS = [
  { label: 'Floor -10%', value: -10 },
  { label: 'Floor -5%', value: -5 },
  { label: 'Floor', value: 0 },
  { label: 'Floor +5%', value: 5 },
]

export const BREAKDOWN = {
  creatorRoyalty: { percent: 7, amount: 8.4 },
  platformFee: { percent: 2.5, amount: 3.0 },
  totalLocked: 120,
  currency: 'HBAR',
}

export const MORE_FROM = [
  {
    id: '1',
    title: 'Inosuke degen',
    image: '/book-rotate.png',
    creator: 'Estuvao',
    role: 'Creator',
    mintPrice: '4.89K',
    currency: 'ℏ',
  },
  {
    id: '2',
    title: 'The son is also the father',
    image: '/book-colored.png',
    creator: 'Ma don',
    role: 'Creator',
    mintPrice: '4.89K',
    currency: 'ℏ',
  },
  {
    id: '3',
    title: 'Spiderman: Mary Jane',
    image: '/book-verticle.png',
    creator: 'Ma don',
    role: 'Creator',
    mintPrice: '4.5K',
    currency: 'ℏ',
  },
]
