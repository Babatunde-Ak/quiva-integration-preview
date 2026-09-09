'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { RefreshCw } from 'lucide-react'
import { HbarIcon } from '@/components/ui/HbarIcon'
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace'
import { useReceivedOffers, type ListingOfferGroup } from '@/hook/useReceivedOffers'
import { useMyOffers, type MyMarketplaceItem } from '@/hook/useMyOffers'
import ReceivedOffersModal from './ReceivedOffersModal'
import PreviewDialog from './PreviewDialog'

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
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ListingOfferGroup | null>(null)
  const [offerToCancel, setOfferToCancel] = useState<MyMarketplaceItem | null>(null)
  const [pendingReturnHbar, setPendingReturnHbar] = useState(0)
  const [busy, setBusy] = useState(false)

  const { cancelOffer, expireOffer, address, readPendingReturn, withdrawPendingReturn } =
    useWagmiMarketplace()
  const {
    offers: receivedOffers,
    groups,
    isLoading: receivedLoading,
    error: receivedError,
    refresh: refreshReceived,
  } = useReceivedOffers(address)
  const { items, active, accepted, closed, lockedHbar, isLoading, error: loadError, refresh } =
    useMyOffers(address)

  const offersMade = items.filter((item) => item.kind === 'offer').length
  const bidsPlaced = items.filter((item) => item.kind === 'bid').length

  // What the contract is holding for this wallet after it was outbid. Only readable on-chain -
  // being outbid credits pendingReturns rather than emitting anything the indexer could store.
  const refreshPendingReturn = useCallback(async () => {
    if (!address) {
      setPendingReturnHbar(0)
      return
    }
    const raw = await readPendingReturn(address)
    setPendingReturnHbar(Number(ethers.formatUnits(raw.toString(), 8)))
    // readPendingReturn is rebuilt every render by the marketplace hook, so keying the effect on
    // it would loop; the wallet is what actually changes the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])

  useEffect(() => {
    void refreshPendingReturn()
  }, [refreshPendingReturn])

  const requestCancelOffer = async () => {
    if (!offerToCancel) return
    setBusy(true)
    setTransactionError(null)
    try {
      await cancelOffer(offerToCancel.referenceId)
      setOfferToCancel(null)
      await refresh()
    } catch (error: any) {
      setTransactionError(error?.message || 'Offer cancellation failed.')
    } finally {
      setBusy(false)
    }
  }

  // Past its deadline the buyer can no longer cancel - `cancelOffer` requires the offer to still
  // be live - so expireOffer is the only way to get the escrowed HBAR back. It is permissionless,
  // so the buyer can trigger their own refund.
  const releaseExpiredOffer = async (item: MyMarketplaceItem) => {
    setBusy(true)
    setTransactionError(null)
    try {
      await expireOffer(item.referenceId)
      await refresh()
    } catch (error: any) {
      setTransactionError(error?.message || 'Could not release this offer.')
    } finally {
      setBusy(false)
    }
  }

  const withdraw = async () => {
    setBusy(true)
    setTransactionError(null)
    try {
      await withdrawPendingReturn()
      await refreshPendingReturn()
    } catch (error: any) {
      setTransactionError(error?.message || 'Withdrawal failed.')
    } finally {
      setBusy(false)
    }
  }

  const goToOffer = (mode: 'offer' | 'bid') => {
    router.push(`/marketplace/auction?mode=${mode === 'bid' ? 'bid' : 'offer'}`)
  }

  if (view === 'received') {
    const totalOffered = groups.reduce((sum, group) => sum + group.bestOfferHbar, 0)

    return (
      <section className="w-full min-w-0 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-white">Offers Received</h2>
            <p className="mt-2 text-sm text-white/45">Offers collectors have placed on your listed editions</p>
          </div>
          <button
            type="button"
            onClick={() => void refreshReceived()}
            className={`flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:text-white ${focusClass}`}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Listings with offers', value: String(groups.length) },
            { label: 'Pending offers', value: String(receivedOffers.length), accent: true },
            { label: 'Best offers combined', value: `${totalOffered}`, accent: true },
          ].map((metric) => (
            <div key={metric.label} className={`${panelClass} p-5 text-center`}>
              <p className={`text-2xl font-bold ${metric.accent ? 'text-[#FAA31E]' : 'text-white'}`}>{metric.value}</p>
              <p className="mt-3 text-xs text-white/40">{metric.label}</p>
            </div>
          ))}
        </div>

        {!address && (
          <div className={`${panelClass} p-8 text-center text-sm text-white/45`}>
            Connect your wallet to see offers on your listings.
          </div>
        )}

        {address && receivedLoading && (
          <div className={`${panelClass} p-8 text-center text-sm text-white/45`}>Loading offers...</div>
        )}

        {address && receivedError && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">
            {receivedError}
          </div>
        )}

        {address && !receivedLoading && !receivedError && groups.length === 0 && (
          <div className={`${panelClass} p-8 text-center`}>
            <p className="font-semibold text-white">No offers yet</p>
            <p className="mt-2 text-sm text-white/45">
              Nobody has made an offer on your listed editions so far.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {groups.map((group) => (
            <article key={group.listingId} className="rounded-2xl border border-[#FAA31E]/80 bg-[#1b1b1b] p-4 transition md:p-5">
              <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(150px,190px)] xl:items-center">
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-bold text-white">
                    {group.serialNumber !== undefined ? `Edition #${group.serialNumber}` : `Listing #${group.listingId}`}
                  </h3>
                  <p className="mt-2 text-sm text-white/45">Listing #{group.listingId}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className="rounded-full bg-[#FAA31E] px-4 py-2 text-sm font-bold text-black sm:px-6">LISTED</span>
                    <span className="rounded-full border border-[#FAA31E]/60 px-4 py-2 text-sm font-bold text-[#FAA31E] sm:px-6">
                      {group.offers.length} {group.offers.length === 1 ? 'offer' : 'offers'}
                    </span>
                  </div>
                  <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white/40">Your listing price</p>
                      <HbarAmount
                        value={group.listingPriceHbar ?? '-'}
                        className="mt-2 text-2xl font-bold text-white"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/40">Best offer</p>
                      <HbarAmount value={group.bestOfferHbar} className="mt-2 text-2xl font-bold text-[#FAA31E]" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full rounded-xl border border-[#FAA31E] px-4 py-3 text-sm font-bold text-[#FAA31E] transition hover:bg-[#FAA31E] hover:text-black ${focusClass}`}
                >
                  View &amp; Accept Offers
                </button>
              </div>
            </article>
          ))}
        </div>

        <ReceivedOffersModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onSettled={() => void refreshReceived()}
        />
      </section>
    )
  }

  const closedLabel: Record<string, string> = {
    expired: 'Expired',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
    lost: 'Auction lost',
  }

  const visible = filter === 'active' ? active : filter === 'accepted' ? accepted : closed

  return (
    <section className="w-full min-w-0 space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-white">My Offers &amp; Bids</h2>
          <p className="mt-2 text-sm text-white/45">Everything you have submitted and are waiting on</p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-3">
          <FilterButton label={`Active (${active.length})`} active={filter === 'active'} onClick={() => setFilter('active')} />
          <FilterButton label={`Accepted (${accepted.length})`} active={filter === 'accepted'} onClick={() => setFilter('accepted')} />
          <FilterButton label={`Closed (${closed.length})`} active={filter === 'expired'} onClick={() => setFilter('expired')} />
        </div>
      </div>

      {!address && (
        <div className={`${panelClass} p-8 text-center text-sm text-white/45`}>
          Connect your wallet to see the offers and bids you have made.
        </div>
      )}

      {address && (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Offers made', value: String(offersMade), accent: true },
            { label: 'Bids placed', value: String(bidsPlaced) },
            { label: 'Accepted', value: String(accepted.length) },
          ].map((metric) => (
            <div key={metric.label} className={`${panelClass} p-5 text-center`}>
              <p className={`text-2xl font-bold ${metric.accent ? 'text-[#FAA31E]' : 'text-white'}`}>
                {metric.value}
              </p>
              <p className="mt-3 text-xs text-white/40">{metric.label}</p>
            </div>
          ))}
        </div>
      )}

      {address && filter === 'active' && (
        <>
          <div className="rounded-xl border border-[#FAA31E]/60 bg-[#FAA31E]/5 p-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-white/40">Total locked in escrow</p>
                <HbarAmount value={lockedHbar} className="mt-2 font-bold text-[#FAA31E]" />
              </div>
              <p className="text-sm text-white/45 sm:text-right">Returned automatically if not accepted</p>
            </div>
          </div>

          {pendingReturnHbar > 0 && (
            <div className="rounded-xl border border-green-500/40 bg-green-500/5 p-5">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-white/40">Ready to withdraw</p>
                  <HbarAmount value={pendingReturnHbar} className="mt-2 font-bold text-green-400" />
                  <p className="mt-2 text-xs text-white/40">
                    Held for you after being outbid. It stays in the contract until you withdraw it.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={withdraw}
                  className={`rounded-xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400 disabled:opacity-40 ${focusClass}`}
                >
                  Withdraw
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {address && isLoading && (
        <div className={`${panelClass} p-8 text-center text-sm text-white/45`}>Loading...</div>
      )}

      {address && loadError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">{loadError}</div>
      )}

      {address && !isLoading && !loadError && visible.length === 0 && (
        <div className={`${panelClass} p-8 text-center`}>
          <p className="font-semibold text-white">Nothing here yet</p>
          <p className="mt-2 text-sm text-white/45">
            {filter === 'active'
              ? 'You have no live offers or bids.'
              : filter === 'accepted'
                ? 'None of your offers or bids have been accepted yet.'
                : 'Nothing has expired or been closed.'}
          </p>
        </div>
      )}

      <div className="space-y-5">
        {visible.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border p-5 ${
              item.outbid ? 'border-red-500/70 bg-red-500/5' : 'border-white/10 bg-[#1b1b1b]'
            }`}
          >
            <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(160px,190px)] lg:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-5 py-2 text-xs font-bold ${
                      item.outbid ? 'border-red-500 text-red-400' : 'border-[#FAA31E] text-[#FAA31E]'
                    }`}
                  >
                    {item.kind.toUpperCase()}
                  </span>
                  <span className="min-w-0 break-words text-sm text-white/40">
                    {item.kind === 'offer'
                      ? `Offer #${item.referenceId}${item.listingId !== undefined ? ` on listing #${item.listingId}` : ''}`
                      : `Auction #${item.referenceId}`}
                  </span>
                </div>

                <h3 className="mt-5 break-words text-lg font-bold text-white">
                  {item.serialNumber !== undefined ? `Edition #${item.serialNumber}` : 'Edition'}
                </h3>

                <p className="mt-3 text-sm text-white/45">
                  {item.kind === 'bid' && item.highestBidHbar !== undefined
                    ? `Highest bid is now ${item.highestBidHbar} HBAR`
                    : item.expiresAt > 0
                      ? `Expires ${new Date(item.expiresAt * 1000).toLocaleString()}`
                      : 'No expiry set'}
                </p>

                <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-2">
                  <HbarAmount
                    value={item.amountHbar}
                    className={`text-2xl font-bold ${item.outbid ? 'text-white/55' : 'text-[#FAA31E]'}`}
                  />
                  <p className={`self-end text-sm ${item.outbid ? 'text-red-400' : 'text-white/35'}`}>
                    {item.status === 'active'
                      ? item.outbid
                        ? 'Outbid - your HBAR is ready to withdraw'
                        : 'Locked in escrow'
                      : item.status === 'accepted'
                        ? 'Accepted - the edition is yours'
                        : item.needsRelease
                          ? 'Expired - your HBAR is still held, claim it back'
                          : closedLabel[item.closedReason || 'expired']}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-3">
                {item.kind === 'bid' && item.outbid && (
                  <button
                    type="button"
                    onClick={() => goToOffer('bid')}
                    className={`w-full rounded-xl bg-[#FAA31E] px-4 py-3 font-bold text-black transition hover:bg-[#ffb13b] ${focusClass}`}
                  >
                    Raise bid
                  </button>
                )}
                {item.kind === 'offer' && item.status === 'active' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setTransactionError(null)
                      setOfferToCancel(item)
                    }}
                    className={`w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 transition hover:text-white disabled:opacity-40 ${focusClass}`}
                  >
                    Cancel offer
                  </button>
                )}
                {item.needsRelease && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => releaseExpiredOffer(item)}
                    className={`w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-green-400 disabled:opacity-40 ${focusClass}`}
                  >
                    Claim refund
                  </button>
                )}
                {item.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => router.push('/marketplace/user-profile?tab=mintedComics')}
                    className={`w-full rounded-xl bg-[#FAA31E] px-4 py-3 text-sm font-bold text-black ${focusClass}`}
                  >
                    View in My Editions
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {transactionError && !offerToCancel && (
        <p className="text-center text-sm text-red-400">{transactionError}</p>
      )}

      <PreviewDialog
        isOpen={Boolean(offerToCancel)}
        title="Cancel this offer?"
        onClose={() => setOfferToCancel(null)}
        className="max-w-md"
      >
        {offerToCancel && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">Cancel this offer?</h3>
              <p className="mt-1 text-sm text-white/45">
                Offer #{offerToCancel.referenceId}
                {offerToCancel.listingId !== undefined ? ` on listing #${offerToCancel.listingId}` : ''}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
              <p className="text-xs text-white/35">You will get back</p>
              <HbarAmount
                value={offerToCancel.amountHbar}
                className="mt-2 justify-center text-4xl font-bold text-green-400"
              />
              <p className="mt-2 text-xs text-white/35">Returned to your wallet in the same transaction</p>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={requestCancelOffer}
              className={`w-full rounded-xl bg-red-500 py-3.5 font-bold text-white transition hover:bg-red-400 disabled:opacity-40 ${focusClass}`}
            >
              Yes, cancel offer
            </button>
            <button
              type="button"
              onClick={() => setOfferToCancel(null)}
              className={`w-full rounded-xl border border-white/10 py-3 text-sm text-white/45 transition hover:text-white ${focusClass}`}
            >
              Keep offer active
            </button>
            {transactionError && <p className="text-sm text-red-400">{transactionError}</p>}
          </div>
        )}
      </PreviewDialog>
    </section>
  )
}
