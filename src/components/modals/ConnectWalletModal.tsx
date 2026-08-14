// "use client";
// import React from "react";
// import { ArrowLeft } from "lucide-react";
// import Image from "next/image";

// type Props = {
//   onBack?: () => void;
//   onGetExtension?: () => void;
// };

// const WalletConnectModal = ({ onBack, onGetExtension }: Props) => {
//   return (
//     <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white">
//       {/* Header */}
//       <div className="flex items-center justify-center relative mb-6">
//         {/* Back Arrow */}
//         <button
//           onClick={onBack}
//           className="absolute left-0 p-2 text-white hover:text-gray-300"
//         >
//           <ArrowLeft size={22} />
//         </button>

//         {/* Title */}
//         <h3 className="text-xl sm:text-2xl font-bold">Connect</h3>
//       </div>

//       {/* QR Code */}
//       <div className="flex justify-center mb-6">
//         <Image
//           src="/qrcode.png" // Place your QR code image in /public/qrcode.png
//           alt="QR Code"
//           width={200}
//           height={200}
//           className="rounded-xl border border-white/20"
//         />
//       </div>

//       {/* Get Extension Button */}
//       <div className="flex justify-center mb-6">
//         <button
//           onClick={onGetExtension}
//           className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-xl shadow-md transition"
//         >
//           Get Extension
//         </button>
//       </div>

//       {/* Description */}
//       <p className="text-center text-white/70 text-sm sm:text-base leading-relaxed">
//         Scan this QR code from your mobile wallet or phone&apos;s camera to connect.
//       </p>
//     </div>
//   );
// };

// export default WalletConnectModal;


import { ConnectButton } from '@rainbow-me/rainbowkit';
export const RainbowConnect = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button">
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>
                  <button onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};