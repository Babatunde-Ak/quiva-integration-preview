'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace'
import { OFFER_EXPIRY_OPTIONS, FLOOR_OPTIONS } from '../data/data'
import type { OfferComic } from './auction-view'

type OfferMode = 'specific' | 'open'

export default function OfferPanel({
  comic,
  listedPriceHbar,
  floorPriceHbar,
  highestOfferHbar,
  balanceHbar,
  royaltyPercent,
  platformFeePercent,
  initialMode = 'specific',
  listingId,
  auctionId,
  onSubmitted,
}: {
  comic: OfferComic
  listedPriceHbar?: number
  floorPriceHbar?: number
  highestOfferHbar?: number
  balanceHbar?: number
  royaltyPercent?: number
  platformFeePercent?: number
  initialMode?: OfferMode
  listingId?: number
  auctionId?: number
  onSubmitted?: () => void
}) {
  const router = useRouter()
  const { createOffer, placeBid, isProcessing, error } = useWagmiMarketplace()
  // Seeded from the listing rather than a fixed number, so the field opens somewhere sensible
  // for this edition instead of at a constant that means nothing here.
  const [amount, setAmount] = useState('')
  const [activeExpiry, setActiveExpiry] = useState('24 hours')
  const [mode, setMode] = useState<OfferMode>(initialMode)

  const numericAmount = Number(amount) || 0
  const usdAmount = (numericAmount * 0.115).toFixed(2)
  const floorPrice = floorPriceHbar ?? listedPriceHbar ?? 0
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

  // Open at the asking price once it is known, so the field starts from this listing rather
  // than empty. Only seeds an untouched field, so it never overwrites what someone typed.
  const [amountTouched, setAmountTouched] = useState(false)
  useEffect(() => {
    if (!amountTouched && listedPriceHbar !== undefined) setAmount(String(listedPriceHbar))
  }, [amountTouched, listedPriceHbar])

  const title = mode === 'open' ? 'Place a Bid' : 'Make an Offer'
  const amountLabel = mode === 'open' ? 'Your bid amount' : 'Your offer amount'
  const expiryLabel = mode === 'open' ? 'Bid expires in' : 'Offer expires in'
  const ctaLabel = mode === 'open' ? 'Place Bid' : 'Submit offer'
  const helperCopy =
    mode === 'open'
      ? 'Your bid is held by the marketplace until the auction ends. If you are outbid it becomes withdrawable straight away.'
      : 'Your HBAR is held by the marketplace until the seller accepts, rejects, or the offer expires.'

  const expirySeconds = activeExpiry === '24 hours'
    ? 24 * 60 * 60
    : activeExpiry === '3 days'
      ? 3 * 24 * 60 * 60
      : activeExpiry === '7 days'
        ? 7 * 24 * 60 * 60
        : 30 * 24 * 60 * 60

  // Both actions address something that has to already exist on-chain: an offer needs the
  // listing it sits on, a bid needs the auction. Both arrive as query params, so opening this
  // page without them leaves nothing to call. Surfaced here rather than thrown, because a
  // swallowed throw looks exactly like a button that does nothing.
  const missingTarget =
    mode === 'open'
      ? auctionId === undefined
        ? 'Open this page from an auction to place a bid.'
        : null
      : listingId === undefined
        ? 'Open this page from a resale listing to make an offer on it.'
        : null

  const [submitError, setSubmitError] = useState<string | null>(null)

  const submitTransaction = async () => {
    setSubmitError(null)
    if (missingTarget) {
      setSubmitError(missingTarget)
      return
    }
    if (numericAmount <= 0) {
      setSubmitError('Enter an amount greater than zero.')
      return
    }

    try {
      if (mode === 'open') {
        await placeBid({ auctionId: auctionId as number, amountInHbar: numericAmount })
      } else {
        await createOffer({
          listingId: listingId as number,
          amountInHbar: numericAmount,
          expiresAt: Math.floor(Date.now() / 1000) + expirySeconds,
        })
      }
      onSubmitted?.()
    } catch (err: any) {
      setSubmitError(err?.message || 'The transaction could not be submitted.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/40">
          {[
            comic.title,
            comic.episode,
            comic.serialNumber !== undefined ? `#${comic.serialNumber}` : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'This edition'}
        </p>
      </div>

      {/*
        The old "Open Bid — any holder of this episode can accept your price" tile described a
        collection-wide offer, which this marketplace has no function for. `placeBid` bids on one
        specific auction, so the toggle only appears when an auction id was actually passed in;
        otherwise there is nothing for that mode to address.
      */}
      {auctionId !== undefined && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode('specific')}
            disabled={listingId === undefined}
            className={`rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#FAA31E] disabled:opacity-40 ${
              mode === 'specific'
                ? 'border-[#FAA31E] bg-[#FAA31E]/15'
                : 'border-white/10 bg-[#171717] hover:border-white/25'
            }`}
          >
            <p className="font-bold text-[#FAA31E]">Offer</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Offer on this listing. The seller chooses whether to accept.
            </p>
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
            <p className="font-bold text-white/80">Auction bid</p>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Bid in the live auction. Highest bid at the end wins.
            </p>
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-[#171717] md:grid-cols-4">
        {[
          { label: 'Listed at', value: listedPriceHbar },
          { label: 'Floor price', value: floorPriceHbar },
          { label: 'Your balance', value: balanceHbar },
          { label: 'Highest offer', value: highestOfferHbar },
        ].map((item, index) => (
          <div key={item.label} className={`p-4 ${index > 0 ? 'md:border-l md:border-white/10' : ''}`}>
            <p className="text-xs text-white/35">{item.label}</p>
            <p className="mt-2 flex items-center gap-1 text-lg font-bold text-white">
              {/* Dash rather than a placeholder number: an invented figure here is one a
                  buyer would price against. */}
              {item.value === undefined ? '-' : Number(item.value.toFixed(4))}
              <HbarIcon size={14} />
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
            onChange={(event) => { setAmountTouched(true); setAmount(event.target.value) }}
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

      {/*
        What the seller would actually keep if this offer were accepted. The platform fee comes
        off the offer first, then HTS takes the collection's royalty out of what reaches the
        seller - the same order the contract settles in - so the royalty is a share of the
        post-fee amount, not of the headline offer.
      */}
      <div className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="px-5 py-4 text-xs font-bold uppercase text-white/35">Breakdown</div>
        <div className="space-y-4 px-5 pb-5 text-sm">
          {platformFeePercent !== undefined && (
            <div className="flex items-center justify-between text-white/55">
              <span>Platform fee ({platformFeePercent}%)</span>
              <span>{((numericAmount * platformFeePercent) / 100).toFixed(2)} HBAR</span>
            </div>
          )}
          {royaltyPercent !== undefined && platformFeePercent !== undefined && (
            <div className="flex items-center justify-between text-white/55">
              <span>Creator royalty ({royaltyPercent}%)</span>
              <span>
                {(
                  ((numericAmount * (100 - platformFeePercent)) / 100) *
                  (royaltyPercent / 100)
                ).toFixed(2)}{' '}
                HBAR
              </span>
            </div>
          )}
          {royaltyPercent !== undefined && platformFeePercent !== undefined && (
            <div className="flex items-center justify-between text-white/55">
              <span>Seller receives</span>
              <span>
                {(
                  ((numericAmount * (100 - platformFeePercent)) / 100) *
                  (1 - royaltyPercent / 100)
                ).toFixed(2)}{' '}
                HBAR
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 font-bold text-white">
            <span>Total locked in escrow</span>
            <span className="text-[#FAA31E]">{numericAmount} HBAR</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={submitTransaction}
        disabled={isProcessing}
        className="w-full rounded-xl bg-[#FAA31E] py-4 font-bold text-black outline-none transition hover:bg-[#ffb13b] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white"
      >
        {isProcessing ? 'Confirming transaction...' : ctaLabel}
      </button>

      {(submitError || error) && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {submitError || error}
        </p>
      )}
      {missingTarget && !submitError && (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
          {missingTarget}
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push('/marketplace')}
        className="w-full rounded-xl border border-white/10 py-3 text-sm text-white/40 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-[#FAA31E]"
      >
        Cancel
      </button>

      <p className="text-center text-xs text-white/30">
        {mode === 'open' ? 'Your bid is held in escrow until the auction settles.' : 'Your HBAR is held in escrow until the seller accepts or the offer expires.'}
      </p>
    </div>
  )
}
