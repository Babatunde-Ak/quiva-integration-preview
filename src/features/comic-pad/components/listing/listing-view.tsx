'use client';

import React, {useState} from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppSelector } from '@/redux/hook';
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

import { useListComic } from '@/hook/useListComic';
import { useMintComic } from '@/hook/useMintComic';

interface ListViewProps {
    episodeTitle?: string;
    episodeImage?: string;
    tokenId: string;
    serial: number;
    topicId?: string;
    previewURI?: string;
    fullMetadataURI?: string;
    royaltyRecipient: string;
    onComplete?: () => void;
    onCancel?: () => void;
}

interface FlowData {
    rarity : {
        name: string;
        type: 'legendary' | 'epic' | 'common';
        supply: string;
    } | null;
    listing : {
        sales: string;
        price: string;
        royalty: string;
    } | null;
}

const ListView : React.FC < ListViewProps > = ({
    episodeTitle = "Galatin Ep 1",
    episodeImage = "/api/placeholder/200/200",
    tokenId,
    serial,
    topicId,
    previewURI,
    fullMetadataURI,
    royaltyRecipient,
    onComplete,
    onCancel
}) => {
    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });

      const { 
          account,
          isConnected, 
          connector,
          signer,
          connectWallet 
        } = useHederaWallet();

         const {user} = useAppSelector((state:any) => state.wallet);
         const {createComicNFT} = useMintComic({
            accountId:  account || user?.walletAddress || '',
            network: "testnet",
            signer: signer,
        });

    const { listComic, status, error } = useListComic({
        accountId:  account || user?.walletAddress || '',
        network: "testnet",
        marketplaceId: "0.0.7348494",
        signer: signer,
    });

    const rarityOptions = {
        legendary: {
            name: 'Legendary',
            type: 'legendary' as const,
                supply: 'Supply 1 — 5,000'
            },
            epic: {
                name: 'Epic',
                type: 'epic' as const,
                    supply: 'Supply 1 — 8,000'
                },
                common: {
                    name: 'Common',
                    type: 'common' as const,
                        supply: 'Infinite'
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
                    // Inscribe and  Mint the comic NFT
                    const formData = {
                        title: episodeTitle,
                        episodeNumber: 1,
                        summary: '',
                        maturityRating: '',
                        bannerImage: null,
                        collaborators: [],
                        contentType: null,
                         files: []
                    }; // Replace with actual form data object from the Episode creation flow
                    const metadataCid = ""; // This is needed to be passed from the episode creation flow
                    const dbComicId = ""; // This is needed to be passed from the episode creation flow

                   let mintData =  await createComicNFT(formData, metadataCid, dbComicId, flowData.rarity?.supply);

                    mintData = {
                        tokenId: tokenId,
                        serial: [serial],
                        transactionId: mintData.transactionId || ""
                    }

                    if (!flowData.listing) return;
                    try {
                        await listComic({
                            tokenAddress: mintData.tokenId,
                            serial: mintData.serial[0],
                            price: Number(flowData.listing.price),
                            royaltyRecipient: user?.walletAddress || '',
                            royaltyBps: Number(flowData.listing.royalty) * 100, // assuming royalty is percent
                            paymentToken: '0x0000000000000000000000000000000000000000', // HBAR
                            previewURI: formData.bannerImage,
                            fullMetadataURI: `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
                        });

                       // await updateBackendListing(mintData.tokenId, mintData.serial[0], flowData.listing.price); // write a function to update the backend
                        setCurrentStep('success');
                    } catch (e) {
                        // Optionally handle error (show error message, etc.)
                    }
                };

                const handleSuccessComplete = () => {
                    onComplete
                        ?.();
                };

                const handleBackFromListing = () => {
                    setCurrentStep('rarity');
                };

                const handleBackFromReview = () => {
                    setCurrentStep('listing');
                };

                const handleCancel = () => {
                    onCancel
                        ?.();
                };

                // Prepare data for review step
                const reviewData = {
                    title: episodeTitle,
                    image: episodeImage,
                    rarity: flowData.rarity || rarityOptions.legendary,
                    supply: flowData.rarity
                        ?.supply
                        ?.split('—')[1]
                        ?.trim() || '5,000',
                    price: flowData.listing
                        ?.price
                            ? `${flowData.listing.price} HBAR`
                            : '12 HBAR',
                    royalty: flowData.listing
                        ?.royalty
                            ? `${flowData.listing.royalty}%`
                            : '5%'
                };

                return (
                    <div className="relative">
                        {/* Rarity Selection Step */}
                        {currentStep === 'rarity' && (<EpisodeRarity
                            episodeTitle={episodeTitle}
                            onBack={handleCancel}
                            onCancel={handleCancel}
                            onContinue={handleRaritySelect}/>)}

                        {/* Listing Details Step */}
                        {currentStep === 'listing' && (<ListingDetails
                            selectedRarity={flowData.rarity || undefined}
                            onBack={handleBackFromListing}
                            onNext={handleListingDetails}/>)}

                        {/* Review Details Step */}
                        {currentStep === 'review' && (<ReviewDetails
                            episodeData={reviewData}
                            onBack={handleBackFromReview}
                            onList={handleReviewComplete}/>)}

                        {/* Success Modal */}
                        {currentStep === 'success' && (<ListingSuccessModal
                            episodeTitle={episodeTitle}
                            onBackToCollection={handleSuccessComplete}
                            onViewListing={handleSuccessComplete}
                            isOpen={true}/>)}
                    </div>
                );
            };

export default ListView;