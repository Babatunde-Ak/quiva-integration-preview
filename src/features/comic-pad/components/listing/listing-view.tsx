'use client';

import React, {useEffect, useState} from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';
import Image from 'next/image';
import {crownIcon, sportsMedal} from '../../../../../public/dev_images';

//import useComicPlatform, { useNFTMarketplace } from '@/hook/useMarkeplace';
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

import {useListComic} from '@/hook/useListComic';
import {useMintComic} from '@/hook/useMintComic';
import {useAppSelector} from '@/redux/hook';
import {useHederaWallet} from '@/providers/HashPackProvider';
import { useParams, useRouter } from 'next/navigation';
import useComicPlatform from '@/hook/useMarkeplace';
import { useComicInscription } from '@/hook/useComicInscription';

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
    listingIds?: string[];
    status: string;
}

const ListView : React.FC < ListViewProps > = ({
    episodeTitle = "Great Manga #2",
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
    
    // const { 
    //     listNFT,
    //     createCollection,
    //     createComicNFT,
    //     batchListNFTs,
    //     status, 
    //     error 
    // } = useNFTMarketplace({
    //     accountId: account || user?.walletAddress || '',
    //     network: "testnet",
    //    // marketplaceContractId: "0.0.7726588", // Your deployed marketplace contract
    // //    marketplaceContractId:"0.0.7750266",
    //    marketplaceContractId:"0.0.7774217",
    //    signer: signer,
    //     //provider: provider,
    // });

    const {
        createComicCollection,
        createDirectListing
    } = useComicPlatform({
        accountId: account || user?.walletAddress || '',
        network: "testnet",
        signer: signer,
    });
    // const {
    // createComicNFT
    // } = useMintComic({
    // accountId: account || user?.walletAddress || '',
    // network: "testnet",
    // signer: signer,
    // })

    const {
         createInscription 

    } = useComicInscription({
        accountId: account || user?.walletAddress || '',
        network: "testnet",
        signer: signer,
    });

   

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
                
            // const metadataURI ="bafkreiatw24wireql2dj74wylfbls3vxo5j2woqmnbzrotu62g5qvipluu";
            const metadataURI = "bafkreicdrvu6mnyvlo2vzasvrgh3hsgndgfzuvlxugapfwupa4cx6tguh4";
            console.log("✅ Metadata URI prepared:", metadataURI);
            // const dbComicId = "69786c446a14dd56c6121d78"
            const dbComicId = "697b9df589db1b499fc42d48";
                // Step 1: Create Collection 
                const createCollectionResult = await createComicCollection({
                    episodeId: dbComicId,
                    name: `${episodeTitle} Collection` || "Comic Collection",
                    symbol: flowData.rarity.type.toUpperCase().substring(0, 4) || "QuivaCoMM", // e.g., "LEGE", "EPIC", "COMM"
                    maxSupply: flowData.rarity.maxSupply,
                    //autoRenewPeriod: 7000000, // ~81 days
                });

                console.log("✅ Collection created:", createCollectionResult);
                
                nftTokenId = createCollectionResult.tokenId!;
                console.log("🎉 New Collection Token ID:", nftTokenId);
                setCollectionTokenId(nftTokenId);
              // endpoint
                // Save to localStorage for recovery
                 localStorage.setItem('lastCollectionTokenId', nftTokenId);
            

            // Step 2: Prepare Inscription / Metadata
    //         console.log("📦 Preparing Inscription...");
    const inscriptionResult = await createInscription(metadataURI, dbComicId);
          console.log("✅ Inscription completed:", inscriptionResult);
            const topicId = inscriptionResult.topicId || '';
            console.log("🎉 Inscription Topic ID:", topicId);
            setMetadataCid(metadataURI);
            setComicId(dbComicId);

            const numberOfCopies = parseInt(flowData.listing.sales) || 1;
            // const metadataURIs = Array(numberOfCopies).fill(metadataURI);
        //     let bannerImageFile: File;
        //     try {
        //         const bannerImageResponse = await fetch(episodeImage);
        //         const bannerImageBlob = await bannerImageResponse.blob();
        //         bannerImageFile = new File([bannerImageBlob], 'banner-image', { type: bannerImageBlob.type || 'image/png' });
        //     } catch (error) {
        //         console.error("❌ Failed to load banner image:", error);
        //         bannerImageFile = new File([], 'banner-image', { type: 'image/png' });
        //     }

        //     const comicData = {
        //          title: `${episodeTitle} NFT`,
        //          episodeNumber: 1,
        //          summary: 'An exciting episode of the comic.',
        //           maturityRating: 'Everyone',
        //           bannerImage: bannerImageFile,
        //           collaborators: [],
        //          contentType:  null,
        //           pages: []
        //     }
        //     const comicCreation = await createComicNFT(
        //         comicData,
        //         metadataURI,
        //         dbComicId,
        //         numberOfCopies

        //     )
        //    console.log("✅ Comic NFTs created:", comicCreation);
            // Step 3: Mint NFTs
            console.log(`🎨 Minting ${numberOfCopies} NFT(s)...`);
            const metadataHRL = `hcs://1/${topicId}`;
            // const metadataHRL = `https://gateway.pinata.cloud/ipfs/${metadataURI}`;
            console.log("Metadata HRL for minting:", metadataHRL);
            
            // const mintResult = await createComicNFT({
            //     tokenId: nftTokenId,
            //     metadata: metadataURI,
            //     copies: numberOfCopies,
            //     dbComicId: dbComicId
            // });
            const mintAndListResult = await createDirectListing({
                 episodeId: dbComicId,
                 quantity: 10,
                 pricePerNFT: parseFloat(flowData.listing.price),
                 metadata: metadataHRL
                //  metadata: metadataHRL,
            })

             console.log("✅ NFTs minted:", mintAndListResult);

            const mintedData: MintResult = {
                tokenId: nftTokenId,
                status: mintAndListResult.status || '',
                serials: serials || [],
                transactionId: mintAndListResult.transactionId || "",
                listingIds: mintAndListResult.listingId ? [mintAndListResult.listingId] : [],

            };
           // endpoint

         setMintedNFTs(mintedData);

            // // Save to localStorage for recovery
            localStorage.setItem('lastMintedNFT', JSON.stringify(mintedData));

            // Step 4: List each NFT for sale
            console.log("💰 Minted and Listed NFTs on marketplace Successfully");
            
            // const priceInHbar = parseFloat(flowData.listing.price);
            
            // const listingPromises = mintedData.serials.map(async (serial) => {
            //     // return await listNFT({
            //     //     tokenId: nftTokenId,
            //     //     serialNumber: serial,
            //     //     priceInHbar: priceInHbar,
            //     // });
            //     return await batchListNFTs({
            //         tokenId: nftTokenId,
            //         serialNumbers: [serial],
            //         priceInHbar: priceInHbar,
            //     });
            // });

            // const listingResults = await Promise.all(listingPromises);
            
            // console.log("✅ All NFTs listed:", listingResults);

            // Step 5: Update backend (if you have one)
            // await updateBackendListing(mintedData.tokenId, mintedData.serials, flowData.listing.price);

            const priceInHbar = parseFloat(flowData.listing.price);

            // // Save complete info to localStorage
            const completeInfo = {
                collection: {
                    tokenId: nftTokenId,
                    name: `${episodeTitle} Collection`,
                    symbol: flowData.rarity.type.toUpperCase().substring(0, 4),
                },
                minted: mintedData,
                listings: (mintedData.listingIds || []).map((listingId, index) => ({
                    listingId,
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
            // console.log("Complete info:", completeInfo);

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
                                {isProcessing 
                                    ? 'Creating your NFT collection and listing...' 
                                    : 'Please wait...'}
                            </p>
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