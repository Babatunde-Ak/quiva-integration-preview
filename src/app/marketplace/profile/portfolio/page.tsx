'use client'

import ComingSoon from '@/components/global/ComingSoon'
import { LayoutGrid } from 'lucide-react'

export default function PortfolioPage() {
  return (
    <ComingSoon
      title="Portfolio"
      description="A showcase of all the comics you've published on Quiva — your creative legacy in one place."
      Icon={LayoutGrid}
    />
  )
}
