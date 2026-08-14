// Preview-only presentation data for the private offers/bids sprint.
// These values are not backend, wallet, escrow, mint, or blockchain confirmations.
export type OfferStatus = 'active' | 'accepted' | 'expired'
export type OfferKind = 'offer' | 'bid'

export const previewCollector = {
  name: 'Yuna',
  displayName: 'Yuna Dean',
  handle: '@YunaReads',
  joined: 'November 2024',
  bio: 'I love to read fanfiction and action series.',
  avatar: '/dev_images/avatar-2.png',
  banner: '/user-profile-bg.png',
  portfolioValue: '234.096',
  mintedComics: 32,
  totalComics: 32,
}

export const previewOfferComic = {
  title: 'Iron Fable',
  series: 'Shadow Realm',
  episode: 'Episode 03',
  edition: '#7 of 200',
  editionLong: 'Edition #7 of 200',
  rarity: 'Epic',
  image: '/naruto.jpg',
  backgroundImage: '/bg.png',
  creator: 'Studio Kira',
}

export const previewOfferSummary = {
  totalLocked: 380,
  usdValue: '$49.24 USD',
  listingPrice: 156,
  bestOffer: 138,
  offerCount: 2,
  totalReceivedValue: 568,
}

export const myOffers = [
  {
    id: 'specific-shadow-42',
    kind: 'offer' as OfferKind,
    status: 'active' as OfferStatus,
    title: 'Shadow Realm - Ep.01 #42',
    context: 'Targeting edition #42 specifically',
    seller: '0x4f...2a1',
    amount: 120,
    expiry: 'Expires in 18h',
    chip: 'Awaiting seller',
    escrowCopy: 'locked in escrow',
    outbid: false,
  },
  {
    id: 'open-shadow-01',
    kind: 'bid' as OfferKind,
    status: 'active' as OfferStatus,
    title: 'Shadow Realm - Ep.01 Any edition',
    context: 'Open to any edition of this episode',
    seller: '',
    amount: 135,
    expiry: 'Expires in 2d',
    chip: 'OUTBID - Raise your bid',
    escrowCopy: 'your bid - outbid',
    outbid: true,
    highestBid: 145,
  },
  {
    id: 'specific-iron-7',
    kind: 'offer' as OfferKind,
    status: 'active' as OfferStatus,
    title: 'Iron Fable - Ep.03 #7',
    context: 'Targeting edition #7 specifically',
    seller: '0x1b...4e8',
    amount: 120,
    expiry: 'Expires in 6d',
    chip: 'Awaiting seller',
    escrowCopy: 'locked in escrow',
    outbid: false,
  },
]

export const acceptedOffers = [
  {
    id: 'accepted-iron-7',
    title: 'Iron Fable - Episode 03',
    edition: 'Edition #7 of 200 - Epic',
    amount: 138,
    copy: 'Accepted 2 days ago - now in your collection',
    image: '/naruto.jpg',
  },
]

export const expiredOffers = [
  {
    id: 'expired-shadow-42',
    kind: 'offer' as OfferKind,
    title: 'Shadow Realm - Ep.01 #42',
    copy: 'Expired 2 days ago - 120 HBAR returned to your wallet',
    amount: 120,
    action: 'Make another offer',
  },
  {
    id: 'expired-iron-open',
    kind: 'bid' as OfferKind,
    title: 'Iron Fable - Episode 02',
    copy: 'Expired 5 days ago - 90 HBAR returned to your wallet',
    amount: 90,
    action: 'Place another bid',
  },
]

export const offersReceived = [
  {
    id: 'received-iron-7',
    title: 'Iron Fable - Episode 03',
    edition: 'Edition #7 of 200 - Epic',
    image: '/naruto.jpg',
    listingPrice: 156,
    bestOffer: 138,
    offers: 2,
    highlighted: true,
  },
  {
    id: 'received-iron-9',
    title: 'Iron Fable - Episode 03',
    edition: 'Edition #7 of 200 - Epic',
    image: '/naruto.jpg',
    listingPrice: 156,
    bestOffer: 138,
    offers: 2,
    highlighted: false,
  },
]

export const resaleEarnings = [
  {
    id: 'earning-shadow-12',
    title: 'Shadow Realm Ep.01 #12 sold',
    detail: '2 days ago - Buyer: 0x9c...3b1',
    amount: 128,
  },
  {
    id: 'earning-iron-33',
    title: 'Iron Fable Ep.02 #33 sold',
    detail: '5 days ago - Buyer: 0x2e...7a4',
    amount: 128,
  },
]
