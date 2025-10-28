import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { QUIVA_FREE_COMICS_ABI, QUIVA_FREE_COMICS_ADDRESS } from '../contracts/QuivaComics';
import { useAppDispatch } from '@/redux/hook';
import type { Address, Chain } from 'viem';
import axios from 'axios';
import axiosInstance from '@/redux/axios-instance';

interface ClaimFreeComicParams {
  tokenId: bigint | string;
  comicId: string;
}

interface ClaimResult {
  success: boolean;
  transactionHash?: string;
  error?: Error;
}

const hederaTestnet = {
  id: 296,
  name: 'HederaTestnet',
  nativeCurrency: { name: 'Hedera Testnet', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet/home' },
  },
} as const satisfies Chain;

export const useClaimFreeComic = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const dispatch = useAppDispatch();

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<Error | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [currentComicId, setCurrentComicId] = useState<string | null>(null);
  const [currentTokenId, setCurrentTokenId] = useState<string | null>(null);
  const [claimProgress, setClaimProgress] = useState(0);

  // Wagmi hooks for contract interaction
  const {
    data: hash,
    writeContract,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isClaimComplete,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Monitor transaction hash
  useEffect(() => {
    if (hash) {
      console.log('🔗 Claim transaction hash received:', hash);
      setClaimProgress(60);
    }
  }, [hash]);

  // Monitor confirmation status
  useEffect(() => {
    if (isConfirming) {
      console.log('⏳ Claim transaction confirming...');
      setClaimProgress(80);
    }
  }, [isConfirming]);

  // Handle successful claim
  useEffect(() => {
    const processClaimSuccess = async () => {
      if (isClaimComplete && receipt && currentComicId && currentTokenId && address) {
        console.log('✅ Free comic NFT claimed successfully!');
        console.log('📄 Transaction receipt:', receipt);
        setClaimProgress(90);

        // Create transaction record in backend
        try {
          console.log('📤 Creating transaction record in backend...');
          
          const transactionData = {
            comicId: currentComicId,
            tokenId: currentTokenId,
            buyerAddress: address,
            transactionHash: receipt.transactionHash,
            amount: 0, // Free claim
            currency: 'FREE',
            type: 'claim',
            status: 'completed',
          };

          console.log('Transaction data:', transactionData);

          const response = await axiosInstance.post(
            `/transactions`,
            transactionData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          console.log('✅ Backend transaction record created:', response.data);
          setClaimProgress(100);
          setClaimSuccess(true);
        } catch (error: any) {
          console.error('❌ Error creating transaction record:', error);
          console.error('Error response:', error.response?.data);
          
          // Still mark as success since blockchain claim worked
          // The backend record is for tracking purposes only
          setClaimProgress(100);
          setClaimSuccess(true);
        } finally {
          setIsClaiming(false);
        }
      }
    };

    processClaimSuccess();
  }, [isClaimComplete, receipt, currentComicId, currentTokenId, address]);

  // Monitor write errors
  useEffect(() => {
    if (writeError) {
      console.error('❌ Write contract error:', writeError);
      setClaimError(writeError as Error);
      setIsClaiming(false);
      setClaimProgress(0);
    }
  }, [writeError]);

  /**
   * Claim a free comic NFT
   */
  const claimFreeComic = async ({
    tokenId,
    comicId,
  }: ClaimFreeComicParams): Promise<ClaimResult> => {
    try {
      console.log('🎁 Starting free comic claim process...');
      console.log('Token ID:', tokenId);
      console.log('Comic ID:', comicId);
      const currentChain = chainId === 296 ? hederaTestnet : null;

      // Validation
      if (!isConnected || !address) {
        const error = new Error('Please connect your wallet to claim');
        setClaimError(error);
        return { success: false, error };
      }

      // Reset states
      setClaimError(null);
      setClaimSuccess(false);
      setIsClaiming(true);
      setCurrentComicId(comicId);
      setCurrentTokenId(tokenId.toString());
      setClaimProgress(20);

      console.log('📝 Calling claimFreeComic contract function...');

      // Call the smart contract
      await writeContract({
        address: QUIVA_FREE_COMICS_ADDRESS,
        abi: QUIVA_FREE_COMICS_ABI,
        functionName: 'claimFreeComic',
        args: [BigInt(tokenId)],
        account: address,
        chain: currentChain,
      });

      setClaimProgress(40);

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error claiming free comic:', error);
      const claimError = new Error(
        error?.message || 'Failed to claim free comic'
      );
      setClaimError(claimError);
      setIsClaiming(false);
      setClaimProgress(0);
      return { success: false, error: claimError };
    }
  };

  /**
   * Reset claim state
   */
  const resetClaimState = () => {
    setIsClaiming(false);
    setClaimError(null);
    setClaimSuccess(false);
    setCurrentComicId(null);
    setCurrentTokenId(null);
    setClaimProgress(0);
  };

  return {
    // Functions
    claimFreeComic,
    resetClaimState,

    // States
    isClaiming: isClaiming || isWritePending || isConfirming,
    claimError,
    claimSuccess,
    claimProgress,
    transactionHash: hash,
    receipt,

    // Connection states
    isConnected,
    address,
  };
};

/**
 * Hook to check if a user has claimed a specific free comic
 * Uses both blockchain and backend verification
 */
export const useCheckComicClaim = (tokenId?: string | bigint, userAddress?: Address) => {
  const [backendHasClaimed, setBackendHasClaimed] = useState<boolean>(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  // Check blockchain
  const { data: blockchainHasClaimed, isLoading: isLoadingBlockchain, refetch: refetchBlockchain } = useReadContract({
    address: QUIVA_FREE_COMICS_ADDRESS,
    abi: QUIVA_FREE_COMICS_ABI,
    functionName: 'hasUserClaimed',
    args: tokenId && userAddress ? [BigInt(tokenId), userAddress] : undefined,
    query: {
      enabled: !!tokenId && !!userAddress,
    },
  });

  // Check backend using verify_nft endpoint
  useEffect(() => {
    const checkBackend = async () => {
      if (!tokenId || !userAddress) return;

      setIsCheckingBackend(true);
      try {
        // const response = await axios.post(
        //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transaction/verify_nft`,
        const response = await axiosInstance.post(
          `/transactions/user/verify_nft/`,
          {
            tokenId: tokenId.toString(),
            walletAddress: userAddress,
          }
        );

        setBackendHasClaimed(response.data?.hasAccess || false);
      } catch (error) {
        console.error('Error checking backend claim status:', error);
        setBackendHasClaimed(false);
      } finally {
        setIsCheckingBackend(false);
      }
    };

    checkBackend();
  }, [tokenId, userAddress]);

  const refetch = async () => {
    await refetchBlockchain();
    // Trigger backend check again
    if (tokenId && userAddress) {
      setIsCheckingBackend(true);
      try {
        // const response = await axios.post(
        //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/transaction/verify_nft`,
        const response = await axiosInstance.post(
          `/transactions/user/verify_nft/`,
          {
            tokenId: tokenId.toString(),
            walletAddress: userAddress,
          }
        );
        setBackendHasClaimed(response.data?.hasAccess || false);
      } catch (error) {
        console.error('Error checking backend claim status:', error);
      } finally {
        setIsCheckingBackend(false);
      }
    }
  };

  // User has claimed if EITHER blockchain OR backend shows claim
  const hasClaimed = (blockchainHasClaimed as boolean) || backendHasClaimed;

  return {
    hasClaimed,
    isLoading: isLoadingBlockchain || isCheckingBackend,
    refetch,
  };
};

/**
 * Hook to check if a comic is claimable by a user
 */
export const useIsComicClaimable = (tokenId?: string | bigint, userAddress?: Address) => {
  const { hasClaimed, isLoading: hasClaimedLoading } = useCheckComicClaim(tokenId, userAddress);

  const { data: comicData, isLoading: comicLoading, refetch } = useReadContract({
    address: QUIVA_FREE_COMICS_ADDRESS,
    abi: QUIVA_FREE_COMICS_ABI,
    functionName: 'getComic',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  const comic = comicData as any;
  const isClaimable = comic?.isFree && comic?.exists && !hasClaimed;
  const reason = !comic?.exists ? 'Comic does not exist' : 
                !comic?.isFree ? 'Comic is not free' :
                hasClaimed ? 'Already claimed' : '';

  return {
    isClaimable,
    reason,
    isLoading: hasClaimedLoading || comicLoading,
    refetch,
  };
};

/**
 * Hook to get comic details including whether it's free
 */
export const useComicDetails = (tokenId?: string | bigint) => {
  const { data: comicData, isLoading, refetch } = useReadContract({
    address: QUIVA_FREE_COMICS_ADDRESS,
    abi: QUIVA_FREE_COMICS_ABI,
    functionName: 'getComic',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  // Parse the comic struct
  const comic = comicData as any;

  return {
    comic: comic
      ? {
          tokenId: comic.tokenId,
          creator: comic.creator,
          metadataURI: comic.metadataURI,
          maxSupply: comic.maxSupply,
          currentSupply: comic.currentSupply,
          royaltyPercentage: comic.royaltyPercentage,
          isFree: comic.isFree,
          exists: comic.exists,
        }
      : null,
    isLoading,
    refetch,
  };
};

/**
 * Combined hook for free comic claiming flow
 */
export const useFreeComicFlow = (comicId: string, tokenId?: string | bigint) => {
  const { address } = useAccount();
  const claimHook = useClaimFreeComic();
  const { hasClaimed, isLoading: isCheckingClaim, refetch } = useCheckComicClaim(
    tokenId,
    address
  );
  const { isClaimable, reason, isLoading: isCheckingClaimable } = useIsComicClaimable(
    tokenId,
    address
  );
  const { comic, isLoading: isLoadingComic } = useComicDetails(tokenId);

  const canClaim = !hasClaimed && isClaimable && comic?.isFree;

  return {
    ...claimHook,
    hasClaimed,
    isClaimable,
    claimableReason: reason,
    comic,
    canClaim,
    isLoading: isCheckingClaim || isCheckingClaimable || isLoadingComic,
    refetchClaimStatus: refetch,
  };
};