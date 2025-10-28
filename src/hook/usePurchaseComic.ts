import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { QUIVA_COMICS_ABI, QUIVA_COMICS_ADDRESS } from '../contracts/QuivaComics';
import { bifrost, mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { useComicMinting } from './useComicMinting';
import { useAppDispatch } from '@/redux/hook';
import { createTransaction } from '@/redux/slices/transactionSlice';

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

interface PurchaseParams {
  tokenId: bigint;
  seller: string;
  amount: bigint;
  pricePerToken: bigint;
}

interface ListingData {
  seller: string;
  pricePerToken: bigint;
  amount: bigint;
  isActive: boolean;
}

export const useComicPurchase = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [comicId, setComicId] = useState<string | null>(null);
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState<number>(0);

  // Wagmi hooks for contract interaction
  const { 
    data: hash, 
    writeContract, 
    error: writeError,
    isPending: isWritePending 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isPurchaseComplete,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash,
  });

  const { sellerAddress, tokenId } = useComicMinting();

  useEffect(() => {
    if (isPurchaseComplete && receipt && comicId && address) {
      console.log('✅ Blockchain transaction complete - creating database record');
      updateBackendData(
        comicId,
        address,
        receipt.transactionHash,
        currentPurchasePrice,
        'HBAR'
      );
    }
  }, [isPurchaseComplete, receipt, comicId, address, currentPurchasePrice])

  /**
   * Get listing details for a specific comic and seller
   */
  const getListing = (tokenId: bigint | string, sellerAddress: string) => {
    return useReadContract({
      address: QUIVA_COMICS_ADDRESS,
      abi: QUIVA_COMICS_ABI,
      functionName: 'getListing',
      args: [BigInt(tokenId), sellerAddress as `0x${string}`],
    });
  };

  /**
   * Get comic details from blockchain
   */
  const getComicDetails = (tokenId: bigint) => {
    return useReadContract({
      address: QUIVA_COMICS_ADDRESS,
      abi: QUIVA_COMICS_ABI,
      functionName: 'getComic',
      args: [tokenId],
    });
  };

  /**
   * Check user's NFT balance
   */
  const getUserBalance = (tokenId: bigint, userAddress: string) => {
    return useReadContract({
      address: QUIVA_COMICS_ADDRESS,
      abi: QUIVA_COMICS_ABI,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`, tokenId],
    });
  };

  /**
   * Purchase comic NFT from marketplace
   */
  const purchaseComic = async ({
    tokenId,
    seller,
    amount,
    pricePerToken,
  }: PurchaseParams) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    if (chainId !== 296) {
      throw new Error('Please switch to Hedera Testnet');
    }

    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      setPurchaseSuccess(false);

      // Convert pricePerToken (wei) back to HBAR for database storage
      const priceInHbar = parseFloat(pricePerToken.toString()) / 1e18;
      setCurrentPurchasePrice(priceInHbar);

      const currentChain = chainId === 296 ? hederaTestnet : mainnet;
      // Calculate total price
      const totalPrice = pricePerToken * amount;

      console.log('💰 Purchasing comic:', {
        tokenId: tokenId.toString(),
        seller,
        amount: amount.toString(),
        pricePerToken: pricePerToken.toString(),
        totalPrice: totalPrice.toString(),
        priceInHbar
      });

      // Call smart contract
      await writeContract({
        address: QUIVA_COMICS_ADDRESS,
        abi: QUIVA_COMICS_ABI,
        functionName: 'purchaseComic',
        args: [tokenId, seller as `0x${string}`, amount],
        value: totalPrice,
        account: address,
        chain: currentChain,
      });

      console.log('✅ Purchase transaction sent');
      console.log(hash)
      return hash;

    } catch (error: any) {
      console.error('❌ Purchase error:', error);
      setPurchaseError(error);
      setIsPurchasing(false);
      throw error;
    }
  };

  /**
   * Create transaction record using Redux slice
   */
  const updateBackendData = async (
    comicId: string,
    walletAddress: string,
    txHash: string,
    price: number,
    currency: string
  ) => {
    try {
      console.log('📝 Creating transaction record via Redux:', {
        comicId,
        walletAddress,
        txHash,
        price,
        currency
      });

      const transactionData = {
        comicId,
        walletAddress,
        txHash,
        price,
        currency
      };

      const result = await dispatch(createTransaction({payload:transactionData} as any)).unwrap();
      console.log('✅ Transaction record created successfully:', result);
      
      // Mark purchase as complete
      setIsPurchasing(false);
      setPurchaseSuccess(true);
      setComicId(null); // Clear for next purchase

    } catch (error) {
      console.error('❌ Error creating transaction record:', error);
      
      // Even if database fails, blockchain succeeded so user should get access
      setIsPurchasing(false);
      setPurchaseSuccess(true); // Still mark as success since blockchain completed
      setComicId(null);
      
      // You might want to show a warning to the user that the purchase succeeded
      // but there was an issue recording it
    }
  };

  /**
   * Batch purchase multiple comics
   */
  const batchPurchaseComics = async (purchases: PurchaseParams[]) => {
    if (!isConnected || !address) {
      throw new Error('Please connect your wallet first');
    }

    if (chainId !== 296) {
      throw new Error('Please switch to Hedera Testnet');
    }

    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      setPurchaseSuccess(false);

      const currentChain = chainId === 296 ? hederaTestnet : mainnet;

      const tokenIds = purchases.map(p => p.tokenId);
      const sellers = purchases.map(p => p.seller);
      const amounts = purchases.map(p => p.amount);

      // Calculate total cost
      const totalCost = purchases.reduce((sum, p) => {
        return sum + (p.pricePerToken * p.amount);
      }, BigInt(0));

      // Store total price in HBAR
      const totalPriceInHbar = parseFloat(totalCost.toString()) / 1e18;
      setCurrentPurchasePrice(totalPriceInHbar);

      console.log('💰 Batch purchasing comics:', {
        count: purchases.length,
        totalCost: totalCost.toString(),
        totalPriceInHbar
      });

      await writeContract({
        address: QUIVA_COMICS_ADDRESS,
        abi: QUIVA_COMICS_ABI,
        functionName: 'batchPurchase',
        args: [tokenIds, sellers as `0x${string}`[], amounts],
        value: totalCost,
        account: address,
        chain: currentChain,
      });

      console.log('✅ Batch purchase transaction sent');

    } catch (error: any) {
      console.error('❌ Batch purchase error:', error);
      setPurchaseError(error);
      setIsPurchasing(false);
      throw error;
    }
  };

  // Monitor purchase completion
  if (isPurchaseComplete && !purchaseSuccess) {
    console.log('🔄 Purchase blockchain transaction completed, creating database record...');
  }

  // Monitor errors
  if (writeError && !purchaseError) {
    setPurchaseError(writeError as Error);
    setIsPurchasing(false);
  }

  // Reset function
  const reset = () => {
    setIsPurchasing(false);
    setPurchaseError(null);
    setPurchaseSuccess(false);
    setCurrentPurchasePrice(0);
  };

  return {
    purchaseComic,
    batchPurchaseComics,
    getListing,
    getComicDetails,
    getUserBalance,
    isPurchasing,
    isWritePending,
    isConfirming,
    isPurchaseComplete,
    purchaseSuccess,
    purchaseError: writeError || purchaseError,
    purchaseHash: hash,
    reset,
    comicId,
    setComicId,
    walletStatus: {
      isConnected,
      address,
      chainId,
    },
  };
};
