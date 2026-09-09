"use client";

/**
 * useReceivedOffers
 *
 * Offers other collectors have placed on the connected wallet's resale listings, read from the
 * backend indexer rather than the chain. `OfferCreated` carries only the offer id, listing id,
 * buyer and amount - the seller lives on the listing - so resolving "offers on MY listings"
 * from logs alone would mean fetching every listing too. The indexer already did that join.
 *
 * Amounts are raw on-chain values in TINYBARS: an offer's amount is the `msg.value` the buyer
 * sent, and inside the Hedera EVM msg.value is denominated in tinybars. See the unit-scale
 * note in CLAUDE.md.
 */

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { marketplaceApi } from '@/lib/marketplace-api';

export interface ReceivedOffer {
  offerId: number;
  listingId: number;
  buyer: string;
  amountTinybars: string;
  amountHbar: number;
  /** Unix seconds. 0 when the indexer has no expiry recorded. */
  expiresAt: number;
  isExpired: boolean;
  tokenAddress?: string;
  serialNumber?: number;
  listingPriceHbar?: number;
}

/** All live offers on one of the seller's listings, plus what the listing itself asks. */
export interface ListingOfferGroup {
  listingId: number;
  tokenAddress?: string;
  serialNumber?: number;
  listingPriceHbar?: number;
  offers: ReceivedOffer[];
  bestOfferHbar: number;
}

type BackendOfferRow = {
  offerId?: string;
  entityId?: string;
  listingId?: string;
  buyerWalletAddress?: string;
  amount?: string | number;
  expiresAt?: string | number;
  tokenAddress?: string;
  serialNumber?: string | number;
  listingPrice?: string | number;
  active?: boolean;
};

const toHbar = (raw?: string | number) => {
  const value = String(raw ?? '');
  if (!/^\d+$/.test(value)) return undefined;
  return Number(ethers.formatUnits(value, 8));
};

const mapOffer = (row: BackendOfferRow): ReceivedOffer | null => {
  const offerId = Number(row.offerId ?? row.entityId);
  const listingId = Number(row.listingId);
  const amountTinybars = String(row.amount ?? '');
  if (!Number.isSafeInteger(offerId) || !/^\d+$/.test(amountTinybars)) return null;

  const expiresAt = Number(row.expiresAt ?? 0);
  return {
    offerId,
    listingId,
    buyer: String(row.buyerWalletAddress || '').toLowerCase(),
    amountTinybars,
    amountHbar: Number(ethers.formatUnits(amountTinybars, 8)),
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
    // An expired offer is still `active` on-chain until someone calls expireOffer, so the
    // clock is the only thing that can tell us it is no longer acceptable.
    isExpired: Number.isFinite(expiresAt) && expiresAt > 0 && expiresAt * 1000 < Date.now(),
    tokenAddress: row.tokenAddress ? String(row.tokenAddress).toLowerCase() : undefined,
    serialNumber: row.serialNumber === undefined ? undefined : Number(row.serialNumber),
    listingPriceHbar: toHbar(row.listingPrice),
  };
};

/** Groups offers by the listing they sit on, best offer first within each group. */
export const groupByListing = (offers: ReceivedOffer[]): ListingOfferGroup[] => {
  const groups = new Map<number, ListingOfferGroup>();

  for (const offer of offers) {
    const existing = groups.get(offer.listingId);
    if (existing) {
      existing.offers.push(offer);
      existing.bestOfferHbar = Math.max(existing.bestOfferHbar, offer.amountHbar);
      continue;
    }
    groups.set(offer.listingId, {
      listingId: offer.listingId,
      tokenAddress: offer.tokenAddress,
      serialNumber: offer.serialNumber,
      listingPriceHbar: offer.listingPriceHbar,
      offers: [offer],
      bestOfferHbar: offer.amountHbar,
    });
  }

  const ordered = Array.from(groups.values());
  ordered.forEach((group) => group.offers.sort((a, b) => b.amountHbar - a.amountHbar));

  return ordered.sort((a, b) => b.listingId - a.listingId);
};

export function useReceivedOffers(walletAddress?: string | null) {
  const [offers, setOffers] = useState<ReceivedOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!walletAddress) {
      setOffers([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.getReceivedOffers<{ data?: BackendOfferRow[] }>(
        walletAddress.toLowerCase()
      );
      const rows = Array.isArray(response?.data) ? response.data : [];
      const mapped = rows
        .filter((row) => row.active !== false)
        .map(mapOffer)
        .filter((offer): offer is ReceivedOffer => Boolean(offer));

      setOffers(mapped);
      return mapped;
    } catch (err: any) {
      console.error('Error loading received offers:', err);
      setError(err?.message || 'Failed to load offers on your listings');
      setOffers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { offers, groups: groupByListing(offers), isLoading, error, refresh };
}

export default useReceivedOffers;
