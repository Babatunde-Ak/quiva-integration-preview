"use client";

/**
 * useMyOffers
 *
 * Everything the connected wallet has submitted and is waiting on: offers it placed on other
 * people's listings, and bids it placed in auctions. Both come from the backend indexer.
 *
 * Bids need the auction alongside them. A bid row only records what was bid and when - whether
 * it is still the leading bid, and whether the auction has since closed, lives on the auction
 * record, so active auctions are fetched once and matched client side rather than per bid.
 *
 * All amounts are raw on-chain values in TINYBARS (`msg.value` as the Hedera EVM sees it).
 */

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { marketplaceApi } from '@/lib/marketplace-api';

export type MyItemStatus = 'active' | 'accepted' | 'closed';
export type ClosedReason = 'expired' | 'cancelled' | 'rejected' | 'lost';

export interface MyMarketplaceItem {
  id: string;
  kind: 'offer' | 'bid';
  /** Offer id for offers, auction id for bids - the argument its actions take. */
  referenceId: number;
  amountTinybars: string;
  amountHbar: number;
  status: MyItemStatus;
  closedReason?: ClosedReason;
  /** Live auction where someone else now leads. The HBAR is claimable, not locked. */
  outbid: boolean;
  /**
   * Expired, but the escrow has not been released yet.
   *
   * `cancelOffer` is gated by the `activeOffer` modifier, which requires the offer to be
   * unexpired - so past the deadline the buyer cannot cancel, and `expireOffer` is the only
   * function that returns the money. Nothing calls it automatically, so the UI has to.
   */
  needsRelease: boolean;
  expiresAt: number;
  listingId?: number;
  serialNumber?: number;
  highestBidHbar?: number;
}

type BackendRow = {
  offerId?: string;
  bidId?: string;
  auctionId?: string;
  entityId?: string;
  listingId?: string;
  amount?: string | number;
  expiresAt?: string | number;
  serialNumber?: string | number;
  eventName?: string;
  active?: boolean;
};

type AuctionRow = {
  entityId?: string;
  auctionId?: string;
  active?: boolean;
  highestBidderWalletAddress?: string;
  highestBid?: string | number;
  winnerWalletAddress?: string;
  serialNumber?: string | number;
};

const toHbar = (raw?: string | number) => {
  const value = String(raw ?? '');
  return /^\d+$/.test(value) ? Number(ethers.formatUnits(value, 8)) : 0;
};

const OFFER_CLOSED_REASONS: Record<string, ClosedReason> = {
  OfferExpired: 'expired',
  OfferCancelled: 'cancelled',
  OfferRejected: 'rejected',
};

const mapOffer = (row: BackendRow): MyMarketplaceItem | null => {
  const offerId = Number(row.offerId ?? row.entityId);
  const amountTinybars = String(row.amount ?? '');
  if (!Number.isSafeInteger(offerId) || !/^\d+$/.test(amountTinybars)) return null;

  const expiresAt = Number(row.expiresAt ?? 0) || 0;
  const closedReason = row.eventName ? OFFER_CLOSED_REASONS[row.eventName] : undefined;
  const hasExpired = expiresAt > 0 && expiresAt * 1000 < Date.now();

  let status: MyItemStatus = 'active';
  if (row.eventName === 'OfferAccepted') status = 'accepted';
  else if (closedReason || row.active === false || hasExpired) status = 'closed';

  return {
    id: `offer-${offerId}`,
    kind: 'offer',
    referenceId: offerId,
    amountTinybars,
    amountHbar: toHbar(amountTinybars),
    status,
    closedReason: status === 'closed' ? closedReason ?? 'expired' : undefined,
    outbid: false,
    // Still flagged active on-chain but past its deadline: no settling event has fired, so the
    // buyer's HBAR is still sitting in the contract waiting for someone to call expireOffer.
    needsRelease: hasExpired && row.active !== false && !closedReason && row.eventName !== 'OfferAccepted',
    expiresAt,
    listingId: Number.isSafeInteger(Number(row.listingId)) ? Number(row.listingId) : undefined,
    serialNumber: row.serialNumber === undefined ? undefined : Number(row.serialNumber),
  };
};

const mapBid = (
  row: BackendRow,
  auctions: Map<number, AuctionRow>,
  walletAddress: string
): MyMarketplaceItem | null => {
  const auctionId = Number(row.auctionId);
  const amountTinybars = String(row.amount ?? '');
  if (!Number.isSafeInteger(auctionId) || !/^\d+$/.test(amountTinybars)) return null;

  const auction = auctions.get(auctionId);
  const leading = String(auction?.highestBidderWalletAddress || '').toLowerCase() === walletAddress;
  const settled = auction ? auction.active === false : false;
  const won = settled && String(auction?.winnerWalletAddress || '').toLowerCase() === walletAddress;

  let status: MyItemStatus = 'active';
  if (won) status = 'accepted';
  else if (settled) status = 'closed';

  return {
    id: String(row.bidId ?? row.entityId ?? `bid-${auctionId}`),
    kind: 'bid',
    referenceId: auctionId,
    amountTinybars,
    amountHbar: toHbar(amountTinybars),
    status,
    closedReason: status === 'closed' ? 'lost' : undefined,
    outbid: status === 'active' && Boolean(auction) && !leading,
    // Bids are released through pendingReturns, not expireOffer.
    needsRelease: false,
    expiresAt: 0,
    serialNumber:
      auction?.serialNumber === undefined ? undefined : Number(auction.serialNumber),
    highestBidHbar: auction?.highestBid === undefined ? undefined : toHbar(auction.highestBid),
  };
};

export function useMyOffers(walletAddress?: string | null) {
  const [items, setItems] = useState<MyMarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!walletAddress) {
      setItems([]);
      return [];
    }

    const wallet = walletAddress.toLowerCase();
    setIsLoading(true);
    setError(null);

    try {
      const [offerResponse, bidResponse, auctionResponse] = await Promise.all([
        marketplaceApi.getMyOffers<{ data?: BackendRow[] }>(wallet),
        marketplaceApi.getBids<{ data?: BackendRow[] }>({ walletAddress: wallet }),
        marketplaceApi.getAuctions<{ data?: AuctionRow[] }>(),
      ]);

      const auctions = new Map<number, AuctionRow>();
      for (const auction of auctionResponse?.data || []) {
        const id = Number(auction.auctionId ?? auction.entityId);
        if (Number.isSafeInteger(id)) auctions.set(id, auction);
      }

      const mapped = [
        ...(offerResponse?.data || []).map(mapOffer),
        ...(bidResponse?.data || []).map((row) => mapBid(row, auctions, wallet)),
      ].filter((item): item is MyMarketplaceItem => Boolean(item));

      setItems(mapped);
      return mapped;
    } catch (err: any) {
      console.error('Error loading your offers and bids:', err);
      setError(err?.message || 'Failed to load your offers and bids');
      setItems([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /**
   * HBAR still committed. An outbid bid is excluded on purpose: `placeBid` moves the losing
   * amount into `pendingReturns` the moment it is beaten, so it is withdrawable rather than
   * locked, and counting it here would overstate what the wallet has tied up.
   */
  const lockedHbar = items
    .filter((item) => item.status === 'active' && !item.outbid)
    .reduce((sum, item) => sum + item.amountHbar, 0);

  return {
    items,
    active: items.filter((item) => item.status === 'active'),
    accepted: items.filter((item) => item.status === 'accepted'),
    closed: items.filter((item) => item.status === 'closed'),
    lockedHbar,
    isLoading,
    error,
    refresh,
  };
}

export default useMyOffers;
