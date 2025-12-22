"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import type { Chain } from "wagmi/chains";

const hederaTestnet = {
  id: 296,
  name: 'HederaTestnet',
  iconUrl: 'https://assets.coingecko.com/coins/images/3688/standard/hbar.png?1696504364',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Hedera Testnet', symbol: 'HBAR', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    default: { name: 'Hashscan', url: 'https://hashscan.io/testnet/home' },
  },
  
} as const;

const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_HASHGRAPH_PROJECT_ID || "ec1bf58ee8034b1747cb72a34b6652ae";

const config = getDefaultConfig({
  appName: "Quiva DApp",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [ hederaTestnet  ],
  ssr: false, // If your dApp uses server side rendering (SSR)
});
const queryClient = new QueryClient();

export default function RainbowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact"> {children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
