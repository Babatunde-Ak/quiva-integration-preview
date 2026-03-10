// import { Card, CardContent } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { TrendingUp, TrendingDown } from 'lucide-react'

// interface StatCardProps {
//   title: string
//   value: string
//   subtitle?: string
//   trend?: {
//     type: 'up' | 'down'
//     value: string
//   }
// }

// function StatCard({ title, value, subtitle, trend }: StatCardProps) {
//   return (
//     <Card className="bg-transparent border-2 border-primary-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
//       <CardContent className="p-6">
//         <div className="space-y-3">
//           <p className="text-sm font-light text-white/50 tracking-wide uppercase">
//             {title}
//           </p>
//           <div className="text-3xl font-bold text-white">
//             {value}
//           </div>
//           {(subtitle || trend) && (
//             <div className="flex items-center gap-2">
//               {subtitle && (
//                 <span className="text-sm text-white/50 ">
//                   {subtitle}
//                 </span>
//               )}
              
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// export function AnalyticsStats() {
//   const stats = [
//     {
//       title: 'Total Marketplace Trading Volume',
//       value: '$0.00',
//       trend: null
//     },
//     {
//       title: 'Total Marketplace Sales',
//       value: '$0.00',
//       subtitle: 'All Time'
//     },
//     {
//       title: 'Total Story Views / Reads',
//       value: '0',
//       subtitle: 'All Time'
//     }
//   ]

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {stats.map((stat, index) => (
//         <StatCard
//           key={index}
//           title={stat.title}
//           value={stat.value}
//           subtitle={stat.subtitle}
//           trend={stat.trend}
//         />
//       ))}
//     </div>
//   )
// }

'use client'

import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { fetchMirrorNodeAnalytics, fetchTradingVolume } from '@/redux/slices/analyticSlide'

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
              {trend && (
                <Badge 
                  variant="secondary" 
                  className={`${
                    trend.type === 'up' 
                      ? 'bg-green-500/10 text-green-500' 
                      : 'bg-red-500/10 text-red-500'
                  } flex items-center gap-1`}
                >
                  {trend.type === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{trend.value}</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// export function AnalyticsStats() {
//   const dispatch = useAppDispatch()
//   //const { overview, totalVolume, isLoading } = useAppSelector((state: any) => state.mirrorNodeAnalytics)
//   const { overview, isLoading, error } = useAppSelector((state) => state.mirrorNodeAnalytics);
//   //const { vol } = useAppSelector((state: any) => state.mirrorNodeAnalytics)

//   useEffect(() => {
//     // Fetch analytics from Mirror Node
//      dispatch(fetchMirrorNodeAnalytics() as any)
//     // dispatch(fetchTradingVolume() as any)
//   }, [dispatch])

//   // const stats = [
//   //   {
//   //     title: 'Total Marketplace Trading Volume',
//   //     value: overview ? `${parseFloat(overview?.totalVolume).toLocaleString()} HBAR` : '0 HBAR',
//   //     subtitle: 'From Hedera Mirror Node',
//   //     trend: null
//   //   },
//   //   {
//   //     title: 'Total Marketplace Sales',
//   //     value: overview ? overview?.totalSales.toLocaleString() : '0',
//   //     subtitle: 'All Time'
//   //   },
//   //   {
//   //     title: 'Total Story Views / Reads',
//   //     value: overview ? overview?.totalViews.toLocaleString() : '0',
//   //     subtitle: 'All Time'
//   //   }
//   // ]

//   const stats = [
//     {
//       title: 'Total Marketplace Trading Volume',
//       value: `${overview?.totalVolume.toLocaleString()} HBAR`,
//       subtitle: 'From Hedera Mirror Node',
//       trend: null
//     },
//     {
//       title: 'Total Marketplace Sales',
//       value: overview?.totalSales.toLocaleString(),
//       subtitle: 'All Time'
//     },
//     {
//       title: 'Total Story Views / Reads',
//       value: overview?.totalViews.toLocaleString(),
//       subtitle: 'All Time'
//     }
//   ]

//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[1, 2, 3].map((i) => (
//           <Card key={i} className="bg-transparent border-2 border-primary-500">
//             <CardContent className="p-6">
//               <div className="animate-pulse space-y-3">
//                 <div className="h-4 bg-white/10 rounded w-3/4"></div>
//                 <div className="h-8 bg-white/10 rounded w-1/2"></div>
//                 <div className="h-4 bg-white/10 rounded w-1/4"></div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {stats.map((stat, index) => (
//         <StatCard
//           key={index}
//           title={stat.title}
//           value={stat.value}
//           subtitle={stat.subtitle}
//           trend={stat.trend}
//         />
//       ))}
//     </div>
//   )
// }

export function AnalyticsStats() {
  const dispatch = useAppDispatch();
  const { overview, volumeByMonth, mintsByMonth, isLoading, error } = 
    useAppSelector((state) => state.mirrorNodeAnalytics);

  useEffect(() => {
    console.log('🟢 Component mounted, dispatching fetchMirrorNodeAnalytics...');
    dispatch(fetchMirrorNodeAnalytics() as any);
  }, [dispatch]);

  useEffect(() => {
    console.log('🟢 Redux state updated:', { 
      overview, 
      volumeByMonth: volumeByMonth?.length, 
      mintsByMonth: mintsByMonth?.length,
      isLoading,
      error 
    });
    
    if (overview) {
      console.log('   overview.totalVolume:', overview.totalVolume);
      console.log('   overview.totalSales:', overview.totalSales);
    }
  }, [overview, volumeByMonth, mintsByMonth, isLoading, error]);

  const stats = [
    {
      title: 'Total Marketplace Trading Volume',
      value: overview ? `${parseFloat(overview.totalVolume).toLocaleString()} HBAR` : '0 HBAR',
      subtitle: 'From Hedera Mirror Node',
      trend: null
    },
    {
      title: 'Total Marketplace Sales',
      value: overview ? overview.totalSales.toLocaleString() : '0',
      subtitle: 'All Time'
    },
    {
      title: 'Total Story Views / Reads',
      value: overview ? overview.totalViews.toLocaleString() : '0',
      subtitle: 'All Time'
    }
  ];

  console.log('🟡 Rendering stats:', stats);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-transparent border-2 border-primary-500">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-8 bg-white/10 rounded w-1/2"></div>
                <div className="h-4 bg-white/10 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
  );
}