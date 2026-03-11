// 'use client';

// import { WalletType, useWalletDetector } from './useWalletDetector';

// export interface TransactionConfig {
//   name: string;
//   description?: string;
//   onSign?: () => void;
//   onConfirm?: (hash: string) => void;
//   onError?: (error: Error) => void;
//   timeout?: number;
// }

// export interface WalletAwareTransactionResult {
//   hash?: string;
//   success: boolean;
//   error?: Error;
//   walletType: WalletType;
// }

// /**
//  * Hook for executing wallet-aware transactions
//  * Provides a unified interface for both EVM and Hedera transactions
//  *
//  * Usage:
//  * ```tsx
//  * const txExecutor = useWalletAwareTransaction();
//  *
//  * const result = await txExecutor.execute(async (walletType) => {
//  *   if (walletType === WalletType.ETHEREUM) {
//  *     // Use wagmi hooks here
//  *     return evmTransactionHash;
//  *   } else if (walletType === WalletType.HEDERA) {
//  *     // Use Hedera SDK here
//  *     return hederaTransactionId;
//  *   }
//  * }, {
//  *   name: 'Buy Comic',
//  *   description: 'Purchase a comic from the marketplace',
//  *   onConfirm: (hash) => console.log('Transaction confirmed:', hash)
//  * });
//  * ```
//  */
// export function useWalletAwareTransaction() {
//   const wallet = useWalletDetector();

//   /**
//    * Execute a transaction with wallet-aware routing
//    */
//   const execute = async <T,>(
//     executor: (walletType: WalletType) => Promise<T>,
//     config: TransactionConfig
//   ): Promise<WalletAwareTransactionResult> => {
//     if (!wallet.isConnected) {
//       const error = new Error('No wallet connected');
//       config.onError?.(error);
//       return {
//         success: false,
//         error,
//         walletType: WalletType.NONE,
//       };
//     }

//     try {
//       config.onSign?.();
//       console.log(`🔄 [${config.name}] Executing on ${wallet.type} wallet...`);

//       const result = await Promise.race([
//         executor(wallet.type),
//         new Promise<never>((_, reject) =>
//           setTimeout(
//             () => reject(new Error('Transaction timeout')),
//             config.timeout || 120000
//           )
//         ),
//       ]);

//       const hash = String(result);
//       config.onConfirm?.(hash);
//       console.log(`✅ [${config.name}] Success:`, hash);

//       return {
//         hash,
//         success: true,
//         walletType: wallet.type,
//       };
//     } catch (err) {
//       const error = err instanceof Error ? err : new Error('Transaction failed');
//       config.onError?.(error);
//       console.error(`❌ [${config.name}] Error:`, error.message);

//       return {
//         success: false,
//         error,
//         walletType: wallet.type,
//       };
//     }
//   };

//   /**
//    * Check wallet type before transaction
//    */
//   const requireWalletType = (requiredType: WalletType): boolean => {
//     if (wallet.type !== requiredType) {
//       console.warn(
//         `⚠️ Wrong wallet connected. Expected ${requiredType}, got ${wallet.type}`
//       );
//       return false;
//     }
//     return true;
//   };

//   /**
//    * Execute only for Ethereum wallet
//    */
//   const executeOnEthereum = async <T,>(
//     executor: () => Promise<T>,
//     config?: TransactionConfig
//   ): Promise<WalletAwareTransactionResult> => {
//     return execute(
//       async (walletType) => {
//         if (walletType !== WalletType.ETHEREUM) {
//           throw new Error('This operation requires Ethereum wallet');
//         }
//         return executor();
//       },
//       config || { name: 'Ethereum Transaction' }
//     );
//   };

//   /**
//    * Execute only for Hedera wallet
//    */
//   const executeOnHedera = async <T,>(
//     executor: () => Promise<T>,
//     config?: TransactionConfig
//   ): Promise<WalletAwareTransactionResult> => {
//     return execute(
//       async (walletType) => {
//         if (walletType !== WalletType.HEDERA) {
//           throw new Error('This operation requires Hedera wallet');
//         }
//         return executor();
//       },
//       config || { name: 'Hedera Transaction' }
//     );
//   };

//   /**
//    * Execute on either wallet type
//    */
//   const executeOnAny = async <T,>(
//     ethereumExecutor: () => Promise<T>,
//     hederaExecutor: () => Promise<T>,
//     config?: TransactionConfig
//   ): Promise<WalletAwareTransactionResult> => {
//     return execute(
//       async (walletType) => {
//         if (walletType === WalletType.ETHEREUM) {
//           return ethereumExecutor();
//         } else if (walletType === WalletType.HEDERA) {
//           return hederaExecutor();
//         }
//         throw new Error('No supported wallet connected');
//       },
//       config || { name: 'Universal Transaction' }
//     );
//   };

//   return {
//     wallet,
//     isConnected: wallet.isConnected,
//     walletType: wallet.type,
//     execute,
//     requireWalletType,
//     executeOnEthereum,
//     executeOnHedera,
//     executeOnAny,
//   };
// }

// /**
//  * Utility to show user which wallet to connect
//  */
// export function getWalletMessage(currentWallet: WalletType): string {
//   const messages = {
//     [WalletType.ETHEREUM]: 'Using Ethereum wallet (RainbowKit)',
//     [WalletType.HEDERA]: 'Using Hedera wallet (HashPack)',
//     [WalletType.NONE]: 'Please connect a wallet to continue',
//   };
//   return messages[currentWallet];
// }

// /**
//  * Convert Hedera address formats
//  */
// export function normalizeHederaAddress(address: string): string {
//   // If already EVM format
//   if (address.startsWith('0x')) {
//     return address;
//   }
//   // If Hedera account format (0.0.12345), would need conversion
//   // This is a placeholder - implement based on your needs
//   return address;
// }

// /**
//  * Check if address is valid for transaction
//  */
// export function isValidAddress(address: string, walletType: WalletType): boolean {
//   if (!address) return false;
  
//   if (walletType === WalletType.ETHEREUM) {
//     return /^0x[a-fA-F0-9]{40}$/.test(address);
//   } else if (walletType === WalletType.HEDERA) {
//     // Hedera address format: 0.0.12345 or 0x... (EVM)
//     return /^0\.\d+\.\d+$/.test(address) || /^0x[a-fA-F0-9]{40}$/.test(address);
//   }
  
//   return false;
// }
