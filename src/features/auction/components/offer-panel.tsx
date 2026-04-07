'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { MainButton } from '@/components/button'
import {
  SELLER,
  COMIC,
  OFFER_STATS,
  OFFER_EXPIRY_OPTIONS,
  BREAKDOWN,
} from '../data/data'

export default function OfferPanel({
  seller,
  comic,
  offerStats,
  breakdown,
}: {
  seller: typeof SELLER
  comic: typeof COMIC
  offerStats: typeof OFFER_STATS
  breakdown: typeof BREAKDOWN
}) {
  const [offerAmount, setOfferAmount] = useState('120')
  const [activeExpiry, setActiveExpiry] = useState('24 hours')
  const [offerType, setOfferType] = useState<'specific' | 'open'>('specific')

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h2 className="text-white font-bold text-xl">Make an Offer</h2>
        <p className="text-white/40 text-xs mt-1">
          to {seller.handle} · {comic.series}
        </p>
      </div>

      {/* Offer type tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setOfferType('specific')}
          className={`rounded-xl p-4 text-left border transition-colors ${
            offerType === 'specific'
              ? 'border-[#FAA31E] bg-[#FAA31E]/10'
              : 'border-white/10 bg-[#1a1a1a]'
          }`}
        >
          <p className={`text-sm font-semibold ${offerType === 'specific' ? 'text-white' : 'text-white/60'}`}>
            Specific Offer
          </p>
          <p className="text-[10px] text-white/40 mt-1">
            For this edition only<br />
            {seller.handle} receives
          </p>
        </button>
        <button
          onClick={() => setOfferType('open')}
          className={`rounded-xl p-4 text-left border transition-colors ${
            offerType === 'open'
              ? 'border-[#FAA31E] bg-[#FAA31E]/10'
              : 'border-white/10 bg-[#1a1a1a]'
          }`}
        >
          <p className={`text-sm font-semibold ${offerType === 'open' ? 'text-white' : 'text-white/60'}`}>
            Open Bid
          </p>
          <p className="text-[10px] text-white/40 mt-1">
            Any holder of this episode<br />
            can accept your price
          </p>
        </button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Listed at', value: offerStats.listed.value },
          { label: 'Floor price', value: offerStats.floorPrice.value },
          { label: 'Top balance', value: offerStats.topBalance.value },
          { label: 'Highest bid', value: offerStats.highestBid.value },
        ].map(s => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <p className="text-[10px] text-white/40">{s.label}</p>
            <p className="text-sm font-bold text-white flex items-center justify-center gap-1">
              {s.value}
              <Image src="/hbar.png" alt="HBAR" width={12} height={12} className="object-contain opacity-70" />
              <ChevronDown className="w-3 h-3 text-white/40" />
            </p>
          </div>
        ))}
      </div>

      {/* Offer amount input */}
      <div>
        <p className="text-xs text-white/40 mb-2">YOUR OFFER AMOUNT</p>
        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3">
          <input
            type="number"
            value={offerAmount}
            onChange={e => setOfferAmount(e.target.value)}
            className="flex-1 bg-transparent text-white text-3xl font-bold outline-none w-0"
          />
          <div className="ml-2 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Image src="/hbar.png" alt="HBAR" width={20} height={20} className="object-contain" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-white/40">≈ ${(Number(offerAmount) * 0.115).toFixed(2)} USD</span>
          <span className="text-[10px] text-[#FAA31E]">15.5% below floor</span>
        </div>
      </div>

      {/* Floor quick-select */}
      <div className="grid grid-cols-4 gap-2">
        {['Floor −6%', 'Floor −6%', 'Floor', 'Floor +6%'].map((label, i) => (
          <button
            key={i}
            className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
              label === 'Floor'
                ? 'bg-[#FAA31E] border-[#FAA31E] text-black'
                : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expiry */}
      <div>
        <p className="text-xs text-white/40 mb-2">OFFER EXPIRES IN</p>
        <div className="grid grid-cols-4 gap-2">
          {OFFER_EXPIRY_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setActiveExpiry(opt)}
              className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
                activeExpiry === opt
                  ? 'bg-[#1a1a1a] border-white/40 text-white'
                  : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Funds locked note */}
      <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/20 rounded-lg px-3 py-2">
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        <p className="text-[11px] text-white/60">
          Funds locked on Hedera until accepted or expired — fully automatic.
        </p>
      </div>

      {/* Breakdown */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-3">
        <p className="text-xs text-white/40 uppercase tracking-wider">Breakdown</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Creator royalty ({breakdown.creatorRoyalty.percent}%)</span>
          <span className="text-sm text-white/60">{breakdown.creatorRoyalty.amount} HBAR</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Platform fee ({breakdown.platformFee.percent}%)</span>
          <span className="text-sm text-white/60">{breakdown.platformFee.amount} HBAR</span>
        </div>
        <div className="border-t border-white/10 pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Total locked in escrow</span>
          <span className="text-sm font-bold text-[#FAA31E]">{breakdown.totalLocked} {breakdown.currency}</span>
        </div>
      </div>

      {/* Submit */}
      <MainButton className="w-full !rounded-xl !py-3.5 !bg-[#FAA31E] !border-[#FAA31E] !text-black !font-bold !shadow-none">
        Submit Offer → {seller.handle}
      </MainButton>

      <button className="text-sm text-white/40 hover:text-white transition-colors text-center">
        Cancel
      </button>

      <p className="text-[10px] text-white/30 text-center">
        Transaction is irreversible once accepted on Hedera
      </p>
    </div>
  )
}
