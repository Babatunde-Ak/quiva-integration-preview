import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  trend?: {
    type: 'up' | 'down'
    value: string
  }
}

function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  return (
    <Card className="bg-transparent border-2 border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="space-y-3">
          <p className="text-sm font-light text-white/50 tracking-wide uppercase">
            {title}
          </p>
          <div className="text-3xl font-bold text-white">
            {value}
          </div>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {subtitle && (
                <span className="text-sm text-white/50 ">
                  {subtitle}
                </span>
              )}
              
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function AnalyticsStats() {
  const stats = [
    {
      title: 'Total Marketplace Trading Volume',
      value: '$0.00',
      trend: null
    },
    {
      title: 'Total Marketplace Sales',
      value: '$0.00',
      subtitle: 'All Time'
    },
    {
      title: 'Total Story Views / Reads',
      value: '0',
      subtitle: 'All Time'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          trend={stat.trend}
        />
      ))}
    </div>
  )
}