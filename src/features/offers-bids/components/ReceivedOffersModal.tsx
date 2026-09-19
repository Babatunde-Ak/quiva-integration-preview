'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace'
import type { ListingOfferGroup, ReceivedOffer } from '@/hook/useReceivedOffers'
import PreviewDialog from './PreviewDialog'

interface ReceivedOffersModalProps {
  group: ListingOfferGroup | null
  onClose: () => void
  /**
   * Called after a successful accept, reject or release so the caller can refetch. The caller is
   * expected to re-select this listing's refreshed group, which is what lets the seller settle
   * several offers without reopening the dialog between each one.
   */
  onSettled: () => void
}

type OfferAction = 'accept' | 'reject' | 'release'

const shorten = (value: string) =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : '-'

export default function ReceivedOffersModal({
  group,
  onClose,
  onSettled,
}: ReceivedOffersModalProps) {
  const { acceptOffer, rejectOffer, expireOffer, statusMessage } = useWagmiMarketplace()

  const [pendingOfferId, setPendingOfferId] = useState<number | null>(null)
  const [offerToReject, setOfferToReject] = useState<ReceivedOffer | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Offers this dialog has already settled on-chain. The refetch behind `onSettled` is racing the
  // indexer - the contract call returns as soon as the receipt lands, while the backend only sees
  // the event on its next poll - so a settled offer would otherwise reappear as live for a few
  // seconds. The receipt is the authority here; this just stops the UI contradicting it.
  const [settledOfferIds, setSettledOfferIds] = useState<number[]>([])

  const listingId = group?.listingId

  useEffect(() => {
    setSettledOfferIds([])
    setError(null)
  }, [listingId])

  const visibleOffers = useMemo(
    () => (group?.offers || []).filter((offer) => !settledOfferIds.includes(offer.offerId)),
    [group, settledOfferIds]
  )

  const run = async (offer: ReceivedOffer, action: OfferAction) => {
    setError(null)
    setPendingOfferId(offer.offerId)

    try {
      if (action === 'accept') {
        await acceptOffer(offer.offerId)

        // Accepting settles the listing, so there is nothing left to decide here.
        onSettled()
        onClose()
        return
      }

      if (action === 'reject') {
        await rejectOffer(offer.offerId)
        setOfferToReject(null)
      } else {
        await expireOffer(offer.offerId)
      }

      // Rejecting or releasing one offer says nothing about the others on this listing, so the
      // dialog stays open on the refreshed group and the seller can clear the rest.
      setSettledOfferIds((current) => [...current, offer.offerId])
      onSettled()
    } catch (err: any) {
      setError(err?.message || `Unable to ${action} this offer.`)
    } finally {
      setPendingOfferId(null)
    }
  }

  const requestReject = (offer: ReceivedOffer) => {
    setError(null)
    setOfferToReject(offer)
  }

  const closeRejectDialog = () => {
    if (pendingOfferId !== null) return

    setError(null)
    setOfferToReject(null)
  }

  return (
    <>
      <PreviewDialog
        isOpen={Boolean(group)}
        title="Offers on this edition"
        onClose={onClose}
        className="max-w-2xl"
      >
        {group && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-white">
                Offers on this edition
              </h3>

              <p className="mt-1 text-sm text-white/45">
                Listing #{group.listingId}
                {group.serialNumber !== undefined
                  ? ` - edition #${group.serialNumber}`
                  : ''}
                {group.listingPriceHbar !== undefined
                  ? ` - asking ${group.listingPriceHbar} HBAR`
                  : ''}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
              Accepting transfers the edition to the buyer and settles the
              marketplace transaction. Declining returns the buyer&apos;s
              escrowed HBAR and leaves the edition with you.
            </div>

            {visibleOffers.some((offer) => offer.isExpired) && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/55">
                An offer past its deadline can no longer be accepted or
                declined, but the buyer&apos;s HBAR is still held by the
                marketplace until someone releases it. Use{' '}
                <span className="font-semibold text-white">Release</span> to
                send it back and clear the offer from this list.
              </div>
            )}

            <div className="space-y-3">
              {visibleOffers.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-[#181818] p-6 text-center">
                  <p className="font-semibold text-white">
                    Every offer here has been settled
                  </p>

                  <p className="mt-2 text-sm text-white/45">
                    Nothing is left to accept or decline on this edition.
                  </p>
                </div>
              )}

              {visibleOffers.map((offer) => {
                const isPending = pendingOfferId === offer.offerId
                const isBusy = pendingOfferId !== null

                return (
                  <div
                    key={offer.offerId}
                    className={`rounded-xl border p-4 ${
                      offer.isExpired
                        ? 'border-white/10 opacity-60'
                        : 'border-white/10 bg-[#181818]'
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

                      <div className="flex flex-wrap gap-2">
                        {offer.isExpired ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void run(offer, 'release')}
                            className="flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-[#FAA31E]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {isPending && (
                              <Loader2 size={14} className="animate-spin" />
                            )}
                            Release
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void run(offer, 'accept')}
                              className="flex items-center gap-2 rounded-xl bg-[#FAA31E] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#ffb13b] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isPending && (
                                <Loader2 size={14} className="animate-spin" />
                              )}
                              Accept
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => requestReject(offer)}
                              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 transition hover:border-[#FAA31E]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Reject
                            </button>
                          </>
                        )}
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

            {error && !offerToReject && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </PreviewDialog>

      <PreviewDialog
        isOpen={Boolean(offerToReject)}
        title="Decline this offer?"
        onClose={closeRejectDialog}
        className="max-w-md"
      >
        {offerToReject && (
          <div className="space-y-5">
            <div className="pr-10">
              <h3 className="text-xl font-bold text-white">
                Decline this offer?
              </h3>

              <p className="mt-1 text-xs leading-5 text-white/40">
                {group?.serialNumber !== undefined
                  ? `Edition #${group.serialNumber}`
                  : `Listing #${offerToReject.listingId}`}
                {' · '}
                Offer from {shorten(offerToReject.buyer)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#171717] px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-white/40">
                  Offer amount
                </span>

                <span className="flex items-center gap-1 text-xl font-bold text-[#FAA31E]">
                  {offerToReject.amountHbar}
                  <HbarIcon size={15} />
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#151515]">
              <div className="border-b border-white/10 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-white/30">
                What happens
              </div>

              <div className="space-y-4 px-4 py-4 text-sm">
                <div className="flex items-center justify-between gap-4 text-white/55">
                  <span>Offer amount</span>

                  <span className="flex items-center gap-1 text-white">
                    {offerToReject.amountHbar}
                    <HbarIcon size={13} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 text-white/55">
                  <span>Buyer refund</span>

                  <span className="flex items-center gap-1 font-semibold text-white">
                    {offerToReject.amountHbar}
                    <HbarIcon size={13} />
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <span className="font-semibold text-white">
                    Your edition
                  </span>

                  <span className="font-semibold text-green-400">
                    Remains with you
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3">
              <p className="text-xs leading-5 text-green-400">
                Declining returns the buyer&apos;s escrowed HBAR. No ownership
                transfer takes place and you keep the edition.
              </p>
            </div>

            {pendingOfferId === offerToReject.offerId &&
              statusMessage && (
                <p className="rounded-xl border border-[#FAA31E]/30 bg-[#FAA31E]/5 px-4 py-3 text-sm text-[#FAA31E]">
                  {statusMessage}
                </p>
              )}

            {error && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={pendingOfferId !== null}
              onClick={() => void run(offerToReject, 'reject')}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FAA31E] px-4 py-3.5 text-sm font-bold text-black transition hover:bg-[#ffb13b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pendingOfferId === offerToReject.offerId && (
                <Loader2 size={16} className="animate-spin" />
              )}

              {pendingOfferId === offerToReject.offerId
                ? 'Declining offer...'
                : 'Decline offer'}
            </button>

            <button
              type="button"
              disabled={pendingOfferId !== null}
              onClick={closeRejectDialog}
              className="w-full rounded-lg border border-white/10 px-4 py-3 text-sm text-white/45 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>
          </div>
        )}
      </PreviewDialog>
    </>
  )
}
