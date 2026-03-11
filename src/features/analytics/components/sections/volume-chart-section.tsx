// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { MoreHorizontal } from 'lucide-react'
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// // Generate realistic monthly volume data with wave pattern
// const volumeData = [
//   { month: 'Jan', volume: 0 },
//   { month: 'Feb', volume: 0 },
//   { month: 'Mar', volume: 0 },
//   { month: 'Apr', volume: 0 },
//   { month: 'May', volume: 0 },
//   { month: 'Jun', volume: 0 },
//   { month: 'Jul', volume: 0 },
//   { month: 'Aug', volume: 0 },
//   { month: 'Sep', volume: 0 },
//   { month: 'Oct', volume: 0 },
//   { month: 'Nov', volume: 0 },
//   { month: 'Dec', volume: 0 }
// ]

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-orange-500 text-white text-sm font-medium px-3 py-2 rounded-md shadow-lg">
//         {payload[0]?.value?.toLocaleString()}
//       </div>
//     )
//   }
//   return null
// }

// export function VolumeChartSection() {
//   return (
//     <Card className="bg-transparent border-black-50">
//       <CardHeader className="pb-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-xl font-semibold tracking-wide text-white">
//               Marketplace Volume
//             </CardTitle>
//           </div>
//           <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
//             <MoreHorizontal className="w-5 h-5" />
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent className="p-6 pt-0">
//         <div className="h-96 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart 
//               data={volumeData}
//               margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//             >
//               <defs>
//                 <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#D38200" stopOpacity={0.6}/>
//                   <stop offset="50%" stopColor="#D38200" stopOpacity={0.3}/>
//                   <stop offset="100%" stopColor="#8B4513" stopOpacity={0}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid 
//                 stroke="#333333" 
//                 strokeWidth={0.5}
//                 opacity={0.8}
//                 horizontal={true}
//                 vertical={true}
//                 syncWithTicks={false}
//               />
//               <XAxis 
//                 dataKey="month" 
//                 stroke="#6b7280"
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fill: '#6b7280' }}
//               />
//               <YAxis 
//                 stroke="#6b7280"
//                 fontSize={12}
//                 tickLine={false}
//                 axisLine={false}
//                 tick={{ fill: '#6b7280' }}
//                 domain={[100000, 900000]}
//                 tickFormatter={(value) => `$${(value / 1000)}K`}
//                 ticks={[100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000]}
//               />
//               <Tooltip 
//                 content={<CustomTooltip />}
//                 // position={{ x: 0, y: 0 }}
//                 allowEscapeViewBox={{ x: true, y: true }}
//               />
//               <Area 
//                 type="monotone" 
//                 dataKey="volume" 
//                 stroke="#D38200" 
//                 strokeWidth={3}
//                 fillOpacity={1} 
//                 fill="url(#volumeGradient)"
//                 // dot={{ fill: '#ffffff', strokeWidth: 2, r: 4, stroke: '#D38200' }}
//                 activeDot={{ r: 6, fill: '#D38200', strokeWidth: 2, stroke: '#ffffff' }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { fetchMirrorNodeAnalytics } from '@/redux/slices/analyticSlide'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-orange-500 text-white text-sm font-medium px-3 py-2 rounded-md shadow-lg">
        {payload[0]?.value?.toLocaleString()} HBAR
      </div>
    )
  }
  return null
}

export function VolumeChartSection() {
  const dispatch = useAppDispatch()
  const { volumeByMonth, isLoading } = useAppSelector((state: any) => state.mirrorNodeAnalytics)

  useEffect(() => {
    // Fetch data from Mirror Node
    dispatch(fetchMirrorNodeAnalytics() as any)
  }, [dispatch])

  // Calculate max value for Y-axis
  const maxVolume = volumeByMonth.length > 0 
    ? Math.max(...volumeByMonth.map((v: any) => v.volume))
    : 100

  const yAxisMax = Math.ceil(maxVolume / 100) * 100

  return (
    <Card className="bg-transparent border-black-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold tracking-wide text-white">
              Marketplace Volume (HBAR)
            </CardTitle>
            <p className="text-sm text-white/50 mt-1">
              Data from Hedera Mirror Node
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="h-96 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-white/60">Fetching on-chain data...</p>
            </div>
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={volumeByMonth}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D38200" stopOpacity={0.6}/>
                    <stop offset="50%" stopColor="#D38200" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#8B4513" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  stroke="#333333" 
                  strokeWidth={0.5}
                  opacity={0.8}
                  horizontal={true}
                  vertical={true}
                  syncWithTicks={false}
                />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#6b7280' }}
                  domain={[0, yAxisMax]}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#D38200" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#volumeGradient)"
                  activeDot={{ r: 6, fill: '#D38200', strokeWidth: 2, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}