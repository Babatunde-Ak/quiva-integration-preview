'use client';

import React, {useEffect, useState} from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppSelector } from '@/redux/hook';
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

import { useListComic } from '@/hook/useListComic';
import { useMintComic } from '@/hook/useMintComic';
import { useParams } from "next/navigation";

interface ListViewProps {
    episodeTitle?: string;
    episodeImage?: string;
    tokenId: string;
    serials: number[];
    topicId?: string;
    // previewURI?: string;
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
    episodeTitle ="Elipsis #2",
    episodeImage = "/api/placeholder/200/200",
    tokenId,
    serials,
    topicId,
    // previewURI,
    fullMetadataURI,
    royaltyRecipient,
    onComplete,
    onCancel
}) => {
    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });
    const params = useParams();
    const [metadataCid, setMetadataCid] = useState<string>('');
    const [comicId, setComicId] = useState<string>('');
    // const [formData, setFormData] = useState<any>({});

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
        marketplaceId: "0.0.7676271",
        signer: signer,
    });



useEffect(() => {
  // params is an object, not a URLSearchParams instance
  const cid = (params as any)?.metadataCid || "";
  console.log("cid", cid);
  const id = (params as any)?.comicId || "";
   console.log("id", id);
  const formDataToSend = params ? (params as any)?.formData || {} : {};
   console.log("formaData", formDataToSend);
  if (cid && id && formDataToSend) {
    setMetadataCid(cid);
    setComicId(id);
    // setFormData(formDataToSend);
  } else {
    const stored = JSON.parse(localStorage.getItem("latestComic") || "{}");
    console.log("stored data:", stored);
    setMetadataCid(stored.metadataCid || "");
    setComicId(stored.dbComicId || "");
    // setFormData(stored.formData || {});
  }
}, [params]);


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
                         pages: []
                    }; // Replace with actual form data object from the Episode creation flow
                    // const metadataCidValue = metadataCid; // This is needed to be passed from the episode creation flow
                    // const dbComicId = comicId; // This is needed to be passed from the episode creation flow
                    const metadataCidValue ="bafkreieqoitwahwu64mj7a6vyj7pzpdbuje4ytoat3fbefcnrjjarlnk3a" ; // This is needed to be passed from the episode creation flow
                    const dbComicId = "69674cdf530a986996ffeaea"; 
                    console.log("flowData:", flowData);
                    console.log("flowdata supply", flowData.rarity?.supply)
                //    const mintResult =  await createComicNFT(formData, metadataCidValue, dbComicId, 10);

                    // mintData = {
                    //     tokenId: tokenId,
                    //     serial: [serial],
                    //     transactionId: mintData.transactionId || ""
                    // }
                    // ✅ Use the tokenId and serial from the mint result, not from props
    // const nftTokenId = mintResult.tokenId;  // Adjust based on actual return structure
    // let nftSerials: number[] = [];
    // if (Array.isArray(mintResult.serials)) {
    //     nftSerials = mintResult.serials;
    // } else if (typeof mintResult.serials === 'number') {
    //     nftSerials = [mintResult.serials];
    // }

    // if (!nftTokenId || nftSerials.length === 0) {
    //     console.error("Missing tokenId or serials from mint result");
    //     return;
    // }


                    if (!flowData.listing) return;
                    try {
                        // await listComic({
                        //     tokenAddress: nftTokenId,
                        //     serials: nftSerials,
                        //     pricePerNFT: parseFloat("10"),
                        //     royaltyRecipient: user?.walletAddress || '',
                        //     royaltyBps: parseFloat("1000"), // assuming royalty is percent
                        //     paymentToken: '0x0000000000000000000000000000000000000000', // HBAR
                        //     // previewURI:  episodeImage,
                        //     fullMetadataURI: `https://gateway.pinata.cloud/ipfs/${metadataCid}`,
                        // });
 




// In your listing-vie
     const priceValue = parseFloat("10");
    
    // 🔥 ADD THIS CONVERSION:
    const priceInTinybars = Math.floor(priceValue * 100_000_000);
    
    console.log("Price entered:", priceValue, "HBAR");
    console.log("Price in tinybars:", priceInTinybars);

                         await listComic({
                            tokenAddress:"0.0.7659745",
                            serials: [1,2,3,4,5,6,7,8,9,10],
                            pricePerNFT: priceInTinybars,
                            royaltyRecipient: user?.walletAddress || '',
                            royaltyBps: parseFloat("1000"), // assuming royalty is percent
                            paymentToken: '0x0000000000000000000000000000000000000000', // HBAR
                            // previewURI:  episodeImage,
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