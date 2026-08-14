'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HbarIcon } from '@/components/ui/HbarIcon'
import OfferActionModals, { OfferModalType } from '@/features/offers-bids/components/OfferActionModals'
import {
  SELLER,
  COMIC,
  OFFER_STATS,
  OFFER_EXPIRY_OPTIONS,
  BREAKDOWN,
  FLOOR_OPTIONS,
} from '../data/data'

type OfferMode = 'specific' | 'open'

export default function OfferPanel({
  seller,
  comic,
  offerStats,
  breakdown,
  initialMode = 'specific',
}: {
  seller: typeof SELLER
  comic: typeof COMIC
  offerStats: typeof OFFER_STATS
  breakdown: typeof BREAKDOWN
  initialMode?: OfferMode
}) {
  const router = useRouter()
  const [amount, setAmount] = useState('120')
  const [activeExpiry, setActiveExpiry] = useState('24 hours')
  const [mode, setMode] = useState<OfferMode>(initialMode)
  const [activeModal, setActiveModal] = useState<OfferModalType>(null)

  const numericAmount = Number(amount) || 0
  const usdAmount = (numericAmount * 0.1295).toFixed(2)
  const floorPrice = Number(offerStats.floorPrice.value) || 142
  const floorDeltaCopy = useMemo(() => {
    if (!numericAmount || !floorPrice) return 'Set a bid amount'
    const delta = ((numericAmount - floorPrice) / floorPrice) * 100
    const rounded = Math.abs(delta).toFixed(1)
    if (delta < 0) return `${rounded}% below floor`
    if (delta > 0) return `${rounded}% above floor`
    return 'At floor fair price'
  }, [floorPrice, numericAmount])

  const setPresetAmount = (value: number) => {
    const next = Math.max(1, Math.round(floorPrice + (floorPrice * value) / 100))
    setAmount(String(next))
  }

  const title = mode === 'open' ? 'Place a Bid' : 'Make an Offer'
  const amountLabel = mode === 'open' ? 'Your bid amount' : 'Your offer amount'
  const expiryLabel = mode === 'open' ? 'Bid expires in' : 'Offer expires in'
  const ctaLabel = mode === 'open' ? 'Place Bid' : `Submit Offer -> ${seller.handle}`
  const helperCopy =
    mode === 'open'
      ? 'Any holder of this episode can accept your price. Funds stay locked until accepted or expired.'
      : 'Offer is sent directly to the collector. Funds stay locked until accepted or expired.'

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/40">
          to {seller.handle} - {comic.series} {comic.episode} #42
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('specific')}
          className={`rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] ${
            mode === 'specific'
              ? 'border-[#FAA31E] bg-[#FAA31E]/15'
              : 'border-white/10 bg-[#171717] hover:border-white/25'
          }`}
        >
          <p className="font-bold text-[#FAA31E]">Specific Offer</p>
          <p className="mt-2 text-xs leading-5 text-white/45">Offer on this edition only. {seller.handle} decides.</p>
        </button>
        <button
          type="button"
          onClick={() => setMode('open')}
          className={`rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] ${
            mode === 'open'
              ? 'border-[#FAA31E] bg-[#FAA31E]/15'
              : 'border-white/10 bg-[#171717] hover:border-white/25'
          }`}
        >
          <p className="font-bold text-white/80">Open Bid</p>
          <p className="mt-2 text-xs leading-5 text-white/45">Any holder of this episode can accept your price.</p>
        </button>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#171717] md:grid-cols-4">
        {[
          { label: 'Listed at', value: offerStats.listed.value },
          { label: 'Floor price', value: offerStats.floorPrice.value },
          { label: 'Your balance', value: offerStats.topBalance.value },
          { label: 'Highest bid', value: offerStats.highestBid.value },
        ].map((item, index) => (
          <div key={item.label} className={`p-4 ${index > 0 ? 'md:border-l md:border-white/10' : ''}`}>
            <p className="text-xs text-white/35">{item.label}</p>
            <p className="mt-2 flex items-center gap-1 text-lg font-bold text-white">
              {item.value} <HbarIcon size={14} />
            </p>
          </div>
        ))}
      </div>

      <label className="block">
        <span className="text-xs font-bold uppercase text-white/40">{amountLabel}</span>
        <div className="mt-3 flex items-center rounded-xl border-2 border-[#FAA31E] bg-[#171717] px-6 py-5">
          <input
            aria-label={amountLabel}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full bg-transparent text-4xl font-bold text-white outline-none"
          />
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black">
            <HbarIcon size={24} />
          </span>
        </div>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
          <span>~ ${usdAmount} USD</span>
          <span className={floorDeltaCopy.includes('below') ? 'text-red-400' : 'text-green-400'}>{floorDeltaCopy}</span>
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {FLOOR_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setPresetAmount(option.value)}
            className={`rounded-lg border px-3 py-3 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] ${
              option.value === 0
                ? 'border-[#FAA31E] bg-[#FAA31E] text-black'
                : 'border-white/10 bg-[#171717] text-white/50 hover:border-white/30 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase text-white/40">{expiryLabel}</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {OFFER_EXPIRY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveExpiry(option)}
              className={`rounded-lg border px-3 py-3 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] ${
                activeExpiry === option
                  ? 'border-[#FAA31E] bg-[#FAA31E] text-black'
                  : 'border-white/10 bg-[#171717] text-white/50 hover:border-white/30 hover:text-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-white/60">
        <span className="h-3 w-3 rounded-full bg-green-400" />
        {helperCopy}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="px-5 py-4 text-xs font-bold uppercase text-white/35">Breakdown</div>
        <div className="space-y-4 px-5 pb-5 text-sm">
          <div className="flex items-center justify-between text-white/55">
            <span>Creator royalty ({breakdown.creatorRoyalty.percent}%)</span>
            <span>{breakdown.creatorRoyalty.amount} HBAR</span>
          </div>
          <div className="flex items-center justify-between text-white/55">
            <span>Platform fee ({breakdown.platformFee.percent}%)</span>
            <span>{breakdown.platformFee.amount} HBAR</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4 font-bold text-white">
            <span>Total locked in escrow</span>
            <span className="text-[#FAA31E]">{numericAmount} HBAR</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setActiveModal('accepted')}
        className="w-full rounded-xl bg-[#FAA31E] py-4 font-bold text-black outline-none transition hover:bg-[#ffb13b] focus-visible:ring-2 focus-visible:ring-white"
      >
        {ctaLabel}
      </button>

      <button
        type="button"
        onClick={() => router.push('/marketplace')}
        className="w-full rounded-xl border border-white/10 py-3 text-sm text-white/40 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
      >
        Cancel
      </button>

      <p className="text-center text-xs text-white/30">
        Preview UI only. No blockchain transfer or escrow transaction is submitted from this screen.
      </p>

      <OfferActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onReadNow={() => router.push('/reader')}
        onViewEditions={() => router.push('/marketplace/user-profile?tab=mintedComics')}
      />
    </div>
  )
}
