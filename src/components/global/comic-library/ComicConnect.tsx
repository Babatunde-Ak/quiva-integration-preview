'use client'

import { MainButton } from '@/components/button'
import HashConnectButton from '@/components/button/HashConnectButton';
import { RainbowConnect } from '@/components/button/RainbowConnect';
import ComicModal from '@/components/modals/ComicModal';
import { useAppSelector } from '@/redux/hook';
import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
 import { useHederaWallet } from '@/providers/HashPackProvider';
//import { HashpackConnector, useEvmAddress, useWallet } from '@reown/walletkit';
import { QuivaLogo } from '@/components/utils/function';

enum WalletType {
  NONE = 'none',
  RAINBOW = 'rainbow',
  HASHPACK = 'hashpack'
}

function ComicConnect() {
  const { isAuthenticated, walletAddress } = useAppSelector((state: any) => state.wallet);
  const [isOpen, setIsOpen] = React.useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletType>(WalletType.NONE);

  // Rainbow Kit hooks
  const { isConnected: isRainbowConnected, address: rainbowAddress } = useAccount();

  // HashPack hooks
  const { isConnected: isHashpackConnected, account } = useHederaWallet();

  // Monitor wallet connections — also check persisted Redux state
  useEffect(() => {
    if (isRainbowConnected && rainbowAddress) {
      setConnectedWallet(WalletType.RAINBOW);
    } else if (isHashpackConnected && account) {
      setConnectedWallet(WalletType.HASHPACK);
    } else if (isAuthenticated && walletAddress) {
      // Provider hasn't restored yet, but Redux says we're authenticated
      // Determine wallet type from the persisted address format
      if (walletAddress.startsWith('0.0.')) {
        setConnectedWallet(WalletType.HASHPACK);
      } else if (walletAddress.startsWith('0x')) {
        setConnectedWallet(WalletType.RAINBOW);
      }
    } else {
      setConnectedWallet(WalletType.NONE);
    }
  }, [isRainbowConnected, rainbowAddress, isHashpackConnected, account, isAuthenticated, walletAddress]);

  // Auto-close the connect modal once auth completes
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setIsOpen(false);
    }
  }, [isAuthenticated, isOpen]);

  const handleConnect = () => {
    setIsOpen(true);
  };

  const renderConnectedWallet = () => {
    switch (connectedWallet) {
      case WalletType.RAINBOW:
        return <RainbowConnect />;
      case WalletType.HASHPACK:
      default:
        // Default to HashConnectButton — it handles its own session restoration
        return <HashConnectButton />;
    }
  };

  const getWalletInfo = () => {
    switch (connectedWallet) {
      case WalletType.RAINBOW:
        return {
          name: 'Rainbow Wallet',
          address: rainbowAddress,
          network: 'Ethereum'
        };
      case WalletType.HASHPACK:
        return {
          name: 'HashPack',
          address: account,
          network: 'Hedera'
        };
      default:
        return null;
    }
  };

  return (
    <div>
      {isAuthenticated === false ? (
        <>
          <MainButton 
            data-tour="connect-wallet"
            className='text-xxs sm:text-sm !px-2 sm:px-4'
            onClick={handleConnect}
          >
            Connect Wallet
          </MainButton>

          {isOpen && (
            <ComicModal className="max-w-xl z-20" onClose={() => setIsOpen(false)}>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col items-center justify-center'>
                    <QuivaLogo showText className="invert" />
                </div>
                <p className='text-white text-center font-light'>
                    Connect With Quiva
                </p>
                
                {/* Wallet Status Info */}
                {connectedWallet !== WalletType.NONE && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-sm font-medium">
                        {getWalletInfo()?.name} Connected
                      </span>
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      {getWalletInfo()?.network} • {getWalletInfo()?.address?.slice(0, 10)}...
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  {/* HashPack Connection */}
                  <div className="flex flex-col gap-2">
                    <div className='flex items-center justify-center'>
                      <div>
                        <HashConnectButton />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/20"></div>
                    <span className="text-white/60 text-xs">OR</span>
                    <div className="flex-1 h-px bg-white/20"></div>
                  </div>

                  {/* Rainbow Kit Connection */}
                  <div className="flex flex-col gap-2">
                    <div className='flex items-center justify-center'>
                      <RainbowConnect />
                    </div>
                  </div>
                </div>

              </div>
            </ComicModal>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2" data-tour="connect-wallet">
          {/* Show connected wallet info */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            <span className="text-primary-400 text-xs font-medium">
              {connectedWallet === WalletType.RAINBOW ? 'Hedera' : 'Hedera'}
            </span>
          </div>
          {renderConnectedWallet()}
        </div>
      )}
    </div>
  );
}

export default ComicConnect;

// 'use client'

// import { MainButton } from '@/components/button'
// import HashConnectButton from '@/components/button/HashConnectButton';
// import { RainbowConnect } from '@/components/button/RainbowConnect';
// import ComicModal from '@/components/modals/ComicModal';
// import { useAppSelector } from '@/redux/hook';
// import React, { useEffect, useState } from 'react';
// import { useAccount } from 'wagmi';
// import { QuivaLogo } from '@/components/utils/function';
// import { useHederaWallet } from '@/providers/HashPackProvider'; // ✅ NEW IMPORT

// enum WalletType {
//   NONE = 'none',
//   RAINBOW = 'rainbow',
//   HASHPACK = 'hashpack'
// }

// function ComicConnect() {
//   const { isAuthenticated } = useAppSelector((state) => state.wallet);
//   const [isOpen, setIsOpen] = React.useState(false);
//   const [connectedWallet, setConnectedWallet] = useState<WalletType>(WalletType.NONE);

//   // ✅ Rainbow Kit hooks
//   const { isConnected: isRainbowConnected, address: rainbowAddress } = useAccount();

//   // ✅ Hashinals Wallet hooks (replaces HashPack hooks)
//   const { isConnected: isHashinalsConnected, account } = useHederaWallet();

//   // ✅ Monitor wallet connections
//   useEffect(() => {
//     if (isRainbowConnected && rainbowAddress) {
//       setConnectedWallet(WalletType.RAINBOW);
//     } else if (isHashinalsConnected && account) {
//       setConnectedWallet(WalletType.HASHPACK);
//     } else {
//       setConnectedWallet(WalletType.NONE);
//     }
//   }, [isRainbowConnected, rainbowAddress, isHashinalsConnected, account]);

//   const handleConnect = () => {
//     setIsOpen(true);
//   };

//   const renderConnectedWallet = () => {
//     switch (connectedWallet) {
//       case WalletType.RAINBOW:
//         return <RainbowConnect />;
//       case WalletType.HASHPACK:
//         return <HashConnectButton />;
//       default:
//         return null;
//     }
//   };

//   const getWalletInfo = () => {
//     switch (connectedWallet) {
//       case WalletType.RAINBOW:
//         return {
//           name: 'Rainbow Wallet',
//           address: rainbowAddress,
//           network: 'Ethereum'
//         };
//       case WalletType.HASHPACK:
//         return {
//           name: 'Hashinals Wallet', // ✅ Updated
//           address: account,         // ✅ Updated
//           network: 'Hedera'
//         };
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       {!isAuthenticated || connectedWallet === WalletType.NONE ? (
//         <>
//           <MainButton 
//             className='text-xxs sm:text-sm !px-2 sm:px-4'
//             onClick={handleConnect}
//           >
//             Connect Wallet
//           </MainButton>

//           {isOpen && (
//             <ComicModal className="max-w-xl" onClose={() => setIsOpen(false)}>
//               <div className='flex flex-col gap-4'>
//                 <div className='flex flex-col items-center justify-center'>
//                   <QuivaLogo showText className="invert" />
//                 </div>
//                 <p className='text-white text-center font-light'>
//                   Connect With Quiva
//                 </p>
                
//                 {/* ✅ Wallet Status Info */}
//                 {connectedWallet !== WalletType.NONE && (
//                   <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-2">
//                     <div className="flex items-center gap-2">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-green-400 text-sm font-medium">
//                         {getWalletInfo()?.name} Connected
//                       </span>
//                     </div>
//                     <p className="text-green-300 text-xs mt-1">
//                       {getWalletInfo()?.network} • {getWalletInfo()?.address?.slice(0, 10)}...
//                     </p>
//                   </div>
//                 )}

//                 <div className="flex flex-col gap-3">
//                   {/* ✅ Hashinals WalletConnect Button */}
//                   <div className="flex flex-col gap-2">
//                     <div className='flex items-center justify-center'>
//                       <div>
//                         <HashConnectButton />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Divider */}
//                   <div className="flex items-center gap-3">
//                     <div className="flex-1 h-px bg-white/20"></div>
//                     <span className="text-white/60 text-xs">OR</span>
//                     <div className="flex-1 h-px bg-white/20"></div>
//                   </div>

//                   {/* Rainbow Kit Connection */}
//                   <div className="flex flex-col gap-2">
//                     <div className='flex items-center justify-center'>
//                       <RainbowConnect />
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </ComicModal>
//           )}
//         </>
//       ) : (
//         <div className="flex items-center gap-2">
//           {/* Show connected wallet info */}
//           <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-lg">
//             <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
//             <span className="text-primary-400 text-xs font-medium">
//               {connectedWallet === WalletType.RAINBOW ? 'Ethereum' : 'Hedera'}
//             </span>
//           </div>
//           {renderConnectedWallet()}
//         </div>
//       )}
//     </>
//   );
// }

// export default ComicConnect;
