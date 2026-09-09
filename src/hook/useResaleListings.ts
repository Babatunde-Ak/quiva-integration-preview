"use client";

/**
 * useResaleListings
 *
 * Reads the secondary-market (resale) listings a collection currently has open on the
 * COMIC_MARKETPLACE contract. Everything here is read-only and goes through the Hedera
 * mirror node, so it works without a wallet connection and without the backend indexer.
 *
 * Discovery is two-tiered:
 *   1. Scan the marketplace's `NFTListed` logs for this token to collect candidate listing ids.
 *   2. If the log query returns nothing, walk back from `listingCounter` instead.
 * Either way every candidate is then confirmed with `getListing`, which is the authoritative
 * source for the current price and whether the listing is still active (cancelled and sold
 * listings only flip `isActive` in contract state).
 */

import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { TokenId } from '@hiero-ledger/sdk';
import { HEDERA_CONTRACTS } from '@/contracts/HederaContractConfig';
import { marketplaceApi } from '@/lib/marketplace-api';
import { mirrorNodeService } from './MirrorNodeService';

const MIRROR_NODE_BASE =
  process.env.NEXT_PUBLIC_MIRROR_NODE_URL || 'https://testnet.mirrornode.hedera.com';

const MARKETPLACE_ABI = [
  'event NFTListed(uint256 indexed listingId, address indexed tokenAddress, int64 serialNumber, address indexed seller, uint256 price)',
  'function getListing(uint256 listingId) external view returns (address tokenAddress, int64 serialNumber, address seller, uint256 price, bool isActive)',
  'function listingCounter() external view returns (uint256)',
  'function isListingFillable(uint256 listingId) external view returns (bool)',
];

const marketplaceInterface = new ethers.Interface(MARKETPLACE_ABI);

// How far back to look when we have to fall back to walking `listingCounter`.
const COUNTER_SCAN_DEPTH = 60;
const LOG_PAGE_LIMIT = 100;
const LOG_MAX_PAGES = 3;

export interface ResaleListing {
  listingId: number;
  tokenAddress: string; // EVM address, lowercase
  serialNumber: number;
  seller: string; // EVM address, lowercase
  /**
   * Raw on-chain price, in TINYBARS (8dp).
   *
   * The marketplace compares this against `msg.value`, and inside the Hedera EVM `msg.value`
   * is denominated in tinybars - the JSON-RPC relay divides the transaction's 18dp `value`
   * by 10^10 before execution. Reading this as weibars makes every listing look 10^10 times
   * cheaper than the contract actually requires, and `purchaseNFT` reverts "Insufficient
   * payment". See the unit-scale note in CLAUDE.md.
   */
  priceTinybars: string;
  priceHbar: number;
  isActive: boolean;
  /**
   * Whether the seller still owns the serial and still has the marketplace approved.
   *
   * The marketplace no longer escrows NFTs, so a seller can move one out from under a live
   * listing. The contract checks this before taking any payment, but the UI should hide or
   * disable such a listing rather than let someone pay gas to discover it. Defaults to true
   * when the contract can't answer - notably against the pre-V3 implementation, which has no
   * such function.
   */
  isFillable: boolean;
}

/** Accepts a Hedera id (`0.0.x`) or an EVM address and returns a lowercase EVM address. */
export const toEvmAddress = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();

  if (/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^[0-9a-fA-F]{40}$/.test(trimmed)) return `0x${trimmed}`.toLowerCase();

  if (/^\d+\.\d+\.\d+$/.test(trimmed)) {
    try {
      const solidity = TokenId.fromString(trimmed).toSolidityAddress();
      return (solidity.startsWith('0x') ? solidity : `0x${solidity}`).toLowerCase();
    } catch {
      return null;
    }
  }

  return null;
};

const marketplaceId = () => HEDERA_CONTRACTS.COMIC_MARKETPLACE.address;

const marketplaceLogAddress = () => {
  const evm = toEvmAddress(HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress);
  if (evm && evm !== '0x0000000000000000000000000000000000000000') return evm;
  return marketplaceId();
};

const callMarketplace = async (functionName: string, args: unknown[] = []) => {
  const data = marketplaceInterface.encodeFunctionData(functionName, args);
  const response = await mirrorNodeService.makeContractCall(marketplaceId(), data);
  return marketplaceInterface.decodeFunctionResult(functionName, response.result);
};

/**
 * Listing ids seen in `NFTListed` logs for this token, newest first.
 *
 * The logs are fetched unfiltered and decoded here: the mirror node only accepts `topic0`
 * filters alongside a timestamp range of at most 7 days, which would hide older listings.
 */
const listingIdsFromLogs = async (tokenEvmAddress: string): Promise<number[]> => {
  const ids: number[] = [];
  let url:
    | string
    | undefined = `${MIRROR_NODE_BASE}/api/v1/contracts/${marketplaceLogAddress()}/results/logs?order=desc&limit=${LOG_PAGE_LIMIT}`;

  for (let page = 0; page < LOG_MAX_PAGES && url; page += 1) {
    const response = await fetch(url);
    if (!response.ok) break;

    const json = await response.json();
    for (const log of json?.logs || []) {
      try {
        const decoded = marketplaceInterface.parseLog({ topics: log.topics, data: log.data });
        if (!decoded) continue;
        if (String(decoded.args.tokenAddress).toLowerCase() !== tokenEvmAddress) continue;
        ids.push(Number(decoded.args.listingId));
      } catch {
        // Not an event we can decode - the marketplace emits others too.
      }
    }

    const next = json?.links?.next;
    url = next ? (next.startsWith('http') ? next : `${MIRROR_NODE_BASE}${next}`) : undefined;
  }

  return Array.from(new Set(ids));
};

/** Fallback: the most recent `COUNTER_SCAN_DEPTH` listing ids the contract has ever issued. */
const recentListingIds = async (): Promise<number[]> => {
  const [counter] = await callMarketplace('listingCounter');
  const total = Number(counter);
  if (!Number.isFinite(total) || total <= 0) return [];

  const start = Math.max(0, total - COUNTER_SCAN_DEPTH);
  const ids: number[] = [];
  for (let id = total - 1; id >= start; id -= 1) ids.push(id);
  return ids;
};

/**
 * Whether the seller still owns the serial and still has the marketplace approved.
 *
 * Deliberately NOT called once per card. Nothing emits an event when a seller moves an NFT out
 * from under a live listing, so this can only be answered on-chain, and asking per listing is
 * what made the grid slow. Call it for the single listing someone is about to buy instead -
 * that is the only place the answer changes what happens.
 *
 * Falls back to `true`: an unanswerable check must not block an otherwise good listing.
 */
export const checkListingFillable = async (listingId: number): Promise<boolean> => {
  try {
    const [fillable] = await callMarketplace('isListingFillable', [listingId]);
    return Boolean(fillable);
  } catch {
    return true;
  }
};

const fetchListing = async (listingId: number): Promise<ResaleListing | null> => {
  try {
    const decoded = await callMarketplace('getListing', [listingId]);
    const priceTinybars = decoded[3].toString();
    const isActive = Boolean(decoded[4]);

    return {
      listingId,
      tokenAddress: String(decoded[0]).toLowerCase(),
      serialNumber: Number(decoded[1]),
      seller: String(decoded[2]).toLowerCase(),
      priceTinybars,
      priceHbar: Number(ethers.formatUnits(priceTinybars, 8)),
      isActive,
      isFillable: isActive,
    };
  } catch (error) {
    console.warn(`Unable to read marketplace listing ${listingId}`, error);
    return null;
  }
};

type BackendListingRow = {
  listingId?: string;
  entityId?: string;
  tokenAddress?: string;
  serialNumber?: string | number;
  sellerWalletAddress?: string;
  price?: string | number;
  active?: boolean;
};

/**
 * Active listings as the backend indexer has them.
 *
 * One request instead of a log sweep plus a `getListing` per candidate, which is the whole
 * reason this path exists. The indexer decodes the same mirror-node logs the fallback below
 * reads directly, so the two agree - the endpoint is just already finished when we ask.
 *
 * Returns null (rather than throwing or returning []) when the endpoint can't answer, so the
 * caller can tell "backend says there are none" apart from "backend didn't answer" and only
 * falls back to the slow path for the latter.
 */
const listingsFromBackend = async (tokenEvmAddress: string): Promise<ResaleListing[] | null> => {
  try {
    const response = await marketplaceApi.getListings<{ data?: BackendListingRow[] }>({
      tokenAddress: tokenEvmAddress,
      active: true,
    });

    const rows = Array.isArray(response?.data) ? response.data : null;
    if (!rows) return null;

    return rows
      .map((row): ResaleListing | null => {
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
          // The database cannot know this - no event fires when a seller moves the NFT out.
          // Assumed true here and verified on-chain at purchase time.
          isFillable: true,
        };
      })
      .filter((listing): listing is ResaleListing => Boolean(listing))
      .filter((listing) => listing.tokenAddress === tokenEvmAddress)
      .sort((a, b) => b.listingId - a.listingId);
  } catch (error) {
    console.warn('Marketplace listings endpoint unavailable, reading the chain instead', error);
    return null;
  }
};

/** Ask the backend to index new events now rather than at its next poll. */
export const syncMarketplaceIndex = async (): Promise<void> => {
  try {
    await fetch('/api/quiva/marketplace/sync', { method: 'POST' });
  } catch (error) {
    console.warn('Could not trigger a marketplace sync', error);
  }
};

/**
 * Active resale listings for a single collection token, read straight from the chain.
 * `tokenId` may be a Hedera token id (`0.0.x`) or an EVM address.
 */
export async function getActiveResaleListings(tokenId: string): Promise<ResaleListing[]> {
  const tokenEvmAddress = toEvmAddress(tokenId);
  if (!tokenEvmAddress) throw new Error(`"${tokenId}" is not a valid token id or EVM address.`);

  let candidateIds: number[] = [];
  try {
    candidateIds = await listingIdsFromLogs(tokenEvmAddress);
  } catch (error) {
    console.warn('Marketplace log scan failed, falling back to listingCounter', error);
  }

  if (candidateIds.length === 0) {
    candidateIds = await recentListingIds();
  }

  const listings = await Promise.all(candidateIds.map(fetchListing));

  return listings
    .filter((listing): listing is ResaleListing => Boolean(listing))
    .filter((listing) => listing.isActive && listing.tokenAddress === tokenEvmAddress)
    .sort((a, b) => b.listingId - a.listingId);
}

export function useResaleListings(tokenId?: string | null) {
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tokenId) {
      setListings([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenEvmAddress = toEvmAddress(tokenId);
      if (!tokenEvmAddress) throw new Error(`"${tokenId}" is not a valid token id or EVM address.`);

      // Endpoint first; the chain scan is the fallback for when the indexer is down, still
      // backfilling, or pointed at a different contract.
      const fromBackend = await listingsFromBackend(tokenEvmAddress);
      const active = fromBackend ?? (await getActiveResaleListings(tokenId));
      setListings(active);
      return active;
    } catch (err: any) {
      console.error('Error loading resale listings:', err);
      setError(err?.message || 'Failed to load resale listings');
      setListings([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { listings, isLoading, error, refresh };
}

export default useResaleListings;
