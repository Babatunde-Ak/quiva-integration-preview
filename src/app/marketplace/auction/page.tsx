import AuctionView from '@/features/auction/components/auction-view'
import { PRODUCTION_FEATURES } from '@/config/features'
import { redirect } from 'next/navigation'

/**
 * Despite the route name this page is the offer form - the place a buyer lands after picking a
 * listing from the Offers tab. Bidding is only one mode of it, and only when an auction id is
 * passed in. So it belongs to `offers`, not `auction`; gating it on both meant enabling offers
 * still redirected every buyer away from the form.
 */
export default function AuctionPage() {
  if (!PRODUCTION_FEATURES.offers) {
    redirect('/marketplace')
  }

  return <AuctionView />
}
