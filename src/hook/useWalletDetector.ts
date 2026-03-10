// 'use client';

// import { useAccount } from 'wagmi';
// import { useHederaWallet } from '@/providers/HashPackProvider';
// import { useMemo } from 'react';

// export enum WalletType {
//   ETHEREUM = 'ethereum',
//   HEDERA = 'hedera',
//   NONE = 'none'
// }

// export interface WalletInfo {
//   type: WalletType;
//   address: string | null;
//   isConnected: boolean;
//   connector?: string;
//   chainId?: number;
//   isLoading?: boolean;
// }

// /**
//  * Hook to detect which wallet is currently connected
//  * Supports both EVM (RainbowKit) and Hedera (HashPack) wallets
//  *
//  * Usage:
//  * ```tsx
//  * const wallet = useWalletDetector();
//  * if (wallet.type === WalletType.ETHEREUM) {
//  *   // Use EVM wagmi hooks
//  * } else if (wallet.type === WalletType.HEDERA) {
//  *   // Use Hedera-specific hooks
//  * }
//  * ```
//  */
// export function useWalletDetector(): WalletInfo {
//   // Get Ethereum wallet info from wagmi
//   const { address: ethAddress, isConnected: isEthConnected, connector: ethConnector, chainId } = useAccount();

//   // Get Hedera wallet info from HashPackProvider
//   const { isConnected: isHederaConnected, account: hederaAccount } = useHederaWallet();

//   // Determine which wallet is connected
//   const walletInfo: WalletInfo = useMemo(() => {
//     // Ethereum wallet takes precedence if both are connected
//     if (isEthConnected && ethAddress) {
//       return {
//         type: WalletType.ETHEREUM,
//         address: ethAddress,
//         isConnected: true,
//         connector: ethConnector?.name,
//         chainId: chainId
//       };
//     }

//     if (isHederaConnected && hederaAccount) {
//       return {
//         type: WalletType.HEDERA,
//         address: hederaAccount,
//         isConnected: true,
//         connector: 'HashPack'
//       };
//     }

//     return {
//       type: WalletType.NONE,
//       address: null,
//       isConnected: false
//     };
//   }, [isEthConnected, ethAddress, ethConnector, chainId, isHederaConnected, hederaAccount]);

//   return walletInfo;
// }

// /**
//  * Higher-order hook that wraps operations to use the correct wallet
//  * Returns wallet-specific operation functions
//  */
// export function useWalletAware() {
//   const wallet = useWalletDetector();

//   return {
//     wallet,
//     isEthereum: wallet.type === WalletType.ETHEREUM,
//     isHedera: wallet.type === WalletType.HEDERA,
//     isConnected: wallet.isConnected,
    
//     /**
//      * Execute function based on wallet type
//      * Usage: executeWithWallet(evmFn, hederaFn, walletFn)
//      */
//     executeWithWallet: <T,>(
//       evmFn: () => T | Promise<T>,
//       hederaFn: () => T | Promise<T>,
//       noneCallback?: () => T | Promise<T>
//     ): T | Promise<T> | null => {
//       switch (wallet.type) {
//         case WalletType.ETHEREUM:
//           return evmFn();
//         case WalletType.HEDERA:
//           return hederaFn();
//         default:
//           return noneCallback ? noneCallback() : null;
//       }
//     },

//     /**
//      * Check if specific wallet type is connected
//      */
//     isWalletType: (type: WalletType): boolean => wallet.type === type,

//     /**
//      * Get appropriate contract address based on wallet type
//      */
//     getContractAddress: (evmAddress: string, hederaAddress: string): string => {
//       return wallet.type === WalletType.ETHEREUM ? evmAddress : hederaAddress;
//     }
//   };
// }
