import { useEffect, useState, useCallback } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useChainId, 
  usePublicClient,
  useUnifiedWallet,
  useUnifiedReadContract
} from './useUnifiedWallet';
import { QUIVA_MARKETPLACE, QUIVA_MARKETPLACE_ABI } from '../contracts/QuivaComics';
import { mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { useAppDispatch } from '@/redux/hook';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { parseEther } from 'viem';
import { ContractId } from "@hashgraph/sdk";

const hederaTestnet = {
  id: 296,
  name: 'HederaTestnet',
  nativeCurrency: { name: 'Hedera Testnet', symbol: 'HBAR', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.hashio.io/api'] } },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet/home' },
  },
} as const satisfies Chain;

// Helper function to normalize contract addresses
const normalizeContractAddress = (address: any) => {
  if (typeof address === 'string') {
    if (address.startsWith('0x')) {
      return address; // Already EVM address
    } else if (address.includes('.')) {
      // Hedera format like "0.0.123456"
      return `0x${ContractId.fromString(address).toSolidityAddress()}`;
    }
  }
  if (address?.toSolidityAddress) {
    // ContractId object
    return `0x${address.toSolidityAddress()}`;
  }
  return address;
};

export const useComicPurchase = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { activeWalletType } = useUnifiedWallet();
  const { readContract } = useUnifiedReadContract({}, {});
  const dispatch = useAppDispatch();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [comicId, setComicId] = useState<string | null>(null);
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState<number>(0);
  const [purchaseHash, setPurchaseHash] = useState<any>();

  const { 
    writeContractAsync,
    data: txHash,
    error: sendError,
    isPending: isSending
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isPurchaseComplete,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: purchaseHash || txHash,
  });

  /** 
   * Read listing directly from contract — Works with both Wagmi and HashPack
   */
  const getListing = useCallback(async (nftAddress: `0x${string}` | string, tokenId: bigint) => {
    const normalizedAddress = normalizeContractAddress(nftAddress) as `0x${string}`;
    
    if (activeWalletType === 'wagmi' && publicClient) {
      // Wagmi approach using publicClient
      return await publicClient.readContract({
        address: QUIVA_MARKETPLACE as `0x${string}`,
        abi: QUIVA_MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [normalizedAddress, tokenId],
        authorizationList: [],
      });
    } else {
      // HashPack approach using unified readContract
      return await readContract({
        address: normalizedAddress,
        abi: QUIVA_MARKETPLACE_ABI,
        functionName: 'getListing',
        args: [normalizedAddress, tokenId],
        authorizationList: [], // Required for HashPack
      });
    }
  }, [activeWalletType, publicClient, readContract]);

  /**
   * Create DB transaction record
   */
  const updateBackendData = async (
    comicId: string,
    walletAddress: string,
    txHash: string,
    price: number,
    currency: string
  ) => {
    try {
      const result = await dispatch(
        createTransaction({
          payload: { comicId, walletAddress, txHash, price, currency },
        } as any)
      ).unwrap();

      console.log('Backend transaction stored:', result);
      setPurchaseSuccess(true);
      setIsPurchasing(false);
      setComicId(null);

    } catch (error) {
      console.error('Backend error but blockchain succeeded:', error);
      setPurchaseSuccess(true);
      setIsPurchasing(false);
      setComicId(null);
    }
  };

  useEffect(() => {
    if (isPurchaseComplete && receipt && comicId && address) {
      updateBackendData(
        comicId,
        address as string,
        receipt.transactionHash,
        currentPurchasePrice,
        'HBAR'
      );
    }
  }, [isPurchaseComplete, receipt, comicId, address, currentPurchasePrice]);

  /**
   * UNIFIED PURCHASE FUNCTION
   * - Works with both Wagmi and HashPack
   * - Fetches real listing
   * - Uses on-chain price ONLY
   */
  const purchaseComic = async ({ nftAddress, tokenId, amount }: {
    nftAddress: `0x${string}` | string;
    tokenId: bigint;
    amount: bigint;
  }) => {
    if (!isConnected || !address) throw new Error('Wallet not connected');
    
    // Validate chain for both wallet types
    if (chainId !== 296) throw new Error('Please switch to Hedera Testnet');

    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      setPurchaseSuccess(false);

      // Get listing data
      const listing: any = await getListing(nftAddress, tokenId);
      console.log('Fetched on-chain listing:', listing);
      
      if (!listing) {
        throw new Error('Listing not found or not active');
      }
      
      if (!listing.pricePerItem || listing.pricePerItem === BigInt(0)) {
        throw new Error('Listing price not available');
      }

      if (!listing.amount || listing.amount === BigInt(0)) {
        throw new Error('Listing not available - sold out');
      }

      // Validate amount requested
      const amountBigInt = BigInt(amount);
      if (amountBigInt > BigInt(listing.amount)) {
        throw new Error(`Insufficient supply. Available: ${listing.amount}, Requested: ${amount}`);
      }

      // Calculate pricing
      const price = BigInt(listing.pricePerItem);
      const totalPrice = price * amountBigInt;
      
      console.log('Purchase calculation:', {
        pricePerItem: price.toString(),
        amount: amount.toString(),
        totalPrice: totalPrice.toString(),
        walletType: activeWalletType
      });

      // Prepare contract call arguments
      const contractArgs = {
        address: normalizeContractAddress(QUIVA_MARKETPLACE),
        contractId: activeWalletType === 'hashpack' ? ContractId.fromString("0.0.123456") : undefined, // Replace with actual marketplace contract ID
        abi: QUIVA_MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [normalizeContractAddress(nftAddress), tokenId, amountBigInt],
        account: address,
        chain: hederaTestnet,
      };

      // Handle wallet-specific logic
      if (activeWalletType === 'wagmi') {
        // Wagmi: Use value parameter for payment
        const totalPriceInHbar = Number(totalPrice) / 1e8;
        setCurrentPurchasePrice(Number(totalPrice) / 1e18);
        
        const hash = await writeContractAsync({
          ...contractArgs,
          value: parseEther(totalPriceInHbar.toString()),
        });
        
        setPurchaseHash(hash);
        return hash;
        
      } else {
        // HashPack: Handle HBAR payment differently
        const totalPriceInHbar = Number(totalPrice) / 1e8;
        setCurrentPurchasePrice(totalPriceInHbar);
        
        const hash = await writeContractAsync({
          ...contractArgs,
          metaArgs: { 
            gas: 300_000,
            amount: totalPriceInHbar // HashPack way to send HBAR
          },
        });
        
        setPurchaseHash(hash);
        return hash;
      }

    } catch (error: any) {
      console.error('Purchase error:', error);
      setPurchaseError(error);
      setIsPurchasing(false);
      throw error;
    }
  };

  const reset = () => {
    setIsPurchasing(false);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setCurrentPurchasePrice(0);
    setPurchaseHash(undefined);
  };

  return {
    purchaseComic,
    getListing,
    isPurchasing: isPurchasing || isSending,
    isConfirming,
    isPurchaseComplete,
    purchaseSuccess,
    purchaseError: sendError || purchaseError,
    purchaseHash: purchaseHash || txHash,
    reset,
    comicId,
    setComicId,
    walletStatus: { 
      isConnected, 
      address, 
      chainId,
      walletType: activeWalletType 
    },
    
    // Additional unified wallet info
    activeWalletType,
  };
};