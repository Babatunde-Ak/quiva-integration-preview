import AuctionView from '@/features/auction/components/auction-view'
import { PRODUCTION_FEATURES } from '@/config/features'
import { redirect } from 'next/navigation'

export default function AuctionPage() {
  if (!PRODUCTION_FEATURES.auction || !PRODUCTION_FEATURES.offers) {
    redirect('/marketplace')
  }

  return <AuctionView />
}
