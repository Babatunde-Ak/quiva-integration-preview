'use client';

import { HWBridgeProvider } from '@buidlerlabs/hashgraph-react-wallets'
import { HashpackConnector, KabilaConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors'
import { HederaTestnet } from '@buidlerlabs/hashgraph-react-wallets/chains'
import { tonmicIcon } from '../../public/dev_images'
import { useEffect, useState } from 'react'

interface HashPackProviderProps {
  children: React.ReactNode;
}

export const HashPackProvider = ({ children }: HashPackProviderProps) => {
  const [metadata, setMetadata] = useState({
    name: 'Quiva DApp (Testnet)',
    description: 'Connect to HashPack Wallets for NFT marketplace interactions',
    icons: [tonmicIcon].map((image) => image.src),
    url: process.env.NEXT_LOCAL_WEBSITE_URL, // fallback URL
  });

  useEffect(() => {
    // Update URL after client-side hydration
    if (typeof window !== 'undefined') {
      setMetadata(prev => ({
        ...prev,
        url: window.location.origin
      }));
    }
  }, []);

  return (
    <HWBridgeProvider
      metadata={metadata}
      projectId={process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID}
      connectors={[HashpackConnector, KabilaConnector]}
      chains={[HederaTestnet]}
    >
      {children}
    </HWBridgeProvider>
  );
};