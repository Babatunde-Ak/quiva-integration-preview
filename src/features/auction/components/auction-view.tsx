'use client'

import { useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import SellerProfile from './seller-profile'
import OfferPanel from './offer-panel'
import MoreFromSection from './more-from-section'
import { useAppSelector, useAppDispatch } from '@/redux/hook'
import { getComicById } from '@/redux/slices/comicSlice'
import { useListingContext } from '@/hook/useListingContext'

export type OfferComic = {
  title?: string
  series?: string
  episode?: string
  creator?: string
  image?: string
  backgroundImage?: string
  serialNumber?: number
  totalEditions?: number
  listedPriceHbar?: number
  usdPrice?: string
  floorPriceHbar?: number
  tokenAddress?: string
}

export type OfferSeller = {
  address?: string
  editionsHeld?: number
}

export default function AuctionView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const comicId = searchParams.get('id')
  const listingIdParam = searchParams.get('listingId')
  const auctionIdParam = searchParams.get('auctionId')
  const tokenAddressParam = searchParams.get('tokenAddress') || undefined
  const serialParam = searchParams.get('serialNumber')
  const initialMode = searchParams.get('mode') === 'bid' ? 'open' : 'specific'

  const listingId = listingIdParam ? Number(listingIdParam) : undefined
  const auctionId = auctionIdParam ? Number(auctionIdParam) : undefined

  const dispatch = useAppDispatch()
  const { currentComic } = useAppSelector((state: any) => state.comic)

  useEffect(() => {
    if (comicId && currentComic?._id !== comicId) {
      dispatch(getComicById({ id: comicId } as any))
    }
  }, [comicId, currentComic?._id, dispatch])

  // The listing is the authority on price, seller and serial - not the comic record, which
  // describes the collection rather than this particular edition or who currently holds it.
  const listing = useListingContext(listingId, tokenAddressParam || currentComic?.nftId?.tokenId)

  const comic: OfferComic = {
    title: currentComic?.title,
    series: currentComic?.collectionTitle || currentComic?.collection?.title,
    episode: currentComic?.episodeNumber
      ? `Episode ${String(currentComic.episodeNumber).padStart(2, '0')}`
      : undefined,
    creator:
      currentComic?.creatorId?.username ||
      (currentComic?.creatorId?.walletAddress
        ? `${currentComic.creatorId.walletAddress.slice(0, 6)}...${currentComic.creatorId.walletAddress.slice(-4)}`
        : undefined),
    image: currentComic?.bannerImage,
    backgroundImage: currentComic?.bannerImage,
    serialNumber: listing.serialNumber ?? (serialParam ? Number(serialParam) : undefined),
    totalEditions: currentComic?.totalEditions,
    listedPriceHbar: listing.listedPriceHbar,
    floorPriceHbar: listing.floorPriceHbar,
    tokenAddress: listing.tokenAddress || tokenAddressParam,
  }

  // Whoever currently holds the edition, which on a resale is not the creator.
  const seller: OfferSeller = {
    address: listing.sellerAddress,
    editionsHeld: listing.sellerEditions,
  }

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
          <SellerProfile seller={seller} comic={comic} isLoading={listing.isLoading} />
          <OfferPanel
            comic={comic}
            listedPriceHbar={listing.listedPriceHbar}
            floorPriceHbar={listing.floorPriceHbar}
            highestOfferHbar={listing.highestOfferHbar}
            balanceHbar={listing.balanceHbar}
            royaltyPercent={listing.royaltyPercent}
            platformFeePercent={listing.platformFeePercent}
            initialMode={initialMode}
            listingId={listingId}
            auctionId={auctionId}
            onSubmitted={() => void listing.refresh()}
          />
        </div>

        <MoreFromSection />
      </div>
    </div>
  )
}
