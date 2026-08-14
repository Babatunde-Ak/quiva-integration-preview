'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnalyticsHeader() {
  const [timeRange, setTimeRange] = useState('all-time')

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">
          Analytics
        </h1>
        <p className="text-lg font-light text-white/40">
          Explore the analytics of the marketplace.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] lg:w-[240px] border-primary-500 focus:border-orange-300 focus:ring-orange-200 hover:border-orange-300 transition-colors">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="border-orange-200 bg-black-200 text-white">
            <SelectItem value="all-time" className="focus:bg-orange-200/10 focus:text-white">
              All Time
            </SelectItem>
            <SelectItem value="30d" className="focus:bg-orange-200/10 focus:text-white">
              Last 30 Days
            </SelectItem>
            <SelectItem value="7d" className="focus:bg-orange-200/10 focus:text-white">
              Last 7 Days
            </SelectItem>
            <SelectItem value="24h" className="focus:bg-orange-200/10 focus:text-white">
              Last 24 Hours
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Button className="border border-primary-500 text-white font-semibold bg-transparent hover:bg-transparent p-1 px-2">
          <span className="bg-primary-500 p-1 px-2 rounded-lg">USD</span> $HBAR
        </Button>
      </div>
    </div>
  )
}