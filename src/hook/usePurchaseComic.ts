import { useEffect, useState } from 'react';
import { 
  useAccount, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useChainId, 
  usePublicClient,
  useWalletClient
} from 'wagmi';
import { QUIVA_MARKETPLACE, QUIVA_MARKETPLACE_ABI } from '../contracts/QuivaComics';
import { mainnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';
import { useAppDispatch } from '@/redux/hook';
import { createTransaction } from '@/redux/slices/transactionSlice';
import { parseEther } from 'viem';

const hederaTestnet = {
  id: 296,
  name: 'HederaTestnet',
  nativeCurrency: { name: 'Hedera Testnet', symbol: 'HBAR', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet.hashio.io/api'] } },
  blockExplorers: {
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet/home' },
  },
} as const satisfies Chain;

export const useComicPurchase = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const dispatch = useAppDispatch();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<Error | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [comicId, setComicId] = useState<string | null>(null);
  const [currentPurchasePrice, setCurrentPurchasePrice] = useState<number>(0);
  const [purchaseHash, setPurchaseHash] = useState<`0x${string}` | undefined>();

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
   * Read listing directly from contract — ALWAYS required 
   */
  const getListing = async (nftAddress: `0x${string}`, tokenId: bigint) => {
    return await publicClient!.readContract({
      address: QUIVA_MARKETPLACE,
      abi: QUIVA_MARKETPLACE_ABI,
      functionName: 'getListing',
      args: [nftAddress, tokenId],
      authorizationList: [],
    });
  };

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
        address,
        receipt.transactionHash,
        currentPurchasePrice,
        'HBAR'
      );
    }
  }, [isPurchaseComplete, receipt, comicId, address, currentPurchasePrice]);

  /**
   * FIXED PURCHASE FUNCTION
   * - Fetches real listing
   * - Uses on-chain price ONLY
   */
  const purchaseComic = async ({ nftAddress, tokenId, amount }: {
    nftAddress : `0x${string}`;
    tokenId: bigint;
    amount: bigint;
    //pricePerToken?: bigint; // now optional and ignored
  }) => {
    if (!isConnected || !address) throw new Error('Wallet not connected');
    if (chainId !== 296) throw new Error('Please switch to Hedera Testnet');
    if (!walletClient) throw new Error('Wallet client unavailable');

    try {
      setIsPurchasing(true);
      setPurchaseError(null);
      setPurchaseSuccess(false);

      // const tokenIdBigInt = BigInt(tokenId);

      // ⭐ CRITICAL FIX — fetch the TRUE on-chain listing
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

      const price = BigInt(listing.pricePerItem);
      console.log("price as BigInt:", price);
      const amountBigInt = BigInt(amount);
      const totalPrice = price * amountBigInt;
      const totalPriceInHbar = Number(totalPrice) / 1e8;
      console.log("TotalPrice in HBAR:", totalPriceInHbar);
      console.log("TotalPrice:", totalPrice);

      // Store HBAR for backend
      setCurrentPurchasePrice(Number(totalPrice) / 1e18);

      console.log('Purchasing comic:', {
        tokenId: tokenId.toString(),
        // seller,
        amount: amount.toString(),
        pricePerToken: price.toString(),
        totalPrice: totalPrice.toString()
       
      });

      // Send smart contract call
      const hash = await writeContractAsync({
        address: QUIVA_MARKETPLACE,
        abi: QUIVA_MARKETPLACE_ABI,
        functionName: 'buyItem',
        args: [ nftAddress, tokenId, amountBigInt],
        value: parseEther(totalPriceInHbar.toString()),        // ★ use totalPrice directly as it's already in wei
        account: address,
        chain: hederaTestnet,
      
      });

      setPurchaseHash(hash);
      return hash;

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
    walletStatus: { isConnected, address, chainId },
  };
};

