'use client'

import Picture from "@/components/picture/Index"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { hbar } from "../../../../public/dev_images"
import { useRouter } from "next/navigation"

export interface TopComic {
  rank: number
  title: string
  author: string
  floorPrice: string
  priceChange: number
  copies: number
  sales: number
  volume: string
  image: string
  id: string
}

interface TopComicsTableProps {
  comics: TopComic[]
}

export function TopComicsTable({ comics }: TopComicsTableProps) {
  const router = useRouter()

  const timePeriods = ['10m', '1h', '6h', '1d', '7d', '30d']

  const [selectedPeriod, setSelectedPeriod] = useState('10m')
  
  return (
    <section className="my-8 mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">Top Comics</h2>
        
        {/* Time Period Selector */}
        <div className="flex space-x-1 rounded-lg p-1">
          {timePeriods.map((period) => (
            <button
              key={period}
              className={`px-3 py-2 text-xs rounded bg-black-500 ${
                period === selectedPeriod 
                  ? ' text-white' 
                  : 'text-white/25 hover:text-white'
              }`}
              onClick={() => setSelectedPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-black-500 rounded-lg overflow-hidden border border-b-2 border-white/10">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-black-600 px-4 py-4">
              <TableHead className="text-white text-sm pl-4">Comic</TableHead>
              <TableHead className="text-white text-sm ">Floor Price</TableHead>
              <TableHead className="text-white text-sm ">Supply</TableHead>
              <TableHead className="text-white text-sm ">Sales</TableHead>
              <TableHead className="text-white text-sm ">24h Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comics.map((comic) => (
              <TableRow 
                onClick={() => router.push(`/marketplace/chapter?id=${comic.id}`)}
                key={comic.rank} 
                className="border-white/10 hover:bg-black-600/50 px-4 py-4 font-light text-base cursor-pointer"
              >
                <TableCell className="flex items-center space-x-3 ml-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Avatar className="w-8 h-8 transition-colors">
                      <AvatarImage
                        src={comic.image}
                        alt={comic.title}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-black-500 text-white font-bold">
                        {comic.title
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="text-white font-light">{comic.title}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-light flex items-center gap-1">{comic.floorPrice} 
                      <span><Picture src={hbar} alt="hbar" loading="eager" className="w-6 h-6" /></span>
                    </span>
                    <span className={`text-xs flex ${
                      comic.priceChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <span>{comic.priceChange > 0 ? <ChevronUp className="w-4 h-4 text-green-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}</span>
                      {comic.priceChange}%
                    </span>
                  </div>
                </TableCell>
                
                <TableCell className="text-white">
                  {comic.copies.toLocaleString()}
                </TableCell>
                
                <TableCell className="text-white">
                  {comic.sales}
                </TableCell>
                
                <TableCell className="text-white font-light flex items-center gap-1">
                  {comic.volume}
                  <span><Picture src={hbar} alt="hbar" loading="eager" className="w-6 h-6" /></span>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}