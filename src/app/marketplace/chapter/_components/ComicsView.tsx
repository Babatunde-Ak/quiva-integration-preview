import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, ChevronDown, Gift, AlertCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hook';
import { useRouter } from 'next/navigation';
import useMirrorNodeQueries from '@/hook/useMirrorNodeQueries';
import { useHederaWallet } from '@/providers/HashPackProvider';

interface ComicsViewProps {
  comicId?: string | null;
}

interface MintedNFT {
  id: string;
  serialNumber: number;
  owner: string; 
  metadata: any; 
  tokenId: string;
}

const ComicsView: React.FC<ComicsViewProps> = ({ comicId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent');
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(false);
  const [errorLoadingNFTs, setErrorLoadingNFTs] = useState<string | null>(null);
  const [directListingMintedCount, setDirectListingMintedCount] = useState(0);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { account } = useHederaWallet();
  const { user } = useAppSelector((state: any) => state.wallet);
  const { currentComic, isLoad } = useAppSelector((state: any) => state.comic);

  // Get Mirror Node queries
  const { fetchAllTokenNfts } = useMirrorNodeQueries();

  // Fetch minted NFTs for the current campaign
  useEffect(() => {
    const loadMintedNFTs = async () => {
      // Only fetch if this comic has a campaign
      const hasCampaignId = currentComic?.nftId?.campaignId && 
                           currentComic.nftId.campaignId !== null && 
                           currentComic.nftId.campaignId !== '' &&
                           currentComic.nftId.campaignType !== 'direct_listing';
      
      if (!hasCampaignId) {
        console.log('🚫 Comics tab - No campaign:', { hasCampaignId });
        setMintedNFTs([]);
        return;
      }

      setIsLoadingNFTs(true);
      setErrorLoadingNFTs(null);

      try {
        const campaignId = currentComic.nftId.campaignId;
        const tokenId = currentComic.nftId.tokenId; // Token ID should be in NFT metadata
        
        console.log('🔍 Comics tab - Current comic data:', {
          campaignId,
          tokenId,
          title: currentComic.title,
        });
        
        if (!tokenId) {
          console.warn('⚠️ No tokenId found in comic NFT data. The backend needs to return nftId.tokenId');
          setErrorLoadingNFTs('Token ID not available for this campaign');
          setMintedNFTs([]);
          return;
        }

        console.log('📡 Fetching ALL NFTs for token:', tokenId, '(all owners)');
        
        // Fetch all NFTs for this token (not just current account)
        const nftsData = await fetchAllTokenNfts(tokenId);
        
        console.log('📦 Raw NFTs response:', nftsData);
        console.log('📊 Response type:', typeof nftsData);
        console.log('📊 Response keys:', nftsData ? Object.keys(nftsData) : 'null');
        
        // Handle both array and object-with-nfts-array responses
        let nftsList: any[] = [];
        if (Array.isArray(nftsData)) {
          console.log('✅ Response is array with', nftsData.length, 'items');
          nftsList = nftsData;
        } else if (nftsData?.nfts && Array.isArray(nftsData.nfts)) {
          console.log('✅ Response has nfts property with', nftsData.nfts.length, 'items');
          nftsList = nftsData.nfts;
        } else {
          console.warn('⚠️ Unexpected NFTs response format:', nftsData);
          nftsList = [];
        }
        
        if (nftsList.length > 0) {
          // Map the NFT data to our format
          const formattedNFTs: MintedNFT[] = nftsList.map((nft: any) => ({
            id: `${nft.token_id}-${nft.serial_number}`,
            serialNumber: nft.serial_number,
            owner: nft.account_id,
            metadata: nft.metadata || {},
            tokenId: nft.token_id,
          }));
          
          console.log('✅ Formatted NFTs:', formattedNFTs);
          setMintedNFTs(formattedNFTs);
        } else {
          console.log('ℹ️ No NFTs minted yet for this campaign');
          setMintedNFTs([]);
        }
      } catch (error: any) {
        console.error('❌ Error loading minted NFTs:', error);
        setErrorLoadingNFTs(error.message || 'Failed to load minted NFTs');
        setMintedNFTs([]);
      } finally {
        setIsLoadingNFTs(false);
      }
    };

    if (currentComic) {
      loadMintedNFTs();
    }
  }, [currentComic, fetchAllTokenNfts]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'recent' ? 'oldest' : 'recent');
  };

  // Filter NFTs based on search
  const filteredNFTs = mintedNFTs.filter(nft =>
    currentComic?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.serialNumber.toString().includes(searchQuery)
  );

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    return sortOrder === 'recent' 
      ? b.serialNumber - a.serialNumber 
      : a.serialNumber - b.serialNumber;
  });

  // Check if this comic has a campaign
  const hasCampaignId = currentComic?.nftId?.campaignId && 
                       currentComic.nftId.campaignId !== null && 
                       currentComic.nftId.campaignId !== '' &&
                       currentComic.nftId.campaignType !== 'direct_listing';
                       
  
  // Check if this comic has a direct listing
  const hasDirectListing = currentComic?.nftId?.listingId && 
                          currentComic.nftId.listingId !== null && 
                          currentComic.nftId.listingId !== '' &&
                          currentComic.nftId.campaignType === 'direct_listing';

  // Handle direct listing card display
  if (hasDirectListing && !hasCampaignId) {
    // 🎯 For direct listings: Only show RESALE listings (secondary market)
    // Don't show the creator's initial direct listing card here
    // This tab is for secondary market (user resales) only
    
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <Gift className="w-12 h-12 text-orange-500/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Resales Yet</h3>
          <p className="text-white/60 mb-6">No one has listed this comic for resale on the secondary market yet</p>
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-[#FF9F1C] hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Explore Other Comics
          </button>
        </div>
      </div>
    );
  }

  // No campaign and no direct listing
  if (!hasCampaignId && !hasDirectListing) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Campaign or Listing Found</h3>
          <p className="text-white/60 mb-4">This comic doesn&apos;t have an active campaign or direct listing</p>
        </div>
      </div>
    );
  }

  if (isLoadingNFTs) {
    return (
      <div className="animate-fade-in-up flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading your minted NFTs...</p>
        </div>
      </div>
    );
  }

  if (errorLoadingNFTs) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-red-900/30">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error Loading NFTs</p>
            <p className="text-white/60 text-sm mb-4">{errorLoadingNFTs}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No NFTs minted yet
  if (sortedNFTs.length === 0) {
    return (
      <div className="animate-fade-in-up">
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#242424] text-center">
          <Gift className="w-12 h-12 text-orange-500/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No NFTs Minted Yet</h3>
          <p className="text-white/60 mb-6">No one has minted NFTs from this campaign yet</p>
          <button
            onClick={() => router.push(`/marketplace/chapter?id=${comicId}&tab=release`)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Go to Release Tab to Mint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-xl font-bold">
          {sortedNFTs.length} NFT{sortedNFTs.length !== 1 ? 's' : ''} Minted from Campaign
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative group w-full md:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search serial number" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0A0A0A] placeholder:text-gray-500 border border-[#242424] rounded-full pl-10 pr-4 py-2.5 text-sm text-white w-full md:w-64 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300"
            />
          </div>

          {/* Sort Button */}
          <button 
            onClick={toggleSortOrder}
            className="flex items-center justify-center gap-2 bg-[#0A0A0A] border border-[#242424] rounded-full px-4 py-2.5 text-sm font-medium hover:border-gray-600 hover:bg-gray-800 active:scale-95 transition-all w-full sm:w-auto"
          >
            Sort {sortOrder === 'recent' ? 'Recent' : 'Oldest'}
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNFTs.map((nft) => (
          <div 
            key={nft.id}
            className="bg-[#0A0A0A] rounded-2xl overflow-hidden border border-[#242424] hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,159,28,0.15)]"
          >
            {/* Comic Image */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden">
              <Image 
                src={currentComic?.bannerImage || "/dev_images/avatar-2.png"} 
                alt={`${currentComic?.title || 'Comic'} #${nft.serialNumber}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
              {/* Serial Badge */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-orange-500/50">
                <p className="text-orange-400 font-bold text-sm">#{nft.serialNumber}</p>
              </div>
              {/* Owner Badge */}
              <div className="absolute bottom-3 left-3 bg-blue-500/20 border border-blue-500/50 rounded-lg px-2 py-1 backdrop-blur-sm">
                <p className="text-blue-300 font-bold text-xs">{nft.owner.slice(0, 6)}...</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h4 className="font-bold text-lg mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">
                {currentComic?.title || 'Comic Edition'}
              </h4>
              
              {/* NFT Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Serial:</span>
                  <span className="text-white font-bold">#{nft.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Owner:</span>
                  <span className="text-blue-300 font-mono text-xs">{nft.owner.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Status:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-bold">
                      {/* {currentComic?.price || '30'} */}
                      Live 
                    </span>
                    <div className="w-4 h-4 bg-gradient rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🔥</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/reader/${comicId}`)}
                  className="w-full bg-[#FF9F1C] hover:bg-[#FFB045] text-black font-bold py-2.5 px-4 rounded-full transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {/* <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center"> */}
                  {currentComic.nftId.price || '30'} <Image src="/hbar.png" alt="HBAR" width={16} height={16} /> 
                  {/* </div> */}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info (Development)
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 bg-[#0A0A0A] rounded-lg p-4 border border-yellow-500/30">
          <p className="text-yellow-500 font-mono text-xs mb-2">Debug: Minted NFTs</p>
          <pre className="text-white/50 text-xs overflow-auto max-h-40">
            {JSON.stringify({
              nftCount: sortedNFTs.length,
              campaignId: currentComic?.nftId?.campaignId,
              tokenId: currentComic?.nftId?.tokenId,
              accountId: account,
            }, null, 2)}
          </pre>
        </div>
      )} */}

      {/* Mint Modals */}
      {/* <MintConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmMint}
        comicTitle={currentComic?.title || 'Comic'}
        coverImage={currentComic?.bannerImage || '/dev_images/avatar-2.png'}
        price={String(currentComic?.nftId?.price ?? 0)}
        walletAddress={account || ''}
        edition={`1 of ${currentComic?.nftId?.maxSupply ?? 0}`}
      /> */}
      {/* <MintProcessingModal
        isOpen={showProcessingModal}
        transactionHash={transactionHash}
      /> */}
      {/* <MintSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewComic={handleViewComic}
        comicTitle={currentComic?.title || 'Comic'}
        coverImage={currentComic?.bannerImage || '/dev_images/avatar-2.png'}
        editionNumber={editionNumber}
        transactionHash={transactionHash}
        price={String(currentComic?.nftId?.price ?? 0)}
      /> */}

    </div>
  );
};

export default ComicsView;
