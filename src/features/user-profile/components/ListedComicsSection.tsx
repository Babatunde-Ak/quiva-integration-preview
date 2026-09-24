'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { useMyListings } from '@/hook/useMyListings';
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace';
import type { ResaleListing } from '@/hook/useResaleListings';
import type { OwnedComic } from '@/hook/usePurchasedComics';
import EmptyState from './states/EmptyState';

interface ListedComicsSectionProps {
  walletAddress?: string | null;
  /**
   * The wallet's NFTs, already resolved to comics by the profile page. Used only to put a title
   * and cover on each listing - the listing itself carries just a token address and a serial.
   * Passed in rather than fetched again so opening this tab costs no extra mirror-node call.
   */
  ownedComics: OwnedComic[];
  onAction?: (action: string) => void;
}

const shorten = (value?: string | null) =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : '—';

const ListedComicsSection: React.FC<ListedComicsSectionProps> = ({
  walletAddress,
  ownedComics,
  onAction,
}) => {
  const router = useRouter();
  const { listings, totalHbar, isLoading, error, refresh } = useMyListings(walletAddress);
  const { cancelResaleListing, statusMessage } = useWagmiMarketplace();

  const [pendingListingId, setPendingListingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  /** The comic a listing belongs to, matched on the collection token plus the serial. */
  const comicFor = (listing: ResaleListing) =>
    ownedComics.find(
      (owned) =>
        owned.tokenEvmAddress?.toLowerCase() === listing.tokenAddress &&
        owned.serialNumber === listing.serialNumber
    );

  const handleCancel = async (listing: ResaleListing) => {
    setActionError(null);
    setActionMessage(null);
    setPendingListingId(listing.listingId);

    try {
      await cancelResaleListing(listing.listingId);
      setActionMessage(
        `Edition #${listing.serialNumber} is no longer for sale. It stays in your wallet.`
      );
      await refresh();
    } catch (err: any) {
      setActionError(err?.message || 'Unable to cancel this listing.');
    } finally {
      setPendingListingId(null);
    }
  };

  if (!walletAddress) {
    return (
      <div className="rounded-2xl border border-black-50 bg-[#0A0A0A] p-8 text-center text-sm text-white/50">
        Connect your wallet to see the comics you have listed for sale.
      </div>
    );
  }

  if (isLoading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="text-white/60">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error && listings.length === 0) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-8 text-center">
        <p className="mb-2 font-semibold text-red-400">Couldn&apos;t load your listings</p>
        <p className="mb-5 text-sm text-white/60">{error}</p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-full bg-orange-600 px-6 py-2 font-bold text-white transition-colors hover:bg-orange-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState type="listedComics" onAction={onAction} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-white/50">
            {listings.length} {listings.length === 1 ? 'edition' : 'editions'} on sale, asking{' '}
            <span className="inline-flex items-center gap-1 font-bold text-[#FF9F1C]">
              {Number(totalHbar.toFixed(4))}
              <Image src="/hbar.png" alt="HBAR" width={13} height={13} />
            </span>{' '}
            in total
          </p>
          <p className="mt-1 text-xs text-white/35">
            Listed editions stay in your wallet until someone buys them
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          className="flex items-center gap-2 rounded-full border border-[#242424] px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-orange-500/40 hover:text-white"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-xl border border-green-900/40 bg-green-950/20 px-4 py-3 text-sm text-green-400">
          {actionMessage}
        </div>
      )}
      {pendingListingId !== null && statusMessage && (
        <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 px-4 py-3 text-sm text-orange-300">
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {listings.map((listing) => {
          const comic = comicFor(listing);
          const isPending = pendingListingId === listing.listingId;

          return (
            <div
              key={listing.listingId}
              className="group overflow-hidden rounded-2xl border border-[#242424] bg-[#0A0A0A] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-900">
                <Image
                  src={comic?.bannerImage || '/placeholder-comic.png'}
                  alt={`${comic?.title || 'Comic'} #${listing.serialNumber}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />

                <div className="absolute right-3 top-3 rounded-lg border border-orange-500/50 bg-black/70 px-3 py-1.5 backdrop-blur-sm">
                  <p className="text-sm font-bold text-orange-400">#{listing.serialNumber}</p>
                </div>

                <div className="absolute left-3 top-3 rounded-lg border border-[#FF9F1C]/60 bg-[#FF9F1C]/20 px-2 py-1 backdrop-blur-sm">
                  <p className="text-xs font-bold text-[#FF9F1C]">For sale</p>
                </div>
              </div>

              <div className="p-4">
                <h4 className="mb-3 line-clamp-2 text-lg font-bold transition-colors group-hover:text-orange-400">
                  {comic?.title || 'Comic Edition'}
                </h4>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Asking:</span>
                    <span className="flex items-center gap-1 font-bold text-[#FF9F1C]">
                      {listing.priceHbar}
                      <Image src="/hbar.png" alt="HBAR" width={14} height={14} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Listing:</span>
                    <span className="font-mono text-xs text-white/70">#{listing.listingId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Collection:</span>
                    <span className="font-mono text-xs text-white/70">
                      {shorten(listing.tokenAddress)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {comic?.comicId && (
                    <button
                      type="button"
                      onClick={() => router.push(`/marketplace/detail?id=${comic.comicId}`)}
                      className="w-full rounded-full bg-[#FF9F1C] px-4 py-2.5 font-bold text-black transition-all hover:bg-[#FFB045] active:scale-[0.98]"
                    >
                      View comic
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleCancel(listing)}
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-600 px-4 py-2.5 font-bold text-white transition-all hover:border-neutral-400 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isPending && <Loader2 size={16} className="animate-spin" />}
                    Cancel listing
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListedComicsSection;
