// 'use client';
// 'use client';

// import { useCallback, useState, useMemo } from 'react';
// import { 
//   useWriteContract, 
//   useReadContract, 
//   useAccount as useWagmiAccount,
//   usePublicClient,
//   useSendTransaction,
//   useWaitForTransactionReceipt,
//   useChainId,
//   createConfig,
// } from 'wagmi';
// import { useHederaWallet } from '@/providers/HashPackProvider';
// import { WalletType, useWalletDetector, useWalletAware } from './useWalletDetector';
// import { 
//   HEDERA_CONTRACTS, 
//   COMIC_CORE_ABI, 
//   COMIC_MARKETPLACE_ABI, 
//   COMIC_SALES_ABI,
//   HEDERA_TOKEN_SERVICE_ABI 
// } from '@/contracts/HederaContractConfig';
// import { http, parseEther } from 'viem';
// import { 
//   ContractExecuteTransaction, 
//   ContractFunctionParameters,
//   AccountId,
//   ContractId,
//   Client,
//   TransactionId
// } from '@hashgraph/sdk';
// import { sepolia } from 'wagmi/chains';
// import { useCallback, useState, useMemo } from 'react';
// import { 
//   useWriteContract, 
//   useReadContract, 
//   useAccount as useWagmiAccount,
//   usePublicClient,
//   useSendTransaction,
//   useWaitForTransactionReceipt,
//   useChainId,
//   createConfig,
// } from 'wagmi';
// import { useHederaWallet } from '@/providers/HashPackProvider';
// import { WalletType, useWalletDetector, useWalletAware } from './useWalletDetector';
// import { 
//   HEDERA_CONTRACTS, 
//   COMIC_CORE_ABI, 
//   COMIC_MARKETPLACE_ABI, 
//   COMIC_SALES_ABI,
//   HEDERA_TOKEN_SERVICE_ABI 
// } from '@/contracts/HederaContractConfig';
// import { http, parseEther } from 'viem';
// import { 
//   ContractExecuteTransaction, 
//   ContractFunctionParameters,
//   AccountId,
//   ContractId,
//   Client,
//   TransactionId
// } from '@hashgraph/sdk';
// import { sepolia } from 'wagmi/chains';

// interface ContractWriteOptions {
//   onSuccess?: (hash: string | undefined) => void;
//   onError?: (error: Error) => void;
//   onSettled?: () => void;
// }
// interface ContractWriteOptions {
//   onSuccess?: (hash: string | undefined) => void;
//   onError?: (error: Error) => void;
//   onSettled?: () => void;
// }

// interface ContractReadOptions {
//   enabled?: boolean;
//   watch?: boolean;
// }
// interface ContractReadOptions {
//   enabled?: boolean;
//   watch?: boolean;
// }

// /**
//  * Unified hook for Comic contract interactions
//  * Automatically routes to EVM (wagmi) or Hedera (SDK) based on connected wallet
//  *
//  * Usage:
//  * ```tsx
//  * const { 
//  *   createCollection,
//  *   grantReadingAccess,
//  *   buyNFT,
//  *   listNFT 
//  * } = useWagmiComicContract();
//  *
//  * const { 
//  *   data: canRead,
//  *   isLoading
//  * } = useWagmiComicContract().canReadByToken({
//  *   tokenAddress: "0x...",
//  *   userAddress: "0x..."
//  * });
//  * ```
//  */
// export function useWagmiComicContract() {
//   const wallet = useWalletDetector();
//   const walletAware = useWalletAware();
// /**
//  * Unified hook for Comic contract interactions
//  * Automatically routes to EVM (wagmi) or Hedera (SDK) based on connected wallet
//  *
//  * Usage:
//  * ```tsx
//  * const { 
//  *   createCollection,
//  *   grantReadingAccess,
//  *   buyNFT,
//  *   listNFT 
//  * } = useWagmiComicContract();
//  *
//  * const { 
//  *   data: canRead,
//  *   isLoading
//  * } = useWagmiComicContract().canReadByToken({
//  *   tokenAddress: "0x...",
//  *   userAddress: "0x..."
//  * });
//  * ```
//  */
// export function useWagmiComicContract() {
//   const wallet = useWalletDetector();
//   const walletAware = useWalletAware();
  
//   // EVM/Wagmi hooks
//   const { address: evmAddress } = useWagmiAccount();
//   const chainId = useChainId();
//   const publicClient = usePublicClient();
//  // const { writeContract, isPending: isEvmWritePending } = useWriteContract();
//    const { data: hash, isPending, writeContractAsync } = useWriteContract()
//     const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
//         confirmations: 1,
//         hash,
//     })
//   const { sendTransaction, isPending: isSendPending } = useSendTransaction();

//   // Hedera hooks
//   const { isConnected: isHederaConnected, account: hederaAccount, signer } = useHederaWallet();
//   // Hedera hooks
//   const { isConnected: isHederaConnected, account: hederaAccount, signer } = useHederaWallet();

//   // State management
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<Error | null>(null);
//   const [lastHash, setLastHash] = useState<string | undefined>();
//   // State management
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<Error | null>(null);
//   const [lastHash, setLastHash] = useState<string | undefined>();

//   // ============================================
//   // COMIC CORE CONTRACT FUNCTIONS
//   // ============================================
//   // ============================================
//   // COMIC CORE CONTRACT FUNCTIONS
//   // ============================================



//   /**
//    * Create a new comic collection
//    * This mints an NFT collection for the comic episode
//    */
//   const createComicCollection = useCallback(
//     async (
//       episodeId: string,
//       name: string,
//       symbol: string,
//       memo: string,
//       maxSupply: bigint,
//       autoRenewPeriod: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Create a new comic collection
//    * This mints an NFT collection for the comic episode
//    */
//   const createComicCollection = useCallback(
//     async (
//       episodeId: string,
//       name: string,
//       symbol: string,
//       memo: string,
//       maxSupply: bigint,
//       autoRenewPeriod: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           // EVM path using wagmi
//         //   const tx = new Promise<string>((resolve, reject) => {
//         //     writeContractAsync(
//         //       {
//         //         address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
//         //         abi: COMIC_CORE_ABI,
//         //         functionName: 'createComicCollection',
//         //         args: [episodeId, name, symbol, memo, BigInt(maxSupply), autoRenewPeriod],
//         //         // account: evmAddress,
//         //         // chainId: chainId,
//         //       },
//         //       {
//         //         onSuccess: (hash) => {
//         //           setLastHash(hash);
//         //           options?.onSuccess?.(hash);
//         //           resolve(hash);
//         //         },
//         //         onError: (err) => {
//         //           const error = err as Error;
//         //           setError(error);
//         //           options?.onError?.(error);
//         //           reject(error);
//         //         },
//         //       }
//         //     );
//         //   });
// const tx = await writeContractAsync({
//      abi: COMIC_CORE_ABI,
//     address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
//     functionName: 'createComicCollection',
//     args: [episodeId, name, symbol, memo, BigInt(maxSupply), autoRenewPeriod],
//     account: evmAddress,
//     chainId: chainId,
// })
//   return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           // Hedera path using SDK
//           return await executeHederaContractCall('createComicCollection', {
//             episodeId,
//             name,
//             symbol,
//             memo,
//             maxSupply,
//             autoRenewPeriod,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, chainId, writeContractAsync, hederaAccount, signer]
//   );

//   /**
//    * Grant reading access to a user for a comic token
//    */
//   const grantReadingAccess = useCallback(
//     async (
//       tokenAddress: string,
//       userAddress: string,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Grant reading access to a user for a comic token
//    */
//   const grantReadingAccess = useCallback(
//     async (
//       tokenAddress: string,
//       userAddress: string,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//         //   const tx = new Promise<string>((resolve, reject) => {
//           const tx = await writeContractAsync({
//               address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
//               abi: COMIC_CORE_ABI,
//               functionName: 'grantReadingAccess',
//               args: [tokenAddress as `0x${string}`, userAddress as `0x${string}`],
//                 account: evmAddress,
//                 chainId: chainId
//               },
//             //   {
//             //     onSuccess: (hash) => {
//             //       setLastHash(hash);
//             //       options?.onSuccess?.(hash);
//             //       resolve(hash);
//             //     },
//             //     onError: (err) => {
//             //       const error = err as Error;
//             //       setError(error);
//             //       options?.onError?.(error);
//             //       reject(error);
//             //     },
//             //   }
//             );
//         //   });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('grantReadingAccess', {
//             tokenAddress,
//             userAddress,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   /**
//    * Revoke reading access from a user
//    */
//   const revokeReadingAccess = useCallback(
//     async (
//       tokenAddress: string,
//       userAddress: string,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Revoke reading access from a user
//    */
//   const revokeReadingAccess = useCallback(
//     async (
//       tokenAddress: string,
//       userAddress: string,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             writeContractAsync({
//               address: HEDERA_CONTRACTS.COMIC_CORE.evmAddress as `0x${string}`,
//               abi: COMIC_CORE_ABI,
//               functionName: 'revokeReadingAccess',
//               args: [tokenAddress as `0x${string}`, userAddress as `0x${string}`],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('revokeReadingAccess', {
//             tokenAddress,
//             userAddress,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   // ============================================
//   // COMIC MARKETPLACE CONTRACT FUNCTIONS
//   // ============================================
//   // ============================================
//   // COMIC MARKETPLACE CONTRACT FUNCTIONS
//   // ============================================

//   /**
//    * List an NFT for resale on the marketplace
//    */
//   const listNFTForResale = useCallback(
//     async (
//       tokenAddress: string,
//       serialNumber: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * List an NFT for resale on the marketplace
//    */
//   const listNFTForResale = useCallback(
//     async (
//       tokenAddress: string,
//       serialNumber: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             writeContractAsync({
//               address: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
//               abi: COMIC_MARKETPLACE_ABI,
//               functionName: 'depositAndListForResale',
//               args: [tokenAddress as `0x${string}`, serialNumber, price],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('depositAndListForResale', {
//             tokenAddress,
//             serialNumber,
//             price,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   /**
//    * Buy an NFT from the marketplace
//    */
//   const buyNFTFromMarketplace = useCallback(
//     async (
//       listingId: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Buy an NFT from the marketplace
//    */
//   const buyNFTFromMarketplace = useCallback(
//     async (
//       listingId: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             // sendTransaction(
//             //   {
//             //     to: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
//             //     data: undefined,
//             //     value: price,
//             //   },
//             //   {
//             //     onSuccess: (hash) => {
//             //       setLastHash(hash);
//             //       options?.onSuccess?.(hash);
//             //       resolve(hash);
//             //     },
//             //     onError: (err) => {
//             //       const error = err as Error;
//             //       setError(error);
//             //       options?.onError?.(error);
//             //       reject(error);
//             //     },
//             //   }
//             // );
//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             // sendTransaction(
//             //   {
//             //     to: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
//             //     data: undefined,
//             //     value: price,
//             //   },
//             //   {
//             //     onSuccess: (hash) => {
//             //       setLastHash(hash);
//             //       options?.onSuccess?.(hash);
//             //       resolve(hash);
//             //     },
//             //     onError: (err) => {
//             //       const error = err as Error;
//             //       setError(error);
//             //       options?.onError?.(error);
//             //       reject(error);
//             //     },
//             //   }
//             // );

//               writeContractAsync(
//               {
//                 address: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
//                 abi: COMIC_MARKETPLACE_ABI,
//                 functionName: 'purchaseNFT',
//                 args: [listingId],
//                 value: price,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
          
          
//         });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && signer) {
//           return await executeHederaContractCall('purchaseNFT', {
//             listingId,
//           }, signer, options, price);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, signer]
//   );
//         });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && signer) {
//           return await executeHederaContractCall('purchaseNFT', {
//             listingId,
//           }, signer, options, price);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, signer]
//   );

//   /**
//    * Cancel a marketplace listing
//    */
//   const cancelListing = useCallback(
//     async (
//       listingId: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Cancel a marketplace listing
//    */
//   const cancelListing = useCallback(
//     async (
//       listingId: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             writeContractAsync(
//               {
//                 address: HEDERA_CONTRACTS.COMIC_MARKETPLACE.evmAddress as `0x${string}`,
//                 abi: COMIC_MARKETPLACE_ABI,
//                 functionName: 'cancelListing',
//                 args: [listingId],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('cancelListing', {
//             listingId,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   // ============================================
//   // COMIC SALES CONTRACT FUNCTIONS
//   // ============================================
//   // ============================================
//   // COMIC SALES CONTRACT FUNCTIONS
//   // ============================================

//   /**
//    * Create a direct listing for selling comics
//    */
//   const createDirectListing = useCallback(
//     async (
//       episodeId: string,
//       pricePerNFT: bigint,
//       quantity: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Create a direct listing for selling comics
//    */
//   const createDirectListing = useCallback(
//     async (
//       episodeId: string,
//       pricePerNFT: bigint,
//       quantity: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             writeContractAsync(
//               {
//                 address: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//                 abi: COMIC_SALES_ABI,
//                 functionName: 'createDirectListing',
//                 args: [episodeId, pricePerNFT, quantity],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('createDirectListing', {
//             episodeId,
//             pricePerNFT,
//             quantity,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   /**
//    * Buy comics from a direct listing
//    */
//   const buyFromDirectListing = useCallback(
//     async (
//       listingId: bigint,
//       quantity: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Buy comics from a direct listing
//    */
//   const buyFromDirectListing = useCallback(
//     async (
//       listingId: bigint,
//       quantity: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             // sendTransaction(
//             //   {
//             //     to: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//             //     value: price,
//             //     data: undefined,
//             //   },
//             //   {
//             //     onSuccess: (hash) => {
//             //       setLastHash(hash);
//             //       options?.onSuccess?.(hash);
//             //       resolve(hash);
//             //     },
//             //     onError: (err) => {
//             //       const error = err as Error;
//             //       setError(error);
//             //       options?.onError?.(error);
//             //       reject(error);
//             //     },
//             //   }
//             // );
//              writeContractAsync(
//               {
//                 address: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//                 abi: COMIC_SALES_ABI,
//                 functionName: 'purchaseFromListing',
//                 args: [listingId],
//                 value: price,
//                 data: undefined,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && signer) {
//           return await executeHederaContractCall('purchaseFromListing', {
//             listingId,
//             quantity,
//           }, signer, options, price);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, signer]
//   );

//   /**
//    * Create a campaign for minting comics
//    */
//   const createCampaign = useCallback(
//     async (
//       episodeId: string,
//       mintPrice: bigint,
//       maxSupply: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Create a campaign for minting comics
//    */
//   const createCampaign = useCallback(
//     async (
//       episodeId: string,
//       mintPrice: bigint,
//       maxSupply: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             writeContractAsync(
//               {
//                 address: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//                 abi: COMIC_SALES_ABI,
//                 functionName: 'createCampaign',
//                 args: [episodeId, mintPrice, maxSupply],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//           });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && hederaAccount && signer) {
//           return await executeHederaContractCall('createCampaign', {
//             episodeId,
//             mintPrice,
//             maxSupply,
//           }, signer, options);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, writeContractAsync, hederaAccount, signer]
//   );

//   /**
//    * Mint from a campaign
//    */
//   const mintFromCampaign = useCallback(
//     async (
//       campaignId: bigint,
//       quantity: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);
//   /**
//    * Mint from a campaign
//    */
//   const mintFromCampaign = useCallback(
//     async (
//       campaignId: bigint,
//       quantity: bigint,
//       price: bigint,
//       options?: ContractWriteOptions
//     ) => {
//       try {
//         setIsProcessing(true);
//         setError(null);

//         if (wallet.type === WalletType.ETHEREUM && evmAddress) {
//           const tx = new Promise<string>((resolve, reject) => {
//             // sendTransaction(
//             //   {
//             //     to: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//             //     value: price,
//             //     data: undefined,
//             //   },
//             //   {
//             //     onSuccess: (hash) => {
//             //       setLastHash(hash);
//             //       options?.onSuccess?.(hash);
//             //       resolve(hash);
//             //     },
//             //     onError: (err) => {
//             //       const error = err as Error;
//             //       setError(error);
//             //       options?.onError?.(error);
//             //       reject(error);
//             //     },
//             //   }
//             // );
//             writeContractAsync(
//                {
//                 address: HEDERA_CONTRACTS.COMIC_SALES.evmAddress as `0x${string}`,
//                 abi: COMIC_SALES_ABI,
//                 functionName: 'mint',
//                 args: [campaignId, quantity],
//                 account: evmAddress,
//                 chainId: chainId,
//               },
//               {
//                 onSuccess: (hash) => {
//                   setLastHash(hash);
//                   options?.onSuccess?.(hash);
//                   resolve(hash);
//                 },
//                 onError: (err) => {
//                   const error = err as Error;
//                   setError(error);
//                   options?.onError?.(error);
//                   reject(error);
//                 },
//               }
//             );
//         });
//           return await tx;
//         } else if (wallet.type === WalletType.HEDERA && signer) {
//           return await executeHederaContractCall('mint', {
//             campaignId,
//             quantity,
//           }, signer, options, price);
//         } else {
//           throw new Error('No wallet connected');
//         }
//       } catch (err) {
//         const error = err instanceof Error ? err : new Error('Unknown error');
//         setError(error);
//         options?.onError?.(error);
//         throw error;
//       } finally {
//         setIsProcessing(false);
//         options?.onSettled?.();
//       }
//     },
//     [wallet.type, evmAddress, sendTransaction, signer]
//   );

//   return {
//     // State
//     isProcessing,
//     error,
//     lastHash,
//     wallet,
//   return {
//     // State
//     isProcessing,
//     error,
//     lastHash,
//     wallet,

//     // Comic Core functions
//     createComicCollection,
//     grantReadingAccess,
//     revokeReadingAccess,
//     // Comic Core functions
//     createComicCollection,
//     grantReadingAccess,
//     revokeReadingAccess,

//     // Marketplace functions
//     listNFTForResale,
//     buyNFTFromMarketplace,
//     cancelListing,
//     // Marketplace functions
//     listNFTForResale,
//     buyNFTFromMarketplace,
//     cancelListing,

//     // Sales functions
//     createDirectListing,
//     buyFromDirectListing,
//     createCampaign,
//     mintFromCampaign,
//   };
// }
//     // Sales functions
//     createDirectListing,
//     buyFromDirectListing,
//     createCampaign,
//     mintFromCampaign,
//   };
// }

// // ============================================
// // HELPER FUNCTIONS
// // ============================================
// // ============================================
// // HELPER FUNCTIONS
// // ============================================

// /**
//  * Execute a contract call on Hedera network
//  * Handles the Hedera SDK contract execution
//  */
// async function executeHederaContractCall(
//   functionName: string,
//   params: Record<string, any>,
//   signer: any,
//   options?: ContractWriteOptions,
//   value?: bigint
// ): Promise<string> {
//   try {
//     const contractId = getContractIdByFunction(functionName);
// /**
//  * Execute a contract call on Hedera network
//  * Handles the Hedera SDK contract execution
//  */
// async function executeHederaContractCall(
//   functionName: string,
//   params: Record<string, any>,
//   signer: any,
//   options?: ContractWriteOptions,
//   value?: bigint
// ): Promise<string> {
//   try {
//     const contractId = getContractIdByFunction(functionName);
    
//     const contractParams = new ContractFunctionParameters();
//     const contractParams = new ContractFunctionParameters();

//     // Map function parameters
//     Object.entries(params).forEach(([key, val]) => {
//       if (typeof val === 'string' && val.startsWith('0x')) {
//         // Address
//         contractParams.addAddress(val);
//       } else if (typeof val === 'bigint' || typeof val === 'number') {
//         // Number/BigInt
//         contractParams.addInt64(Number(val));
//       } else if (typeof val === 'string') {
//         // String
//         contractParams.addString(val);
//       }
//     });
//     // Map function parameters
//     Object.entries(params).forEach(([key, val]) => {
//       if (typeof val === 'string' && val.startsWith('0x')) {
//         // Address
//         contractParams.addAddress(val);
//       } else if (typeof val === 'bigint' || typeof val === 'number') {
//         // Number/BigInt
//         contractParams.addInt64(Number(val));
//       } else if (typeof val === 'string') {
//         // String
//         contractParams.addString(val);
//       }
//     });

//     const transaction = new ContractExecuteTransaction()
//       .setContractId(contractId)
//       .setGas(3000000)
//       .setFunction(functionName, contractParams);
//     const transaction = new ContractExecuteTransaction()
//       .setContractId(contractId)
//       .setGas(3000000)
//       .setFunction(functionName, contractParams);

//     if (value) {
//       transaction.setPayableAmount(Number(value));
//     }
//     if (value) {
//       transaction.setPayableAmount(Number(value));
//     }

//     const result = await signer.call(transaction);
//     const txId = result.transactionId?.toString() || 'unknown';
//     const result = await signer.call(transaction);
//     const txId = result.transactionId?.toString() || 'unknown';
    
//     options?.onSuccess?.(txId);
//     return txId;
//   } catch (error) {
//     const err = error instanceof Error ? error : new Error('Hedera contract call failed');
//     options?.onError?.(err);
//     throw err;
//   }
// }
//     options?.onSuccess?.(txId);
//     return txId;
//   } catch (error) {
//     const err = error instanceof Error ? error : new Error('Hedera contract call failed');
//     options?.onError?.(err);
//     throw err;
//   }
// }

// /**
//  * Get contract ID based on function name
//  */
// function getContractIdByFunction(functionName: string): ContractId {
//   switch (functionName) {
//     case 'createComicCollection':
//     case 'grantReadingAccess':
//     case 'revokeReadingAccess':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_CORE.address);
// /**
//  * Get contract ID based on function name
//  */
// function getContractIdByFunction(functionName: string): ContractId {
//   switch (functionName) {
//     case 'createComicCollection':
//     case 'grantReadingAccess':
//     case 'revokeReadingAccess':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_CORE.address);
    
//     case 'depositAndListForResale':
//     case 'purchaseNFT':
//     case 'cancelListing':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_MARKETPLACE.address);
//     case 'depositAndListForResale':
//     case 'purchaseNFT':
//     case 'cancelListing':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_MARKETPLACE.address);
    
//     case 'createDirectListing':
//     case 'createCampaign':
//     case 'purchaseFromListing':
//     case 'mint':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_SALES.address);
//     case 'createDirectListing':
//     case 'createCampaign':
//     case 'purchaseFromListing':
//     case 'mint':
//       return ContractId.fromString(HEDERA_CONTRACTS.COMIC_SALES.address);
    
//     default:
//       throw new Error(`Unknown function: ${functionName}`);
//   }
// }
//     default:
//       throw new Error(`Unknown function: ${functionName}`);
//   }
// }
