"use client";

/**
 * useListingContext
 *
 * The real numbers behind one resale listing, for the offer page: what it is listed at, who is
 * actually selling it, the collection's floor, the best standing offer, the viewer's balance,
 * and the fees an offer would carry.
 *
 * Each figure comes from the thing that owns it - the listing from the contract, the floor from
 * the other live listings, the best offer from the indexer, the royalty from the token's own
 * custom fees, the platform cut from the marketplace contract. Anything with no source is
 * returned as undefined rather than filled in, so a caller can leave it out instead of
 * displaying a number nobody can stand behind.
 */

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, usePublicClient } from 'wagmi';
import { HEDERA_CONTRACTS } from '@/contracts/HederaContractConfig';
import { marketplaceApi } from '@/lib/marketplace-api';
import { getActiveResaleListings, toEvmAddress } from './useResaleListings';

const MIRROR_NODE_BASE =
  process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

const MARKETPLACE_ABI = [
  'function getListing(uint256 listingId) external view returns (address tokenAddress, int64 serialNumber, address seller, uint256 price, bool isActive)',
  'function platformFeePercent() external view returns (uint256)',
];

const marketplaceInterface = new ethers.Interface(MARKETPLACE_ABI);

export interface ListingContext {
  /** The listing itself, straight from contract state. */
  listedPriceHbar?: number;
  sellerAddress?: string;
  serialNumber?: number;
  tokenAddress?: string;
  isActive: boolean;

  /** Lowest asking price among this collection's live listings. */
  floorPriceHbar?: number;
  /** Best standing offer on this listing. */
  highestOfferHbar?: number;
  /** Connected wallet's spendable HBAR. */
  balanceHbar?: number;

  /** Percentages, as whole numbers - 20 means 20%. */
  royaltyPercent?: number;
  platformFeePercent?: number;

  /** How many editions of this collection the seller holds. */
  sellerEditions?: number;
}

const readContract = async (functionName: string, args: unknown[] = []) => {
  const data = marketplaceInterface.encodeFunctionData(functionName, args);
  const response = await fetch(`${MIRROR_NODE_BASE}/api/v1/contracts/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, to: HEDERA_CONTRACTS.COMIC_MARKETPLACE.address }),
  });
  if (!response.ok) throw new Error(`Contract read failed: ${functionName}`);
  const json = await response.json();
  return marketplaceInterface.decodeFunctionResult(functionName, json.result);
};

/** Sum of the token's royalty percentages, from its HTS custom fees. */
const fetchRoyaltyPercent = async (tokenEvmAddress: string): Promise<number | undefined> => {
  const raw = tokenEvmAddress.replace(/^0x/, '');
  const tokenNum = Number.parseInt(raw, 16);
  if (!Number.isSafeInteger(tokenNum)) return undefined;

  try {
    const response = await fetch(`${MIRROR_NODE_BASE}/api/v1/tokens/0.0.${tokenNum}`);
    if (!response.ok) return undefined;
    const json = await response.json();
    const fees: any[] = json?.custom_fees?.royalty_fees ?? [];

    return fees.reduce((total, fee) => {
      const numerator = Number(fee?.amount?.numerator);
      const denominator = Number(fee?.amount?.denominator);
      if (!numerator || !denominator) return total;
      return total + (numerator / denominator) * 100;
    }, 0);
  } catch {
    return undefined;
  }
};

const countSellerEditions = async (tokenEvmAddress: string, sellerEvmAddress: string) => {
  const tokenNum = Number.parseInt(tokenEvmAddress.replace(/^0x/, ''), 16);
  const sellerNum = Number.parseInt(sellerEvmAddress.replace(/^0x/, ''), 16);
  if (!Number.isSafeInteger(tokenNum)) return undefined;

  // A seller with an ECDSA alias has no long-zero form, so this only resolves for accounts the
  // mirror node can look up by the address the contract stored.
  const account = Number.isSafeInteger(sellerNum) && sellerNum > 0 ? `0.0.${sellerNum}` : sellerEvmAddress;

  try {
    const response = await fetch(
      `${MIRROR_NODE_BASE}/api/v1/accounts/${account}/nfts?token.id=0.0.${tokenNum}&limit=100`
    );
    if (!response.ok) return undefined;
    const json = await response.json();
    return Array.isArray(json?.nfts) ? json.nfts.length : undefined;
  } catch {
    return undefined;
  }
};

export function useListingContext(listingId?: number, tokenId?: string | null) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [context, setContext] = useState<ListingContext>({ isActive: false });
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (listingId === undefined || !Number.isSafeInteger(listingId)) {
      setContext({ isActive: false });
      return;
    }

    setIsLoading(true);
    try {
      const listing = await readContract('getListing', [listingId]).catch(() => null);
      const tokenAddress = listing ? String(listing[0]).toLowerCase() : toEvmAddress(tokenId || '');
      const priceTinybars = listing ? listing[3].toString() : undefined;

      const [floor, offers, fee, royalty, balance, editions] = await Promise.all([
        tokenAddress
          ? getActiveResaleListings(tokenAddress)
              .then((all) => all.reduce<number | undefined>(
                (min, item) => (min === undefined ? item.priceHbar : Math.min(min, item.priceHbar)),
                undefined
              ))
              .catch(() => undefined)
          : Promise.resolve(undefined),
        marketplaceApi
          .getOffers<{ data?: Array<{ amount?: string; active?: boolean }> }>({
            listingId: String(listingId),
            active: true,
          })
          .then((res) =>
            (res?.data || []).reduce<number | undefined>((best, row) => {
              const value = String(row.amount ?? '');
              if (!/^\d+$/.test(value)) return best;
              const hbar = Number(ethers.formatUnits(value, 8));
              return best === undefined ? hbar : Math.max(best, hbar);
            }, undefined)
          )
          .catch(() => undefined),
        readContract('platformFeePercent')
          .then(([bps]) => Number(bps) / 100)
          .catch(() => undefined),
        tokenAddress ? fetchRoyaltyPercent(tokenAddress) : Promise.resolve(undefined),
        address && publicClient
          ? publicClient
              .getBalance({ address })
              // Relay balances are 18dp weibars, unlike everything the contract stores.
              .then((wei) => Number(ethers.formatUnits(wei.toString(), 18)))
              .catch(() => undefined)
          : Promise.resolve(undefined),
        listing && tokenAddress
          ? countSellerEditions(tokenAddress, String(listing[2]).toLowerCase())
          : Promise.resolve(undefined),
      ]);

      setContext({
        listedPriceHbar: priceTinybars ? Number(ethers.formatUnits(priceTinybars, 8)) : undefined,
        sellerAddress: listing ? String(listing[2]).toLowerCase() : undefined,
        serialNumber: listing ? Number(listing[1]) : undefined,
        tokenAddress: tokenAddress || undefined,
        isActive: listing ? Boolean(listing[4]) : false,
        floorPriceHbar: floor,
        highestOfferHbar: offers,
        balanceHbar: balance,
        royaltyPercent: royalty,
        platformFeePercent: fee,
        sellerEditions: editions,
      });
    } finally {
      setIsLoading(false);
    }
  }, [listingId, tokenId, address, publicClient]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...context, isLoading, refresh };
}

export default useListingContext;
