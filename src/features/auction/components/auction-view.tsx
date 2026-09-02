'use client'

import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SELLER, COMIC, OFFER_STATS, BREAKDOWN } from '../data/data'
import SellerProfile from './seller-profile'
import OfferPanel from './offer-panel'
import MoreFromSection from './more-from-section'
import { useAppSelector, useAppDispatch } from '@/redux/hook'
import { getComicById } from '@/redux/slices/comicSlice'

export default function AuctionView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const comicId = searchParams.get('id')
  const listingId = searchParams.get('listingId')
  const auctionId = searchParams.get('auctionId')
  const tokenAddress = searchParams.get('tokenAddress') || undefined
  const serialNumber = searchParams.get('serialNumber') ? Number(searchParams.get('serialNumber')) : undefined
  const initialMode = searchParams.get('mode') === 'bid' ? 'open' : 'specific'
  const dispatch = useAppDispatch()
  const { currentComic } = useAppSelector((state: any) => state.comic)

  useEffect(() => {
    if (comicId && currentComic?._id !== comicId) {
      dispatch(getComicById({ id: comicId } as any))
    }
  }, [comicId, currentComic?._id, dispatch])

  const comic = currentComic ? {
    id: currentComic._id || COMIC.id,
    title: currentComic.title || COMIC.title,
    series: currentComic.collectionTitle || currentComic.collection?.title || COMIC.series,
    episode: currentComic.episodeNumber ? `Episode ${String(currentComic.episodeNumber).padStart(2, '0')}` : COMIC.episode,
    creator: currentComic.creatorId?.username ||
      (currentComic.creatorId?.walletAddress
        ? `${currentComic.creatorId.walletAddress.slice(0, 6)}...${currentComic.creatorId.walletAddress.slice(-4)}`
        : COMIC.creator),
    image: currentComic.bannerImage || COMIC.image,
    backgroundImage: currentComic.bannerImage || COMIC.backgroundImage,
    editionNumber: currentComic.editionNumber || COMIC.editionNumber,
    totalEditions: currentComic.totalEditions || COMIC.totalEditions,
    currentPrice: currentComic.price ?? COMIC.currentPrice,
    currency: COMIC.currency,
    usdPrice: currentComic.price != null
      ? (currentComic.price * 0.115).toFixed(2)
      : COMIC.usdPrice,
    floorPrice: currentComic.price ?? COMIC.floorPrice,
    floorStatus: COMIC.floorStatus,
    floorPercent: COMIC.floorPercent,
    activity: currentComic.activity || COMIC.activity,
    onHatiko: COMIC.onHatiko,
  } : COMIC

  const seller = currentComic?.creatorId ? {
    handle: `@${currentComic.creatorId.username || 'Unknown'}`,
    displayName: currentComic.creatorId.username || 'Unknown',
    initials: (currentComic.creatorId.username || 'UK').slice(0, 2).toUpperCase(),
    verified: true,
    rating: SELLER.rating,
    stats: SELLER.stats,
  } : SELLER

  const offerStats = currentComic?.price != null ? {
    listed: { value: currentComic.price, currency: 'ℏ' },
    floorPrice: { value: currentComic.price, currency: 'ℏ' },
    topBalance: OFFER_STATS.topBalance,
    highestBid: OFFER_STATS.highestBid,
  } : OFFER_STATS

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SellerProfile seller={seller} comic={comic} />
          <OfferPanel
            seller={seller}
            comic={comic}
            offerStats={offerStats}
            breakdown={BREAKDOWN}
            initialMode={initialMode}
            listingId={listingId ? Number(listingId) : undefined}
            auctionId={auctionId ? Number(auctionId) : undefined}
            tokenAddress={tokenAddress}
            serialNumber={serialNumber}
          />
        </div>

        <MoreFromSection seller={seller} />
      </div>
    </div>
  )
}
