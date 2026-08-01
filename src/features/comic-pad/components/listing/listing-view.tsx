// 'use client';

// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { useParams, useRouter } from 'next/navigation';

// // Components
// import EpisodeRarity from './steps/EpisodeRarity';
// import ListingDetails from './steps/ListingDetails';
// import ReviewDetails from './steps/ReviewDetails';
// import ListingSuccessModal from './steps/ListingSuccessModal';

// // Hooks
// import { useAppDispatch, useAppSelector } from '@/redux/hook';
// import { useHederaWallet } from '@/providers/HashPackProvider';

// // Redux
// import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

// // Assets
// import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

// // Types
// type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

// import useComicPlatform from '@/hook/useMarkeplace';

// interface ListViewProps {
//     episodeTitle?: string;
//     episodeImage?: string;
//     onCancel?: () => void;
// }

// interface RarityOption {
//     name: string;
//     type: 'legendary' | 'epic' | 'common';
//     supply: string;
//     maxSupply: number;
//     icon: React.ReactNode;
// }

// interface ListingData {
//     supply: string;
//     price: string;
//     royalty: string;
// }

// interface FlowData {
//     rarity: RarityOption | null;
//     listing: ListingData | null;
// }

// interface MintResult {
//     tokenId: string;
//     serials: number[];
//     transactionId: string;
//     listingId?: string;
//     status: string;
// }

// // Transaction State Types
// type TransactionStage = 
//     | 'idle'
//     | 'creating_collection'
//     | 'collection_created'
//     | 'minting_and_listing'
//     | 'completed'
//     | 'failed';

// interface TransactionState {
//     stage: TransactionStage;
//     episodeId: string;
//     collectionData?: {
//         tokenId: string;
//         transactionId: string;
//         name: string;
//         symbol: string;
//         maxSupply: number;
//     };
//     mintingData?: {
//         tokenId: string;
//         serials: number[];
//         transactionId: string;
//         listingId?: string;
//         status: string;
//     };
//     flowData?: FlowData;
//     episodeData?: any;
//     error?: {
//         stage: TransactionStage;
//         message: string;
//         timestamp: number;
//     };
//     timestamp: number;
// }

// // Constants
// const AUTO_RENEW_PERIOD = 7000000;
// const TRANSACTION_STATE_KEY = 'nft_transaction_state';
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000; // 2 seconds

// const RARITY_OPTIONS: Record<string, RarityOption> = {
//     legendary: {
//         name: 'Legendary',
//         type: 'legendary',
//         supply: 'Supply 1 – 5,000',
//         maxSupply: 5000,
//         icon: <Image src={crownIcon} alt="legendary" className="w-6 h-6 object-cover" />
//     },
//     epic: {
//         name: 'Epic',
//         type: 'epic',
//         supply: 'Supply 1 – 8,000',
//         maxSupply: 8000,
//         icon: <Image src={sportsMedal} alt="epic" className="w-6 h-6 object-cover" />
//     },
//     common: {
//         name: 'Common',
//         type: 'common',
//         supply: 'Infinite',
//         maxSupply: 1000000,
//         icon: <Image src={sportsMedal} alt="common" className="w-6 h-6 object-cover" />
//     }
// };

// const ListView: React.FC<ListViewProps> = ({
//     episodeTitle = "Great Manga #2",
//     episodeImage = "/api/placeholder/200/200",
//     onCancel,
// }) => {
//     const router = useRouter();
//     const params = useParams();
//     const dispatch = useAppDispatch();
//     const episodeId = params.episode as string;

//     // State
//     const [currentStep, setCurrentStep] = useState<FlowStep>('rarity');
//     const [flowData, setFlowData] = useState<FlowData>({ rarity: null, listing: null });
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [mintedNFTs, setMintedNFTs] = useState<MintResult | null>(null);
//     const [episodeData, setEpisodeData] = useState<any>(null);
//     const [transactionState, setTransactionState] = useState<TransactionState | null>(null);
//     const [processingMessage, setProcessingMessage] = useState<string>('');
//     const [showRetryModal, setShowRetryModal] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);

//     // Redux state
//     const { loading, error: comicError } = useAppSelector((state: any) => state.comic);

//     // Wallet connection
//     const { account, signer } = useHederaWallet();
//     const { user } = useAppSelector((state: any) => state.wallet);

//     const {
//         createComicCollection,
//         createDirectListing
//     } = useComicPlatform({
//         accountId: account || user?.walletAddress || '',
//         network: "testnet",
//         signer: signer,
//     });

//     // Load transaction state from localStorage on mount
//     useEffect(() => {
//         const savedState = localStorage.getItem(TRANSACTION_STATE_KEY);
//         if (savedState) {
//             try {
//                 const parsed: TransactionState = JSON.parse(savedState);
//                 // Only restore if it's for the same episode and not older than 24 hours
//                 const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
//                 if (parsed.episodeId === episodeId && isRecent && parsed.stage !== 'completed') {
//                     setTransactionState(parsed);
//                     if (parsed.flowData) {
//                         setFlowData(parsed.flowData);
//                     }
//                     if (parsed.episodeData) {
//                         setEpisodeData(parsed.episodeData);
//                     }
//                     // Show retry modal if there was an error
//                     if (parsed.error) {
//                         setShowRetryModal(true);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error loading transaction state:", error);
//             }
//         }
//     }, [episodeId]);

//     // Save transaction state to localStorage
//     const saveTransactionState = (state: TransactionState) => {
//         setTransactionState(state);
//         localStorage.setItem(TRANSACTION_STATE_KEY, JSON.stringify(state));
//     };

//     // Clear transaction state
//     const clearTransactionState = () => {
//         setTransactionState(null);
//         localStorage.removeItem(TRANSACTION_STATE_KEY);
//     };

//     // Fetch episode data on mount
//     useEffect(() => {
//         const fetchEpisode = async () => {
//             const result = await dispatch(getComicById({ id: episodeId } as any));
//             if (result.payload) {
//                 setEpisodeData(result.payload?.data?.comic);
//                 console.log("Episode data loaded:", result.payload?.data?.comic);
//             }
//         };

//         if (episodeId) {
//             fetchEpisode();
//         }
//     }, [episodeId, dispatch]);

//     // Retry with exponential backoff
//     const retryWithBackoff = async <T,>(
//         fn: () => Promise<T>,
//         retries: number = MAX_RETRIES
//     ): Promise<T> => {
//         try {
//             return await fn();
//         } catch (error) {
//             if (retries > 0) {
//                 const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1);
//                 console.log(`Retry attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES} after ${delay}ms...`);
//                 setRetryCount(MAX_RETRIES - retries + 1);
//                 await new Promise(resolve => setTimeout(resolve, delay));
//                 return retryWithBackoff(fn, retries - 1);
//             }
//             throw error;
//         }
//     };

//     // Step 1: Create Collection
//     const executeCreateCollection = async (
//         flowData: FlowData,
//         episodeData: any
//     ) => {
//         setProcessingMessage('Creating NFT collection...');
        
//         const result = await retryWithBackoff(async () => {
//             return await createComicCollection({
//                 episodeId: episodeId,
//                 name: `${episodeData?.title || 'Unknown'} Collection`,
//                 symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//                 maxSupply: flowData.rarity!.maxSupply,
//             });
//         });
//         console.log("✅ Collection created:", result);
        
//         const collectionData = {
//             tokenId: result.tokenId!,
//             transactionId: result.transactionId,
//             name: `${episodeData?.title || 'Unknown'} Collection`,
//             symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//             maxSupply: flowData.rarity!.maxSupply,
//         };
//          console.log("Collection data to save:", collectionData);
//         saveTransactionState({
//             stage: 'collection_created',
//             episodeId,
//             collectionData,
//             flowData,
//             episodeData,
//             timestamp: Date.now(),
//         });

//         return collectionData;
//     };

//     // Step 2: Mint and List NFTs
//     const executeMintAndList = async (
//         flowData: FlowData,
//         ipfsMetadataUrl: string,
//         collectionData: { tokenId: string }
//     ) => {
//         setProcessingMessage('Minting and listing NFTs...');
        
//         const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

//         const result = await retryWithBackoff(async () => {
//             return await createDirectListing({
//                 episodeId: episodeData?._id || '',
//                 quantity: numberOfCopies,
//                 pricePerNFT: parseFloat(flowData.listing!.price),
//                 metadata: ipfsMetadataUrl
//             });
//         });

//         console.log("✅ NFTs minted and listed:", result);

//         const mintingData: MintResult = {
//             tokenId: collectionData.tokenId,
//             status: result.status || '',
//             serials: [], // Will be populated from result if available
//             transactionId: result.transactionId || "",
//             listingId: result.listingId || "",
//         };

//         const currentState = transactionState!;
//         saveTransactionState({
//             ...currentState,
//             stage: 'completed',
//             mintingData,
//             timestamp: Date.now(),
//         });

//         return mintingData;
//     };

//     // Main transaction execution with resume capability
//     const executeTransaction = async (resumeFromState?: TransactionState) => {
//         setIsProcessing(true);
//         setRetryCount(0);
//         setShowRetryModal(false);

//         try {
//             let currentState = resumeFromState || {
//                 stage: 'idle' as TransactionStage,
//                 episodeId,
//                 flowData,
//                 episodeData,
//                 timestamp: Date.now(),
//             };
//             console.log("Starting transaction with state:", currentState);

//             // Initialize transaction state if starting fresh
//             if (!resumeFromState) {
//                 saveTransactionState(currentState);
//             }

//             let collectionData = currentState.collectionData;
//             let mintingData = currentState.mintingData;

//             // Step 1: Create Collection (if not already done)
//             if (!collectionData) {
//                 try {
//                     currentState.stage = 'creating_collection';
//                     saveTransactionState(currentState);
//                     collectionData = await executeCreateCollection(flowData, episodeData);
//                 } catch (error: any) {
//                     console.error("❌ Collection creation failed:", error);
//                     saveTransactionState({
//                         ...currentState,
//                         stage: 'failed',
//                         error: {
//                             stage: 'creating_collection',
//                             message: error.message,
//                             timestamp: Date.now(),
//                         },
//                     });
//                     throw error;
//                 }
//             } else {
//                 console.log("✅ Using existing collection:", collectionData);
//             }

//             // Step 2: Mint and List (if not already done)
//             if (!mintingData) {
//                 try {
//                     currentState.stage = 'minting_and_listing';
//                     saveTransactionState(currentState);
//                     const cid = episodeData?.nftMetadataCid || '';
//                     const ipfsMetadataUrl = cid.startsWith('http') ? cid : `https://gateway.pinata.cloud/ipfs/${cid}`;
//                     mintingData = await executeMintAndList(flowData, ipfsMetadataUrl, collectionData!);
//                 } catch (error: any) {
//                     console.error("❌ Minting and listing failed:", error);
//                     saveTransactionState({
//                         ...currentState,
//                         stage: 'failed',
//                         error: {
//                             stage: 'minting_and_listing',
//                             message: error.message,
//                             timestamp: Date.now(),
//                         },
//                     });
//                     throw error;
//                 }
//             } else {
//                 console.log("✅ Using existing minting data:", mintingData);
//             }

//             // Save complete info
//             setMintedNFTs(mintingData);
//             localStorage.setItem('lastMintedNFT', JSON.stringify(mintingData));

//             const completeInfo = {
//                 collection: collectionData,
//                 minted: mintingData,
//                 listingId: mintingData.listingId,
//                 serial: mintingData.serials[0] || 0,
//                 price: parseFloat(flowData.listing!.price),
//                 metadata: {
//                     cid: episodeData?.nftMetadataCid,
//                     comicId: episodeId,
//                 },
//             };

//             localStorage.setItem('completeNFTInfo', JSON.stringify(completeInfo));

//             // Step 4: Update backend
//             setProcessingMessage('Updating backend...');
//             const updateResult = await dispatch(updateComicToken({
//                 comicId: episodeId,
//                 tokenId: collectionData!.tokenId,
//                 listingId: mintingData.listingId || '',
//                 campaignId: '',
//                 campaignType: 'direct_listing',
//                 price: parseFloat(flowData.listing!.price),
//                 serial: mintingData.serials[0] || 0,
//                 transactionId: mintingData.transactionId || '',
//                 maxSupply: flowData.listing!.supply,
//             } as any));

//             console.log("✅ Backend updated:", updateResult);
//             console.log("✅ Complete NFT creation and listing successful!");

//             // Clear transaction state on success
//             clearTransactionState();
//             setCurrentStep('success');

//         } catch (error) {
//             console.error("❌ Error in NFT creation/listing process:", error);
//             setShowRetryModal(true);
//         } finally {
//             setIsProcessing(false);
//             setRetryCount(0);
//         }
//     };

//     // Handler for review complete
//     const handleReviewComplete = async () => {
//         if (!flowData.listing || !flowData.rarity || !episodeData) {
//             console.error("Missing required data");
//             return;
//         }

//         await executeTransaction();
//     };

//     // Handler for retry button
//     const handleRetry = () => {
//         if (transactionState) {
//             executeTransaction(transactionState);
//         }
//     };

//     // Handler for cancel retry and start fresh
//     const handleCancelRetry = () => {
//         clearTransactionState();
//         setShowRetryModal(false);
//         setCurrentStep('rarity');
//     };

//     // Step handlers
//     const handleRaritySelect = (selectedRarity: string) => {
//         const rarity = RARITY_OPTIONS[selectedRarity];
//         setFlowData(prev => ({ ...prev, rarity }));
//         setCurrentStep('listing');
//     };

//     const handleListingDetails = (listingData: ListingData) => {
//         setFlowData(prev => ({ 
//             ...prev, 
//             listing: {
//                 supply: listingData.supply,
//                 price: listingData.price,
//                 royalty: listingData.royalty || '5'
//             }
//         }));
//         setCurrentStep('review');
//     };

//     const handleSuccessComplete = () => {
//         router.push('/marketplace');
//     };

//     const handleBackFromListing = () => setCurrentStep('rarity');
//     const handleBackFromReview = () => setCurrentStep('listing');

//     // Prepare review data
//     const reviewData = {
//         title: episodeData?.title || episodeTitle || "Episode Title",
//         image: episodeData?.bannerImage || episodeImage || "/api/placeholder/400/300",
//         rarity: {
//             name: flowData.rarity?.name || 'Legendary',
//             type: flowData.rarity?.type || 'legendary',
//             supply: flowData.rarity?.supply || 'Supply 1 — 5,000',
//             maxSupply: flowData.rarity?.maxSupply || 5000
//         },
//         supply: flowData.listing?.supply || '1000',
//         price: flowData.listing?.price || '10',
//         royalty: '5%' // Fixed royalty
//     };

//     return (
//         <div className="relative">
//             {/* Data Loading Overlay */}
//             {loading && !episodeData && (
//                 <LoadingOverlay message="Retrieving episode details, please wait..." />
//             )}

//             {/* Error Overlay */}
//             {comicError && !showRetryModal && (
//                 <ErrorOverlay message={comicError} />
//             )}

//             {/* Processing Overlay */}
//             {isProcessing && (
//                 <LoadingOverlay 
//                     message={processingMessage || "Processing transaction..."}
//                     retryCount={retryCount}
//                 />
//             )}

//             {/* Retry Modal */}
//             {showRetryModal && transactionState?.error && (
//                 <RetryModal
//                     error={transactionState.error}
//                     onRetry={handleRetry}
//                     onCancel={handleCancelRetry}
//                     transactionState={transactionState}
//                 />
//             )}

//             {/* Rarity Selection Step */}
//             {currentStep === 'rarity' && (
//                 <EpisodeRarity
//                     episodeTitle={episodeData?.title || episodeTitle}
//                     onBack={onCancel}
//                     onCancel={onCancel}
//                     onContinue={handleRaritySelect}
//                 />
//             )}

//             {/* Listing Details Step */}
//             {currentStep === 'listing' && (
//                 <ListingDetails
//                     selectedRarity={flowData.rarity}
//                     onBack={handleBackFromListing}
//                     onNext={handleListingDetails}
//                 />
//             )}

//             {/* Review Details Step */}
//             {currentStep === 'review' && (
//                 <ReviewDetails
//                     episodeData={reviewData}
//                     onBack={handleBackFromReview}
//                     onList={handleReviewComplete}
//                 />
//             )}

//             {/* Success Modal */}
//             {currentStep === 'success' && mintedNFTs && (
//                 <ListingSuccessModal
//                     episodeTitle={episodeData?.title || episodeTitle}
//                     onBackToCollection={() => {
//                         router.back();
//                     }}
//                     onViewListing={handleSuccessComplete}
//                     isOpen={true}
//                     nftInfo={{
//                         tokenId: mintedNFTs.tokenId,
//                         serialNumber: mintedNFTs.serials[0],
//                         transactionId: mintedNFTs.transactionId,
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// // Helper Components
// const LoadingOverlay: React.FC<{ message: string; error?: string; retryCount?: number }> = ({ 
//     message, 
//     error,
//     retryCount 
// }) => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-8 max-w-md">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                 <h3 className="text-xl font-bold mb-2">Processing...</h3>
//                 <p className="text-gray-600">{message}</p>
//                 {retryCount && retryCount > 0 && (
//                     <p className="text-sm text-blue-600 mt-2">
//                         Retry attempt {retryCount}/{MAX_RETRIES}
//                     </p>
//                 )}
//                 {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
//             </div>
//         </div>
//     </div>
// );

// const ErrorOverlay: React.FC<{ message: string }> = ({ message }) => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-8 max-w-md">
//             <div className="text-center">
//                 <p className="text-red-600">{message}</p>
//             </div>
//         </div>
//     </div>
// );

// const RetryModal: React.FC<{
//     error: { stage: TransactionStage; message: string; timestamp: number };
//     onRetry: () => void;
//     onCancel: () => void;
//     transactionState: TransactionState;
// }> = ({ error, onRetry, onCancel, transactionState }) => {
//     const getStageDescription = (stage: TransactionStage): string => {
//         switch (stage) {
//             case 'creating_collection':
//                 return 'Creating NFT Collection';
//             // case 'creating_inscription':
//             //     return 'Creating Inscription';
//             case 'minting_and_listing':
//                 return 'Minting and Listing NFTs';
//             default:
//                 return 'Unknown Stage';
//         }
//     };

//     const getCompletedSteps = () => {
//         const steps = [];
//         if (transactionState.collectionData) {
//             steps.push('✅ Collection Created');
//         }
//         // if (transactionState.inscriptionData) {
//         //     steps.push('✅ Inscription Created');
//         // }
//         if (transactionState.mintingData) {
//             steps.push('✅ NFTs Minted and Listed');
//         }
//         return steps;
//     };

//     return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-8 max-w-lg">
//                 <div className="text-center">
//                     <div className="mb-4">
//                         <svg 
//                             className="w-16 h-16 text-yellow-500 mx-auto" 
//                             fill="none" 
//                             stroke="currentColor" 
//                             viewBox="0 0 24 24"
//                         >
//                             <path 
//                                 strokeLinecap="round" 
//                                 strokeLinejoin="round" 
//                                 strokeWidth={2} 
//                                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
//                             />
//                         </svg>
//                     </div>
                    
//                     <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
//                     <p className="text-gray-600 mb-4">
//                         Failed at: <span className="font-semibold">{getStageDescription(error.stage)}</span>
//                     </p>
                    
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                         <p className="text-sm text-red-600">{error.message}</p>
//                     </div>

//                     {getCompletedSteps().length > 0 && (
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
//                             <p className="text-sm font-semibold text-green-800 mb-2">Completed Steps:</p>
//                             {getCompletedSteps().map((step, index) => (
//                                 <p key={index} className="text-sm text-green-700">{step}</p>
//                             ))}
//                         </div>
//                     )}

//                     <p className="text-sm text-gray-500 mb-6">
//                         You can retry from where it failed, or start fresh with a new listing.
//                     </p>

//                     <div className="flex gap-4 justify-center">
//                         <button
//                             onClick={onCancel}
//                             className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                         >
//                             Start Fresh
//                         </button>
//                         <button
//                             onClick={onRetry}
//                             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             Retry from Failed Step
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ListView;

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Components
import EpisodeRarity from './steps/EpisodeRarity';
import ListingDetails from './steps/ListingDetails';
import ReviewDetails from './steps/ReviewDetails';
import ListingSuccessModal from './steps/ListingSuccessModal';

//Hooks
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { useHederaWallet } from '@/providers/HashPackProvider';

// Redux
import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

// Assets
import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

// Types
type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

 import useWagmiMarketplace from '@/hook/useWagmiMarketplace'

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
    listingId?: string;
    status: string;
}

// Transaction State Types
type TransactionStage = 
    | 'idle'
    | 'creating_collection'
    | 'collection_created'
    | 'minting_and_listing'
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
    mintingData?: {
        tokenId: string;
        serials: number[];
        transactionId: string;
        listingId?: string;
        status: string;
    };
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
const TRANSACTION_STATE_KEY = 'nft_transaction_state';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

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
    const [transactionState, setTransactionState] = useState<TransactionState | null>(null);
    const [processingMessage, setProcessingMessage] = useState<string>('');
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Redux state
    const { loading, error: comicError } = useAppSelector((state: any) => state.comic);

    // Wallet connection
    const { account, signer } = useHederaWallet();
    const { user } = useAppSelector((state: any) => state.wallet);

    const {
        createComicCollection,
        createDirectListing,
        statusMessage: hookStatusMessage,
    } = useWagmiMarketplace();

    // Load transaction state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(TRANSACTION_STATE_KEY);
        if (savedState) {
            try {
                const parsed: TransactionState = JSON.parse(savedState);
                // Only restore if it's for the same episode and not older than 24 hours
                const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
                if (parsed.episodeId === episodeId && isRecent && parsed.stage !== 'completed') {
                    setTransactionState(parsed);
                    if (parsed.flowData) {
                        setFlowData(parsed.flowData);
                    }
                    if (parsed.episodeData) {
                        setEpisodeData(parsed.episodeData);
                    }
                    // Show retry modal if there was an error
                    if (parsed.error) {
                        setShowRetryModal(true);
                    }
                }
            } catch (error) {
                console.error("Error loading transaction state:", error);
            }
        }
    }, [episodeId]);

    // Save transaction state to localStorage
    const saveTransactionState = (state: TransactionState) => {
        setTransactionState(state);
        localStorage.setItem(TRANSACTION_STATE_KEY, JSON.stringify(state));
    };

    // Clear transaction state
    const clearTransactionState = () => {
        setTransactionState(null);
        localStorage.removeItem(TRANSACTION_STATE_KEY);
    };

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

    // Step 1: Create Collection
    const executeCreateCollection = async (
        flowData: FlowData,
        episodeData: any
    ) => {
        try {
            // The hook now handles Mirror Node + Event Logs fallback internally!
            // No need for retryWithBackoff anymore
            const result = await createComicCollection({
                episodeId: episodeId,
                name: `${episodeData?.title || 'Unknown'} Collection`,
                symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
                maxSupply: flowData.rarity!.maxSupply,
            });
            
            console.log("✅ Collection created:", result);
            
            // ============================================
            // NEW: Check which indexing method was used
            // ============================================
            
            if (result.indexedVia === "event-logs") {
                console.warn("⚠️ Used Event Logs fallback (Mirror Node was unavailable)");
                // This is still successful, just used fallback
            } else {
                console.log("✅ Indexed via Mirror Node (normal path)");
            }
            
            const normalizedTokenId = result?.tokenId && /^0x[0-9a-fA-F]{40}$/.test(result.tokenId)
                ? (() => {
                    try {
                        return require('@hiero-ledger/sdk').TokenId.fromEvmAddress(0, 0, result.tokenId).toString();
                    } catch {
                        return result.tokenId;
                    }
                })()
                : result?.tokenId;

            const collectionData = {
                tokenId: normalizedTokenId!,
                transactionId: result.transactionId,
                name: `${episodeData?.title || 'Unknown'} Collection`,
                symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
                maxSupply: flowData.rarity!.maxSupply,
                indexedVia: result.indexedVia, // Track how it was indexed
            };
            
            console.log("Collection data to save:", collectionData);
            saveTransactionState({
                stage: 'collection_created',
                episodeId,
                collectionData,
                flowData,
                episodeData,
                timestamp: Date.now(),
            });

            return collectionData;
            
        } catch (err: any) {
            console.error("❌ Collection creation failed:", err);
            throw err;
        }
    };

    // Step 2: Mint and List NFTs
    const executeMintAndList = async (
        flowData: FlowData,
        ipfsMetadataUrl: string,
        collectionData: { tokenId: string }
    ) => {
        try {
            const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

            const result = await createDirectListing({
                episodeId: episodeData?._id || '',
                quantity: numberOfCopies,
                pricePerNFT: parseFloat(flowData.listing!.price),
                metadata: ipfsMetadataUrl
            });

            console.log("✅ NFTs minted and listed:", result);

            const mintingData: MintResult = {
                tokenId: collectionData.tokenId,
                status: result.status || '',
                serials: [], // Will be populated from result if available
                transactionId: result.transactionId || "",
                listingId: result.listingId || "",
            };

            const currentState = transactionState!;
            saveTransactionState({
                ...currentState,
                stage: 'completed',
                mintingData,
                timestamp: Date.now(),
            });

            return mintingData;
        } catch (err: any) {
            console.error("❌ Listing creation failed:", err);
            throw err;
        }
    };

    // Main transaction execution with resume capability
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
            console.log("Starting transaction with state:", currentState);

            // Initialize transaction state if starting fresh
            if (!resumeFromState) {
                saveTransactionState(currentState);
            }

            let collectionData = currentState.collectionData;
            let mintingData = currentState.mintingData;

            // Step 1: Create Collection (if not already done)
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
            } else {
                console.log("✅ Using existing collection:", collectionData);
            }

            // Step 2: Mint and List (if not already done)
            if (!mintingData) {
                try {
                    currentState.stage = 'minting_and_listing';
                    saveTransactionState(currentState);
                    const cid = episodeData?.nftMetadataCid || '';
                    const ipfsMetadataUrl = cid.startsWith('http') ? cid : `https://gateway.pinata.cloud/ipfs/${cid}`;
                    mintingData = await executeMintAndList(flowData, ipfsMetadataUrl, collectionData!);
                } catch (error: any) {
                    console.error("❌ Minting and listing failed:", error);
                    saveTransactionState({
                        ...currentState,
                        stage: 'failed',
                        error: {
                            stage: 'minting_and_listing',
                            message: error.message,
                            timestamp: Date.now(),
                        },
                    });
                    throw error;
                }
            } else {
                console.log("✅ Using existing minting data:", mintingData);
            }

            // Save complete info
            setMintedNFTs(mintingData);
            localStorage.setItem('lastMintedNFT', JSON.stringify(mintingData));

            const completeInfo = {
                collection: collectionData,
                minted: mintingData,
                listingId: mintingData.listingId,
                serial: mintingData.serials[0] || 0,
                price: parseFloat(flowData.listing!.price),
                metadata: {
                    cid: episodeData?.nftMetadataCid,
                    comicId: episodeId,
                },
            };

            localStorage.setItem('completeNFTInfo', JSON.stringify(completeInfo));

            // Step 4: Update backend
            setProcessingMessage('Updating backend...');
            const updateResult = await dispatch(updateComicToken({
                comicId: episodeId,
                tokenId: collectionData!.tokenId,
                listingId: mintingData.listingId || '',
                campaignId: '',
                campaignType: 'direct_listing',
                price: parseFloat(flowData.listing!.price),
                serial: mintingData.serials[0] || 0,
                transactionId: mintingData.transactionId || '',
                maxSupply: flowData.listing!.supply,
            } as any));

            console.log("✅ Backend updated:", updateResult);
            console.log("✅ Complete NFT creation and listing successful!");

            // Clear transaction state on success
            clearTransactionState();
            setCurrentStep('success');

        } catch (error) {
            console.error("❌ Error in NFT creation/listing process:", error);
            setShowRetryModal(true);
        } finally {
            setIsProcessing(false);
            setRetryCount(0);
        }
    };

    // Handler for review complete
    const handleReviewComplete = async () => {
        if (!flowData.listing || !flowData.rarity || !episodeData) {
            console.error("Missing required data");
            return;
        }

        await executeTransaction();
    };

    // Handler for retry button
    const handleRetry = () => {
        if (transactionState) {
            executeTransaction(transactionState);
        }
    };

    // Handler for cancel retry and start fresh
    const handleCancelRetry = () => {
        clearTransactionState();
        setShowRetryModal(false);
        setCurrentStep('rarity');
    };

    // Step handlers
    const handleRaritySelect = (selectedRarity: string) => {
        const rarity = RARITY_OPTIONS[selectedRarity];
        setFlowData(prev => ({ ...prev, rarity }));
        setCurrentStep('listing');
    };

    const handleListingDetails = (listingData: ListingData) => {
        setFlowData(prev => ({ 
            ...prev, 
            listing: {
                supply: listingData.supply,
                price: listingData.price,
                royalty: listingData.royalty || '5'
            }
        }));
        setCurrentStep('review');
    };

    const handleSuccessComplete = () => {
        router.push('/marketplace');
    };

    const handleBackFromListing = () => setCurrentStep('rarity');
    const handleBackFromReview = () => setCurrentStep('listing');

    // Prepare review data
    const reviewData = {
        title: episodeData?.title || episodeTitle || "Episode Title",
        image: episodeData?.bannerImage || episodeImage || "/api/placeholder/400/300",
        rarity: {
            name: flowData.rarity?.name || 'Legendary',
            type: flowData.rarity?.type || 'legendary',
            supply: flowData.rarity?.supply || 'Supply 1 — 5,000',
            maxSupply: flowData.rarity?.maxSupply || 5000
        },
        supply: flowData.listing?.supply || '1000',
        price: flowData.listing?.price || '10',
        royalty: '5%' // Fixed royalty
    };

    return (
        <div className="relative">
            {/* Data Loading Overlay */}
            {loading && !episodeData && (
                <LoadingOverlay message="Retrieving episode details, please wait..." />
            )}

            {/* Error Overlay */}
            {comicError && !showRetryModal && (
                <ErrorOverlay message={comicError} />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
                <LoadingOverlay 
                    message={hookStatusMessage || processingMessage || "Processing transaction..."}
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
const LoadingOverlay: React.FC<{ message: string; error?: string; retryCount?: number; usedFallback?: boolean }> = ({ 
    message, 
    error,
    retryCount,
    usedFallback
}) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Processing...</h3>
                <p className="text-gray-600">{message}</p>
                
                {/* Show which indexing method is being used */}
                {message?.includes('[Mirror Node]') && (
                    <p className="text-sm text-blue-600 mt-2">
                        📡 Attempting Mirror Node indexing...
                    </p>
                )}
                
                {message?.includes('[Event Logs]') && (
                    <p className="text-sm text-orange-500 mt-2">
                        ⚠️ Using Event Logs fallback (Mirror Node unavailable)
                    </p>
                )}
                
                {usedFallback && message?.includes('successfully') && (
                    <p className="text-sm text-orange-500 mt-2">
                        ✅ Collection created via Event Logs fallback
                    </p>
                )}
                
                {retryCount && retryCount > 0 && !message?.includes('Event Logs') && (
                    <p className="text-sm text-blue-600 mt-2">
                        Retry attempt {retryCount}/{MAX_RETRIES}
                    </p>
                )}
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

const RetryModal: React.FC<{
    error: { stage: TransactionStage; message: string; timestamp: number };
    onRetry: () => void;
    onCancel: () => void;
    transactionState: TransactionState;
}> = ({ error, onRetry, onCancel, transactionState }) => {
    const getStageDescription = (stage: TransactionStage): string => {
        switch (stage) {
            case 'creating_collection':
                return 'Creating NFT Collection';
            // case 'creating_inscription':
            //     return 'Creating Inscription';
            case 'minting_and_listing':
                return 'Minting and Listing NFTs';
            default:
                return 'Unknown Stage';
        }
    };

    const getCompletedSteps = () => {
        const steps = [];
        if (transactionState.collectionData) {
            steps.push('✅ Collection Created');
        }
        // if (transactionState.inscriptionData) {
        //     steps.push('✅ Inscription Created');
        // }
        if (transactionState.mintingData) {
            steps.push('✅ NFTs Minted and Listed');
        }
        return steps;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg">
                <div className="text-center">
                    <div className="mb-4">
                        <svg 
                            className="w-16 h-16 text-yellow-500 mx-auto" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                            />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
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
                        You can retry from where it failed, or start fresh with a new listing.
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

export default ListView;