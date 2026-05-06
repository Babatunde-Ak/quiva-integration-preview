
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DAppConnector,
  HederaSessionEvent,
  HederaJsonRpcMethod,
  HederaChainId,
  
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
    url: 'https://quiva.app',
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

      // Restore existing sessions after init
      const signers = dAppConnector.signers;
      console.log('Initial signers after init:', signers);
      if (signers && signers.length > 0) {
        const accountId = signers[0].getAccountId().toString();
        console.log('Restored session, account:', accountId);
        setAccount(accountId);
        setIsConnected(true);
      }

      // Subscribe to session events via WalletConnect client
      if (dAppConnector.walletConnectClient) {
        dAppConnector.walletConnectClient.on('session_update', () => {
          const updatedSigners = dAppConnector.signers;
          if (updatedSigners && updatedSigners.length > 0) {
            const accountId = updatedSigners[0].getAccountId().toString();
            console.log('Session updated, new account:', accountId);
            setAccount(accountId);
            setIsConnected(true);
          } else {
            setAccount(null);
            setIsConnected(false);
          }
        });

        dAppConnector.walletConnectClient.on('session_delete', () => {
          console.log('Session deleted');
          setAccount(null);
          setIsConnected(false);
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

  const signMessage = async (message: string): Promise<`0x${string}`> => {
    if (!connector || !account) throw new Error('Wallet not connected');

    const accountId = AccountId.fromString(account);
    const evmAddr = `0x${accountId.toEvmAddress()}`;

    const sessions = connector.walletConnectClient?.session.getAll();
    if (!sessions || sessions.length === 0) throw new Error('No active WalletConnect session');

    const signature = await connector.walletConnectClient?.request<`0x${string}`>({
      topic: sessions[0].topic,
      chainId: 'eip155:296', // Hedera Testnet EVM chain ID
      request: {
        method: 'personal_sign',
        params: [
          `0x${Buffer.from(message, 'utf-8').toString('hex')}`,
          evmAddr,
        ],
      },
    });

    if (!signature) throw new Error('No signature returned from wallet');
    return signature;
  };

  const evmAddress = account
    ? (() => {
        try {
          return `0x${AccountId.fromString(account).toEvmAddress()}` as `0x${string}`;
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <WalletContext.Provider
      value={{
        connector,
        account,
        evmAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
        signMessage,
        signer: account ? connector?.getSigner(AccountId.fromString(account)) : null,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const HashPackProvider = HederaWalletProvider;

export const useHederaWallet = () => useContext(WalletContext);

// 'use client';

// import React, { createContext, useContext, useEffect, useState } from 'react';
// import {
//   DAppConnector,
//   HederaJsonRpcMethod,
//   HederaSessionEvent,
//   HederaChainId,
// } from '@hashgraph/hedera-wallet-connect';
// import { LedgerId } from '@hashgraph/sdk';
// import { ethers } from 'ethers';

// type WalletContextType = {
//   connectWallet: () => Promise<void>;
//   disconnectWallet: () => Promise<void>;
//   isConnected: boolean;
//   account: string | null;
//   evmAddress: string | null;
//   provider: ethers.JsonRpcProvider | null;
//   signer: DAppConnector | null;
// };

// const WalletContext = createContext<WalletContextType | null>(null);

// export const HederaWalletProvider = ({ children }: { children: React.ReactNode }) => {
//   const [connector, setConnector] = useState<DAppConnector | null>(null);
//   const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
//   const [account, setAccount] = useState<string | null>(null);
//   const [evmAddress, setEvmAddress] = useState<string | null>(null);
//   const [isConnected, setIsConnected] = useState(false);

//   const projectId = 'ec1bf58ee8034b1747cb72a34b6652ae';

//   useEffect(() => {
//     const init = async () => {
//       const dapp = new DAppConnector(
//         {
//           name: 'Quiva Hedera DApp',
//           description: 'NFT Marketplace',
//           url: window.location.origin,
//           icons: ['https://yourapp.io/icon.png'],
//         },
//         LedgerId.TESTNET,
//         projectId,
//         Object.values(HederaJsonRpcMethod),
//         [HederaSessionEvent.AccountsChanged, HederaSessionEvent.ChainChanged],
//         [HederaChainId.Testnet],
//       );

//       await dapp.init({ logger: 'error' });
//       setConnector(dapp);
//     };

//     init();
//   }, []);

//   const connectWallet = async () => {
//     if (!connector) return;

//     await connector.openModal();

//     // Get signers after connection
//     const signers = connector.signers;

//     if (!signers || signers.length === 0) {
//       throw new Error('No signers available after connection');
//     }

//     // Get the Hedera account ID from the signer
//     const hederaSigner = signers[0];
//     const accountId = hederaSigner.getAccountId().toString();

//     // Get the EVM address for contract interactions
//     // You can derive this from the account or get it from the signer
//     const ledgerId = hederaSigner.getLedgerId();
    
//     // Create a JSON-RPC provider for read operations
//     const jsonRpcProvider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

//     setProvider(jsonRpcProvider);
//     setAccount(accountId);
//     setIsConnected(true);
    
//     // Note: For signing transactions with your HTS contract,
//     // use connector.signers[0] to sign via WalletConnect
//   };

//   const disconnectWallet = async () => {
//     if (!connector) return;

//     const sessions = connector.walletConnectClient?.session.getAll();
//     if (sessions?.length) {
//       await connector.disconnect(sessions[0].topic);
//     }

//     setProvider(null);
//     setAccount(null);
//     setEvmAddress(null);
//     setIsConnected(false);
//   };

//   return (
//     <WalletContext.Provider
//       value={{
//         connectWallet,
//         disconnectWallet,
//         isConnected,
//         account,
//         evmAddress,
//         provider,
//         signer: connector,
//       }}
//     >
//       {children}
//     </WalletContext.Provider>
//   );
// };

// export const useHederaWallet = () => {
//   const ctx = useContext(WalletContext);
//   if (!ctx) throw new Error('useHederaWallet must be used within provider');
//   return ctx;
// };