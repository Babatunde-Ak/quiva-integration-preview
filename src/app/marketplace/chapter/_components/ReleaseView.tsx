// import React, { useState } from 'react';
// import Image from 'next/image';
// import { Minus, Plus } from 'lucide-react';

// const ReleaseView = () => {
//   const [mintAmount, setMintAmount] = useState(1);

//   const handleIncrement = () => setMintAmount(prev => Math.min(prev + 1, 10)); // Max 10 per tx
//   const handleDecrement = () => setMintAmount(prev => Math.max(prev - 1, 1));

//   return (
//     <div className="animate-fade-in-up space-y-6">
      
//       {/* 1. RELEASE SCHEDULE & MINTING BLOCK */}
//       <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
//         <h3 className="text-white/70 font-mono text-sm mb-6">Release Schedule</h3>

//         {/* Phase 1: FCFS + OG */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1A1A1A] pb-8">
//           <div className="space-y-1">
//             <h4 className="text-white font-bold text-lg">FCFS + OG Title Holders</h4>
//             <div className="flex items-center gap-3 text-sm">
//               <span className="font-bold text-xl text-white">100/100</span>
//               <span className="text-white/70 text-xs font-bold uppercase tracking-wider">| Limit 5 Episodes per wallet</span>
//             </div>
//             <p className="text-white/70 text-xs font-mono pt-1">Dec. 12, 2025 12:00PM UTC+1</p>
//           </div>

//           <div className="flex flex-col items-end gap-2">
//             <div className="text-right">
//               <span className="text-white/70 text-xs mr-2">Ends:</span>
//               <span className="text-white font-bold font-mono">02:19:08:12</span>
//             </div>
//             <div className="flex items-center gap-2 bg-[#1A0505] border border-red-900/30 px-3 py-1.5 rounded-full">
//               <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
//               <span className="text-red-500 text-xs font-bold uppercase">Sold Out</span>
//             </div>
//           </div>
//         </div>

//         {/* Phase 2: Public Mint */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
//           <div className="space-y-1">
//             <h4 className="text-white font-bold text-lg">Public Mint</h4>
//             <div className="flex items-center gap-3 text-sm">
//               <span className="font-bold text-xl text-white">28/100</span>
//             </div>
//             <p className="text-white/70 text-xs font-mono pt-1">Dec. 12, 2025 12:00PM UTC+1</p>
//           </div>

//           <div className="flex items-center gap-2 bg-[#051A05] border border-green-900/30 px-3 py-1.5 rounded-full">
//             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
//             <span className="text-green-500 text-xs font-bold uppercase">Minting now</span>
//           </div>
//         </div>

//         {/* Mint Actions Row */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          
//           {/* Price Info */}
//           <div className="space-y-4">
//             <div>
//                 <h4 className="text-white font-bold text-lg mb-1">Mint Fee</h4>
//               <div className="flex items-baseline gap-2">
//                 <span className="text-white/50 text-sm line-through decoration-white/50 decoration-2 flex items-center">
//                   FCFS price 0.09 <span className="text-[10px] ml-0.5">H</span>
//                 </span>
//                 <span className="text-2xl font-bold text-white flex items-center gap-1">
//                   0.19 
//                   <span className="flex items-center justify-center w-8 h-8 rounded">
//                      <Image src="/hbar.png" alt="H" width={20} height={20} />
//                   </span>
//                 </span>
//               </div>
//             </div>
//             <div>
//               <p className="text-white/70 text-xs font-bold mb-1">Protocol Fee</p>
//               <div className="flex items-center gap-1 text-white font-bold text-sm">
//                 0.19 
//                 <span className="flex items-center justify-center w-8 h-8 rounded">
//                     <Image src="/hbar.png" alt="H" width={20} height={20} />
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Controls & Button */}
//           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
//              {/* Counter */}
//              <div className="flex items-center justify-between bg-[#151515] rounded-lg border border-[#242424] p-1 w-full sm:w-32">
//                 <button 
//                   onClick={handleDecrement}
//                   className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-gray-400 text-white/70 hover:text-white transition-colors"
//                 >
//                   <Minus size={16} />
//                 </button>
//                 <span className="font-bold text-white">{mintAmount}</span>
//                 <button 
//                   onClick={handleIncrement}
//                   className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-white/70 hover:text-white transition-colors"
//                 >
//                   <Plus size={16} />
//                 </button>
//              </div>

//              {/* Mint Button */}
//              <button className="flex-1 sm:w-48 bg-[#FF9F1C] hover:bg-[#FFB045] text-black font-bold py-3 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20">
//                Mint
//              </button>
//           </div>

//         </div>
//       </div>

//       {/* 2. EPISODE INFO BLOCK */}
//       <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
//         <h3 className="text-white font-mono text-lg font-bold mb-6">
//           S1:Ep1 “Episode 1: The Last Air bender”
//         </h3>
//         <p className="text-white/70 font-mono text-sm leading-relaxed max-w-4xl">
//           Avatar: The Last Airbender is a legendary comic collection that follows the journey of balance, destiny, and mastery of the elements. Explore iconic moments, timeless characters, and stories that shaped an entire generation—now preserved as digital collectibles. Read, collect, and mint pieces from the Avatar universe while building your streaks and earning rewards along the way.
//         </p>
//       </div>

//     </div>
//   );
// };

// export default ReleaseView;
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Currency, Minus, Plus } from 'lucide-react';
import { useMirrorNodeQueries } from '@/hook/useMirrorNodeQueries';
import useWagmiMarketplace, { CampaignType } from '@/hook/useWagmiMarketplace';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getComicById } from '@/redux/slices/comicSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import MintSuccessModal from '@/components/modals/MintSuccessModal';
import { createTransaction } from '@/redux/slices/transactionSlice';

interface ReleaseViewProps {
  comicId?: string | null;
}

const ReleaseView: React.FC<ReleaseViewProps> = ({ comicId }) => {
  const [mintAmount, setMintAmount] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [currentPhaseData, setCurrentPhaseData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastMintedQuantity, setLastMintedQuantity] = useState(0);

  const router = useRouter();
  // Accept comicId as prop, fallback to searchParams if not provided
  const searchParams = useSearchParams();
  const urlComicId = searchParams.get('id');
  const effectiveComicId = comicId || urlComicId;

  const { account, signer, isConnected } = useHederaWallet();
  const { user } = useAppSelector((state: any) => state.wallet);
  const { currentComic } = useAppSelector((state: any) => state.comic);
  const dispatch = useAppDispatch();

  // Mirror Node queries
  const {
    campaign,
    fetchCampaign,
    currentPhase,
    fetchCurrentPhase,
  } = useMirrorNodeQueries();

  // Smart contract functions
  const {
    mintFromCampaign,
    status,
    error: txError,
  } = useWagmiMarketplace();

  // Fetch campaign data when component mounts or comic changes
  useEffect(() => {
    const loadCampaignData = async () => {
      // FIXED: Check if campaignId exists and is not null/empty
      const campaignId = currentComic?.nftId?.campaignId;
      
      if (!campaignId || campaignId === null || campaignId === '') {
        console.log('📊 No campaignId found for this comic');
        setCampaignData(null);
        return;
      }

      try {
        console.log('📊 Fetching campaign data for ID:', campaignId);
        
        // Fetch campaign info
        const campaignInfo = await fetchCampaign(parseInt(campaignId));
        setCampaignData(campaignInfo);
        
        // If it's a scheduled campaign, fetch current phase
        if (campaignInfo?.campaignType === CampaignType.SCHEDULED) {
          const phase = await fetchCurrentPhase(parseInt(campaignId));
          setCurrentPhaseData(phase);
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setCampaignData(null);
      }
    };

    if (currentComic) {
      loadCampaignData();
    }
  }, [currentComic, fetchCampaign, fetchCurrentPhase]);

  const handleIncrement = () => {
    const maxPerWallet = campaignData ? parseInt(campaignData.maxSupply) : 10;
    setMintAmount(prev => Math.min(prev + 1, maxPerWallet));
  };
  
  const handleDecrement = () => setMintAmount(prev => Math.max(prev - 1, 1));

  // Handle minting from campaign
  const handleMint = async () => {
    if (!campaignData || !isConnected) {
      console.error('Missing campaign data or wallet not connected');
      return;
    }

    setIsPurchasing(true);

    try {
      console.log('🎨 Minting from campaign...');
      console.log('Campaign ID:', currentComic.nftId.campaignId);
      console.log('Quantity:', mintAmount);
      console.log('Price per NFT:', campaignData.mintPrice);

      const phaseId = currentPhaseData?.phaseId || 0;

      const result = await mintFromCampaign({
        campaignId: parseInt(currentComic.nftId.campaignId),
        phaseId: phaseId,
        quantity: mintAmount,
        mintPrice: parseFloat(campaignData.mintPrice),
      });

      console.log('✅ Mint successful:', result);
       const tx =   await dispatch(createTransaction({
            comicId: comicId,
            walletAddress: account || user?.walletAddress || '',
            txHash: result.transactionId,
            price: currentComic?.nftId?.price || 0,
            currency: 'HBAR',
          } as any));
          console.log("Update to Backend", tx);
      // const transactionDispatch = await dispatch(createTransaction(
      //   comicId: currentComic._id,
      //   walletAddress: account || user?.walletAddress || '',
      //   txHash: result.transactionId,
      //   price: (parseFloat(campaignData.mintPrice) * mintAmount).toString(),
      //   currency: 'HBAR'
      // ) as any);
      //  console.log('Transaction recorded in Redux:', transactionDispatch);
      // Store the minted quantity and show success modal
      setLastMintedQuantity(mintAmount);
      setShowSuccessModal(true);
      
      // Refresh campaign data after minting
      await fetchCampaign(parseInt(currentComic.nftId.campaignId));
      
      // 🔄 IMPORTANT: Refresh currentComic Redux state so ComicsView refetches NFTs from Mirror Node
      if (effectiveComicId) {
        console.log('🔄 Refreshing currentComic state to trigger NFT refetch in ComicsView...');
        await dispatch(getComicById({id: effectiveComicId} as any)).unwrap();
      }
      
      // Reset mint amount for next mint
      setMintAmount(1);

    } catch (error: any) {
      console.error('❌ Mint failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle mint more button
  const handleMintMore = () => {
    setShowSuccessModal(false);
    // Mint amount is already reset to 1
    setMintAmount(1);
  };

  // Handle read comic button
  const handleReadComic = () => {
    setShowSuccessModal(false);
    // Navigate to the comic reader
    router.push(`/reader?id=${comicId}`);
  };

  // Get campaign type label
  const getCampaignTypeLabel = (type: number): string => {
    switch (type) {
      case CampaignType.PUBLIC:
        return 'Public Mint';
      case CampaignType.WHITELIST:
        return 'Whitelist Only';
      case CampaignType.SCHEDULED:
        return 'Scheduled Phases';
      default:
        return 'Unknown';
    }
  };

  // Calculate remaining supply
  const hasCampaignId = currentComic?.nftId?.campaignId && 
    currentComic.nftId.campaignId !== null && 
    currentComic.nftId.campaignId !== '' &&
    currentComic.nftId.campaignType !== 'direct_listing';

  const remainingSupply = campaignData
    ? Math.max(0, parseInt(campaignData.maxSupply || '0') - parseInt(campaignData.totalMinted || '0'))
    : Number(currentComic?.nftId?.maxSupply || 0);

  // Check if campaign is active
  const isCampaignActive = campaignData?.isActive || false;
  const isSoldOut = hasCampaignId ? remainingSupply <= 0 : false;

  // Loading state
  if (campaign.isLoading) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white/60">Loading campaign data...</p>
          </div>
        </div>
      </div>
    );
  }

  // No campaign ID found
  if (!hasCampaignId) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
          <div className="text-center py-12">
            <p className="text-white/70 text-lg mb-4">No active campaign for this comic</p>
            <p className="text-white/50 text-sm mb-6">
              This comic may be available for purchase in the Comics tab
            </p>
            <button
              onClick={() => router.push(`/marketplace?id=${comicId}&tab=comics`)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Go to Comics Tab
            </button>
          </div>
        </div>

        {/* Debug Info
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-yellow-500/30">
            <p className="text-yellow-500 font-mono text-xs mb-2">Debug Info:</p>
            <pre className="text-white/50 text-xs overflow-auto">
              {JSON.stringify({
                comicId: currentComic?._id,
                listingId: currentComic?.nftId?.listingId,
                campaignId: currentComic?.nftId?.campaignId,
                campaignType: currentComic?.nftId?.campaignType,
                hasCampaignId,
              }, null, 2)}
            </pre>
          </div>
        )} */}
      </div>
    );
  }

  // Campaign ID exists but data failed to load
  if (!campaignData && !campaign.isLoading && hasCampaignId) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-red-900/30">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg mb-2">Error loading campaign</p>
            <p className="text-white/50 text-sm mb-4">
              {campaign.error || 'Failed to fetch campaign data from blockchain'}
            </p>
            <button
              onClick={() => fetchCampaign(parseInt(currentComic.nftId.campaignId))}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* RELEASE SCHEDULE & MINTING BLOCK */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
        <h3 className="text-white/70 font-mono text-sm mb-6">Release Schedule</h3>

        {/* Campaign Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="space-y-1">
            <h4 className="text-white font-bold text-lg">
              {getCampaignTypeLabel(campaignData.campaignType)}
            </h4>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-xl text-white">
                {campaignData.totalMinted}/{campaignData.maxSupply}
              </span>
              <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
                | {remainingSupply} Available
              </span>
            </div>
            {currentPhaseData && (
              <p className="text-white/70 text-xs font-mono pt-1">
                Current Phase: {currentPhaseData.phaseId}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div>
            {isSoldOut ? (
              <div className="flex items-center gap-2 bg-[#1A0505] border border-red-900/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span className="text-red-500 text-xs font-bold uppercase">Sold Out</span>
              </div>
            ) : isCampaignActive ? (
              <div className="flex items-center gap-2 bg-[#051A05] border border-green-900/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-500 text-xs font-bold uppercase">Minting now</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#1A1A05] border border-yellow-900/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-yellow-500 text-xs font-bold uppercase">Paused</span>
              </div>
            )}
          </div>
        </div>

        {/* Mint Actions Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
          
          {/* Price Info */}
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-bold text-lg mb-1">Mint Price</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white flex items-center gap-1">
                  {campaignData.mintPrice}
                  <span className="flex items-center justify-center w-8 h-8 rounded">
                    <Image src="/hbar.png" alt="H" width={20} height={20} />
                  </span>
                </span>
              </div>
            </div>
            <div>
              <p className="text-white/70 text-xs font-bold mb-1">Total Cost</p>
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                {(parseFloat(campaignData.mintPrice) * mintAmount).toFixed(2)}
                <span className="flex items-center justify-center w-8 h-8 rounded">
                  <Image src="/hbar.png" alt="H" width={20} height={20} />
                </span>
              </div>
            </div>
          </div>

          {/* Controls & Button */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Counter */}
            <div className="flex items-center justify-between bg-[#151515] rounded-lg border border-[#242424] p-1 w-full sm:w-32">
              <button 
                onClick={handleDecrement}
                disabled={mintAmount <= 1}
                className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-gray-400 text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-white">{mintAmount}</span>
              <button 
                onClick={handleIncrement}
                disabled={mintAmount >= remainingSupply}
                className="w-10 h-10 flex items-center justify-center hover:bg-[#242424] rounded text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Mint Button */}
            <button 
              onClick={handleMint}
              disabled={!isConnected || isPurchasing || !isCampaignActive || isSoldOut || status === 'processing'}
              className="flex-1 sm:w-48 bg-[#FF9F1C] hover:bg-[#FFB045] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 px-8 rounded-full transition-all active:scale-95 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              {isPurchasing || status === 'processing' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Minting...</span>
                </>
              ) : !isConnected ? (
                'Connect Wallet'
              ) : isSoldOut ? (
                'Sold Out'
              ) : !isCampaignActive ? (
                'Campaign Paused'
              ) : (
                'Mint'
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {txError && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-500 text-sm">{txError}</p>
          </div>
        )}

        {/* Wallet Connection Warning */}
        {!isConnected && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
            <p className="text-yellow-500 text-sm">
              ⚠️ Please connect your wallet to participate in this campaign
            </p>
          </div>
        )}
      </div>

      {/* EPISODE INFO BLOCK */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 md:p-8 border border-[#242424]">
        <h3 className="text-white font-mono text-lg font-bold mb-6">
          {currentComic?.title || "Episode Title"}
        </h3>
        <p className="text-white/70 font-mono text-sm leading-relaxed max-w-4xl">
          {currentComic?.description || "This comic is part of an exclusive campaign. Mint your copy now while supplies last!"}
        </p>

        {/* Campaign Details */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#151515] rounded-lg p-4 border border-[#242424]">
            <p className="text-white/50 text-xs mb-1">Campaign Type</p>
            <p className="text-white font-bold text-sm">
              {getCampaignTypeLabel(campaignData.campaignType)}
            </p>
          </div>
          <div className="bg-[#151515] rounded-lg p-4 border border-[#242424]">
            <p className="text-white/50 text-xs mb-1">Total Supply</p>
            <p className="text-white font-bold text-sm">{campaignData.maxSupply}</p>
          </div>
          <div className="bg-[#151515] rounded-lg p-4 border border-[#242424]">
            <p className="text-white/50 text-xs mb-1">Minted</p>
            <p className="text-white font-bold text-sm">{campaignData.totalMinted}</p>
          </div>
          <div className="bg-[#151515] rounded-lg p-4 border border-[#242424]">
            <p className="text-white/50 text-xs mb-1">Price</p>
            <p className="text-white font-bold text-sm flex items-center gap-1">
              {campaignData.mintPrice}
              <Image src="/hbar.png" alt="H" width={14} height={14} />
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-yellow-500/30">
          <p className="text-yellow-500 font-mono text-xs mb-2">Debug Info:</p>
          <pre className="text-white/50 text-xs overflow-auto">
            {JSON.stringify({
              campaignId: currentComic?.nftId?.campaignId,
              campaignType: campaignData?.campaignType,
              isActive: campaignData?.isActive,
              remaining: remainingSupply,
              currentPhase: currentPhaseData?.phaseId,
              hasCampaignId,
            }, null, 2)}
          </pre>
        </div>
      )}

      {/* Mint Success Modal */}
      <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onMintMore={handleMintMore}
        onReadComic={handleReadComic}
        comicTitle={currentComic?.title || "Comic"}
        comicImage={currentComic?.bannerImage || "/dev_images/avatar-2.png"}
        mintedQuantity={lastMintedQuantity}
        totalMinted={campaignData?.totalMinted || 0}
      />
    </div>
  );
};

export default ReleaseView;