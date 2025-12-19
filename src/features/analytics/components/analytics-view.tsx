import { Metadata } from 'next'
import { AnalyticsHeader } from './sections/analytics-header'
import { AnalyticsStats } from './sections/analytics-stats'
import { UserGrowthSection } from './sections/user-growth-section'
import { VolumeChartSection } from './sections/volume-chart-section'
import { BottomChartsSection } from './sections/bottom-charts-section'

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