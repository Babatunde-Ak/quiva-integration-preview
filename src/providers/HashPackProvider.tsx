// 'use client';

// import { HWBridgeProvider } from '@buidlerlabs/hashgraph-react-wallets'
// import {  HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors'
// import { HederaTestnet } from '@buidlerlabs/hashgraph-react-wallets/chains'
// import { tonmicIcon } from '../../public/dev_images'
// import { useEffect, useState } from 'react'

// interface HashPackProviderProps {
//   children: React.ReactNode;
// }

// // Use environment variable for WalletConnect project ID
// const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID || "ec1bf58ee8034b1747cb72a34b6652ae";

// export const HashPackProvider = ({ children }: HashPackProviderProps) => {
//   const [isClient, setIsClient] = useState(false);
//   const [metadata, setMetadata] = useState({
//     name: 'Quiva DApp (Testnet)',
//     description: 'Connect to HashPack Wallets for NFT marketplace interactions',
//     icons: [tonmicIcon].map((image) => image.src),
//     url: 'http://localhost:3000', // Default fallback URL
//   });

//   useEffect(() => {
//     setIsClient(true);
//     // Update URL after client-side hydration
//     if (typeof window !== 'undefined') {
//       setMetadata(prev => ({
//         ...prev,
//         url: window.location.origin
//       }));
//     }
//   }, []);

//   // Debug logging and network connectivity check
//   useEffect(() => {
//     if (isClient) {
//       console.log("HashPackProvider initialized with:", {
//         projectId: WALLET_CONNECT_PROJECT_ID ? `${WALLET_CONNECT_PROJECT_ID.substring(0, 8)}...` : 'MISSING',
//         fullProjectId: WALLET_CONNECT_PROJECT_ID,
//         metadata,
//         isClient
//       });

//       // Test WebSocket connectivity to WalletConnect relay
//       const testRelayConnection = async () => {
//         try {
//           const ws = new WebSocket('wss://relay.walletconnect.org');
//           ws.onopen = () => {
//             console.log('✅ WalletConnect relay is reachable');
//             ws.close();
//           };
//           ws.onerror = (err) => {
//             console.error('❌ WalletConnect relay connection failed:', err);
//             console.error('This may be caused by:');
//             console.error('  - VPN or firewall blocking WebSocket connections');
//             console.error('  - Corporate network restrictions');
//             console.error('  - ISP blocking WebSocket traffic');
//             console.error('Try disabling VPN or using a different network');
//           };
//           // Timeout after 5 seconds
//           setTimeout(() => {
//             if (ws.readyState !== WebSocket.OPEN && ws.readyState !== WebSocket.CLOSED) {
//               console.error('❌ WalletConnect relay connection timed out');
//               ws.close();
//             }
//           }, 5000);
//         } catch (err) {
//           console.error('❌ Failed to create WebSocket test connection:', err);
//         }
//       };
//       testRelayConnection();
//     }
//   }, [metadata, isClient]);

//   // Don't render provider until we're on the client
//   if (!isClient) {
//     return <>{children}</>;
//   }

//   return (
//     <HWBridgeProvider
//       metadata={metadata}
//       projectId={WALLET_CONNECT_PROJECT_ID}
//       connectors={[ HashpackConnector]}
//       chains={[HederaTestnet]}
//     >
//       {children}
//     </HWBridgeProvider>
//   );
// };

// HashinalsProvider.tsx
// 'use client';

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { HashinalsWalletConnectSDK } from '@hashgraphonline/hashinal-wc';
// import { LedgerId } from '@hashgraph/sdk';

// interface HashinalsContextType {
//   sdk: HashinalsWalletConnectSDK | null;
//   account: string | null;
//   isConnected: boolean;
//   isInitializing: boolean;
//   initError: string | null;
//   connect: () => Promise<any>;
//   disconnect: () => Promise<void>;
// }

// const HashinalsContext = createContext<HashinalsContextType | null>(null);

// export const HashinalsProvider = ({ children }: { children: React.ReactNode }) => {
//   const [sdk, setSdk] = useState<HashinalsWalletConnectSDK | null>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isInitializing, setIsInitializing] = useState(true);
//   const [initError, setInitError] = useState<string | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         // Test WebSocket connectivity first
//         console.log('🔄 Testing WalletConnect relay connectivity...');
        
//         const wsTest = new Promise<boolean>((resolve) => {
//           const ws = new WebSocket('wss://relay.walletconnect.org');
//           const timeout = setTimeout(() => {
//             ws.close();
//             resolve(false);
//           }, 5000);
          
//           ws.onopen = () => {
//             clearTimeout(timeout);
//             console.log('✅ WalletConnect relay is reachable');
//             ws.close();
//             resolve(true);
//           };
//           ws.onerror = () => {
//             clearTimeout(timeout);
//             resolve(false);
//           };
//         });

//         const isReachable = await wsTest;
//         if (!isReachable) {
//           console.error('❌ WalletConnect relay is NOT reachable');
//           console.error('Possible causes:');
//           console.error('  - VPN blocking WebSocket connections');
//           console.error('  - Firewall blocking wss://relay.walletconnect.org');
//           console.error('  - ISP/Network restrictions');
//           setInitError('Unable to connect to WalletConnect relay. Check your network/VPN settings.');
//           setIsInitializing(false);
//           return;
//         }

//         const metadata = {
//           name: 'Quiva DApp',
//           description: 'NFT marketplace using Hashinals WalletConnect',
//           url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
//           icons: ['https://quiva.app/icon.png'],
//         };

//         console.log('🔄 Initializing HashinalsWalletConnectSDK...');
//         const instance = HashinalsWalletConnectSDK.getInstance();
//         await instance.init(
//           process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID || 'ec1bf58ee8034b1747cb72a34b6652ae',
//           metadata,
//           LedgerId.TESTNET
//         );
//         console.log('✅ HashinalsWalletConnectSDK initialized successfully');
//         setSdk(instance);
//         setInitError(null);
//       } catch (err: any) {
//         console.error('❌ Failed to initialize HashinalsWalletConnectSDK:', err);
//         setInitError(err?.message || 'Failed to initialize wallet SDK');
//       } finally {
//         setIsInitializing(false);
//       }
//     };

//     if (typeof window !== 'undefined') {
//       init();
//     }
//   }, []);

//   const connect = async () => {
//     if (!sdk) {
//       console.error('SDK not initialized');
//       throw new Error(initError || 'Wallet SDK not initialized. Please refresh the page.');
//     }
    
//     try {
//       console.log('🔄 Connecting to wallet...');
//       const session = await sdk.connect();
//       console.log('✅ Wallet session established:', session);
      
//       const info = await sdk.getAccountInfo();
//       console.log('✅ Account info:', info);
      
//       setAccount(info.accountId);
//       setIsConnected(true);
//       return info;
//     } catch (err: any) {
//       console.error('❌ Failed to connect wallet:', err);
      
//       // Check for specific WalletConnect errors
//       if (err?.message?.includes('publish') || err?.message?.includes('payload')) {
//         throw new Error('Network error: Unable to reach WalletConnect relay. Please check your internet connection, disable VPN, or try a different network.');
//       }
//       throw err;
//     }
//   };

//   const disconnect = async () => {
//     if (!sdk) return;
//     try {
//       await sdk.disconnect();
//       setAccount(null);
//       setIsConnected(false);
//     } catch (err) {
//       console.error('Error disconnecting:', err);
//     }
//   };

//   return (
//     <HashinalsContext.Provider value={{ sdk, account, isConnected, isInitializing, initError, connect, disconnect }}>
//       {children}
//     </HashinalsContext.Provider>
//   );
// };

// // Export as HashPackProvider for backward compatibility with layout.tsx
// export const HashPackProvider = HashinalsProvider;

// export const useHashinals = () => {
//   const context = useContext(HashinalsContext);
//   if (!context) {
//     throw new Error('useHashinals must be used within a HashinalsProvider');
//   }
//   return context;
// };


'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId
} from '@hashgraph/hedera-wallet-connect';
import { LedgerId, AccountId } from '@hashgraph/sdk';
// import { Account } from "@hashgraphonline/hashinal-wc";


const WalletContext = createContext<any>(null);

export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [connector, setConnector] = useState<DAppConnector | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const projectId ='ec1bf58ee8034b1747cb72a34b6652ae';
  const metadata = {
    name: 'Quiva Hedera DApp',
    description: 'Hedera DApp using WalletConnect v2',
    url: 'localhost:3000/marketplace',
    icons: ['https://yourapp.io/icon.png'],
  };

  // Initialize the Hedera connector
  useEffect(() => {
    const initConnector = async () => {
      const dAppConnector = new DAppConnector(
        metadata,
        LedgerId.TESTNET,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet, HederaChainId.Mainnet],
      );
      await dAppConnector.init({ logger: 'error' });
      setConnector(dAppConnector);
        const signers = dAppConnector.signers;
        console.log('Initial signers:', signers);
      // Subscribe to session events via WalletConnect client
      if (dAppConnector.walletConnectClient) {
        dAppConnector.walletConnectClient.on('session_update', () => {
         
          if (signers && signers.length > 0) {
            const accountId = signers[0].getAccountId().toString();
            setAccount(accountId);
            setIsConnected(true);
          } else {
            setAccount(null);
            setIsConnected(false);
          }
        });
      }
    };

    initConnector();
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

  return (
    <WalletContext.Provider
      value={{
        connector,
        account,
        isConnected,
        connectWallet,
        disconnectWallet,
        signMessage,
        signer: account ? connector?.getSigner(AccountId.fromString(account)) : null,
        accountId: account ? AccountId.fromString(account) : null,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const HashPackProvider = HederaWalletProvider;

export const useHederaWallet = () => useContext(WalletContext);
