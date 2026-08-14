'use client'

import ComingSoon from '@/components/global/ComingSoon'
import { Bookmark } from 'lucide-react'

export default function WatchlistPage() {
  return (
    <ComingSoon
      title="Watchlist"
      description="Save comics you want to follow and get notified when new episodes drop or prices change."
      Icon={Bookmark}
    />
  )
}
