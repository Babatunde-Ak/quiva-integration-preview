'use client';

import React, {useEffect, useState} from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';
import Image from 'next/image';
import {crownIcon, sportsMedal} from '../../../../../public/dev_images';

import { useNFTMarketplace } from '@/hook/useMarkeplace';
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

import {useListComic} from '@/hook/useListComic';
import {useMintComic} from '@/hook/useMintComic';
import {useAppSelector} from '@/redux/hook';
import {useHederaWallet} from '@/providers/HashPackProvider';
import { useParams, useRouter } from 'next/navigation';

interface ListViewProps {
    episodeTitle?: string;
    episodeImage?: string;
    tokenId?: string;
    serials?: number[];
    topicId?: string;
    fullMetadataURI?: string;
    royaltyRecipient?: string;
    onComplete?: () => void;
    onCancel?: () => void;
}

interface FlowData {
    rarity : {
        name: string;
        type: 'legendary' | 'epic' | 'common';
        supply: string;
        maxSupply: number; // Added for actual supply number
        icon: React.ReactNode;
    } | null;
    listing : {
        sales: string;
        price: string;
        royalty: string;
    } | null;
}

interface MintResult {
    tokenId: string;
    serials: number[];
    transactionId: string;
}

const ListView : React.FC < ListViewProps > = ({
    episodeTitle = "Elipsis #2",
    episodeImage = "/api/placeholder/200/200",
    tokenId,
    serials,
    topicId,
    fullMetadataURI,
    royaltyRecipient,
    onComplete,
    onCancel,
}) => {
    const router = useRouter();
    const params = useParams();
    const episodeId = params.episode

    const [currentStep,
        setCurrentStep] = useState < FlowStep > ('rarity');
    const [flowData,
        setFlowData] = useState < FlowData > ({rarity: null, listing: null});
    const [isProcessing, setIsProcessing] = useState(false);
    const [metadataCid, setMetadataCid] = useState<string>('');
    const [comicId, setComicId] = useState<string>('');
    const [collectionTokenId, setCollectionTokenId] = useState<string>(''); // Store created collection
    const [mintedNFTs, setMintedNFTs] = useState<MintResult | null>(null); // Store minted NFT info

    const { 
        account,
        isConnected, 
        // connector,
        provider,
        signer,
        connectWallet 
    } = useHederaWallet();

    const { user } = useAppSelector((state:any) => state.wallet);
    
    const { 
        listNFT,
        createCollection,
        createComicNFT,
        batchListNFTs,
        status, 
        error 
    } = useNFTMarketplace({
        accountId: account || user?.walletAddress || '',
        network: "testnet",
       // marketplaceContractId: "0.0.7726588", // Your deployed marketplace contract
    //    marketplaceContractId:"0.0.7750266",
       marketplaceContractId:"0.0.7774217",
       signer: signer,
        //provider: provider,
    });

    // Load metadata and comic ID from params or localStorage
    // useEffect(() => {
        const metadatcid = (params as any)?.metadataCid || "";
        console.log("Metadata CID from params:", metadatcid);
        const metadatcid = (params as any)?.comicId || "";
        
        if (cid && id) {
            setMetadataCid(cid);
            setComicId(id);
        } else {
            const stored = JSON.parse(localStorage.getItem("latestComic") || "{}");
            console.log("Stored data:", stored);
            setMetadataCid(stored.metadataCid || "");
            setComicId(stored.dbComicId || "");
        }
    // }, [params]);

    // Rarity configuration with actual supply numbers
    const rarityOptions = {
        legendary: {
            name: 'Legendary',
            type: 'legendary' as const,
            supply: 'Supply 1 – 5,000',
            maxSupply: 5000,
                icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover"/>
        },
        epic: {
            name: 'Epic',
            type: 'epic' as const,
            supply: 'Supply 1 – 8,000',
            maxSupply: 8000,
                    icon: <Image src={sportsMedal} alt="epic" className="w-6 h-6 object-cover"/>
        },
        common: {
            name: 'Common',
            type: 'common' as const,
            supply: 'Infinite',
            maxSupply: 1000000, // Large number for "infinite",
            icon: <Image src={sportsMedal} alt="common" className="w-6 h-6 object-cover"/>
        }
    };

    const handleRaritySelect = (selectedRarity : string) => {
        const rarity = rarityOptions[selectedRarity as keyof typeof rarityOptions];
        setFlowData(prev => ({
            ...prev,
            rarity
        }));
        setCurrentStep('listing');
    };

    const handleListingDetails = (listingData : any) => {
        setFlowData(prev => ({
            ...prev,
            listing: listingData
        }));
        setCurrentStep('review');
    };

    const handleReviewComplete = async () => {
        if (!flowData.listing || !flowData.rarity) {
            console.error("Missing flow data");
            return;
        }

        setIsProcessing(true);

        try {
            console.log("🚀 Starting NFT creation and listing process...");

            // Step 1: Create Collection (if not already created)
            //let nftTokenId = collectionTokenId;
            let nftTokenId;
            // if (!nftTokenId) {
                console.log("📝 Creating NFT collection...");
                
                const createCollectionResult = await createCollection({
                    name: `${episodeTitle} Collection` || "Comic Collection",
                    symbol: flowData.rarity.type.toUpperCase().substring(0, 4) || "QuivaCoMM", // e.g., "LEGE", "EPIC", "COMM"
                    memo: `${flowData.rarity.name} rarity comic collection` || "Comic Collection",
                    maxSupply: flowData.rarity.maxSupply,
                    autoRenewPeriod: 7000000, // ~81 days
                });

                console.log("✅ Collection created:", createCollectionResult);
                
                nftTokenId = createCollectionResult.tokenId!;
                console.log("🎉 New Collection Token ID:", nftTokenId);
                setCollectionTokenId(nftTokenId);
              // endpoint
                // Save to localStorage for recovery
                localStorage.setItem('lastCollectionTokenId', nftTokenId);
            

            // Step 2: Prepare metadata URIs
            console.log("📦 Preparing metadata...");
       // const comicMetadataCid = 'bafkreieqoitwahwu64mj7a6vyj7pzpdbuje4ytoat3fbefcnrjjarlnk3a'; // Fallback CID
            // const metadataURI = comicMetadataCid 
            //     ? `https://gateway.pinata.cloud/ipfs/${comicMetadataCid}`
            //     : `ipfs://bafkreieqoitwahwu64mj7a6vyj7pzpdbuje4ytoat3fbefcnrjjarlnk3a`; // Fallback
            const metadataURI ="bafkreiatw24wireql2dj74wylfbls3vxo5j2woqmnbzrotu62g5qvipluu";
            console.log("✅ Metadata URI prepared:", metadataURI);
            const dbComicId = "69786c446a14dd56c6121d78"
            // For this example, minting 1 NFT. You can adjust for batch minting
            const numberOfCopies = parseInt(flowData.listing.sales) || 1;
            // const metadataURIs = Array(numberOfCopies).fill(metadataURI);

            // Step 3: Mint NFTs
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
            //endpoint

            setMintedNFTs(mintedData);

            // Save to localStorage for recovery
            localStorage.setItem('lastMintedNFT', JSON.stringify(mintedData));

            // Step 4: List each NFT for sale
            console.log("💰 Listing NFTs on marketplace...");
            
            const priceInHbar = parseFloat(flowData.listing.price);
            
            const listingPromises = mintedData.serials.map(async (serial) => {
                // return await listNFT({
                //     tokenId: nftTokenId,
                //     serialNumber: serial,
                //     priceInHbar: priceInHbar,
                // });
                return await batchListNFTs({
                    tokenId: nftTokenId,
                    serialNumbers: [serial],
                    priceInHbar: priceInHbar,
                });
            });

            const listingResults = await Promise.all(listingPromises);
            
            console.log("✅ All NFTs listed:", listingResults);

            // Step 5: Update backend (if you have one)
            // await updateBackendListing(mintedData.tokenId, mintedData.serials, flowData.listing.price);

            // Save complete info to localStorage
            const completeInfo = {
                collection: {
                    tokenId: nftTokenId,
                    name: `${episodeTitle} Collection`,
                    symbol: flowData.rarity.type.toUpperCase().substring(0, 4),
                },
                minted: mintedData,
                listings: listingResults.map((result, index) => ({
                    listingIds: result.listingIds,
                    serial: mintedData.serials[index],
                    price: priceInHbar,
                })),
                metadata: {
                    cid: metadataCid,
                    comicId: comicId,
                },
            };

            localStorage.setItem('lastCompleteNFTInfo', JSON.stringify(completeInfo));

            console.log("✅ Complete NFT creation and listing successful!");
            console.log("Complete info:", completeInfo);

            setCurrentStep('success');

        } catch (error) {
            console.error("❌ Error in NFT creation/listing process:", error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSuccessComplete = () => {
        // Clear saved data
        localStorage.removeItem('lastCollectionTokenId');
        localStorage.removeItem('lastMintedNFT');
        
        onComplete?.();
    };

    const handleBackFromListing = () => {
        setCurrentStep('rarity');
    };

    const handleBackFromReview = () => {
        setCurrentStep('listing');
    };

    const handleCancel = () => {
        onCancel?.();
    };

    // Prepare data for review step
    const reviewData = {
        title: episodeTitle,
        image: episodeImage,
        rarity: flowData.rarity || rarityOptions.legendary,
        supply: flowData.rarity?.supply?.split('–')[1]?.trim() || '5,000',
        price: flowData.listing?.price ? `${flowData.listing.price} HBAR` : '12 HBAR',
        royalty: flowData.listing?.royalty ? `${flowData.listing.royalty}%` : '5%'
    };

    return (
        <div className="relative">
            {/* Loading Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h3 className="text-xl font-bold mb-2">Processing...</h3>
                            <p className="text-gray-600">
                                {status === 'processing' 
                                    ? 'Creating your NFT collection and listing...' 
                                    : 'Please wait...'}
                            </p>
                            {error && (
                                <p className="text-red-600 text-sm mt-2">{error}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Rarity Selection Step */}
            {currentStep === 'rarity' && (
                <EpisodeRarity
                    episodeTitle={episodeTitle}
                    onBack={handleCancel}
                    onCancel={handleCancel}
                    onContinue={handleRaritySelect}
                />
            )}

            {/* Listing Details Step */}
            {currentStep === 'listing' && (
                <ListingDetails
                    selectedRarity={flowData.rarity || undefined}
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
                    episodeTitle={episodeTitle}
                    onBackToCollection={handleSuccessComplete}
                    onViewListing={handleSuccessComplete}
                    isOpen={true}
                    // Pass additional info if your modal supports it
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

            export default ListView;