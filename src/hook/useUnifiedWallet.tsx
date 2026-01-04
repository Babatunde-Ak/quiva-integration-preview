// import { useCallback, useMemo, useState } from 'react';
// import { 
//   useAccount as useWagmiAccount, 
//   useWriteContract as useWagmiWriteContract, 
//   useWaitForTransactionReceipt as useWagmiWaitForTransactionReceipt, 
//   useChainId as useWagmiChainId, 
//   usePublicClient as useWagmiPublicClient,
//   useReadContract as useWagmiReadContract,
//   useBalance as useWagmiBalance,
// } from 'wagmi';
// // import {    
// //   useWallet, 
// //   useEvmAddress, 
// //   useReadContract as useHashpackReadContract,
// //   useChain as useHashpackChain,
// //   useWriteContract as useHashpackWriteContract,
// //   useAuthSignature,
// //   useBalance as useHashpackBalance,
// //   useAccountInfo,
// //   UserRefusedToSignAuthError 
// // } from '@buidlerlabs/hashgraph-react-wallets';
// import { ContractId } from "@hashgraph/sdk";

// // Helper function to handle ContractId conversions
// const normalizeContractAddress = (address: any) => {
//   if (typeof address === 'string') {
//     if (address.startsWith('0x')) {
//       return address; // Already EVM address
//     } else if (address.includes('.')) {
//       // Hedera format like "0.0.123456"
//       return `0x${ContractId.fromString(address).toSolidityAddress()}`;
//     }
//   }
//   if (address?.toSolidityAddress) {
//     // ContractId object
//     return `0x${address.toSolidityAddress()}`;
//   }
//   return address;
// };

// const normalizeContractId = (address: any) => {
//   if (typeof address === 'string') {
//     if (address.startsWith('0x')) {
//       // Convert EVM address back to ContractId if needed
//       // This is more complex and might need specific logic
//       return address;
//     } else if (address.includes('.')) {
//       return ContractId.fromString(address);
//     }
//   }
//   return address;
// };

// // Types
// type WalletType = 'wagmi' | 'hashpack' | 'auto';

// interface UnifiedAccount {
//   address?: `0x${string}` | string;
//   isConnected: boolean;
//   isConnecting: boolean;
//   isDisconnected: boolean;
//   connector?: any;
//   chain?: any;
// }

// interface UnifiedWriteContract {
//   writeContract: (args: any) => Promise<any>;
//   writeContractAsync: (args: any) => Promise<any>;
//   data?: `0x${string}`;
//   error?: Error | null;
//   isPending: boolean;
//   isSuccess: boolean;
// }

// interface UnifiedReadContract {
//   data?: any;
//   error?: Error | null;
//   isLoading: boolean;
//   isSuccess: boolean;
//   refetch: () => void;
// }

// interface UnifiedBalance {
//   data?: {
//     value: bigint;
//     decimals: number;
//     formatted: string;
//     symbol: string;
//   };
//   error?: Error | null;
//   isLoading: boolean;
//   refetch: () => void;
// }

// interface UnifiedTransactionReceipt {
//   data?: any;
//   error?: Error | null;
//   isLoading: boolean;
//   isSuccess: boolean;
// }

// interface UseUnifiedWalletConfig {
//   walletType?: WalletType;
//   preferredWallet?: 'wagmi' | 'hashpack';
// }

// /**
//  * Core unified wallet hook that provides a consistent interface
//  * for both Wagmi and HashPack wallets
//  */
// export const useUnifiedWallet = (config: UseUnifiedWalletConfig = {}) => {
//   const { walletType = 'auto', preferredWallet = 'wagmi' } = config;

//   // Wagmi hooks
//   const wagmiAccount = useWagmiAccount();
//   const wagmiChainId = useWagmiChainId();
//   const wagmiPublicClient = useWagmiPublicClient();

//   // HashPack hooks
// //   const hashpackWallet = useWallet();
// //   const hashpackEvmAddress = useEvmAddress();
// //   const hashpackChain = useHashpackChain();
// //   const hashpackAccountInfo = useAccountInfo();

//   // Determine which wallet system to use
//   const activeWalletType = useMemo(() => {
//     if (walletType !== 'auto') return walletType;
    
//     // Auto-detection logic
//     if (wagmiAccount.isConnected && hashpackWallet.isConnected) {
//       return preferredWallet;
//     }
//     if (wagmiAccount.isConnected) return 'wagmi';
//     if (hashpackWallet.isConnected) return 'hashpack';
    
//     return preferredWallet; // fallback to preferred
//   }, [
//     walletType, 
//     wagmiAccount.isConnected, 
//     hashpackWallet.isConnected, 
//     preferredWallet
//   ]);

//   // Unified account interface
//   const account: UnifiedAccount = useMemo(() => {
//     if (activeWalletType === 'wagmi') {
//       return {
//         address: wagmiAccount.address,
//         isConnected: wagmiAccount.isConnected,
//         isConnecting: wagmiAccount.isConnecting,
//         isDisconnected: wagmiAccount.isDisconnected,
//         connector: wagmiAccount.connector,
//         chain: wagmiAccount.chain,
//       };
//     } else {
//       return {
//         address: hashpackEvmAddress || hashpackAccountInfo?.accountId,
//         isConnected: hashpackWallet.isConnected,
//         isConnecting: false, // HashPack doesn't have isConnecting
//         isDisconnected: !hashpackWallet.isConnected,
//         connector: hashpackWallet,
//         chain: hashpackChain,
//       };
//     }
//   }, [
//     activeWalletType,
//     wagmiAccount,
//     hashpackWallet,
//     hashpackEvmAddress,
//     hashpackAccountInfo,
//     hashpackChain
//   ]);

//   // Unified chain ID
//   const chainId = useMemo(() => {
//     return activeWalletType === 'wagmi' ? wagmiChainId : hashpackChain?.id;
//   }, [activeWalletType, wagmiChainId, hashpackChain]);

//   // Unified public client
//   const publicClient = useMemo(() => {
//     return activeWalletType === 'wagmi' ? wagmiPublicClient : null;
//   }, [activeWalletType, wagmiPublicClient]);

//   return {
//     // Core wallet info
//     account,
//     chainId,
//     publicClient,
//     activeWalletType,
    
//     // Legacy compatibility (for easy migration)
//     address: account.address,
//     isConnected: account.isConnected,
//     isConnecting: account.isConnecting,
//     isDisconnected: account.isDisconnected,
    
//     // Wallet-specific data (for advanced usage)
//     wagmi: {
//       account: wagmiAccount,
//       chainId: wagmiChainId,
//       publicClient: wagmiPublicClient,
//     },
//     hashpack: {
//       wallet: hashpackWallet,
//       evmAddress: hashpackEvmAddress,
//       chain: hashpackChain,
//       accountInfo: hashpackAccountInfo,
//     },
//   };
// };

// /**
//  * Unified write contract hook that works with both wallet types
//  */
// export const useUnifiedWriteContract = (config: UseUnifiedWalletConfig = {}) => {
//   const { activeWalletType } = useUnifiedWallet(config);
  
//   const wagmiWrite = useWagmiWriteContract();
//   const { writeContract: hashpackWriteFunction } = useHashpackWriteContract();

//   // State for HashPack operations (since it doesn't provide state)
//   const [hashpackState, setHashpackState] = useState({
//     isLoading: false,
//     error: null as Error | null,
//     data: null as any,
//   });

//   const writeContract = useCallback(async (args: any) => {
//     if (activeWalletType === 'wagmi') {
//       return wagmiWrite.writeContract(args);
//     } else {
//       setHashpackState({ isLoading: true, error: null, data: null });
//       try {
//         // HashPack pattern: expects contractId, not address
//         const hashpackArgs = {
//           contractId: args.contractId || normalizeContractId(args.address),
//           abi: args.abi,
//           functionName: args.functionName,
//           args: args.args || [],
//           metaArgs: args.metaArgs || { gas: 300_000 }, // Default gas if not provided
//         };
//         const result = await hashpackWriteFunction(hashpackArgs);
//         setHashpackState({ isLoading: false, error: null, data: result });
//         return result;
//       } catch (error) {
//         setHashpackState({ isLoading: false, error: error as Error, data: null });
//         throw error;
//       }
//     }
//   }, [activeWalletType, wagmiWrite, hashpackWriteFunction]);

//   const writeContractAsync = useCallback(async (args: any) => {
//     if (activeWalletType === 'wagmi') {
//       return wagmiWrite.writeContractAsync(args);
//     } else {
//       // Same logic as writeContract for HashPack
//       return writeContract(args);
//     }
//   }, [activeWalletType, wagmiWrite, writeContract]);

//   return {
//     writeContract,
//     writeContractAsync,
//     data: activeWalletType === 'wagmi' ? wagmiWrite.data : hashpackState.data,
//     error: activeWalletType === 'wagmi' ? wagmiWrite.error : hashpackState.error,
//     isPending: activeWalletType === 'wagmi' ? wagmiWrite.isPending : hashpackState.isLoading,
//     isSuccess: activeWalletType === 'wagmi' ? wagmiWrite.isSuccess : (hashpackState.data !== null && !hashpackState.error),
    
//     // Legacy compatibility
//     isLoading: activeWalletType === 'wagmi' ? wagmiWrite.isPending : hashpackState.isLoading,
//   };
// };

// /**
//  * Unified read contract hook
//  */
// export const useUnifiedReadContract = (args: any, config: UseUnifiedWalletConfig = {}) => {
//   const { activeWalletType } = useUnifiedWallet(config);
  
//   // Wagmi uses traditional hook pattern
//   const wagmiRead = useWagmiReadContract(args);
  
//   // HashPack uses function-based pattern
//   const { readContract: hashpackReadFunction } = useHashpackReadContract();

//   // State for HashPack operations (since it doesn't provide state)
//   const [hashpackState, setHashpackState] = useState({
//     data: null as any,
//     error: null as Error | null,
//     isLoading: false,
//   });

//   const readContract = useCallback(async (contractArgs: any) => {
//     if (activeWalletType === 'wagmi') {
//       // For Wagmi, we need to refetch with new args or return current data
//       if (wagmiRead.data !== undefined) {
//         return wagmiRead.data;
//       }
//       const result = await wagmiRead.refetch();
//       return result.data;
//     } else {
//       // HashPack pattern: direct function call with proper parameters
//       setHashpackState(prev => ({ ...prev, isLoading: true, error: null }));
//       try {
//         const result = await hashpackReadFunction({
//           address: normalizeContractAddress(contractArgs.address || contractArgs.contractId),
//           abi: contractArgs.abi,
//           functionName: contractArgs.functionName,
//           args: contractArgs.args || [],
//           authorizationList: contractArgs.authorizationList || [], // Required by HashPack
//         });
//         setHashpackState({ data: result, error: null, isLoading: false });
//         return result;
//       } catch (error) {
//         setHashpackState({ data: null, error: error as Error, isLoading: false });
//         throw error;
//       }
//     }
//   }, [activeWalletType, wagmiRead, hashpackReadFunction]);

//   const refetch = useCallback(async () => {
//     if (activeWalletType === 'wagmi') {
//       return wagmiRead.refetch();
//     } else {
//       // For HashPack, we'd need the original args to refetch
//       // This is a limitation of the function-based approach
//       throw new Error('Refetch not supported for HashPack without original arguments');
//     }
//   }, [activeWalletType, wagmiRead]);

//   return useMemo(() => {
//     if (activeWalletType === 'wagmi') {
//       return {
//         data: wagmiRead.data,
//         error: wagmiRead.error,
//         isLoading: wagmiRead.isLoading,
//         isSuccess: wagmiRead.isSuccess,
//         refetch: wagmiRead.refetch,
//         readContract, // Function for manual calls
//       };
//     } else {
//       return {
//         data: hashpackState.data,
//         error: hashpackState.error,
//         isLoading: hashpackState.isLoading,
//         isSuccess: hashpackState.data !== null && !hashpackState.error,
//         refetch,
//         readContract, // Main function for HashPack
//       };
//     }
//   }, [activeWalletType, wagmiRead, hashpackState, readContract, refetch]);
// };

// /**
//  * Unified balance hook
//  */
// export const useUnifiedBalance = (args: any = {}, config: UseUnifiedWalletConfig = {}) => {
//   const { activeWalletType, account } = useUnifiedWallet(config);
  
//   const wagmiBalance = useWagmiBalance({
//     address: account.address as `0x${string}`,
//     ...args
//   });
//   const hashpackBalance = useHashpackBalance(args);

//   return useMemo(() => {
//     if (activeWalletType === 'wagmi') {
//       return {
//         data: wagmiBalance.data ? {
//           value: wagmiBalance.data.value,
//           decimals: wagmiBalance.data.decimals,
//           formatted: wagmiBalance.data.formatted,
//           symbol: wagmiBalance.data.symbol,
//         } : undefined,
//         error: wagmiBalance.error,
//         isLoading: wagmiBalance.isLoading,
//         refetch: wagmiBalance.refetch,
//       };
//     } else {
//       return {
//         data: hashpackBalance.data ? {
//           value: BigInt(hashpackBalance.data.toString()),
//           decimals: 8, // HBAR decimals
//           formatted: hashpackBalance.data.toString(),
//           symbol: 'HBAR',
//         } : undefined,
//         error: hashpackBalance.error,
//         isLoading: hashpackBalance.isLoading,
//         refetch: hashpackBalance.refetch,
//       };
//     }
//   }, [activeWalletType, wagmiBalance, hashpackBalance]);
// };

// /**
//  * Unified transaction receipt waiting hook
//  */
// export const useUnifiedWaitForTransactionReceipt = (args: any = {}, config: UseUnifiedWalletConfig = {}) => {
//   const { activeWalletType } = useUnifiedWallet(config);
  
//   const wagmiReceipt = useWagmiWaitForTransactionReceipt(args);
  
//   // For HashPack, you might need custom transaction monitoring logic
//   // This is a placeholder - implement based on HashPack's transaction system
//   const hashpackReceipt = useMemo(() => ({
//     data: null,
//     error: null,
//     isLoading: false,
//     isSuccess: false,
//   }), []);

//   return useMemo(() => {
//     if (activeWalletType === 'wagmi') {
//       return {
//         data: wagmiReceipt.data,
//         error: wagmiReceipt.error,
//         isLoading: wagmiReceipt.isLoading,
//         isSuccess: wagmiReceipt.isSuccess,
        
//         // Legacy compatibility
//         isConfirming: wagmiReceipt.isLoading,
//       };
//     } else {
//       return {
//         ...hashpackReceipt,
//         isConfirming: hashpackReceipt.isLoading,
//       };
//     }
//   }, [activeWalletType, wagmiReceipt, hashpackReceipt]);
// };

// /**
//  * Unified chain ID hook
//  */
// export const useUnifiedChainId = (config: UseUnifiedWalletConfig = {}) => {
//   const { chainId } = useUnifiedWallet(config);
//   return chainId;
// };

// /**
//  * Unified public client hook
//  */
// export const useUnifiedPublicClient = (config: UseUnifiedWalletConfig = {}) => {
//   const { publicClient } = useUnifiedWallet(config);
//   return publicClient;
// };

// /**
//  * Auth signature hook (primarily for HashPack)
//  */
// export const useUnifiedAuthSignature = (config: UseUnifiedWalletConfig = {}) => {
//   const { activeWalletType } = useUnifiedWallet(config);
//   const { signAuth } = useAuthSignature();
//   const [authState, setAuthState] = useState({
//     isLoading: false,
//     error: null as Error | null,
//   });

//   const signMessage = useCallback(async (message: string) => {
//     if (activeWalletType === 'hashpack') {
//       setAuthState({ isLoading: true, error: null });
//       try {
//         const result = await signAuth(message);
//         setAuthState({ isLoading: false, error: null });
//         return result;
//       } catch (error) {
//         if (error instanceof UserRefusedToSignAuthError) {
//           const refusedError = new Error('User refused to sign message');
//           setAuthState({ isLoading: false, error: refusedError });
//           throw refusedError;
//         }
//         setAuthState({ isLoading: false, error: error as Error });
//         throw error;
//       }
//     } else {
//       throw new Error('Message signing not implemented for Wagmi in this hook');
//     }
//   }, [activeWalletType, signAuth]);

//   return {
//     signMessage,
//     isLoading: authState.isLoading,
//     error: authState.error,
//   };
// };

// /**
//  * Drop-in replacement hooks for easy migration
//  */

// // Drop-in replacement for useAccount
// export const useAccount = (config: UseUnifiedWalletConfig = {}) => {
//   const { account, activeWalletType } = useUnifiedWallet(config);
//   return {
//     ...account,
//     // Add any additional properties you might need for compatibility
//   };
// };

// // Drop-in replacement for useWriteContract  
// export const useWriteContract = (config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedWriteContract(config);
// };

// // Drop-in replacement for useWaitForTransactionReceipt
// export const useWaitForTransactionReceipt = (args: any, config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedWaitForTransactionReceipt(args, config);
// };

// // Drop-in replacement for useChainId
// export const useChainId = (config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedChainId(config);
// };

// // Drop-in replacement for usePublicClient
// export const usePublicClient = (config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedPublicClient(config);
// };

// // Drop-in replacement for useReadContract
// export const useReadContract = (args: any, config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedReadContract(args, config);
// };

// // Drop-in replacement for useBalance
// export const useBalance = (args: any = {}, config: UseUnifiedWalletConfig = {}) => {
//   return useUnifiedBalance(args, config);
// };

// /**
//  * Utility hook for manually switching wallet types
//  */
// export const useWalletSwitcher = () => {
//   const switchToWagmi = useCallback(() => {
//     // Implement wallet switching logic here
//     console.log('Switching to Wagmi wallet...');
//     // You might want to store preference in localStorage or context
//   }, []);

//   const switchToHashPack = useCallback(() => {
//     // Implement wallet switching logic here  
//     console.log('Switching to HashPack wallet...');
//     // You might want to store preference in localStorage or context
//   }, []);

//   return {
//     switchToWagmi,
//     switchToHashPack,
//   };
// };