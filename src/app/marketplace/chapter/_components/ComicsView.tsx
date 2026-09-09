import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Gift, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useAppSelector } from '@/redux/hook';
import { useRouter } from 'next/navigation';
import { useResaleListings, type ResaleListing } from '@/hook/useResaleListings';
import { useWagmiMarketplace } from '@/hook/useWagmiMarketplace';

interface ComicsViewProps {
  comicId?: string | null;
  /**
   * `buy` is the Comics tab: the editions on sale, bought outright.
   * `offer` is the Offers tab: the same editions, but the action is to bid on one instead.
   *
   * Both render from the same listings because an offer is always made against a specific
   * live listing - `createOffer` takes a listing id, so there is nothing to offer on that
   * isn't already in this grid.
   */
  mode?: 'buy' | 'offer';
}

const shorten = (value?: string | null, lead = 6) =>
  value ? `${value.slice(0, lead)}...${value.slice(-4)}` : '—';

/**
 * Secondary market for a single comic: the editions holders have put back up for sale on the
 * marketplace contract. The creator's own drop is not part of this - that lives on the sales
 * contract and is already buyable from the hero at the top of the page.
 */
const ComicsView: React.FC<ComicsViewProps> = ({ comicId, mode = 'buy' }) => {
  const isOfferMode = mode === 'offer';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [pendingListingId, setPendingListingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const router = useRouter();

  const { currentComic } = useAppSelector((state: any) => state.comic);

  const tokenId: string | undefined = currentComic?.nftId?.tokenId || undefined;

  const {
    listings,
    isLoading,
    error: listingsError,
    refresh: refreshListings,
  } = useResaleListings(tokenId);

  const {
    address,
    purchaseResaleListing,
    cancelResaleListing,
    isConnected,
    statusMessage,
  } = useWagmiMarketplace();

  const visibleListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return listings
      .filter((listing) => {
        if (!query) return true;
        return (
          listing.serialNumber.toString().includes(query) ||
          listing.seller.toLowerCase().includes(query) ||
          Boolean(currentComic?.title?.toLowerCase().includes(query))
        );
      })
      .sort((a, b) =>
        sortOrder === 'recent'
          ? b.serialNumber - a.serialNumber
          : a.serialNumber - b.serialNumber
      );
  }, [listings, searchQuery, sortOrder, currentComic?.title]);

  /** Everything the offer panel needs to talk to the contract about this exact listing. */
  const offerHref = (listing: ResaleListing) => {
    const params = new URLSearchParams({
      listingId: String(listing.listingId),
      tokenAddress: listing.tokenAddress,
      serialNumber: String(listing.serialNumber),
    });
    if (comicId || currentComic?._id) params.set('id', String(comicId || currentComic._id));
    return `/marketplace/auction?${params.toString()}`;
  };

  const isSeller = (listing: ResaleListing) =>
    Boolean(address && listing.seller.toLowerCase() === address.toLowerCase());

  const handleBuy = async (listing: ResaleListing) => {
    setActionError(null);
    setActionMessage(null);

    if (!isConnected) {
      setActionError('Connect your wallet to buy this comic.');
      return;
    }

    setPendingListingId(listing.listingId);
    try {
      await purchaseResaleListing({
        listingId: listing.listingId,
        priceTinybars: listing.priceTinybars,
        tokenAddress: listing.tokenAddress,
      });
      setActionMessage(`You now own edition #${listing.serialNumber}.`);
      await refreshListings();
    } catch (error: any) {
      setActionError(error?.message || 'Unable to complete this purchase.');
    } finally {
      setPendingListingId(null);
    }
  };

  const handleCancel = async (listing: ResaleListing) => {
    setActionError(null);
    setActionMessage(null);
    setPendingListingId(listing.listingId);

    try {
      await cancelResaleListing(listing.listingId);
      setActionMessage(`Listing for edition #${listing.serialNumber} cancelled.`);
      await refreshListings();
    } catch (error: any) {
      setActionError(error?.message || 'Unable to cancel this listing.');
    } finally {
      setPendingListingId(null);
    }
  };

  // No token means the collection was never created on-chain, so nothing can be resold.
  if (!tokenId) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Collection Token Yet</h3>
          <p className="text-white/60 mb-4">
            This comic has no on-chain collection, so it cannot be traded on the secondary market.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading secondary market...</p>
        </div>
      </div>
    );
  }

  if (listingsError && listings.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-red-900/30">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error Loading Resales</p>
            <p className="text-white/60 text-sm mb-4">{listingsError}</p>
            <button
              onClick={() => void refreshListings()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <Gift className="w-12 h-12 text-orange-500/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {isOfferMode ? 'Nothing to Bid On Yet' : 'No Resales Yet'}
          </h3>
          <p className="text-white/60 mb-6">
            {isOfferMode
              ? 'Offers are made against a live listing, and no holder has listed this comic yet'
              : 'No one has listed this comic for resale on the secondary market yet'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => void refreshListings()}
              className="flex items-center gap-2 border border-[#242424] hover:border-orange-500/40 text-white/80 hover:text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/marketplace')}
              className="bg-[#FF9F1C] hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Explore Other Comics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold">
            {listings.length} {listings.length === 1 ? 'edition' : 'editions'}{' '}
            {isOfferMode ? 'you can bid on' : 'for resale'}
          </h3>
          <p className="text-white/50 text-sm mt-1">
            {isOfferMode
              ? 'Offer below the asking price - your HBAR is held until the seller accepts'
              : 'Listed by holders on the secondary market'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors"
            />
            <input
              type="text"
              placeholder="Search serial number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-56 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
            />
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder((prev) => (prev === 'recent' ? 'oldest' : 'recent'))}
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            Sort {sortOrder === 'recent' ? 'Recent' : 'Oldest'}
            <ChevronDown size={14} />
          </button>

          {/* Refresh */}
          <button
            onClick={() => void refreshListings()}
            title="Refresh listings"
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Status banners */}
      {listingsError && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          Couldn&apos;t refresh resale listings: {listingsError}
        </div>
      )}
      {actionError && (
        <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {actionError}
        </div>
      )}
      {actionMessage && (
        <div className="mb-4 rounded-xl border border-green-900/40 bg-green-950/20 px-4 py-3 text-sm text-green-400">
          {actionMessage}
        </div>
      )}
      {pendingListingId !== null && statusMessage && (
        <div className="mb-4 rounded-xl border border-orange-900/40 bg-orange-950/20 px-4 py-3 text-sm text-orange-300">
          {statusMessage}
        </div>
      )}

      {visibleListings.length === 0 ? (
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <Gift className="w-12 h-12 text-orange-500/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Resales Match</h3>
          <p className="text-white/60">No resale matches your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleListings.map((listing) => {
            const isPending = pendingListingId === listing.listingId;
            const ownedByViewer = isSeller(listing);

            return (
              <div
                key={listing.listingId}
                className="bg-[#0A0A0A] rounded-2xl overflow-hidden border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,159,28,0.15)]"
              >
                {/* Comic Image */}
                <div className="relative aspect-square bg-gray-900 overflow-hidden">
                  <Image
                    src={currentComic?.bannerImage || '/dev_images/avatar-2.png'}
                    alt={`${currentComic?.title || 'Comic'} #${listing.serialNumber}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Serial Badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-orange-500/50">
                    <p className="text-orange-400 font-bold text-sm">#{listing.serialNumber}</p>
                  </div>
                  {/* Resale Badge */}
                  <div
                    className={`absolute top-3 left-3 rounded-lg px-2 py-1 backdrop-blur-sm border ${
                      listing.isFillable
                        ? 'bg-[#FF9F1C]/20 border-[#FF9F1C]/60'
                        : 'bg-neutral-700/30 border-neutral-500/60'
                    }`}
                  >
                    <p
                      className={`font-bold text-xs ${
                        listing.isFillable ? 'text-[#FF9F1C]' : 'text-neutral-300'
                      }`}
                    >
                      {!listing.isFillable
                        ? 'Unavailable'
                        : ownedByViewer
                          ? 'Your listing'
                          : 'Resale'}
                    </p>
                  </div>
                  {/* Seller Badge */}
                  <div className="absolute bottom-3 left-3 bg-blue-500/20 border border-blue-500/50 rounded-lg px-2 py-1 backdrop-blur-sm">
                    <p className="text-blue-300 font-bold text-xs">{shorten(listing.seller, 6)}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                    {currentComic?.title || 'Comic Edition'}
                  </h4>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Serial:</span>
                      <span className="text-white font-bold">#{listing.serialNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Seller:</span>
                      <span className="text-blue-300 font-mono text-xs">
                        {shorten(listing.seller, 10)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Price:</span>
                      <span className="flex items-center gap-1 text-[#FF9F1C] font-bold">
                        {listing.priceHbar}
                        <Image src="/hbar.png" alt="HBAR" width={14} height={14} />
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50">Listing:</span>
                      <span className="text-white/70 font-mono text-xs">#{listing.listingId}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    {ownedByViewer ? (
                      // The contract rejects an offer from the listing's own seller, so in offer
                      // mode this card has no action at all - only the cancel it already had.
                      isOfferMode ? (
                        <div className="w-full border border-neutral-700 text-white/50 text-sm font-medium py-2.5 px-4 rounded-full text-center">
                          You can&apos;t offer on your own listing
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCancel(listing)}
                          disabled={isPending}
                          className="w-full border border-neutral-600 hover:border-neutral-400 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          {isPending && <Loader2 size={16} className="animate-spin" />}
                          Cancel Listing
                        </button>
                      )
                    ) : !listing.isFillable ? (
                      // The seller moved this edition or revoked the marketplace's approval, so
                      // the sale would revert. Say so instead of taking their gas to find out.
                      <div className="w-full border border-neutral-700 text-white/50 text-sm font-medium py-2.5 px-4 rounded-full text-center">
                        Seller no longer holds this edition
                      </div>
                    ) : isOfferMode ? (
                      // The offer panel reads its target from the query string, so this link is
                      // what binds an offer to a real, active listing.
                      <button
                        onClick={() => router.push(offerHref(listing))}
                        className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] text-black font-bold py-2.5 px-4 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        Make an offer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(listing)}
                        disabled={isPending}
                        className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] disabled:opacity-50 text-black font-bold py-2.5 px-4 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {isPending && <Loader2 size={16} className="animate-spin" />}
                        Buy for {listing.priceHbar}
                        <Image src="/hbar.png" alt="HBAR" width={16} height={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ComicsView;
