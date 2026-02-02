'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

// Components
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';

// Hooks
import { useNFTMarketplace } from '@/hook/useMarkeplace';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';

// Redux
import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

// Assets
import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

// Types
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

interface ListViewProps {
    episodeTitle?: string;
    episodeImage?: string;
    onComplete?: () => void;
    onCancel?: () => void;
}

interface RarityOption {
    name: string;
    type: 'legendary' | 'epic' | 'common';
    supply: string;
    maxSupply: number;
    icon: React.ReactNode;
}

interface ListingData {
    supply: string;
    price: string;
    royalty: string;
}

interface FlowData {
    rarity: RarityOption | null;
    listing: ListingData | null;
}

interface MintResult {
    tokenId: string;
    serials: number[];
    transactionId: string;
}

// Constants
const MARKETPLACE_CONTRACT_ID = "0.0.7750266";
const NETWORK = "testnet";
const AUTO_RENEW_PERIOD = 7000000; // ~81 days

const RARITY_OPTIONS: Record<string, RarityOption> = {
    legendary: {
        name: 'Legendary',
        type: 'legendary',
        supply: 'Supply 1 – 5,000',
        maxSupply: 5000,
        icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover" />
    },
    epic: {
        name: 'Epic',
        type: 'epic',
        supply: 'Supply 1 – 8,000',
        maxSupply: 8000,
        icon: <Image src={sportsMedal} alt="epic" className="w-6 h-6 object-cover" />
    },
    common: {
        name: 'Common',
        type: 'common',
        supply: 'Infinite',
        maxSupply: 1000000,
        icon: <Image src={sportsMedal} alt="common" className="w-6 h-6 object-cover" />
    }
};

const ListView: React.FC<ListViewProps> = ({
    episodeTitle = "Elipsis #2",
    episodeImage = "/api/placeholder/200/200",
    onComplete,
    onCancel,
}) => {
    const params = useParams();
    const dispatch = useAppDispatch();
    const episodeId = params.episode as string;

    // State
    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });
    const [isProcessing, setIsProcessing] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState<MintResult | null>(null);
    const [episodeData, setEpisodeData] = useState<any>(null);

    // Redux state
    const { loading, error: comicError } = useAppSelector((state: any) => state.comic);
    const { user } = useAppSelector((state: any) => state.wallet);

    // Wallet connection
    const { account, signer } = useHederaWallet();

    // NFT Marketplace hook
    const {
        createCollection,
        createComicNFT,
        batchListNFTs,
        status,
        error
    } = useNFTMarketplace({
        accountId: account || user?.walletAddress || '',
        network: NETWORK,
        marketplaceContractId: MARKETPLACE_CONTRACT_ID,
        signer: signer,
    });

    // Fetch episode data on mount
    useEffect(() => {
        const fetchEpisode = async () => {
            const result = await dispatch(getComicById({ id: episodeId } as any));
            if (result.payload) {
                setEpisodeData(result.payload?.data?.comic);
                console.log("Episode data loaded:", result.payload?.data?.comic);
            }
        };

        if (episodeId) {
            fetchEpisode();
        }
    }, [episodeId, dispatch]);

    // Step handlers
    const handleRaritySelect = (selectedRarity: string) => {
        const rarity = RARITY_OPTIONS[selectedRarity];
        setFlowData(prev => ({ ...prev, rarity }));
        setCurrentStep('listing');
    };

    const handleListingDetails = (listingData: ListingData) => {
        setFlowData(prev => ({ ...prev, listing: listingData }));
        setCurrentStep('review');
    };

    const handleReviewComplete = async () => {
        if (!flowData.listing || !flowData.rarity || !episodeData) {
            console.error("Missing required data");
            return;
        }

        setIsProcessing(true);

        try {
            console.log("🚀 Starting NFT creation and listing process...");

            // Step 1: Create Collection
            console.log("📝 Creating NFT collection...");
            const createCollectionResult = await createCollection({
                name: `${episodeData.title} Collection`,
                symbol: flowData.rarity.type.toUpperCase().substring(0, 4),
                memo: `${flowData.rarity.name} rarity comic collection`,
                maxSupply: flowData.rarity.maxSupply,
                autoRenewPeriod: AUTO_RENEW_PERIOD,
            });

            console.log("✅ Collection created:", createCollectionResult);
            const nftTokenId = createCollectionResult.tokenId!;

            // Step 2: Mint NFTs
            const numberOfCopies = parseInt(flowData.listing.supply) || 1;
            const metadataURI = episodeData?.nftMetadataCid;
            const dbComicId = episodeData?._id || '';

            console.log(`🎨 Minting ${numberOfCopies} NFT(s)...`);
            const mintResult = await createComicNFT({
                tokenId: nftTokenId,
                metadata: metadataURI,
                copies: numberOfCopies,
                dbComicId: dbComicId
            });

            console.log("✅ NFTs minted:", mintResult);

            const mintedData: MintResult = {
                tokenId: nftTokenId,
                serials: mintResult.serials || [],
                transactionId: mintResult.transactionId || "",
            };

            setMintedNFTs(mintedData);

            // Step 3: List NFTs on marketplace
            console.log("💰 Listing NFTs on marketplace...");
            const priceInHbar = parseFloat(flowData.listing.price);

            const listingPromises = mintedData.serials.map(serial =>
                batchListNFTs({
                    tokenId: nftTokenId,
                    serialNumbers: [serial],
                    priceInHbar: priceInHbar,
                })
            );

            const listingResults = await Promise.all(listingPromises);
            console.log("✅ All NFTs listed:", listingResults);

            // Step 4: Update backend
            const updateResult = await dispatch(updateComicToken({
                tokenId: nftTokenId,
                listingId: listingResults[0].listingIds[0],
                price: priceInHbar,
                serial: mintedData.serials[0],
                transactionId: mintedData.transactionId,
                metadataTopicIds: episodeData?.nftMetadataCid
            } as any));

            console.log("✅ Backend updated:", updateResult);
            console.log("✅ Complete NFT creation and listing successful!");

            setCurrentStep('success');

        } catch (error) {
            console.error("❌ Error in NFT creation/listing process:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Navigation handlers
    const handleSuccessComplete = () => {
        onComplete?.();
    };

    const handleBackFromListing = () => setCurrentStep('rarity');
    const handleBackFromReview = () => setCurrentStep('listing');

    // Prepare review data
    const reviewData = {
        title: episodeData?.title || "",
        image: episodeData?.bannerImage || episodeImage,
        rarity: flowData.rarity || RARITY_OPTIONS.legendary,
        supply: flowData.rarity?.supply?.split('–')[1]?.trim() || '5,000',
        price: flowData.listing?.price ? `${flowData.listing.price} HBAR` : '12 HBAR',
        royalty: flowData.listing?.royalty ? `${flowData.listing.royalty}%` : '5%'
    };

    return (
        <div className="relative">
            {/* Data Loading Overlay */}
            {loading && !episodeData && (
                <LoadingOverlay message="Retrieving episode details, please wait..." />
            )}

            {/* Error Overlay */}
            {comicError && (
                <ErrorOverlay message={comicError} />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <LoadingOverlay 
                    message={status === 'processing' 
                        ? 'Creating your NFT collection and listing...' 
                        : 'Please wait...'}
                    error={error}
                />
            )}

            {/* Rarity Selection Step */}
            {currentStep === 'rarity' && (
                <EpisodeRarity
                    episodeTitle={episodeData?.title || episodeTitle}
                    onBack={onCancel}
                    onCancel={onCancel}
                    onContinue={handleRaritySelect}
                />
            )}

            {/* Listing Details Step */}
            {currentStep === 'listing' && (
                <ListingDetails
                    selectedRarity={flowData.rarity}
                    onBack={handleBackFromListing}
                    onNext={handleListingDetails}
                />
            )}

            {/* Review Details Step */}
            {currentStep === 'review' && (
                <ReviewDetails
                    episodeData={reviewData}
                    onBack={handleBackFromReview}
                    onList={handleReviewComplete}
                />
            )}

            {/* Success Modal */}
            {currentStep === 'success' && mintedNFTs && (
                <ListingSuccessModal
                    episodeTitle={episodeData?.title || episodeTitle}
                    onBackToCollection={handleSuccessComplete}
                    onViewListing={handleSuccessComplete}
                    isOpen={true}
                    nftInfo={{
                        tokenId: mintedNFTs.tokenId,
                        serialNumber: mintedNFTs.serials[0],
                        transactionId: mintedNFTs.transactionId,
                    }}
                />
            )}
        </div>
    );
};

// Helper Components
const LoadingOverlay: React.FC<{ message: string; error?: string }> = ({ message, error }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Processing...</h3>
                <p className="text-gray-600">{message}</p>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
        </div>
    </div>
);

const ErrorOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="text-center">
                <p className="text-red-600">{message}</p>
            </div>
        </div>
    </div>
);

export default ListView;