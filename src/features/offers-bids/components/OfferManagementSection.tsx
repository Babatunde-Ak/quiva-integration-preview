'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace'
import OfferActionModals, { OfferModalType } from './OfferActionModals'
import {
  acceptedOffers,
  expiredOffers,
  myOffers,
  offersReceived,
  previewOfferSummary,
  resaleEarnings,
} from '../data/preview-data'

type OfferView = 'sent' | 'received'
type SentFilter = 'active' | 'accepted' | 'expired'

const panelClass = 'rounded-2xl border border-white/10 bg-[#151515]'
const focusClass = 'outline-none focus-visible:ring-2 focus-visible:ring-[#FAA31E] focus-visible:ring-offset-2 focus-visible:ring-offset-black'

function HbarAmount({ value, className = '' }: { value: number | string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {value}
      <HbarIcon size={14} />
    </span>
  )
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[120px] rounded-full px-5 py-3 text-sm font-bold transition ${focusClass} ${
        active ? 'bg-[#FAA31E] text-black' : 'bg-white/5 text-white/45 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export default function OfferManagementSection({ view }: { view: OfferView }) {
  const router = useRouter()
  const [filter, setFilter] = useState<SentFilter>('active')
  const [activeModal, setActiveModal] = useState<OfferModalType>(null)
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const { cancelOffer } = useWagmiMarketplace()

  const requestCancelOffer = async () => {
    if (selectedOfferId === null) {
      setTransactionError('This preview offer has no on-chain offer ID yet.')
      return
    }
    try {
      await cancelOffer(selectedOfferId)
      setActiveModal(null)
    } catch (error: any) {
      setTransactionError(error?.message || 'Offer cancellation failed.')
    }
  }

  const goToOffer = (mode: 'offer' | 'bid') => {
    router.push(`/marketplace/auction?mode=${mode === 'bid' ? 'bid' : 'offer'}`)
  }

  if (view === 'received') {
    return (
      <section className="w-full min-w-0 space-y-8">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">Offers Received</h2>
          <p className="mt-2 text-sm text-white/45">Offers and bids sent to you on your listed editions</p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Editions owned', value: '4' },
            { label: 'Active listings', value: '2', accent: true },
            { label: 'Pending bids/offers', value: '3', accent: true },
            { label: 'Total HBAR value', value: previewOfferSummary.totalReceivedValue },
          ].map((metric) => (
            <div key={metric.label} className={`${panelClass} p-5 text-center`}>
              <p className={`text-2xl font-bold ${metric.accent ? 'text-[#FAA31E]' : 'text-white'}`}>{metric.value}</p>
              <p className="mt-3 text-xs text-white/40">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {offersReceived.map((offer) => (
            <article
              key={offer.id}
              className={`rounded-2xl border bg-[#1b1b1b] p-4 transition md:p-5 ${
                offer.highlighted ? 'border-[#FAA31E]/80' : 'border-white/10'
              }`}
            >
              <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(88px,140px)_minmax(0,1fr)] md:items-center xl:grid-cols-[minmax(104px,150px)_minmax(0,1fr)_minmax(150px,190px)]">
                <div className="relative aspect-[4/5] w-full max-w-[150px] overflow-hidden rounded-xl bg-white/5 md:max-w-none">
                  <Image src={offer.image} alt={offer.title} fill sizes="(max-width: 767px) 150px, 140px" className="object-cover" />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-xl font-bold text-white">{offer.title}</h3>
                  <p className="mt-2 text-sm text-white/45">{offer.edition}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full bg-[#FAA31E] px-4 py-2 text-sm font-bold text-black sm:px-6">LISTED</span>
                    <span className="rounded-full border border-[#FAA31E]/60 px-4 py-2 text-sm font-bold text-[#FAA31E] sm:px-6">
                      {offer.offers} offers
                    </span>
                  </div>
                  <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white/40">Your listing price</p>
                      <HbarAmount value={offer.listingPrice} className="mt-2 text-2xl font-bold text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/40">Best offer</p>
                      <HbarAmount value={offer.bestOffer} className="mt-2 text-2xl font-bold text-[#FAA31E]" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal('accepted')}
                  className={`w-full rounded-xl border border-[#FAA31E] px-4 py-3 text-sm font-bold text-[#FAA31E] transition hover:bg-[#FAA31E] hover:text-black md:col-span-2 xl:col-span-1 ${focusClass}`}
                >
                  View & Accept Offers
                </button>
              </div>
            </article>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">Recent earnings from resales</h3>
          <div className="mt-4 space-y-3">
            {resaleEarnings.map((earning) => (
              <div key={earning.id} className={`${panelClass} flex min-w-0 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-white">{earning.title}</p>
                  <p className="mt-2 text-sm text-white/40">{earning.detail}</p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <HbarAmount value={`+${earning.amount}`} className="font-bold text-[#FAA31E]" />
                  <p className="mt-2 text-xs text-white/35">after fees</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <OfferActionModals
          activeModal={activeModal}
          onClose={() => setActiveModal(null)}
          onReadNow={() => router.push('/reader')}
          onViewEditions={() => router.push('/marketplace/user-profile?tab=mintedComics')}
        />
      </section>
    )
  }

  return (
    <section className="w-full min-w-0 space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">My Offers & Bids</h2>
          <p className="mt-2 text-sm text-white/45">Track everything you have submitted - funds locked in escrow</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-3">
          <FilterButton label="Active (3)" active={filter === 'active'} onClick={() => setFilter('active')} />
          <FilterButton label="Accepted" active={filter === 'accepted'} onClick={() => setFilter('accepted')} />
          <FilterButton label="Expired" active={filter === 'expired'} onClick={() => setFilter('expired')} />
        </div>
      </div>

      {filter === 'active' && (
        <>
          <div className="rounded-xl border border-[#FAA31E]/60 bg-[#FAA31E]/5 p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-white/40">Total locked in escrow</p>
                <HbarAmount value={previewOfferSummary.totalLocked} className="mt-2 font-bold text-[#FAA31E]" />
                <span className="ml-3 text-sm font-bold text-[#FAA31E]">{previewOfferSummary.usdValue}</span>
              </div>
              <p className="text-sm text-white/45 sm:text-right">Returns automatically if not accepted</p>
            </div>
          </div>

          <div className="space-y-5">
            {myOffers.map((offer) => (
              <article
                key={offer.id}
                className={`rounded-2xl border p-5 ${
                  offer.outbid ? 'border-red-500/70 bg-red-500/5' : 'border-white/10 bg-[#1b1b1b]'
                }`}
              >
                <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(160px,190px)] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-5 py-2 text-xs font-bold ${
                          offer.outbid ? 'border-red-500 text-red-400' : 'border-[#FAA31E] text-[#FAA31E]'
                        }`}
                      >
                        {offer.kind.toUpperCase()}
                      </span>
                      <span className="min-w-0 break-words text-sm text-white/40">{offer.context}</span>
                    </div>
                    <h3 className="mt-5 break-words text-lg font-bold text-white">{offer.title}</h3>
                    <p className="mt-3 text-sm text-white/45">
                      {offer.seller ? `Seller: ${offer.seller} - ` : ''}
                      {offer.highestBid ? `Highest bid is now ${offer.highestBid} HBAR - ` : ''}
                      {offer.expiry}
                    </p>
                    <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
                      <HbarAmount
                        value={offer.amount}
                        className={`text-2xl font-bold ${offer.outbid ? 'text-white/55' : 'text-[#FAA31E]'}`}
                      />
                      <p className={`self-end text-sm ${offer.outbid ? 'text-red-400' : 'text-white/35'}`}>
                        {offer.escrowCopy}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-col gap-3">
                    <span
                      className={`rounded-full px-4 py-2 text-center text-xs font-bold ${
                        offer.outbid ? 'bg-red-500 text-white' : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {offer.chip}
                    </span>
                    {offer.outbid && (
                      <button
                        type="button"
                        onClick={() => setActiveModal('raise')}
                        className={`w-full rounded-xl bg-[#FAA31E] px-4 py-3 font-bold text-black transition hover:bg-[#ffb13b] ${focusClass}`}
                      >
                        Raise bid
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setTransactionError(null)
                        setSelectedOfferId(/^\d+$/.test(offer.id) ? Number(offer.id) : null)
                        setActiveModal('cancel')
                      }}
                      className={`w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 transition hover:text-white ${focusClass}`}
                    >
                      Cancel offer
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="text-center text-sm text-white/40">
            Cancelling returns your HBAR instantly. Accepted offers transfer ownership only through the real marketplace flow.
          </p>
          {transactionError && <p className="text-center text-sm text-red-400">{transactionError}</p>}
        </>
      )}

      {filter === 'accepted' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-500/70 bg-green-500/5 p-5 text-sm text-white/45">
            These offers and bids have been accepted by the collector.
          </div>
          {acceptedOffers.map((offer) => (
            <article key={offer.id} className="rounded-2xl border border-green-500/70 bg-[#18221c] p-5">
              <div className="grid min-w-0 gap-5 md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[88px_minmax(0,1fr)_minmax(150px,180px)] lg:items-center">
                <div className="relative h-24 w-20 overflow-hidden rounded-lg bg-white/5">
                  <Image src={offer.image} alt={offer.title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="rounded-full bg-green-500/20 px-4 py-2 text-xs font-bold text-green-300">Accepted</span>
                  <h3 className="mt-3 break-words text-lg font-bold text-white">{offer.title}</h3>
                  <p className="mt-2 text-sm text-white/45">{offer.edition}</p>
                  <p className="mt-3 text-sm text-white/40">{offer.copy}</p>
                </div>
                <div className="min-w-0 md:col-span-2 lg:col-span-1 lg:text-right">
                  <p className="text-xs text-white/40">You paid</p>
                  <HbarAmount value={offer.amount} className="mt-2 justify-start text-xl font-bold text-[#FAA31E] md:justify-end" />
                  <button
                    type="button"
                    onClick={() => router.push('/marketplace/user-profile?tab=mintedComics')}
                    className={`mt-4 w-full rounded-xl bg-[#FAA31E] px-5 py-3 text-sm font-bold text-black ${focusClass}`}
                  >
                    View in My Editions
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {filter === 'expired' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/35">
            These offers and bids expired without a response. Your funds were returned automatically to your wallet.
          </div>
          {expiredOffers.map((offer) => (
            <article key={offer.id} className="rounded-2xl border border-white/10 bg-[#151515]/70 p-5 opacity-70">
              <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(150px,180px)] md:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/10 px-5 py-2 text-xs font-bold text-white/45">
                      {offer.kind.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-white/10 px-5 py-2 text-xs font-bold text-white/35">Expired</span>
                  </div>
                  <h3 className="mt-4 break-words font-bold text-white/80">{offer.title}</h3>
                  <p className="mt-2 text-sm text-white/40">{offer.copy}</p>
                  <HbarAmount value={offer.amount} className="mt-4 text-lg font-bold text-white/45 line-through" />
                </div>
                <button
                  type="button"
                  onClick={() => goToOffer(offer.kind === 'bid' ? 'bid' : 'offer')}
                  className={`w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/50 transition hover:text-white ${focusClass}`}
                >
                  {offer.action}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <OfferActionModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onCancelOffer={requestCancelOffer}
        onReadNow={() => router.push('/reader')}
        onViewEditions={() => router.push('/marketplace/user-profile?tab=mintedComics')}
      />
    </section>
  )
}
