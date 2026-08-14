'use client'

import ComingSoon from '@/components/global/ComingSoon'
import { History } from 'lucide-react'

export default function HistoryPage() {
  return (
    <ComingSoon
      title="History"
      description="Your reading and activity history will appear here. Track every comic you've read and every action you've taken."
      Icon={History}
    />
  )
}
