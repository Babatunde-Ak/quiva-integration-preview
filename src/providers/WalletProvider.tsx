// // src/providers/WalletProvider.tsx
// // Complete wallet provider with RainbowKit integration (manual config – no getDefaultConfig)

'use client';

import React from 'react';
import {
  RainbowKitProvider,
  darkTheme,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useDisconnect,
  useSignMessage,
  useChainId,
} from 'wagmi';
import { mainnet, polygon, arbitrum, sepolia } from 'wagmi/chains';
// Import connectors from individual files to avoid MetaMask SDK and WalletConnect deps
// import { injected } from 'wagmi/connectors/injected';
// import { coinbaseWallet } from 'wagmi/connectors/coinbaseWallet';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import '@rainbow-me/rainbowkit/styles.css';

// Manual wagmi config


// Theme
const baseTheme = darkTheme({
  accentColor: '#D38200',
  accentColorForeground: '#000000',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

const customTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,
    modalBackground: '#1A1B1F',
    modalBackdrop: 'rgba(0,0,0,0.8)',
    modalBorder: 'rgba(255,255,255,0.2)',
    modalText: '#FFFFFF',
    modalTextDim: 'rgba(255,255,255,0.7)',
    modalTextSecondary: 'rgba(255,255,255,0.6)',
    connectButtonBackground: '#D38200',
  },
};

interface WalletProviderProps {
  children: React.ReactNode;
}

// export default function WalletProvider({ children }: WalletProviderProps) {
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider
//           chains={chainsList}
//           theme={customTheme as any}
//           modalSize="compact"
//           appInfo={{
//             appName: 'Quiva Comic Platform',
//             learnMoreUrl: 'https://quiva.io/about',
//           }}
//         >
//           {children}
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// Custom Connect Button
// export function CustomConnectButton() {
//   return (
//     <ConnectButton.Custom>
//       {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
//         const ready = mounted;
//         const connected = ready && account && chain;
//         return (
//           <div
//             {...(!ready && {
//               'aria-hidden': true,
//               style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
//             })}
//           >
//             {(() => {
//               if (!connected) {
//                 return (
//                   <button
//                     onClick={openConnectModal}
//                     type="button"
//                     className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
//                   >
//                     Connect Wallet
//                   </button>
//                 );
//               }
//               if (chain.unsupported) {
//                 return (
//                   <button
//                     onClick={openChainModal}
//                     type="button"
//                     className="w-full bg-red-500 hover:bg-red-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200"
//                   >
//                     Wrong Network
//                   </button>
//                 );
//               }
//               return (
//                 <div className="w-full space-y-3">
//                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
//                     <div className="flex items-center gap-3">
//                       {chain.hasIcon && chain.iconUrl && (
//                         <div
//                           style={{
//                             background: chain.iconBackground,
//                             width: 20,
//                             height: 20,
//                             borderRadius: 999,
//                             overflow: 'hidden',
//                           }}
//                         >
//                           <img
//                             alt={chain.name ?? 'Chain icon'}
//                             src={chain.iconUrl}
//                             style={{ width: 20, height: 20 }}
//                           />
//                         </div>
//                       )}
//                       <div>
//                         <p className="text-white font-medium text-sm">
//                           {account.displayName}
//                         </p>
//                         <p className="text-white/60 text-xs">{chain.name}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={openAccountModal}
//                       className="text-yellow-400 hover:text-yellow-300 text-sm font-medium"
//                     >
//                       Change
//                     </button>
//                   </div>
//                 </div>
//               );
//             })()}
//           </div>
//         );
//       }}
//     </ConnectButton.Custom>
//   );
// }

// Simple Connect Button
// export function SimpleConnectButton() {
//   return (
//     <ConnectButton.Custom>
//       {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
//         const ready = mounted;
//         const connected = ready && account && chain;
//         return (
//           <div
//             {...(!ready && {
//               'aria-hidden': true,
//               style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
//             })}
//           >
//             {!connected ? (
//               <button
//                 onClick={openConnectModal}
//                 type="button"
//                 className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
//               >
//                 Connect Wallet
//               </button>
//             ) : (
//               <div className="flex items-center gap-2">
//                 {chain.unsupported ? (
//                   <button
//                     onClick={openChainModal}
//                     type="button"
//                     className="bg-red-500 hover:bg-red-400 text-white font-medium px-3 py-2 rounded-lg transition-colors duration-200"
//                   >
//                     Wrong Network
//                   </button>
//                 ) : (
//                   <button
//                     onClick={openChainModal}
//                     type="button"
//                     className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
//                   >
//                     {chain.hasIcon && chain.iconUrl && (
//                       <img
//                         alt={chain.name ?? 'Chain icon'}
//                         src={chain.iconUrl}
//                         className="w-4 h-4 rounded-full"
//                       />
//                     )}
//                     {chain.name}
//                   </button>
//                 )}
//                 <button
//                   onClick={openAccountModal}
//                   type="button"
//                   className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
//                 >
//                   {account.displayName}
//                 </button>
//               </div>
//             )}
//           </div>
//         );
//       }}
//     </ConnectButton.Custom>
//   );
// }

