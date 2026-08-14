/**
 * useNftOwnershipCheck Hook
 * Check if user owns an NFT by querying their wallet directly via Mirror Node
 */

import { useState, useCallback } from 'react';

interface NftOwnershipResult {
  hasNft: boolean;
  serialNumbers: number[];
  isLoading: boolean;
  error: string | null;
}

export function useNftOwnershipCheck() {
  const [state, setState] = useState<NftOwnershipResult>({
    hasNft: false,
    serialNumbers: [],
    isLoading: false,
    error: null,
  });

  /**
   * Check if user owns any NFT from a specific token/collection
   * @param accountId - User's Hedera account ID (e.g., "0.0.1234567")
   * @param tokenId - NFT Token ID from comic (e.g., "0.0.8046342")
   * @returns Promise with ownership status and serial numbers
   */
  const checkOwnership = useCallback(async (
    accountId: string | null | undefined,
    tokenId: string | null | undefined
  ): Promise<NftOwnershipResult> => {
    console.log('🔍 Checking NFT ownership:', { accountId, tokenId });

    // Validation
    if (!accountId || !tokenId) {
      const result = {
        hasNft: false,
        serialNumbers: [],
        isLoading: false,
        error: 'Missing accountId or tokenId',
      };
      setState(result);
      return result;
    }

    setState({ hasNft: false, serialNumbers: [], isLoading: true, error: null });

    try {
      // Fetch all NFTs owned by this account
      const response = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}/nfts?limit=1000`
      );

      if (!response.ok) {
        throw new Error(`Mirror Node error: ${response.status}`);
      }

      const data = await response.json();
      const allNfts = data.nfts || [];

      console.log(`📦 User has ${allNfts.length} total NFTs`);
      console.log(`🎯 Looking for tokenId: ${tokenId}`);

      // Filter NFTs that match this token ID
      const matchingNfts = allNfts.filter((nft: any) => {
        const nftTokenId = nft.token_id;
        const matches = nftTokenId.toLowerCase() === tokenId.toLowerCase();
        
        if (matches) {
          console.log(`✅ Found matching NFT: Serial #${nft.serial_number}`);
        }
        
        return matches;
      });

      const hasNft = matchingNfts.length > 0;
      const serialNumbers = matchingNfts.map((nft: any) => nft.serial_number);

      const result = {
        hasNft,
        serialNumbers,
        isLoading: false,
        error: null,
      };

      setState(result);

      console.log(`🎯 Ownership check result:`, {
        hasNft,
        serialCount: serialNumbers.length,
        serials: serialNumbers,
      });

      return result;
    } catch (error: any) {
      console.error('❌ Error checking NFT ownership:', error);
      
      const result = {
        hasNft: false,
        serialNumbers: [],
        isLoading: false,
        error: error.message || 'Failed to check ownership',
      };

      setState(result);
      return result;
    }
  }, []);

  /**
   * Check if user owns a specific NFT serial number
   */
  const checkSpecificSerial = useCallback(async (
    accountId: string | null | undefined,
    tokenId: string | null | undefined,
    serialNumber: number
  ): Promise<boolean> => {
    const result = await checkOwnership(accountId, tokenId);
    return result.serialNumbers.includes(serialNumber);
  }, [checkOwnership]);

  return {
    ...state,
    checkOwnership,
    checkSpecificSerial,
  };
}

export default useNftOwnershipCheck;