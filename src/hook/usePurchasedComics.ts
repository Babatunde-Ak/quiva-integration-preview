'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { useAppSelector } from '@/redux/hook';
import { extractComicList } from '@/features/comic-library/utils/transformComicData';

const MIRROR_BASE = 'https://testnet.mirrornode.hedera.com';
const HASHIO_RPC = 'https://testnet.hashio.io/api';

// Hedera ID (0.0.XXXX) to EVM 0x address helper
const toEvmAddress = (hederaId: string): string => {
  if (hederaId.startsWith('0x')) return hederaId.toLowerCase();
  const parts = hederaId.split('.');
  const num = parseInt(parts[2] || '0', 10);
  return '0x' + num.toString(16).padStart(40, '0').toLowerCase();
};

const COMIC_CORE_EVM = toEvmAddress('0.0.7806656');

const COMIC_CORE_ABI = [
  'function canReadByToken(address tokenAddress, address user) external view returns (bool)',
  'function canReadComic(string episodeId, address user) external view returns (bool)',
];

export interface OwnedComic {
  comicId: string;
  tokenId: string;
  tokenEvmAddress: string;
  serialNumber: number;
  title: string;
  bannerImage: string;
  summary: string;
  canRead: boolean;
  rawComicData: any;
}

export function useUserPurchasedComics() {
  const { address, isConnected } = useAccount();
  const comicsPayload = useAppSelector((state: any) => state.comic?.comics);
  const allComics = useMemo(() => extractComicList(comicsPayload), [comicsPayload]);
  
  const [ownedComics, setOwnedComics] = useState<OwnedComic[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchasedComics = useCallback(async () => {
    if (!isConnected || !address) {
      setOwnedComics([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch all NFTs owned by the user's EVM address from Hedera Mirror Node
      const res = await fetch(`${MIRROR_BASE}/api/v1/accounts/${address}/nfts?limit=100`);
      if (!res.ok) {
        throw new Error(`Mirror Node error: ${res.status}`);
      }

      const data = await res.json();
      const nfts = data.nfts || [];

      if (nfts.length === 0) {
        setOwnedComics([]);
        setIsLoading(false);
        return;
      }

      const provider = new ethers.JsonRpcProvider(HASHIO_RPC);
      const comicCoreContract = new ethers.Contract(COMIC_CORE_EVM, COMIC_CORE_ABI, provider);

      const items: OwnedComic[] = [];

      for (const nft of nfts) {
        const tokenId = nft.token_id; // e.g. "0.0.8046342"
        const tokenEvmAddress = toEvmAddress(tokenId);

        // Find matching comic in Redux store or backend list
        const matchedComic: any = Array.isArray(allComics)
          ? allComics.find((c: any) => {
              const comicToken = c.tokenId || c.nftId?.tokenId || c.tokenAddress;
              if (!comicToken) return false;
              return toEvmAddress(comicToken) === tokenEvmAddress || comicToken === tokenId;
            })
          : null;

        // Verify reading access on-chain from ComicCore contract
        let canRead = false;
        try {
          canRead = await comicCoreContract.canReadByToken(tokenEvmAddress, address);
        } catch {
          // If contract query fails, assume read access if user owns the NFT serial
          canRead = true;
        }

        items.push({
          comicId: matchedComic?._id || tokenId,
          tokenId: tokenId,
          tokenEvmAddress: tokenEvmAddress,
          serialNumber: nft.serial_number,
          title: matchedComic?.title || `Comic #${nft.serial_number}`,
          bannerImage: matchedComic?.bannerImage || '/placeholder-comic.png',
          summary: matchedComic?.summary || '',
          canRead: canRead,
          rawComicData: matchedComic,
        });
      }

      setOwnedComics(items);
    } catch (err: any) {
      console.error('Error loading user purchased comics:', err);
      setError(err.message || 'Failed to fetch purchased comics');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, allComics]);

  useEffect(() => {
    fetchPurchasedComics();
  }, [fetchPurchasedComics]);

  return {
    ownedComics,
    isLoading,
    error,
    refetch: fetchPurchasedComics,
  };
}
