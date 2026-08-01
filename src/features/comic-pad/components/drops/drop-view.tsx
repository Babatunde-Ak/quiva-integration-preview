// 'use client';

// import React, {useState} from 'react';
// import EpisodeRarity from './steps/EpisodeRarity';
// import DropDetails from './steps/DropDetails';
// import MintType from './steps/MintType';
// import WhitelistSettings from './steps/WhitelistSettings';
// import SetSchedule from './steps/SetSchedule';
// import ReviewDetails from './steps/ReviewDetails';
// import DropSuccessModal from './steps/DropSuccessModal';
// import Image from 'next/image';
// import {crownIcon, sportsMedal} from '../../../../../public/dev_images';

// type FlowStep = 'rarity' | 'drop-details' | 'mint-type' | 'whitelist' | 'schedule' | 'review' | 'success';

// import useComicPlatform from '@/hook/useMarkeplace';
// import { useComicInscription } from '@/hook/useComicInscription';
// import {useAppDispatch, useAppSelector} from '@/redux/hook';
// import {useHederaWallet} from '@/providers/HashPackProvider';
// import {useParams, useRouter} from 'next/navigation';

// interface DropViewProps {
//     episodeTitle?: string;
//     episodeImage?: string;
//     tokenId?: string;
//     serial?: number;
//     topicId?: string;
//     previewURI?: string;
//     fullMetadataURI?: string;
//     royaltyRecipient?: string;
//     onComplete?: () => void;
//     onCancel?: () => void;
// }

// interface RarityOption {
//     name : string;
//     type : 'legendary' | 'epic' | 'common';
//     supply : string;
//     icon : React.ReactNode;
// }

// interface DropFormData {
//     supply : string;
//     price : string;
//     royalty : string;
//     maxMintPerWallet : string;
//     bannerImage : File | null;
// }

// interface WhitelistData {
//     wallets : string[];
//     maxMintPerWallet : string;
//     reservedSupply : string;
// }

// interface ScheduleData {
//     startDate : string;
//     startTime : string;
//     endDate : string;
//     endTime : string;
// }

// interface FlowData {
//     rarity : RarityOption | null;
//     dropDetails : DropFormData | null;
//     mintType : 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop' | null;
//     whitelistData : WhitelistData | null;
//     scheduleData : ScheduleData | null;
// }

// const DropView : React.FC < DropViewProps > = ({
//     episodeTitle = "Galatin Ep 1",
//     episodeImage = "/api/placeholder/200/200",
//     onComplete,
//     onCancel
// }) => {
//     const router = useRouter();
//         const params = useParams();
//         const dispatch = useAppDispatch();
//         const episodeId = params.episode as string;
//     const [currentStep,
//         setCurrentStep] = useState < FlowStep > ('rarity');
//     const [flowData,
//         setFlowData] = useState < FlowData > ({rarity: null, dropDetails: null, mintType: null, whitelistData: null, scheduleData: null});

//     const {account, isConnected, connector, signer, connectWallet} = useHederaWallet();

//     const {user} = useAppSelector((state : any) => state.wallet);

//       const {
//             createComicCollection,
//             createCampaign
//         } = useComicPlatform({
//             accountId: account || user?.walletAddress || '',
//             network: "testnet",
//             signer: signer,
//         });
    
//         const {
//             createInscription
//         } = useComicInscription({
//             accountId: account || user?.walletAddress || '',
//             network: "testnet",
//             signer: signer,
//         });
   
//   // Constants
//   const AUTO_RENEW_PERIOD = 7000000;
// const TRANSACTION_STATE_KEY = 'nft_transaction_state';
// const MAX_RETRIES = 30;
// const RETRY_DELAY = 2000; // 2 seconds

//     const rarityOptions = {
//         legendary: {
//             name: 'Legendary',
//             type: 'legendary' as const,
//                 supply: 'Supply 1 — 5,000',
//                 icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover"/>
//             },
//             epic: {
//                 name: 'Epic',
//                 type: 'epic' as const,
//                     supply: 'Supply 1 — 8,000',
//                     icon: <Image src={sportsMedal} alt="epic" className="w-6 h-6 object-cover"/>
//                 },
//                 common: {
//                     name: 'Common',
//                     type: 'common' as const,
//                         supply: 'Infinite',
//                         icon: <Image src={sportsMedal} alt="common" className="w-6 h-6 object-cover"/>
//                     }
//                 };

//                 const handleRaritySelect = (selectedRarity : string) => {
//                     const rarity = rarityOptions[selectedRarity as keyof typeof rarityOptions];
//                     setFlowData(prev => ({
//                         ...prev,
//                         rarity
//                     }));
//                     setCurrentStep('drop-details');
//                 };

//                 const handleDropDetailsNext = (dropDetailsData : DropFormData) => {
//                     setFlowData(prev => ({
//                         ...prev,
//                         dropDetails: dropDetailsData
//                     }));
//                     setCurrentStep('mint-type');
//                 };

//                 const handleMintTypeNext = (mintType : 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop') => {
//                     setFlowData(prev => ({
//                         ...prev,
//                         mintType
//                     }));

//                     // Navigate based on mint type
//                     if (mintType === 'whitelist' || mintType === 'wl-priority') {
//                         setCurrentStep('whitelist');
//                     } else if (mintType === 'scheduled') {
//                         setCurrentStep('schedule');
//                     } else {
//                         setCurrentStep('review');
//                     }
//                 };

//                 const handleWhitelistNext = (whitelistData : WhitelistData) => {
//                     setFlowData(prev => ({
//                         ...prev,
//                         whitelistData
//                     }));
//                     setCurrentStep('review');
//                 };

//                 const handleScheduleNext = (scheduleData : ScheduleData) => {
//                     setFlowData(prev => ({
//                         ...prev,
//                         scheduleData
//                     }));
//                     setCurrentStep('review');
//                 };

//                 const handleReviewComplete = async() => {
//                     // TODO: Implement actual minting logic here For now, just move to success
//                     setCurrentStep('success');
//                 };

//                 const handleSuccessComplete = () => {
//                     onComplete
//                         ?.();
//                     router.push('/comic-pad/collections');
//                 };

//                 const handleBackFromDropDetails = () => {
//                     setCurrentStep('rarity');
//                 };

//                 const handleBackFromMintType = () => {
//                     setCurrentStep('drop-details');
//                 };

//                 const handleBackFromWhitelist = () => {
//                     setCurrentStep('mint-type');
//                 };

//                 const handleBackFromSchedule = () => {
//                     setCurrentStep('mint-type');
//                 };

//                 const handleBackFromReview = () => {
//                     // Go back to the appropriate step based on mint type
//                     if (flowData.mintType === 'whitelist' || flowData.mintType === 'wl-priority') {
//                         setCurrentStep('whitelist');
//                     } else if (flowData.mintType === 'scheduled') {
//                         setCurrentStep('schedule');
//                     } else {
//                         setCurrentStep('mint-type');
//                     }
//                 };

//                 const handleCancel = () => {
//                     onCancel
//                         ?.();
//                 };

//                 // Prepare data for review step
//                 const reviewData = {
//                     title: episodeTitle,
//                     image: episodeImage,
//                     rarity: flowData.rarity || rarityOptions.legendary,
//                     supply: flowData.dropDetails
//                         ?.supply || flowData.rarity
//                             ?.supply
//                                 ?.split('—')[1]
//                                     ?.trim() || '5,000',
//                     price: flowData.dropDetails
//                         ?.price
//                             ? `${flowData.dropDetails.price} HBAR`
//                             : '12 HBAR',
//                     royalty: flowData.dropDetails
//                         ?.royalty
//                             ? `${flowData.dropDetails.royalty}%`
//                             : '5%',
//                     maxMintPerWallet: flowData.dropDetails
//                         ?.maxMintPerWallet || '1',
//                     bannerImage: flowData.dropDetails
//                         ?.bannerImage || null,
//                     mintType: flowData.mintType || 'public',
//                     whitelistData: flowData.whitelistData,
//                     scheduleData: flowData.scheduleData
//                 };

//                 return (
//                     <div className="relative">
//                         {/* Rarity Selection Step */}
//                         {currentStep === 'rarity' && (<EpisodeRarity
//                             episodeTitle={episodeTitle}
//                             onBack={handleCancel}
//                             onCancel={handleCancel}
//                             onContinue={handleRaritySelect}/>)}

//                         {/* Drop Details Step */}
//                         {currentStep === 'drop-details' && (<DropDetails
//                             selectedRarity={flowData.rarity || undefined}
//                             onBack={handleBackFromDropDetails}
//                             onNext={handleDropDetailsNext}/>)}

//                         {/* Mint Type Step */}
//                         {currentStep === 'mint-type' && (<MintType onBack={handleBackFromMintType} onNext={handleMintTypeNext}/>)}

//                         {/* Whitelist Settings Step */}
//                         {currentStep === 'whitelist' && (<WhitelistSettings
//                             onBack={handleBackFromWhitelist}
//                             onNext={handleWhitelistNext}/>)}

//                         {/* Set Schedule Step */}
//                         {currentStep === 'schedule' && (<SetSchedule onBack={handleBackFromSchedule} onNext={handleScheduleNext}/>)}

//                         {/* Review Details Step */}
//                         {currentStep === 'review' && (<ReviewDetails
//                             episodeData={reviewData}
//                             onBack={handleBackFromReview}
//                             onList={handleReviewComplete}/>)}

//                         {/* Success Modal */}
//                         {currentStep === 'success' && (<DropSuccessModal
//                             episodeTitle={episodeTitle}
//                             onBackToCollection={handleSuccessComplete}
//                             onViewListing={handleSuccessComplete}
//                             isOpen={true}/>)}
//                     </div>
//                 );
//             };

//             export default DropView;


'use client';

import React, { useState, useEffect } from 'react';
import EpisodeRarity from './steps/EpisodeRarity';
import DropDetails from './steps/DropDetails';
import MintType from './steps/MintType';
import WhitelistSettings from './steps/WhitelistSettings';
import SetSchedule from './steps/SetSchedule';
import ReviewDetails from './steps/ReviewDetails';
import DropSuccessModal from './steps/DropSuccessModal';
import Image from 'next/image';
import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

type FlowStep = 'rarity' | 'drop-details' | 'mint-type' | 'whitelist' | 'schedule' | 'review' | 'success';

import useWagmiMarketplace, { CampaignType, PhaseType } from '@/hook/useWagmiMarketplace';
import { useComicInscription } from '@/hook/useComicInscription';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useParams, useRouter } from 'next/navigation';
import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

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
    name: string;
    type: 'legendary' | 'epic' | 'common';
    supply: string;
    maxSupply: number;
    icon: React.ReactNode;
}

interface DropFormData {
    supply: string;
    price: string;
    royalty: string;
    maxMintPerWallet: string;
    bannerImage: File | null;
}

interface WhitelistData {
    wallets: string[];
    maxMintPerWallet: string;
    reservedSupply: string;
}

interface ScheduleData {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    phases?: Array<{
        phaseType: PhaseType;
        startTime: number;
        endTime: number;
        mintPrice: number;
        maxPerWallet: number;
        phaseSupply: number;
    }>;
}

interface FlowData {
    rarity: RarityOption | null;
    dropDetails: DropFormData | null;
    mintType: 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop' | null;
    whitelistData: WhitelistData | null;
    scheduleData: ScheduleData | null;
}

interface CampaignResult {
    transactionId: string;
    status: string;
    campaignId?: string;
}

// Transaction State Types
type TransactionStage =
    | 'idle'
    | 'creating_collection'
    | 'collection_created'
    | 'creating_inscription'
    | 'inscription_created'
    | 'creating_campaign'
    | 'campaign_created'
    | 'adding_whitelist'
    | 'whitelist_added'
    | 'adding_phases'
    | 'phases_added'
    | 'completed'
    | 'failed';

interface TransactionState {
    stage: TransactionStage;
    episodeId: string;
    collectionData?: {
        tokenId: string;
        transactionId: string;
        name: string;
        symbol: string;
        maxSupply: number;
    };
    inscriptionData?: {
        topicId: string;
        transactionId: string;
        metadataHRL: string;
    };
    campaignData?: CampaignResult;
    whitelistTransactionId?: string;
    phasesTransactionIds?: string[];
    flowData?: FlowData;
    episodeData?: any;
    error?: {
        stage: TransactionStage;
        message: string;
        timestamp: number;
    };
    timestamp: number;
}

// Constants
const AUTO_RENEW_PERIOD = 7000000;
const TRANSACTION_STATE_KEY = 'campaign_transaction_state';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const DropView: React.FC<DropViewProps> = ({
    episodeTitle = "Galatin Ep 1",
    episodeImage = "/api/placeholder/200/200",
    onComplete,
    onCancel
}) => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const episodeId = params.episode as string;

    const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
    const [flowData, setFlowData] = useState<FlowData>({
        rarity: null,
        dropDetails: null,
        mintType: null,
        whitelistData: null,
        scheduleData: null
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [episodeData, setEpisodeData] = useState<any>(null);
    const [transactionState, setTransactionState] = useState<TransactionState | null>(null);
    const [processingMessage, setProcessingMessage] = useState<string>('');
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [campaignResult, setCampaignResult] = useState<CampaignResult | null>(null);

    const { account, isConnected, signer } = useHederaWallet();
    const { user } = useAppSelector((state: any) => state.wallet);
    const { loading, error: comicError } = useAppSelector((state: any) => state.comic);

    const {
        createComicCollection,
        createCampaign,
        addToWhitelist,
        addPhase,
    } = useWagmiMarketplace();

    const {
        createInscription
    } = useComicInscription();

    const rarityOptions: Record<string, RarityOption> = {
        legendary: {
            name: 'Legendary',
            type: 'legendary',
            supply: 'Supply 1 — 5,000',
            maxSupply: 5000,
            icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover" />
        },
        epic: {
            name: 'Epic',
            type: 'epic',
            supply: 'Supply 1 — 8,000',
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


const createSerializableState = (state: TransactionState): any => {
  return {
    stage: state.stage,
    episodeId: state.episodeId,
    timestamp: state.timestamp,
    collectionData: state.collectionData,
    inscriptionData: state.inscriptionData,
    campaignData: state.campaignData,
    whitelistTransactionId: state.whitelistTransactionId,
    phasesTransactionIds: state.phasesTransactionIds,
    error: state.error,
    
    flowData: state.flowData ? {
      mintType: state.flowData.mintType,
      rarity: state.flowData.rarity ? {
        name: state.flowData.rarity.name,
        type: state.flowData.rarity.type,
        supply: state.flowData.rarity.supply,
        maxSupply: state.flowData.rarity.maxSupply,
      } : null,
      dropDetails: state.flowData.dropDetails ? {
        supply: state.flowData.dropDetails.supply,
        price: state.flowData.dropDetails.price,
        royalty: state.flowData.dropDetails.royalty,
        maxMintPerWallet: state.flowData.dropDetails.maxMintPerWallet,
      } : null,
      whitelistData: state.flowData.whitelistData,
      scheduleData: state.flowData.scheduleData,
    } : undefined,
    
    episodeData: state.episodeData ? {
      _id: state.episodeData._id,
      title: state.episodeData.title,
      description: state.episodeData.description,
      nftMetadataCid: state.episodeData.nftMetadataCid,
      bannerImage: state.episodeData.bannerImage,
    } : undefined,
  };
};
    // Load transaction state from localStorage
    // useEffect(() => {
    //     const savedState = localStorage.getItem(TRANSACTION_STATE_KEY);
    //     if (savedState) {
    //         try {
    //             const parsed: TransactionState = JSON.parse(savedState);
    //             const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
    //             if (parsed.episodeId === episodeId && isRecent && parsed.stage !== 'completed') {
    //                 setTransactionState(parsed);
    //                 if (parsed.flowData) {
    //                     setFlowData(parsed.flowData);
    //                 }
    //                 if (parsed.episodeData) {
    //                     setEpisodeData(parsed.episodeData);
    //                 }
    //                 if (parsed.error) {
    //                     setShowRetryModal(true);
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error loading transaction state:", error);
    //         }
    //     }
    // }, [episodeId]);

useEffect(() => {
  const savedState = localStorage.getItem(TRANSACTION_STATE_KEY);
  if (savedState) {
    try {
      const parsed: TransactionState = JSON.parse(savedState);
      const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
      
      if (parsed.episodeId === episodeId && isRecent && parsed.stage !== 'completed') {
        // Restore flowData and reconstruct icon
        if (parsed.flowData?.rarity) {
          const rarityType = parsed.flowData.rarity.type;
          const fullRarity = rarityOptions[rarityType];
          
          parsed.flowData.rarity = {
            ...parsed.flowData.rarity,
            icon: fullRarity?.icon,
          };
        }
        
        setTransactionState(parsed);
        
        if (parsed.flowData) {
          setFlowData(parsed.flowData as FlowData);
        }
        
        if (parsed.episodeData) {
          setEpisodeData(parsed.episodeData);
        }
        
        if (parsed.error) {
          setShowRetryModal(true);
        }
        
        console.log('✅ Transaction state restored from localStorage');
      }
    } catch (error) {
      console.error("Error loading transaction state:", error);
      localStorage.removeItem(TRANSACTION_STATE_KEY);
    }
  }
}, [episodeId]);




      // Save transaction state
    // const saveTransactionState = (state: TransactionState) => {
    //     setTransactionState(state);
    //     // localStorage.setItem(TRANSACTION_STATE_KEY, JSON.stringify(state));
    // };
const saveTransactionState = (state: TransactionState) => {
  setTransactionState(state);
  
  try {
    const serializableState = createSerializableState(state);
    localStorage.setItem(TRANSACTION_STATE_KEY, JSON.stringify(serializableState));
    console.log('✅ Transaction state saved successfully');
  } catch (error) {
    console.error('❌ Failed to save transaction state:', error);
  }
};

     // Clear transaction state
    const clearTransactionState = () => {
        setTransactionState(null);
        localStorage.removeItem(TRANSACTION_STATE_KEY);
    };
    // Fetch episode data
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


    // Retry with exponential backoff
    const retryWithBackoff = async <T,>(
        fn: () => Promise<T>,
        retries: number = MAX_RETRIES
    ): Promise<T> => {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
                console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after ${delay}ms...`);
                setRetryCount(MAX_RETRIES - retries + 1);
                await new Promise(resolve => setTimeout(resolve, delay));
                return retryWithBackoff(fn, retries - 1);
            }
            throw error;
        }
    };

        // Add this NEW function
const campaignTypeToBackendString = (campaignType: CampaignType): string => {
  switch (campaignType) {
    case CampaignType.PUBLIC:
      return 'Public';       // Backend needs "Public"
    case CampaignType.WHITELIST:
      return 'Whitelist';    // Backend needs "Whitelist"
    case CampaignType.SCHEDULED:
      return 'Scheduled';    // Backend needs "Scheduled"
    default:
      return 'Public';
  }
};

    // Get campaign type from mint type
    const getCampaignType = (mintType: string | null): CampaignType => {
        switch (mintType) {
            case 'whitelist':
            case 'wl-priority':
                return CampaignType.WHITELIST;
            case 'scheduled':
                return CampaignType.SCHEDULED;
            case 'public':
            default:
                return CampaignType.PUBLIC;
        }
    };


    // Step 1: Create Collection
    const executeCreateCollection = async (
        flowData: FlowData,
        episodeData: any
    ) => {
        setProcessingMessage('Creating NFT collection...');

        const result = await retryWithBackoff(async () => {
            return await createComicCollection({
                episodeId: episodeId,
                name: `${episodeData?.title || 'Unknown'} Collection`,
                symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
                maxSupply: flowData.rarity!.maxSupply,
            });
        });

        console.log("✅ Collection created:", result);

        const collectionData = {
            tokenId: result.tokenId!,
            transactionId: result.transactionId,
            name: `${episodeData?.title || 'Unknown'} Collection`,
            symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
            maxSupply: flowData.rarity!.maxSupply,
        };

        saveTransactionState({
            stage: 'collection_created',
            episodeId,
            collectionData,
            flowData,
            episodeData,
            timestamp: Date.now(),
        });

        return collectionData;
    };

    // Step 2: Create Inscription
    const executeCreateInscription = async (episodeData: any) => {
        setProcessingMessage('Creating inscription on Hedera Consensus Service...');

        const metadataURI = episodeData?.nftMetadataCid;
        const dbComicId = episodeData?._id || '';

        const result = await retryWithBackoff(async () => {
            return await createInscription(metadataURI, dbComicId);
        });

        console.log("✅ Inscription completed:", result);

        const topicId = result.topicId || '';
        const metadataHRL = `hcs://1/${topicId}`;

        const inscriptionData = {
            topicId,
            transactionId: result.transactionId || '',
            metadataHRL,
        };

        const currentState = transactionState!;
        saveTransactionState({
            ...currentState,
            stage: 'inscription_created',
            inscriptionData,
            timestamp: Date.now(),
        });

        return inscriptionData;
    };

    // Step 3: Create Campaign
    const executeCreateCampaign = async (
        flowData: FlowData,
        inscriptionData: { metadataHRL: string }
    ) => {
        setProcessingMessage('Creating campaign...');

        const campaignType = getCampaignType(flowData.mintType);
        console.log("Campaign Type:", campaignType)
        const maxSupply = parseInt(flowData.dropDetails!.supply) || flowData.rarity!.maxSupply;
        const mintPrice = parseFloat(flowData.dropDetails!.price);
        const maxPerWallet = parseInt(flowData.dropDetails!.maxMintPerWallet) || 1;

        const result = await retryWithBackoff(async () => {
            return await createCampaign({
                episodeId: episodeData?._id || '',
                campaignType: campaignType ,
                mintPrice: mintPrice,
                maxSupply: maxSupply,
                maxPerWallet: maxPerWallet,
                metadata: inscriptionData.metadataHRL
            });
        });

        console.log("✅ Campaign created:", result);

        // Get campaign ID from mirror node
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // const txIdFormatted = formatTxIdForMirror(result.transactionId);
        // const mirrorResponse = await fetch(
        //     `${getMirrorNodeUrl()}/api/v1/contracts/results/${txIdFormatted}`
        // );
        // const mirrorData = await mirrorResponse.json();
        
        // let campaignId: string | undefined;
        // if (mirrorData?.call_result) {
        //     campaignId = BigInt("0x" + mirrorData.call_result.slice(2)).toString();
        // }

        const campaignData: CampaignResult = {
            transactionId: result.transactionId,
            status: result.status,
            campaignId: result.campaignId || undefined
        };

        const currentState = transactionState!;
        saveTransactionState({
            ...currentState,
            stage: 'campaign_created',
            campaignData,
            timestamp: Date.now(),
        });

        return campaignData;
    };

    // Step 4: Add Whitelist (if needed)
    const executeAddWhitelist = async (
        campaignData: CampaignResult,
        whitelistData: WhitelistData
    ) => {
        setProcessingMessage('Adding whitelist addresses...');

        if (!campaignData.campaignId) {
            throw new Error('Campaign ID not found');
        }

        const addresses = whitelistData.wallets;
        const allocations = addresses.map(() => parseInt(whitelistData.maxMintPerWallet));

        const result = await retryWithBackoff(async () => {
            return await addToWhitelist({
                campaignId: parseInt(campaignData.campaignId!),
                addresses,
                allocations,
            });
        });

        console.log("✅ Whitelist added:", result);

        const currentState = transactionState!;
        saveTransactionState({
            ...currentState,
            stage: 'whitelist_added',
            whitelistTransactionId: result.transactionId,
            timestamp: Date.now(),
        });

        return result.transactionId;
    };

    // Step 5: Add Phases (if scheduled)
    const executeAddPhases = async (
        campaignData: CampaignResult,
        scheduleData: ScheduleData
    ) => {
        setProcessingMessage('Adding campaign phases...');

        if (!campaignData.campaignId || !scheduleData.phases) {
            throw new Error('Campaign ID or phases not found');
        }

        const phaseTxIds: string[] = [];

        for (const phase of scheduleData.phases) {
            const result = await retryWithBackoff(async () => {
                return await addPhase({
                    campaignId: parseInt(campaignData.campaignId!),
                    phaseType: phase.phaseType,
                    startTime: phase.startTime,
                    endTime: phase.endTime,
                    mintPrice: phase.mintPrice,
                    maxPerWallet: phase.maxPerWallet,
                    phaseSupply: phase.phaseSupply,
                });
            });

            console.log("✅ Phase added:", result);
            phaseTxIds.push(result.transactionId);

            // Small delay between phases
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const currentState = transactionState!;
        saveTransactionState({
            ...currentState,
            stage: 'phases_added',
            phasesTransactionIds: phaseTxIds,
            timestamp: Date.now(),
        });

        return phaseTxIds;
    };

    // Helper functions
    const formatTxIdForMirror = (txIdStr: string) => {
        return txIdStr
            .replace("@", "-")
            .replace(/\./g, (match, offset, string) => {
                const dotCount = string.slice(0, offset + 1).split('.').length - 1;
                return dotCount <= 2 ? "." : "-";
            });
    };

    const getMirrorNodeUrl = () => {
        return "https://testnet.mirrornode.hedera.com";
    };

    // Main transaction execution
    const executeTransaction = async (resumeFromState?: TransactionState) => {
        setIsProcessing(true);
        setRetryCount(0);
        setShowRetryModal(false);

        try {
            let currentState = resumeFromState || {
                stage: 'idle' as TransactionStage,
                episodeId,
                flowData,
                episodeData,
                timestamp: Date.now(),
            };

            if (!resumeFromState) {
                saveTransactionState(currentState);
            }

            let collectionData = currentState.collectionData;
            let inscriptionData = currentState.inscriptionData;
            let campaignData = currentState.campaignData;

            // Step 1: Create Collection
            if (!collectionData) {
                try {
                    currentState.stage = 'creating_collection';
                    saveTransactionState(currentState);
                    collectionData = await executeCreateCollection(flowData, episodeData);
                } catch (error: any) {
                    console.error("❌ Collection creation failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'creating_collection',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            }

            // Step 2: Create Inscription
            if (!inscriptionData) {
                try {
                    currentState.stage = 'creating_inscription';
                    saveTransactionState(currentState);
                    inscriptionData = await executeCreateInscription(episodeData);
                } catch (error: any) {
                    console.error("❌ Inscription creation failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'creating_inscription',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            }

            // Step 3: Create Campaign
            if (!campaignData) {
                try {
                    currentState.stage = 'creating_campaign';
                    saveTransactionState(currentState);
                    campaignData = await executeCreateCampaign(flowData, inscriptionData);
                } catch (error: any) {
                    console.error("❌ Campaign creation failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'creating_campaign',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            }

            // Step 4: Add Whitelist (if whitelist campaign)
            if ((flowData.mintType === 'whitelist' || flowData.mintType === 'wl-priority') && 
                flowData.whitelistData && 
                !currentState.whitelistTransactionId) {
                try {
                    currentState.stage = 'adding_whitelist';
                    saveTransactionState(currentState);
                    await executeAddWhitelist(campaignData, flowData.whitelistData);
                } catch (error: any) {
                    console.error("❌ Whitelist addition failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'adding_whitelist',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            }

            // Step 5: Add Phases (if scheduled campaign)
            if (flowData.mintType === 'scheduled' && 
                flowData.scheduleData?.phases && 
                !currentState.phasesTransactionIds) {
                try {
                    currentState.stage = 'adding_phases';
                    saveTransactionState(currentState);
                    await executeAddPhases(campaignData, flowData.scheduleData);
                } catch (error: any) {
                    console.error("❌ Phase addition failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'adding_phases',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            }

         
            // Success - Update backend
            setProcessingMessage('Updating backend...');

            const campaignTypeEnum = getCampaignType(flowData.mintType);
            const campaignTypeString = campaignTypeToBackendString(campaignTypeEnum);
            console.log('📤 Updating backend with:', {
            campaignId: campaignData.campaignId,
            campaignType: campaignTypeString,  // Will be "Public", "Whitelist", or "Scheduled"
            price: flowData.dropDetails.price,
});
            // const updateBackend = await dispatch(updateComicToken({
            //     comicId: episodeId,
            //     tokenId: collectionData.tokenId,
            //     listingId: null,
            //     campaignId: campaignData.campaignId || '',
            //     campaignType: campaignTypeString,
            //     price: flowData.dropDetails.price,
            //     serial: null,
            //     maxSupply: flowData.dropDetails?.supply || '',
            //     transactionId: campaignData.transactionId,
            //     metadataTopicIds: inscriptionData.topicId,
               
            // } as any));
 try {
  const updateBackend = await dispatch(updateComicToken({
    comicId: episodeId,
    tokenId: collectionData.tokenId,
    listingId: '',
    campaignId: campaignData.campaignId || '',
    campaignType: campaignTypeString,  // ✅ STRING for backend
    price: parseFloat(flowData.dropDetails.price),
    serial: null,
    maxSupply: flowData.dropDetails?.supply || '',
    transactionId: campaignData.transactionId,
    metadataTopicIds: inscriptionData.topicId,
  } as any));

  console.log("✅ Backend updated successfully:", updateBackend);
} catch (backendError) {
  console.error("⚠️ Backend update failed (blockchain succeeded):", backendError);
  // Don't throw - blockchain transaction succeeded
}
            // console.log("✅ Backend updated:", updateBackend);
            console.log("✅ Campaign setup complete!");
            setCampaignResult(campaignData);

            // Clear state and proceed to success
            clearTransactionState();
            setCurrentStep('success');

        } catch (error) {
            console.error("❌ Campaign setup failed:", error);
            setShowRetryModal(true);
        } finally {
            setIsProcessing(false);
            setRetryCount(0);
        }
    };

    // Step handlers
    const handleRaritySelect = (selectedRarity: string) => {
        const rarity = rarityOptions[selectedRarity as keyof typeof rarityOptions];
        setFlowData(prev => ({
            ...prev,
            rarity
        }));
        setCurrentStep('drop-details');
    };

    const handleDropDetailsNext = (dropDetailsData: DropFormData) => {
        setFlowData(prev => ({
            ...prev,
            dropDetails: dropDetailsData
        }));
        setCurrentStep('mint-type');
    };

    const handleMintTypeNext = (mintType: 'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop') => {
        setFlowData(prev => ({
            ...prev,
            mintType
        }));

        if (mintType === 'whitelist' || mintType === 'wl-priority') {
            setCurrentStep('whitelist');
        } else if (mintType === 'scheduled') {
            setCurrentStep('schedule');
        } else {
            setCurrentStep('review');
        }
    };

    const handleWhitelistNext = (whitelistData: WhitelistData) => {
        setFlowData(prev => ({
            ...prev,
            whitelistData
        }));
        setCurrentStep('review');
    };

    const handleScheduleNext = (scheduleData: ScheduleData) => {
        setFlowData(prev => ({
            ...prev,
            scheduleData
        }));
        setCurrentStep('review');
    };

    const handleReviewComplete = async () => {
        if (!flowData.dropDetails || !flowData.rarity || !episodeData) {
            console.error("Missing required data");
            return;
        }

        await executeTransaction();
        
    };

    const handleSuccessComplete = () => {
        onComplete?.();
        router.push('/comic-pad/collections');
    };

    // Retry handler
    const handleRetry = () => {
        if (transactionState) {
            executeTransaction(transactionState);
        }
    };

    const handleCancelRetry = () => {
        clearTransactionState();
        setShowRetryModal(false);
        setCurrentStep('rarity');
    };

    // Back handlers
    const handleBackFromDropDetails = () => setCurrentStep('rarity');
    const handleBackFromMintType = () => setCurrentStep('drop-details');
    const handleBackFromWhitelist = () => setCurrentStep('mint-type');
    const handleBackFromSchedule = () => setCurrentStep('mint-type');
    const handleBackFromReview = () => {
        if (flowData.mintType === 'whitelist' || flowData.mintType === 'wl-priority') {
            setCurrentStep('whitelist');
        } else if (flowData.mintType === 'scheduled') {
            setCurrentStep('schedule');
        } else {
            setCurrentStep('mint-type');
        }
    };

    const handleCancel = () => {
        onCancel?.();
    };

    // Prepare review data
    const reviewData = {
        title: episodeData?.title || episodeTitle,
        image: episodeData?.bannerImage || episodeImage,
        rarity: flowData.rarity || rarityOptions.legendary,
        supply: flowData.dropDetails?.supply || flowData.rarity?.supply?.split('—')[1]?.trim() || '5,000',
        price: flowData.dropDetails?.price ? `${flowData.dropDetails.price} HBAR` : '12 HBAR',
        royalty: flowData.dropDetails?.royalty ? `${flowData.dropDetails.royalty}%` : '5%',
        maxMintPerWallet: flowData.dropDetails?.maxMintPerWallet || '1',
        bannerImage: flowData.dropDetails?.bannerImage || null,
        mintType: flowData.mintType || 'public',
        whitelistData: flowData.whitelistData,
        scheduleData: flowData.scheduleData
    };

    return (
        <div className="relative">
            {/* Loading Overlay */}
            {(loading && !episodeData) && (
                <LoadingOverlay message="Retrieving episode details..." />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <LoadingOverlay 
                    message={processingMessage || "Processing..."}
                    retryCount={retryCount}
                />
            )}

            {/* Retry Modal */}
            {showRetryModal && transactionState?.error && (
                <RetryModal
                    error={transactionState.error}
                    onRetry={handleRetry}
                    onCancel={handleCancelRetry}
                    transactionState={transactionState}
                />
            )}

            {/* Rarity Selection Step */}
            {currentStep === 'rarity' && (
                <EpisodeRarity
                    episodeTitle={episodeData?.title || episodeTitle}
                    onBack={handleCancel}
                    onCancel={handleCancel}
                    onContinue={handleRaritySelect}
                />
            )}

            {/* Drop Details Step */}
            {currentStep === 'drop-details' && (
                <DropDetails
                    selectedRarity={flowData.rarity || undefined}
                    onBack={handleBackFromDropDetails}
                    onNext={handleDropDetailsNext}
                />
            )}

            {/* Mint Type Step */}
            {currentStep === 'mint-type' && (
                <MintType 
                    onBack={handleBackFromMintType} 
                    onNext={handleMintTypeNext} 
                />
            )}

            {/* Whitelist Settings Step */}
            {currentStep === 'whitelist' && (
                <WhitelistSettings
                    onBack={handleBackFromWhitelist}
                    onNext={handleWhitelistNext}
                />
            )}

            {/* Set Schedule Step */}
            {currentStep === 'schedule' && (
                <SetSchedule 
                    onBack={handleBackFromSchedule} 
                    onNext={handleScheduleNext} 
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
            {currentStep === 'success' && (
                <DropSuccessModal
                    episodeTitle={episodeData?.title || episodeTitle}
                    onBackToCollection={handleSuccessComplete}
                    onViewListing={handleSuccessComplete}
                    isOpen={true}
                    // campaignInfo={campaignResult}
                />
            )}
        </div>
    );
};

// Helper Components
const LoadingOverlay: React.FC<{ message: string; retryCount?: number }> = ({ message, retryCount }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Processing...</h3>
                <p className="text-gray-600">{message}</p>
                {retryCount && retryCount > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                        Retry attempt {retryCount}/{MAX_RETRIES}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const RetryModal: React.FC<{
    error: { stage: TransactionStage; message: string; timestamp: number };
    onRetry: () => void;
    onCancel: () => void;
    transactionState: TransactionState;
}> = ({ error, onRetry, onCancel, transactionState }) => {
    const getStageDescription = (stage: TransactionStage): string => {
        const descriptions: Record<TransactionStage, string> = {
            idle: 'Starting',
            creating_collection: 'Creating NFT Collection',
            collection_created: 'Collection Created',
            creating_inscription: 'Creating Inscription',
            inscription_created: 'Inscription Created',
            creating_campaign: 'Creating Campaign',
            campaign_created: 'Campaign Created',
            adding_whitelist: 'Adding Whitelist',
            whitelist_added: 'Whitelist Added',
            adding_phases: 'Adding Phases',
            phases_added: 'Phases Added',
            completed: 'Completed',
            failed: 'Failed',
        };
        return descriptions[stage] || 'Unknown Stage';
    };

    const getCompletedSteps = () => {
        const steps = [];
        if (transactionState.collectionData) steps.push('✅ Collection Created');
        if (transactionState.inscriptionData) steps.push('✅ Inscription Created');
        if (transactionState.campaignData) steps.push('✅ Campaign Created');
        if (transactionState.whitelistTransactionId) steps.push('✅ Whitelist Added');
        if (transactionState.phasesTransactionIds) steps.push('✅ Phases Added');
        return steps;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg">
                <div className="text-center">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">Campaign Setup Failed</h3>
                    <p className="text-gray-600 mb-4">
                        Failed at: <span className="font-semibold">{getStageDescription(error.stage)}</span>
                    </p>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-red-600">{error.message}</p>
                    </div>

                    {getCompletedSteps().length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                            <p className="text-sm font-semibold text-green-800 mb-2">Completed Steps:</p>
                            {getCompletedSteps().map((step, index) => (
                                <p key={index} className="text-sm text-green-700">{step}</p>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-6">
                        You can retry from where it failed, or start fresh.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Start Fresh
                        </button>
                        <button
                            onClick={onRetry}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry from Failed Step
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropView;