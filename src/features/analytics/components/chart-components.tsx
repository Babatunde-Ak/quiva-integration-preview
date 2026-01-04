'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  showMenu?: boolean
}

export function ChartContainer({ 
  title, 
  description, 
  children, 
  className = "", 
  showMenu = false 
}: ChartContainerProps) {
  return (
    <Card className={`border-border ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-wide">
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {showMenu && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

interface CustomTooltipProps {
  formatValue?: (value: number) => string
}

export function CustomTooltip({ 
  active, 
  payload, 
  label, 
  formatValue 
}: any & CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  return (
    <Card className="shadow-lg border-border">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p 
            key={index} 
            className="text-sm font-medium" 
            style={{ color: entry.color }}
          >
            {`${entry.name || entry.dataKey}: ${
              formatValue && typeof entry.value === 'number' 
                ? formatValue(entry.value)
                : typeof entry.value === 'number'
                  ? entry.value.toLocaleString()
                  : entry.value
            }`}
          </p>
        ))}
      </CardContent>
    </Card>
  )
}

// Chart-specific tooltip components
export function VolumeTooltip({ active, payload, label }: any) {
  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={`Day ${label}`}
      formatValue={(value) => value.toLocaleString()}
    />
  )
}

export function UserGrowthTooltip({ active, payload, label }: any) {
  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={label}
      formatValue={(value) => value.toLocaleString()}
    />
  )
}

export function LaunchpadTooltip({ active, payload, label }: any) {
  return (
    <CustomTooltip
      active={active}
      payload={payload}
      label={label}
      formatValue={(value) => value.toLocaleString()}
    />
  )
}

export function MarketShareTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <Card className="shadow-lg">
      <CardContent className="p-3">
        <p className="text-sm font-medium">{data.name}</p>
        <p className="text-sm text-orange-500 font-medium">{data.value}M</p>
      </CardContent>
    </Card>
  )
}

// Common chart styling configurations
export const chartConfig = {
  colors: {
    primary: '#f97316',    // orange-500
    secondary: '#eab308',  // yellow-500
    accent: '#10b981',     // green-500
    muted: '#6b7280',      // gray-500
  },
  grid: {
    strokeDasharray: '3 3',
    className: 'stroke-muted',
    opacity: 0.3,
  },
  axis: {
    className: 'text-xs fill-muted-foreground',
    tickLine: false,
    axisLine: false,
  },
  gradients: {
    orange: [
      { offset: '5%', stopColor: '#f97316', stopOpacity: 0.8 },
      { offset: '95%', stopColor: '#f97316', stopOpacity: 0.1 },
    ]
  }
}