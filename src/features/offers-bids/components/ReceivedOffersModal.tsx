'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace'
import type { ListingOfferGroup, ReceivedOffer } from '@/hook/useReceivedOffers'
import PreviewDialog from './PreviewDialog'

interface ReceivedOffersModalProps {
  group: ListingOfferGroup | null
  onClose: () => void
  /** Called after a successful accept or reject so the caller can refetch. */
  onSettled: () => void
}

const shorten = (value: string) => (value ? `${value.slice(0, 6)}...${value.slice(-4)}` : '-')

export default function ReceivedOffersModal({ group, onClose, onSettled }: ReceivedOffersModalProps) {
  const { acceptOffer, rejectOffer, statusMessage } = useWagmiMarketplace()
  const [pendingOfferId, setPendingOfferId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (offer: ReceivedOffer, action: 'accept' | 'reject') => {
    setError(null)
    setPendingOfferId(offer.offerId)
    try {
      await (action === 'accept' ? acceptOffer(offer.offerId) : rejectOffer(offer.offerId))
      onSettled()
      onClose()
    } catch (err: any) {
      setError(err?.message || `Unable to ${action} this offer.`)
    } finally {
      setPendingOfferId(null)
    }
  }

  return (
    <PreviewDialog
      isOpen={Boolean(group)}
      title="Offers on this edition"
      onClose={onClose}
      className="max-w-2xl"
    >
      {group && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-white">Offers on this edition</h3>
            <p className="mt-1 text-sm text-white/45">
              Listing #{group.listingId}
              {group.serialNumber !== undefined ? ` - edition #${group.serialNumber}` : ''}
              {group.listingPriceHbar !== undefined ? ` - asking ${group.listingPriceHbar} HBAR` : ''}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
            Accepting transfers the edition to the buyer and pays you in the same transaction.
            The creator&apos;s royalty is deducted automatically. Rejecting returns the buyer&apos;s
            HBAR immediately.
          </div>

          <div className="space-y-3">
            {group.offers.map((offer) => {
              const isPending = pendingOfferId === offer.offerId
              const isBusy = pendingOfferId !== null

              return (
                <div
                  key={offer.offerId}
                  className={`rounded-xl border p-4 ${
                    offer.isExpired ? 'border-white/10 opacity-60' : 'border-white/10 bg-[#181818]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-2xl font-bold text-[#FAA31E]">
                        {offer.amountHbar}
                        <HbarIcon size={16} />
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Offer #{offer.offerId} from {shorten(offer.buyer)}
                        {offer.isExpired ? ' - expired' : ''}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isBusy || offer.isExpired}
                        onClick={() => run(offer, 'accept')}
                        className="flex items-center gap-2 rounded-xl bg-[#FAA31E] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#ffb13b] disabled:opacity-40"
                      >
                        {isPending && <Loader2 size={14} className="animate-spin" />}
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => run(offer, 'reject')}
                        className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/55 transition hover:text-white disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pendingOfferId !== null && statusMessage && (
            <p className="rounded-xl border border-[#FAA31E]/30 bg-[#FAA31E]/5 px-4 py-3 text-sm text-[#FAA31E]">
              {statusMessage}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </PreviewDialog>
  )
}
