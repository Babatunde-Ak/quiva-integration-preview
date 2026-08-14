'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from 'recharts'

// Sample data
const marketShareData = [
  { name: 'Others', value: 0, color: '#3F270C' },
  { name: 'Quiva', value: 0, color: '#D38200' }
]

const launchpadData = [
  { month: 'Jan', volume: 0 },
  { month: 'Feb', volume: 0 },
  { month: 'Mar', volume: 0 },
  { month: 'Apr', volume: 0 },
  { month: 'May', volume: 0 },
  { month: 'Jun', volume: 0 },
  { month: 'Jul', volume: 0 },
  { month: 'Aug', volume: 0 },
  { month: 'Sep', volume: 0 },
  { month: 'Oct', volume: 0 },
  { month: 'Nov', volume: 0 },
  { month: 'Dec', volume: 0 }
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
        <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white font-medium text-sm" style={{ color: entry.color }}>
            {`Volume: $${entry.value?.toLocaleString()}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Custom label function for pie chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="black" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="font-medium text-sm"
      style={{ fontSize: '14px', fontWeight: 600 }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const PieChartComponent = () => {
  return (
    <div className="relative h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={marketShareData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={0}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={450}
          >
            {marketShareData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }: any) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium text-sm">{payload[0].payload.name}</p>
                    <p className="text-amber-500 text-sm">{payload[0].value}%</p>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* White center circle with total volume */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-black-100">$0.00</div>
            <div className="text-xs text-black-200">Total Volume</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-3">
        {marketShareData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white text-sm font-medium">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const LaunchpadChart = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart 
        data={launchpadData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="launchpadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6}/>
            <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2}/>
            <stop offset="100%" stopColor="#92400e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid 
          opacity={0}
        />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280"
          color="#ffffff"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280"
          color="#ffffff"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280' }}
          domain={[0, 500000]}
          tickFormatter={(value) => `$${(value / 1000)}K`}
          ticks={[0, 100000, 200000, 300000, 400000, 500000]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="volume" 
          stroke="#f59e0b" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#launchpadGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BottomChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Market Share Pie Chart */}
      <Card className="bg-black-500 border-primary-500 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">
            Comic Marketplace shared by Volume ($HIBAR)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-64 w-full">
            <PieChartComponent />
          </div>
        </CardContent>
      </Card>

      {/* Launchpad Volume Area Chart */}
      <Card className="bg-black-500 backdrop-blur-sm border-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">
            Launchpad Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="h-64 w-full">
            <LaunchpadChart />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}