'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SELLER, COMIC, OFFER_STATS, BREAKDOWN } from '../data/data'
import SellerProfile from './seller-profile'
import OfferPanel from './offer-panel'
import MoreFromSection from './more-from-section'

export default function AuctionView() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — seller + comic info */}
          <SellerProfile seller={SELLER} comic={COMIC} />

          {/* Right — offer panel */}
          <OfferPanel
            seller={SELLER}
            comic={COMIC}
            offerStats={OFFER_STATS}
            breakdown={BREAKDOWN}
          />
        </div>

        {/* More from section — full width */}
        <MoreFromSection seller={SELLER} />
      </div>
    </div>
  )
}
