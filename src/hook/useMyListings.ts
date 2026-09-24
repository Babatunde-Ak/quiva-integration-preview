'use client';

/**
 * useMyListings
 *
 * Every edition the connected wallet currently has up for sale, across all collections.
 *
 * Endpoint first, chain second, for the same reason the per-comic grid works that way: the
 * indexer has already decoded these logs, so one request replaces walking `listingCounter` and
 * reading each listing back. The chain scan stays as the fallback for when the indexer is down,
 * still backfilling, or pointed at a different contract.
 *
 * Note that a listed edition is still in the seller's wallet - V3 takes an allowance rather than
 * custody - so these editions also appear under Minted Comics. That is not a duplicate; it is
 * the same NFT seen as a holding and as an offer to sell, which is exactly what it is.
 */

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { marketplaceApi } from '@/lib/marketplace-api';
import {
  getActiveListingsForSeller,
  toEvmAddress,
  type ResaleListing,
} from './useResaleListings';

type BackendListingRow = {
  listingId?: string;
  entityId?: string;
  tokenAddress?: string;
  serialNumber?: string | number;
  sellerWalletAddress?: string;
  price?: string | number;
  active?: boolean;
};

const mapRow = (row: BackendListingRow): ResaleListing | null => {
  const listingId = Number(row.listingId ?? row.entityId);
  const priceTinybars = String(row.price ?? '');
  if (!Number.isSafeInteger(listingId) || !/^\d+$/.test(priceTinybars)) return null;

  return {
    listingId,
    tokenAddress: String(row.tokenAddress || '').toLowerCase(),
    serialNumber: Number(row.serialNumber),
    seller: String(row.sellerWalletAddress || '').toLowerCase(),
    priceTinybars,
    priceHbar: Number(ethers.formatUnits(priceTinybars, 8)),
    isActive: row.active !== false,
    // Nothing is emitted when a seller moves an NFT out from under their own listing, so the
    // database cannot know. It is verified on-chain at purchase time instead.
    isFillable: true,
  };
};

/**
 * Returns null rather than [] when the endpoint cannot answer, so the caller can tell "you have
 * no listings" apart from "the backend didn't reply" and only falls back for the latter.
 */
const listingsFromBackend = async (sellerEvmAddress: string): Promise<ResaleListing[] | null> => {
  try {
    const response = await marketplaceApi.getListings<{ data?: BackendListingRow[] }>({
      walletAddress: sellerEvmAddress,
      active: true,
    });

    const rows = Array.isArray(response?.data) ? response.data : null;
    if (!rows) return null;

    return rows
      .map(mapRow)
      .filter((listing): listing is ResaleListing => Boolean(listing))
      // The endpoint matches a wallet across buyer, bidder and owner fields too, so a row coming
      // back is not proof this wallet is the seller of it.
      .filter((listing) => listing.seller === sellerEvmAddress)
      .sort((a, b) => b.listingId - a.listingId);
  } catch (error) {
    console.warn('Listings endpoint unavailable, reading the chain instead', error);
    return null;
  }
};

export function useMyListings(walletAddress?: string | null) {
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const sellerEvmAddress = toEvmAddress(walletAddress);
    if (!sellerEvmAddress) {
      setListings([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const fromBackend = await listingsFromBackend(sellerEvmAddress);
      const mine = fromBackend ?? (await getActiveListingsForSeller(sellerEvmAddress));
      setListings(mine);
      return mine;
    } catch (err: any) {
      console.error('Error loading your listings:', err);
      setError(err?.message || 'Failed to load the comics you have listed for sale');
      setListings([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalHbar = listings.reduce((sum, listing) => sum + listing.priceHbar, 0);

  return { listings, totalHbar, isLoading, error, refresh };
}

export default useMyListings;
