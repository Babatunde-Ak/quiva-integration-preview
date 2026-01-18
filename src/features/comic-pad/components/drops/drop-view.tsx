'use client';

import React, {useState} from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import DropDetails from './steps/DropDetails';
import MintType from './steps/MintType';
import WhitelistSettings from './steps/WhitelistSettings';
import SetSchedule from './steps/SetSchedule';
import ReviewDetails from './steps/ReviewDetails';
import DropSuccessModal from './steps/DropSuccessModal';
import Image from 'next/image';
import {crownIcon, sportsMedal} from '../../../../../public/dev_images';

type FlowStep = 'rarity' | 'drop-details' | 'mint-type' | 'whitelist' | 'schedule' | 'review' | 'success';

import {useListComic} from '@/hook/useListComic';
import {useMintComic} from '@/hook/useMintComic';
import {useAppSelector} from '@/redux/hook';
import {useHederaWallet} from '@/providers/HashPackProvider';
import {useRouter} from 'next/navigation';

interface DropViewProps {
    episodeTitle?: string;
    episodeImage?: string;
    tokenId?: string;
    serial?: number;
    topicId?: string;
    previewURI?: string;
    fullMetadataURI?: string;
    royaltyRecipient?: string;
    onComplete?: () => void;
    onCancel?: () => void;
}

interface RarityOption {
    name : string;
    type : 'legendary' | 'epic' | 'common';
    supply : string;
    icon : React.ReactNode;
}

interface DropFormData {
    supply : string;
    price : string;
    royalty : string;
    maxMintPerWallet : string;
    bannerImage : File | null;
}

interface WhitelistData {
    wallets : string[];
    maxMintPerWallet : string;
    reservedSupply : string;
}

interface ScheduleData {
    startDate : string;
    startTime : string;
    endDate : string;
    endTime : string;
}

interface FlowData {
    rarity : RarityOption | null;
    dropDetails : DropFormData | null;
    mintType : 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop' | null;
    whitelistData : WhitelistData | null;
    scheduleData : ScheduleData | null;
}

const DropView : React.FC < DropViewProps > = ({
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
    const router = useRouter();
    const [currentStep,
        setCurrentStep] = useState < FlowStep > ('rarity');
    const [flowData,
        setFlowData] = useState < FlowData > ({rarity: null, dropDetails: null, mintType: null, whitelistData: null, scheduleData: null});

    const {account, isConnected, connector, signer, connectWallet} = useHederaWallet();

    const {user} = useAppSelector((state : any) => state.wallet);
    const {createComicNFT} = useMintComic({
        accountId: account || user
            ?.walletAddress || '',
        network: "testnet",
        signer: signer
    });

    const {listComic, status, error} = useListComic({
        accountId: account || user
            ?.walletAddress || '',
        network: "testnet",
        marketplaceId: "0.0.7348494",
        signer: signer
    });

    const rarityOptions = {
        legendary: {
            name: 'Legendary',
            type: 'legendary' as const,
                supply: 'Supply 1 — 5,000',
                icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover"/>
            },
            epic: {
                name: 'Epic',
                type: 'epic' as const,
                    supply: 'Supply 1 — 8,000',
                    icon: <Image src={sportsMedal} alt="epic" className="w-6 h-6 object-cover"/>
                },
                common: {
                    name: 'Common',
                    type: 'common' as const,
                        supply: 'Infinite',
                        icon: <Image src={sportsMedal} alt="common" className="w-6 h-6 object-cover"/>
                    }
                };

                const handleRaritySelect = (selectedRarity : string) => {
                    const rarity = rarityOptions[selectedRarity as keyof typeof rarityOptions];
                    setFlowData(prev => ({
                        ...prev,
                        rarity
                    }));
                    setCurrentStep('drop-details');
                };

                const handleDropDetailsNext = (dropDetailsData : DropFormData) => {
                    setFlowData(prev => ({
                        ...prev,
                        dropDetails: dropDetailsData
                    }));
                    setCurrentStep('mint-type');
                };

                const handleMintTypeNext = (mintType : 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop') => {
                    setFlowData(prev => ({
                        ...prev,
                        mintType
                    }));

                    // Navigate based on mint type
                    if (mintType === 'whitelist' || mintType === 'wl-priority') {
                        setCurrentStep('whitelist');
                    } else if (mintType === 'scheduled') {
                        setCurrentStep('schedule');
                    } else {
                        setCurrentStep('review');
                    }
                };

                const handleWhitelistNext = (whitelistData : WhitelistData) => {
                    setFlowData(prev => ({
                        ...prev,
                        whitelistData
                    }));
                    setCurrentStep('review');
                };

                const handleScheduleNext = (scheduleData : ScheduleData) => {
                    setFlowData(prev => ({
                        ...prev,
                        scheduleData
                    }));
                    setCurrentStep('review');
                };

                const handleReviewComplete = async() => {
                    // TODO: Implement actual minting logic here For now, just move to success
                    setCurrentStep('success');
                };

                const handleSuccessComplete = () => {
                    onComplete
                        ?.();
                    router.push('/comic-pad/collections');
                };

                const handleBackFromDropDetails = () => {
                    setCurrentStep('rarity');
                };

                const handleBackFromMintType = () => {
                    setCurrentStep('drop-details');
                };

                const handleBackFromWhitelist = () => {
                    setCurrentStep('mint-type');
                };

                const handleBackFromSchedule = () => {
                    setCurrentStep('mint-type');
                };

                const handleBackFromReview = () => {
                    // Go back to the appropriate step based on mint type
                    if (flowData.mintType === 'whitelist' || flowData.mintType === 'wl-priority') {
                        setCurrentStep('whitelist');
                    } else if (flowData.mintType === 'scheduled') {
                        setCurrentStep('schedule');
                    } else {
                        setCurrentStep('mint-type');
                    }
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
                    supply: flowData.dropDetails
                        ?.supply || flowData.rarity
                            ?.supply
                                ?.split('—')[1]
                                    ?.trim() || '5,000',
                    price: flowData.dropDetails
                        ?.price
                            ? `${flowData.dropDetails.price} HBAR`
                            : '12 HBAR',
                    royalty: flowData.dropDetails
                        ?.royalty
                            ? `${flowData.dropDetails.royalty}%`
                            : '5%',
                    maxMintPerWallet: flowData.dropDetails
                        ?.maxMintPerWallet || '1',
                    bannerImage: flowData.dropDetails
                        ?.bannerImage || null,
                    mintType: flowData.mintType || 'public',
                    whitelistData: flowData.whitelistData,
                    scheduleData: flowData.scheduleData
                };

                return (
                    <div className="relative">
                        {/* Rarity Selection Step */}
                        {currentStep === 'rarity' && (<EpisodeRarity
                            episodeTitle={episodeTitle}
                            onBack={handleCancel}
                            onCancel={handleCancel}
                            onContinue={handleRaritySelect}/>)}

                        {/* Drop Details Step */}
                        {currentStep === 'drop-details' && (<DropDetails
                            selectedRarity={flowData.rarity || undefined}
                            onBack={handleBackFromDropDetails}
                            onNext={handleDropDetailsNext}/>)}

                        {/* Mint Type Step */}
                        {currentStep === 'mint-type' && (<MintType onBack={handleBackFromMintType} onNext={handleMintTypeNext}/>)}

                        {/* Whitelist Settings Step */}
                        {currentStep === 'whitelist' && (<WhitelistSettings
                            onBack={handleBackFromWhitelist}
                            onNext={handleWhitelistNext}/>)}

                        {/* Set Schedule Step */}
                        {currentStep === 'schedule' && (<SetSchedule onBack={handleBackFromSchedule} onNext={handleScheduleNext}/>)}

                        {/* Review Details Step */}
                        {currentStep === 'review' && (<ReviewDetails
                            episodeData={reviewData}
                            onBack={handleBackFromReview}
                            onList={handleReviewComplete}/>)}

                        {/* Success Modal */}
                        {currentStep === 'success' && (<DropSuccessModal
                            episodeTitle={episodeTitle}
                            onBackToCollection={handleSuccessComplete}
                            onViewListing={handleSuccessComplete}
                            isOpen={true}/>)}
                    </div>
                );
            };

            export default DropView;