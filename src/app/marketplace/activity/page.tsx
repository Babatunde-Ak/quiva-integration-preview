'use client'

import ComingSoon from '@/components/global/ComingSoon'
import { Activity } from 'lucide-react'

export default function ActivityPage() {
  return (
    <ComingSoon
      title="Activity Log"
      description="A full timeline of your purchases, sales, mints, and interactions across the Quiva platform."
      Icon={Activity}
    />
  )
}
