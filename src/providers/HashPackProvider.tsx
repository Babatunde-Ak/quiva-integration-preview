
// // 'use client';

// // import React, { createContext, useContext, useState, useEffect } from 'react';
// // import {
// //   DAppConnector,
// //   HederaSessionEvent,
// //   HederaJsonRpcMethod,
// //   HederaChainId,
  
// // } from '@hashgraph/hedera-wallet-connect';
// // import { LedgerId, AccountId } from '@hashgraph/sdk';
// // // import {AccountId}
// // // import { Account } from "@hashgraphonline/hashinal-wc";


// // const WalletContext = createContext<any>(null);

// // export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [connector, setConnector] = useState<DAppConnector | null>(null);
// //   const [account, setAccount] = useState<string | null>(null);
// //   const [isConnected, setIsConnected] = useState(false);

// //   const projectId ='ec1bf58ee8034b1747cb72a34b6652ae';
// //   const metadata = {
// //     name: 'Quiva Hedera DApp',
// //     description: 'Hedera DApp using WalletConnect v2',
// //     url: 'https://quiva.app',
// //     icons: ['https://yourapp.io/icon.png'],
// //   };

// //   // Initialize the Hedera connector
// //   useEffect(() => {
// //     const initConnector = async () => {
// //       const dAppConnector = new DAppConnector(
// //         metadata,
// //         LedgerId.TESTNET,
// //         projectId,
// //         Object.values(HederaJsonRpcMethod),
// //         [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
// //         [HederaChainId.Testnet, HederaChainId.Mainnet],
// //       );
// //       await dAppConnector.init({ logger: 'error' });
// //       setConnector(dAppConnector);

// //       // Restore existing sessions after init
// //       const signers = dAppConnector.signers;
// //       console.log('Initial signers after init:', signers);
// //       if (signers && signers.length > 0) {
// //         const accountId = signers[0].getAccountId().toString();
// //         console.log('Restored session, account:', accountId);
// //         setAccount(accountId);
// //         setIsConnected(true);
// //       }

// //       // Subscribe to session events via WalletConnect client
// //       if (dAppConnector.walletConnectClient) {
// //         dAppConnector.walletConnectClient.on('session_update', () => {
// //           const updatedSigners = dAppConnector.signers;
// //           if (updatedSigners && updatedSigners.length > 0) {
// //             const accountId = updatedSigners[0].getAccountId().toString();
// //             console.log('Session updated, new account:', accountId);
// //             setAccount(accountId);
// //             setIsConnected(true);
// //           } else {
// //             setAccount(null);
// //             setIsConnected(false);
// //           }
// //         });

// //         dAppConnector.walletConnectClient.on('session_delete', () => {
// //           console.log('Session deleted');
// //           setAccount(null);
// //           setIsConnected(false);
// //         });
// //       }
// //     };

// //     initConnector();
// //   }, []);

// //   const connectWallet = async () => {
// //     if (!connector) return;
// //     const session = await connector.openModal();
// //     console.log('Connected session:', session);
// //     const signers = connector.signers;
// //     if (signers && signers.length > 0) {
// //       const accountId = signers[0].getAccountId().toString();
// //       setAccount(accountId);
// //       setIsConnected(true);
// //     }
// //   };

// //   const disconnectWallet = async () => {
// //     if (!connector) return;
// //     const sessions = connector.walletConnectClient?.session.getAll();
// //     if (sessions && sessions.length > 0) {
// //       await connector.disconnect(sessions[0].topic);
// //     }
// //     setAccount(null);
// //     setIsConnected(false);
// //   };

// //   const signMessage = async (message: string): Promise<`0x${string}`> => {
// //     if (!connector || !account) throw new Error('Wallet not connected');

// //     const accountId = AccountId.fromString(account);
// //     const evmAddr = `0x${accountId.toEvmAddress()}`;

// //     const sessions = connector.walletConnectClient?.session.getAll();
// //     if (!sessions || sessions.length === 0) throw new Error('No active WalletConnect session');

// //     const signature = await connector.walletConnectClient?.request<`0x${string}`>({
// //       topic: sessions[0].topic,
// //       chainId: 'eip155:296', // Hedera Testnet EVM chain ID
// //       request: {
// //         method: 'personal_sign',
// //         params: [
// //           `0x${Buffer.from(message, 'utf-8').toString('hex')}`,
// //           evmAddr,
// //         ],
// //       },
// //     });

// //     if (!signature) throw new Error('No signature returned from wallet');
// //     return signature;
// //   };

// //   const evmAddress = account
// //     ? (() => {
// //         try {
// //           return `0x${AccountId.fromString(account).toEvmAddress()}` as `0x${string}`;
// //         } catch {
// //           return null;
// //         }
// //       })()
// //     : null;

// //   return (
// //     <WalletContext.Provider
// //       value={{
// //         connector,
// //         account,
// //         evmAddress,
// //         isConnected,
// //         connectWallet,
// //         disconnectWallet,
// //         signMessage,
// //         signer: account ? connector?.getSigner(AccountId.fromString(account)) : null,
// //       }}
// //     >
// //       {children}
// //     </WalletContext.Provider>
// //   );
// // };

// // export const HashPackProvider = HederaWalletProvider;

// // export const useHederaWallet = () => useContext(WalletContext);

// // // 'use client';

// // // import React, { createContext, useContext, useEffect, useState } from 'react';
// // // import {
// // //   DAppConnector,
// // //   HederaJsonRpcMethod,
// // //   HederaSessionEvent,
// // //   HederaChainId,
// // // } from '@hashgraph/hedera-wallet-connect';
// // // import { LedgerId } from '@hashgraph/sdk';
// // // import { ethers } from 'ethers';

// // // type WalletContextType = {
// // //   connectWallet: () => Promise<void>;
// // //   disconnectWallet: () => Promise<void>;
// // //   isConnected: boolean;
// // //   account: string | null;
// // //   evmAddress: string | null;
// // //   provider: ethers.JsonRpcProvider | null;
// // //   signer: DAppConnector | null;
// // // };

// // // const WalletContext = createContext<WalletContextType | null>(null);

// // // export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
// // //   const [connector, setConnector] = useState<DAppConnector | null>(null);
// // //   const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
// // //   const [account, setAccount] = useState<string | null>(null);
// // //   const [evmAddress, setEvmAddress] = useState<string | null>(null);
// // //   const [isConnected, setIsConnected] = useState(false);

// // //   const projectId = 'ec1bf58ee8034b1747cb72a34b6652ae';

// // //   useEffect(() => {
// // //     const init = async () => {
// // //       const dapp = new DAppConnector(
// // //         {
// // //           name: 'Quiva Hedera DApp',
// // //           description: 'NFT Marketplace',
// // //           url: window.location.origin,
// // //           icons: ['https://yourapp.io/icon.png'],
// // //         },
// // //         LedgerId.TESTNET,
// // //         projectId,
// // //         Object.values(HederaJsonRpcMethod),
// // //         [HederaSessionEvent.AccountsChanged, HederaSessionEvent.ChainChanged],
// // //         [HederaChainId.Testnet],
// // //       );

// // //       await dapp.init({ logger: 'error' });
// // //       setConnector(dapp);
// // //     };

// // //     init();
// // //   }, []);

// // //   const connectWallet = async () => {
// // //     if (!connector) return;

// // //     await connector.openModal();

// // //     // Get signers after connection
// // //     const signers = connector.signers;

// // //     if (!signers || signers.length === 0) {
// // //       throw new Error('No signers available after connection');
// // //     }

// // //     // Get the Hedera account ID from the signer
// // //     const hederaSigner = signers[0];
// // //     const accountId = hederaSigner.getAccountId().toString();

// // //     // Get the EVM address for contract interactions
// // //     // You can derive this from the account or get it from the signer
// // //     const ledgerId = hederaSigner.getLedgerId();
    
// // //     // Create a JSON-RPC provider for read operations
// // //     const jsonRpcProvider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

// // //     setProvider(jsonRpcProvider);
// // //     setAccount(accountId);
// // //     setIsConnected(true);
    
// // //     // Note: For signing transactions with your HTS contract,
// // //     // use connector.signers[0] to sign via WalletConnect
// // //   };

// // //   const disconnectWallet = async () => {
// // //     if (!connector) return;

// // //     const sessions = connector.walletConnectClient?.session.getAll();
// // //     if (sessions?.length) {
// // //       await connector.disconnect(sessions[0].topic);
// // //     }

// // //     setProvider(null);
// // //     setAccount(null);
// // //     setEvmAddress(null);
// // //     setIsConnected(false);
// // //   };

// // //   return (
// // //     <WalletContext.Provider
// // //       value={{
// // //         connectWallet,
// // //         disconnectWallet,
// // //         isConnected,
// // //         account,
// // //         evmAddress,
// // //         provider,
// // //         signer: connector,
// // //       }}
// // //     >
// // //       {children}
// // //     </WalletContext.Provider>
// // //   );
// // // };

// // // export const useHederaWallet = () => {
// // //   const ctx = useContext(WalletContext);
// // //   if (!ctx) throw new Error('useHederaWallet must be used within provider');
// // //   return ctx;
// // // };


// 'use client';

// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import type {
//   DAppConnector,
//   HederaSessionEvent,
//   HederaJsonRpcMethod,
//   HederaChainId,
// } from '@hashgraph/hedera-wallet-connect';
// import { AccountId } from '@hiero-ledger/sdk';

// // import { Account } from "@hashgraphonline/hashinal-wc";

// const WalletContext = createContext<any>(null);

// export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
//   const [connector, setConnector] = useState<any>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const sdkRef = useRef<{ LedgerId?: any; AccountId?: any }>({});

//   const projectId ='ec1bf58ee8034b1747cb72a34b6652ae';
//   const metadata = {
//     name: 'Quiva Hedera DApp',
//     description: 'Hedera DApp using WalletConnect v2',
//     url: 'localhost:3000/marketplace',
//     icons: ['https://yourapp.io/icon.png'],
//   };

//   // Initialize the Hedera connector
//   useEffect(() => {
//     let mounted = true;
//     let clientConnector: any = null;

//     const initConnector = async () => {
//       const [{ DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId }, sdk] = await Promise.all([
//         import('@hashgraph/hedera-wallet-connect'),
//         import('@hiero-ledger/sdk'),
//       ]);

//       // Store runtime SDK bindings (LedgerId, AccountId) for later use
//       sdkRef.current = { LedgerId: sdk.LedgerId, AccountId: sdk.AccountId };

//       clientConnector = new DAppConnector(
//         metadata,
//         sdkRef.current.LedgerId.TESTNET,
//         projectId,
//         Object.values(HederaJsonRpcMethod),
//         [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
//         [HederaChainId.Testnet, HederaChainId.Mainnet],
//       );
//       await clientConnector.init({ logger: 'error' });
//       if (!mounted) return;
//       setConnector(clientConnector);

//       const signers = clientConnector.signers;
//       console.log('Initial signers:', signers);
//       clientConnector.walletConnectClient?.on('session_update', () => {
//         const updatedSigners = clientConnector.signers;
//         if (updatedSigners && updatedSigners.length > 0) {
//           setAccount(updatedSigners[0].getAccountId().toString());
//           setIsConnected(true);
//         } else {
//           setAccount(null);
//           setIsConnected(false);
//         }
//       });
//     };

//     initConnector();
//     return () => {
//       mounted = false;
//       if (clientConnector?.walletConnectClient?.off) {
//         clientConnector.walletConnectClient.off('session_update');
//       }
//     };
//   }, []);

//   const connectWallet = async () => {
//     if (!connector) return;
//     const session = await connector.openModal();
//     console.log('Connected session:', session);
//     const signers = connector.signers;
//     if (signers && signers.length > 0) {
//       const accountId = signers[0].getAccountId().toString();
//       setAccount(accountId);
//       setIsConnected(true);
//     }
//   };

//   const disconnectWallet = async () => {
//     if (!connector) return;
//     const sessions = connector.walletConnectClient?.session.getAll();
//     if (sessions && sessions.length > 0) {
//       await connector.disconnect(sessions[0].topic);
//     }
//     setAccount(null);
//     setIsConnected(false);
//   };

//   const signMessage = async (message: string) => {
//     if (!connector || !account) throw new Error('Wallet not connected');
//     const { AccountId } = sdkRef.current;
//     if (!AccountId) {
//       throw new Error('Hedera SDK not loaded');
//     }
//     const accountId = AccountId.fromString(account);
//     const signer = connector.getSigner(accountId);
//     const messageBuffer = Buffer.from(message, 'utf-8');
//     const signature = await signer.sign([messageBuffer]);
//     return signature;
//   };

//   return (
//     <WalletContext.Provider
//       value={{
//         connector,
//         account,
//         isConnected,
//         connectWallet,
//         disconnectWallet,
//         signMessage,
//          signer: account ? connector?.getSigner(AccountId.fromString(account)) : null,
//         // accountId: account ? AccountId.fromString(account) : null,
//       }}
//     >
//       {children}
//     </WalletContext.Provider>
//   );
// };

// export const HashPackProvider = HederaWalletProvider;

// export const useHederaWallet = () => useContext(WalletContext);

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId,
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId, AccountId } from '@hiero-ledger/sdk';

const WalletContext = createContext<any>(null);

const projectId = 'ec1bf58ee8034b1747cb72a34b6652ae';
const metadata = {
  name: 'Quiva Hedera DApp',
  description: 'Hedera DApp using WalletConnect v2',
  url: 'localhost:3000/marketplace',
  icons: ['https://yourapp.io/icon.png'],
};

// ─────────────────────────────────────────────────────────────────────────
// Module-level singleton. React 18 StrictMode double-invokes effects in
// dev (mount → cleanup → mount), and the previous version created a brand
// new DAppConnector + WalletConnect client on every one of those mounts,
// with no real teardown in between. That can leave two live connector
// instances attached to the same restored session — a very plausible
// source of "list is locked" / "Request expired" style errors, since two
// signer instances can end up racing over the same relay session.
//
// Caching the init promise at module scope means the *first* effect run
// kicks off initialization, and any subsequent StrictMode remount (or
// remount from anywhere else in the app) just awaits the same promise
// instead of creating a second connector.
// ─────────────────────────────────────────────────────────────────────────
let connectorPromise: Promise<DAppConnector> | null = null;

const getConnector = (): Promise<DAppConnector> => {
  if (!connectorPromise) {
    connectorPromise = (async () => {
      const dAppConnector = new DAppConnector(
        metadata,
        LedgerId.TESTNET,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet, HederaChainId.Mainnet],
      );
      await dAppConnector.init({ logger: 'error' });
      return dAppConnector;
    })();
  }
  return connectorPromise;
};

export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [connector, setConnector] = useState<DAppConnector | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenerAttachedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    getConnector().then((clientConnector) => {
      if (!mounted) return;
      setConnector(clientConnector);

      const signers = clientConnector.signers;
      console.log('Initial signers:', signers);
      if (signers && signers.length > 0) {
        setAccount(signers[0].getAccountId().toString());
        setIsConnected(true);
      }

      // Only attach the listener once per singleton connector, even if
      // this effect runs again (StrictMode remount) — otherwise a second
      // 'session_update' handler stacks on top of the first.
      if (!listenerAttachedRef.current && clientConnector.walletConnectClient) {
        listenerAttachedRef.current = true;
        clientConnector.walletConnectClient.on('session_update', () => {
          const updatedSigners = clientConnector.signers;
          if (updatedSigners && updatedSigners.length > 0) {
            setAccount(updatedSigners[0].getAccountId().toString());
            setIsConnected(true);
          } else {
            setAccount(null);
            setIsConnected(false);
          }
        });
      }
    });

    return () => {
      mounted = false;
      // Deliberately NOT disposing the connector or removing the
      // 'session_update' listener here — the connector is a module-level
      // singleton shared across mounts, so tearing it down on the first
      // StrictMode cleanup would kill the only instance the app has.
    };
  }, []);

  const connectWallet = async () => {
    if (!connector) return;
    const session = await connector.openModal();
    console.log('Connected session:', session);
    const signers = connector.signers;
    if (signers && signers.length > 0) {
      const accountId = signers[0].getAccountId().toString();
      setAccount(accountId);
      setIsConnected(true);
    }
  };

  const disconnectWallet = async () => {
    if (!connector) return;
    const sessions = connector.walletConnectClient?.session.getAll();
    if (sessions && sessions.length > 0) {
      await connector.disconnect(sessions[0].topic);
    }
    setAccount(null);
    setIsConnected(false);
  };

  const signMessage = async (message: string) => {
    if (!connector || !account) throw new Error('Wallet not connected');
    const accountId = AccountId.fromString(account);
    const signer = connector.getSigner(accountId);
    const messageBuffer = Buffer.from(message, 'utf-8');
    const signature = await signer.sign([messageBuffer]);
    return signature;
  };

  // Memoized so consumers (like useMarketplace's `signer`) get a STABLE
  // reference between renders instead of a brand-new DAppSigner instance
  // on every re-render — the previous version recomputed this inline in
  // the JSX on every render, which risks a transaction being built
  // against one signer identity and executed against a different one if
  // a re-render happens mid-flow.
  const signer = useMemo(
    () => (connector && account ? connector.getSigner(AccountId.fromString(account)) : null),
    [connector, account]
  );

  const value = useMemo(
    () => ({
      connector,
      account,
      isConnected,
      connectWallet,
      disconnectWallet,
      signMessage,
      signer,
    }),
    [connector, account, isConnected, signer]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const HashPackProvider = HederaWalletProvider;

export const useHederaWallet = () => useContext(WalletContext);