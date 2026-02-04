'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Components
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';

// Hooks
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';

// Redux
import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

// Assets
import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

// Types
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

import {useMintComic} from '@/hook/useMintComic';
import useComicPlatform from '@/hook/useMarkeplace';
import { useComicInscription } from '@/hook/useComicInscription';


interface ListViewProps {
    episodeTitle?: string;
    episodeImage?: string;
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
    listingIds?: string[];
    status: string;
}

// Constants
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
    episodeTitle = "Great Manga #2",
    episodeImage = "/api/placeholder/200/200",
    onCancel,
}) => {
    const router = useRouter();
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

    // Wallet connection
    const { account, signer } = useHederaWallet();

    const { user } = useAppSelector((state:any) => state.wallet);

    const {
        createComicCollection,
        createDirectListing
    } = useComicPlatform({
        accountId: account || user?.walletAddress || '',
        network: "testnet",
        signer: signer,
    });

    const {
        createInscription
    } = useComicInscription({
        accountId: account || user?.walletAddress || '',
        network: "testnet",
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
            const createCollectionResult = await createComicCollection({
                episodeId: episodeId,
                name: `${episodeData?.title || 'Unknown'} Collection`,
                symbol: flowData.rarity.type.toUpperCase().substring(0, 4),
                maxSupply: flowData.rarity.maxSupply,
            });

            console.log("✅ Collection created:", createCollectionResult);
            const nftTokenId = createCollectionResult.tokenId!;

            // Step 2: Mint NFTs
            const numberOfCopies = parseInt(flowData.listing.supply) || 1;
            const metadataURI = episodeData?.nftMetadataCid;
            const dbComicId = episodeData?._id || '';

            const inscriptionResult = await createInscription(metadataURI, dbComicId);
            console.log("✅ Inscription completed:", inscriptionResult);
            const topicId = inscriptionResult.topicId || '';
            console.log("🎉 Inscription Topic ID:", topicId);

            console.log(`🎨 Minting ${numberOfCopies} NFT(s)...`);
            const metadataHRL = `hcs://1/${topicId}`;
            // const metadataHRL = `https://gateway.pinata.cloud/ipfs/${metadataURI}`;
            console.log("Metadata HRL for minting:", metadataHRL);
            
            const mintAndListResult = await createDirectListing({
                episodeId: dbComicId,
                quantity: numberOfCopies,
                pricePerNFT: parseFloat(flowData.listing.price),
                metadata: metadataHRL
            });

            const serials: number[] = [];

            console.log("✅ NFTs minted:", mintAndListResult);

            const mintedData: MintResult = {
                tokenId: nftTokenId,
                status: mintAndListResult.status || '',
                serials: serials || [],
                transactionId: mintAndListResult.transactionId || "",
                listingIds: mintAndListResult.listingId ? [mintAndListResult.listingId] : [],

            };

            setMintedNFTs(mintedData);

            console.log("💾 Saving minted NFT data locally...", mintedData);
            // Save to localStorage for recovery
            localStorage.setItem('lastMintedNFT', JSON.stringify(mintedData));

            // Step 4: List each NFT for sale
            console.log("💰 Minted and Listed NFTs on marketplace Successfully");
            
            const priceInHbar = parseFloat(flowData.listing.price);

            // Save complete info to localStorage
            const completeInfo = {
                collection: {
                    tokenId: nftTokenId,
                    name: `${episodeData?.title || episodeTitle} Collection`,
                    symbol: flowData.rarity.type.toUpperCase().substring(0, 4),
                },
                minted: mintedData,
                listings: (mintedData.listingIds || []).map((listingId, index) => ({
                    listingId,
                    serial: mintedData.serials[index],
                    price: priceInHbar,
                })),
                metadata: {
                    cid: metadataURI,
                    comicId: episodeId,
                },
            };

            // Step 5: Update backend with token ID and listing info
            console.log("🔄 Updating backend with NFT details...");
            const updateResult = await dispatch(updateComicToken({
                comicId: episodeId,
                tokenId: nftTokenId,
                listingId: mintedData.listingIds[0] || '',
                price: priceInHbar,
                serial: mintedData?.serials[0] || 0,
                transactionId: mintedData.transactionId || '',
                metadataTopicIds: topicId,
                maxSupply: flowData.listing.supply,
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
        router.push('/marketplace');
    };

    const handleBackFromListing = () => setCurrentStep('rarity');
    const handleBackFromReview = () => setCurrentStep('listing');

    // Prepare review data
    const reviewData = {
        title: episodeData?.title || "",
        image: episodeData?.bannerImage || episodeImage,
        rarity: flowData.rarity || RARITY_OPTIONS.legendary,
        supply: flowData.listing?.supply?.split('–')[1]?.trim() || '5,000',
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
                    message="Creating your NFT collection and listing..." 
                    error={comicError}
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
                    onBackToCollection={() => {
                        router.back();
                    }}
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