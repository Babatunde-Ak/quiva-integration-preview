// 'use client';

// import React from 'react';
// import { X, Gift, Loader2, CheckCircle, XCircle } from 'lucide-react';

// interface ClaimModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onClaim: () => void;
//   comicTitle: string;
//   isClaiming: boolean;
//   claimSuccess: boolean;
//   claimError: Error | null;
//   claimProgress: number;
//   transactionHash?: string;
// }

// const ClaimModal: React.FC<ClaimModalProps> = ({
//   isOpen,
//   onClose,
//   onClaim,
//   comicTitle,
//   isClaiming,
//   claimSuccess,
//   claimError,
//   claimProgress,
//   transactionHash,
// }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-orange-500/30 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center relative">
//           {!isClaiming && !claimSuccess && (
//             <button
//               onClick={onClose}
//               className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
//             >
//               <X size={20} />
//             </button>
//           )}
//           <Gift className="w-16 h-16 text-white mx-auto mb-3" />
//           <h2 className="text-2xl font-bold text-white">
//             {claimSuccess ? 'Successfully Claimed!' : 'Claim Free NFT'}
//           </h2>
//           <p className="text-white/80 text-sm mt-2">
//             {claimSuccess
//               ? 'You can now read this comic anytime!'
//               : 'Get your free comic NFT'}
//           </p>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Initial State - Show Claim Info */}
//           {!isClaiming && !claimSuccess && !claimError && (
//             <div className="space-y-4">
//               <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//                 <p className="text-white/60 text-xs mb-2">Comic:</p>
//                 <p className="text-white font-semibold">{comicTitle}</p>
//               </div>

//               <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
//                 <p className="text-green-300 text-sm text-center leading-relaxed">
//                   🎁 This comic is completely free! Claim your NFT to get permanent
//                   reading access. You'll only pay gas fees.
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={onClose}
//                   className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={onClaim}
//                   className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full font-semibold transition-all shadow-lg"
//                 >
//                   Claim Now
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Claiming In Progress */}
//           {isClaiming && !claimSuccess && !claimError && (
//             <div className="space-y-4">
//               <div className="flex items-center gap-3">
//                 <Loader2 className="w-6 h-6 text-blue-400 animate-spin flex-shrink-0" />
//                 <div className="flex-1">
//                   <p className="text-white text-sm font-medium mb-2">
//                     {claimProgress < 40
//                       ? 'Preparing transaction...'
//                       : claimProgress < 80
//                       ? 'Claiming NFT...'
//                       : 'Confirming on blockchain...'}
//                   </p>
//                   <div className="w-full bg-white/10 rounded-full h-2">
//                     <div
//                       className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
//                       style={{ width: `${claimProgress}%` }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white/5 rounded-lg p-4 border border-white/10">
//                 <p className="text-white/60 text-xs leading-relaxed">
//                   Please confirm the transaction in your wallet. This will claim your free
//                   NFT and grant you permanent access to read this comic.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Claim Success */}
//           {claimSuccess && (
//             <div className="text-center space-y-4">
//               <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
//               <div>
//                 <p className="text-white font-semibold mb-1">Congratulations!</p>
//                 <p className="text-white/60 text-sm">
//                   You've successfully claimed this comic NFT
//                 </p>
//               </div>

//               {transactionHash && (
//                 <a
//                   href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-400 hover:text-blue-300 text-xs underline inline-block"
//                 >
//                   View on HashScan
//                 </a>
//               )}

//               <p className="text-white/40 text-xs">
//                 Redirecting to comic reader...
//               </p>
//             </div>
//           )}

//           {/* Claim Error */}
//           {claimError && (
//             <div className="text-center space-y-4">
//               <XCircle className="w-16 h-16 text-red-400 mx-auto" />
//               <div>
//                 <p className="text-white font-semibold mb-1">Claim Failed</p>
//                 <p className="text-red-300 text-sm">{claimError.message}</p>
//               </div>
//               <button
//                 onClick={onClose}
//                 className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClaimModal;

'use client';

import React from 'react';
import { X, Gift, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  comicTitle: string;
  isClaiming: boolean;
  claimSuccess: boolean;
  claimError: Error | null;
  claimProgress: number;
  transactionHash?: string;
}

const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  onClaim,
  comicTitle,
  isClaiming,
  claimSuccess,
  claimError,
  claimProgress,
  transactionHash,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-orange-500/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-center relative">
          {!isClaiming && !claimSuccess && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
          <Gift className="w-16 h-16 text-white mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white">
            {claimSuccess ? 'Successfully Claimed!' : 'Claim Free NFT'}
          </h2>
          <p className="text-white/80 text-sm mt-2">
            {claimSuccess
              ? 'You can now read this comic anytime!'
              : 'Get your free comic NFT'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Initial State */}
          {!isClaiming && !claimSuccess && !claimError && (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-xs mb-2">Comic:</p>
                <p className="text-white font-semibold">{comicTitle}</p>
              </div>

              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-300 text-sm text-center leading-relaxed">
                  🎁 This comic is completely free! Claim your NFT to get permanent
                  reading access. You'll only pay gas fees.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={onClaim}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-full font-semibold transition-all shadow-lg"
                >
                  Claim Now
                </button>
              </div>
            </div>
          )}

          {/* Claiming In Progress */}
          {isClaiming && !claimSuccess && !claimError && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-2">
                    {claimProgress < 40
                      ? 'Preparing transaction...'
                      : claimProgress < 80
                      ? 'Claiming NFT...'
                      : 'Confirming on blockchain...'}
                  </p>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${claimProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-white/60 text-xs leading-relaxed">
                  Please confirm the transaction in your wallet. This will claim your free
                  NFT and grant you permanent access to read this comic.
                </p>
              </div>
            </div>
          )}

          {/* Claim Success */}
          {claimSuccess && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <div>
                <p className="text-white font-semibold mb-1">Congratulations!</p>
                <p className="text-white/60 text-sm">
                  You've successfully claimed this comic NFT
                </p>
              </div>

              {transactionHash && (
                <a
                  href={`https://hashscan.io/testnet/transaction/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline inline-block"
                >
                  View on HashScan
                </a>
              )}

              <p className="text-white/40 text-xs">
                Redirecting to comic reader...
              </p>
            </div>
          )}

          {/* Claim Error */}
          {claimError && (
            <div className="text-center space-y-4">
              <XCircle className="w-16 h-16 text-red-400 mx-auto" />
              <div>
                <p className="text-white font-semibold mb-1">Claim Failed</p>
                <p className="text-red-300 text-sm">{claimError.message}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimModal;