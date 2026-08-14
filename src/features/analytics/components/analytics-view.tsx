import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { AnalyticsHeader } from './sections/analytics-header'
import { AnalyticsStats } from './sections/analytics-stats'

const UserGrowthSection = dynamic(() => import('./sections/user-growth-section').then(mod => mod.UserGrowthSection), { ssr: false })
const VolumeChartSection = dynamic(() => import('./sections/volume-chart-section').then(mod => mod.VolumeChartSection), { ssr: false })
const BottomChartsSection = dynamic(() => import('./sections/bottom-charts-section').then(mod => mod.BottomChartsSection), { ssr: false })

export const metadata: Metadata = {
  title: 'Analytics - Quiva Dashboard',
  description: 'Explore the analytics of the Quiva marketplace',
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-black-500 p-6 space-y-8 text-white">
      <AnalyticsHeader />
      <AnalyticsStats />
      <UserGrowthSection />
      <VolumeChartSection />
      <BottomChartsSection />
    </div>
  )
}