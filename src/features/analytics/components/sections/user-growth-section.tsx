'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SlidersHorizontal } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useState } from 'react'
import { TbTriangleFilled } from 'react-icons/tb'

interface UserStatsDisplayProps {
  value: string
  label: string
  trend: string
  isActive?: boolean
  onClick?: () => void
}

function UserStatsDisplay({ value, label, trend, isActive = false, onClick }: UserStatsDisplayProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left transition-all duration-200 hover:scale-105 focus:outline-none group flex flex-col sm:flex-row items-start sm:items-end gap-2 pl-2 sm:pl-3 border-l-2 sm:border-l-4 border-white min-w-0 flex-1 sm:flex-initial`}
    >
      <div className="space-y-1 min-w-0">
        {/* Label */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium uppercase tracking-widest text-white/40 group-hover:text-white/80 truncate`}>
            {label}
          </span>
        </div>
        
        {/* Value */}
        <div className={`text-2xl sm:text-3xl font-bold transition-colors text-[#979797] group-hover:text-white/80`}>
          {value}%
        </div>
      </div>

      <Badge 
        variant="secondary" 
        className="text-primary-500 text-sm sm:text-base px-1.5 py-0.5 font-medium flex-shrink-0 self-start sm:self-end"
      >
        <TbTriangleFilled className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5" />
        <span className="text-xs sm:text-sm">{trend}</span>
      </Badge>
    </button>
  )
}

const userData = [
  { month: 'Jan', high: 0, middle: 0, low: 0 },
  { month: 'Feb', high: 0, middle: 0, low: 0 },
  { month: 'Mar', high: 0, middle: 0, low: 0 },
  { month: 'Apr', high: 0, middle: 0, low: 0 },
  { month: 'May', high: 0, middle: 0, low: 0 },
  { month: 'Jun', high: 0, middle: 0, low: 0 },
  { month: 'Jul', high: 0, middle: 0, low: 0 },
  { month: 'Aug', high: 0, middle: 0, low: 0 },
  { month: 'Sep', high: 0, middle: 0, low: 0 },
  { month: 'Oct', high: 0, middle: 0, low: 0 },
  { month: 'Nov', high: 0, middle: 0, low: 0 },
  { month: 'Dec', high: 0, middle: 0, low: 0 }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black-200/30 border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-white text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white font-medium text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom Legend Component - Always vertical layout
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-row lg:flex-col items-center lg:items-start justify-center lg:justify-end gap-2 lg:gap-4 ml-0 lg:ml-4 pl-0 lg:pl-4 mb-4 lg:mb-0">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white text-xs font-medium capitalize whitespace-nowrap">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function UserGrowthSection() {
  const [timeFilter, setTimeFilter] = useState('Monthly')
  const [activeMetric, setActiveMetric] = useState('monthly')

  const userStats = [
    {
      value: '0',
      label: 'Monthly',
      trend: '+0.00%',
      key: 'monthly'
    },
    {
      value: '0',
      label: 'Weekly',
      trend: '+0.00%',
      key: 'weekly'
    },
    {
      value: '0',
      label: 'Daily',
      trend: '+0.00%',
      key: 'daily'
    }
  ]

  return (
    <div className="space-y-4 my-8 sm:my-12 lg:my-16 px-2 sm:px-4 lg:px-0">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-8 border-b border-white/80">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Quiva New Users</h2>
          <p className="text-white/40 text-base sm:text-lg leading-relaxed font-light">
            Total Quiva New Users in a month
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 lg:space-y-0">
        {/* Stats and Controls Layout */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 flex-wrap">
          {/* Stats Display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 sm:gap-6 lg:gap-12 flex-1">
            {userStats.map((stat) => (
              <UserStatsDisplay
                key={stat.key}
                value={stat.value}
                label={stat.label}
                trend={stat.trend}
                isActive={activeMetric === stat.key}
                onClick={() => setActiveMetric(stat.key)}
              />
            ))}
          </div>

          {/* Controls - Allow wrapping when lg: */}
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-3 lg:gap-2 xl:gap-3 flex-shrink-0 lg:min-w-0">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[100px] sm:w-[120px] lg:w-[100px] xl:w-[120px] h-8 border-primary-500 rounded-lg bg-transparent text-gray-primary text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-orange-200 bg-transparent">
                <SelectItem value="Monthly" className="text-white hover:text-white focus:bg-gray-primary text-sm">
                  Monthly
                </SelectItem>
                <SelectItem value="Weekly" className="text-white hover:text-white focus:bg-gray-primary text-sm">
                  Weekly  
                </SelectItem>
                <SelectItem value="Daily" className="text-white hover:text-white focus:bg-gray-primary text-sm">
                  Daily
                </SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 sm:px-3 lg:px-2 xl:px-3 border-primary-500 bg-transparent text-gray-primary text-sm hover:bg-primary-500 hover:text-white whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3 h-3 mr-1 sm:mr-1.5 lg:mr-1 xl:mr-1.5" />
              <span className="hidden sm:inline lg:hidden xl:inline">Filter</span>
              <span className="sm:hidden lg:inline xl:hidden">Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-64 sm:h-80 lg:h-96 w-full bg-transparent mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={userData} 
            margin={{ 
              top: 20, 
              right: 40, 
              left: 10, 
              bottom: 5 
            }}
            barGap={4}
            barCategoryGap={6}
          >
            <CartesianGrid 
              stroke="#E7EAEE" 
              opacity={0.8}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 40000]}
              tickFormatter={(value) => `${(value/1000)}k`}
              ticks={[0, 5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000]}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Legend always on right for sm+ screens, bottom for mobile */}
            <Legend 
              align={window.innerWidth < 900 ? "center" : "right"} 
              verticalAlign={window.innerWidth < 900 ? "bottom" : "top"} 
              layout={window.innerWidth < 900 ? "horizontal" : "vertical"} 
              content={<CustomLegend />} 
            />
            
            {/* Stacked Bars */}
            <Bar 
              dataKey="low" 
              stackId="users"
              fill="#ffffff" 
              name="High"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="middle" 
              stackId="users"
              fill="#FAA31E" 
              name="Middle"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="high" 
              stackId="users"
              fill="#3F270C"
              name="Low"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}