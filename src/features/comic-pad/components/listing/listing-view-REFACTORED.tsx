// 'use client';

// /**
//  * REFACTORED: listing-view.tsx with Wagmi Integration
//  * 
//  * This shows how to integrate wagmi hooks into your existing listing-view component.
//  * 
//  * Key changes:
//  * 1. Added wallet detection (useWalletDetector)
//  * 2. Added wagmi contract hooks (useWagmiComicContract)
//  * 3. Updated collection creation to use wagmi
//  * 4. Updated direct listing creation to use wagmi
//  * 5. Automatic wallet routing - no manual conditional logic needed
//  */

// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { useParams, useRouter } from 'next/navigation';
// import { useAccount } from 'wagmi'; // ✅ NEW: From wagmi

// // Components
// import EpisodeRarity from './steps/EpisodeRarity';
// import ListingDetails from './steps/ListingDetails';
// import ReviewDetails from './steps/ReviewDetails';
// import ListingSuccessModal from './steps/ListingSuccessModal';

// // Hooks - OLD (kept for reference, can be migrated gradually)
// import { useAppDispatch, useAppSelector } from '@/redux/hook';
// import { useHederaWallet } from '@/providers/HashPackProvider';

// // Hooks - NEW ✅ (Wagmi integration)
// import { useWalletDetector, WalletType } from '@/hook/useWalletDetector';
// import { useWagmiComicContract } from '@/hook/useWagmiComicContract';
// import { useWalletAwareTransaction } from '@/hook/useWalletAwareTransaction';

// // Redux
// import { getComicById, updateComicToken } from '@/redux/slices/comicSlice';

// // Assets
// import { crownIcon, sportsMedal } from '../../../../../public/dev_images';

// // Types
// type FlowStep = 'rarity' | 'listing' | 'review' | 'success';

// import useComicPlatform from '@/hook/useMarkeplace';
// import { useComicInscription } from '@/hook/useComicInscription';

// // ... (same types as before) ...

// // ============================================
// // START: Modified Version with Wagmi
// // ============================================

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

// type TransactionStage = 
//     | 'idle'
//     | 'creating_collection'
//     | 'collection_created'
//     | 'creating_inscription'
//     | 'inscription_created'
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
//     inscriptionData?: {
//         topicId: string;
//         transactionId: string;
//         metadataHRL: string;
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
// const AUTO_RENEW_PERIOD = 7776000; // 90 days in seconds
// const TRANSACTION_STATE_KEY = 'nft_transaction_state';
// const MAX_RETRIES = 30;
// const RETRY_DELAY = 2000;

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

//     // ==========================================
//     // ✅ NEW: Wallet Detection Hooks
//     // ==========================================
//     const wallet = useWalletDetector();
//     const { address: evmAddress } = useAccount();
//     const walletAware = useWalletAware();
//     const txExecutor = useWalletAwareTransaction();

//     // ==========================================
//     // ✅ NEW: Wagmi Contract Hooks
//     // ==========================================
//     const {
//         createComicCollection: wagmiCreateCollection,
//         createDirectListing: wagmiCreateDirectListing,
//         isProcessing: contractProcessing,
//         error: contractError
//     } = useWagmiComicContract();

//     // ==========================================
//     // OLD: Legacy Hooks (kept for gradual migration)
//     // ==========================================
//     const { account, signer } = useHederaWallet();
//     const { user } = useAppSelector((state: any) => state.wallet);

//     const {
//         createComicCollection: legacyCreateCollection,
//         createDirectListing: legacyCreateDirectListing
//     } = useComicPlatform({
//         accountId: account || user?.walletAddress || '',
//         network: "testnet",
//         signer: signer,
//     });

//     const {
//         createInscription
//     } = useComicInscription({
//         accountId: account || user?.walletAddress || '',
//         network: "testnet",
//         signer: signer,
//     });

//     // Local State
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

//     // Load transaction state from localStorage on mount
//     useEffect(() => {
//         const savedState = localStorage.getItem(TRANSACTION_STATE_KEY);
//         if (savedState) {
//             try {
//                 const parsed: TransactionState = JSON.parse(savedState);
//                 const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
//                 if (parsed.episodeId === episodeId && isRecent && parsed.stage !== 'completed') {
//                     setTransactionState(parsed);
//                     if (parsed.flowData) {
//                         setFlowData(parsed.flowData);
//                     }
//                     if (parsed.episodeData) {
//                         setEpisodeData(parsed.episodeData);
//                     }
//                     if (parsed.error) {
//                         setShowRetryModal(true);
//                     }
//                 }
//             } catch (error) {
//                 console.error("Error loading transaction state:", error);
//             }
//         }
//     }, [episodeId]);

//     // Save transaction state
//     const saveTransactionState = (state: TransactionState) => {
//         setTransactionState(state);
//         localStorage.setItem(TRANSACTION_STATE_KEY, JSON.stringify(state));
//     };

//     // Clear transaction state
//     const clearTransactionState = () => {
//         setTransactionState(null);
//         localStorage.removeItem(TRANSACTION_STATE_KEY);
//     };

//     // Fetch episode data
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

//     // ==========================================
//     // ✅ MODIFIED: Create Collection with Wagmi
//     // ==========================================
//     const executeCreateCollection = async (
//         flowData: FlowData,
//         episodeData: any
//     ) => {
//         setProcessingMessage('Creating NFT collection...');

//         // ✅ Check wallet connection
//         if (!wallet.isConnected) {
//             throw new Error('Please connect a wallet first');
//         }

//         console.log(`🔄 Creating collection on ${wallet.type} wallet...`);

//         const result = await retryWithBackoff(async () => {
//             // ✅ Use Wagmi hook - automatically routes to correct wallet
//             return await wagmiCreateCollection(
//                 episodeId,
//                 `${episodeData?.title || 'Unknown'} Collection`,
//                 flowData.rarity!.type.toUpperCase().substring(0, 4),
//                 `${episodeData?.title} NFT Collection`,
//                 BigInt(flowData.rarity!.maxSupply),
//                 BigInt(AUTO_RENEW_PERIOD),
//                 {
//                     onSuccess: (hash) => {
//                         console.log('✅ Collection created:', hash);
//                         setProcessingMessage('Collection created successfully!');
//                     },
//                     onError: (err) => {
//                         console.error('❌ Collection creation failed:', err);
//                         setProcessingMessage(`Error: ${err.message}`);
//                     }
//                 }
//             );
//         });

//         // ✅ Map response - wagmi returns transaction hash
//         const collectionData = {
//             tokenId: result || 'pending', // Will be updated after blockchain confirmation
//             transactionId: result || '',
//             name: `${episodeData?.title || 'Unknown'} Collection`,
//             symbol: flowData.rarity!.type.toUpperCase().substring(0, 4),
//             maxSupply: flowData.rarity!.maxSupply,
//         };

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

//     // ==========================================
//     // ✅ MODIFIED: Create Inscription (unchanged)
//     // ==========================================
//     const executeCreateInscription = async (
//         episodeData: any
//     ) => {
//         setProcessingMessage('Creating inscription on Hedera Consensus Service...');

//         const metadataURI = episodeData?.nftMetadataCid;
//         const dbComicId = episodeData?._id || '';

//         const result = await retryWithBackoff(async () => {
//             return await createInscription(metadataURI, dbComicId);
//         });

//         console.log("✅ Inscription completed:", result);

//         const topicId = result.topicId || '';
//         const metadataHRL = `hcs://1/${topicId}`;

//         const inscriptionData = {
//             topicId,
//             transactionId: result.transactionId || '',
//             metadataHRL,
//         };

//         const currentState = transactionState!;
//         saveTransactionState({
//             ...currentState,
//             stage: 'inscription_created',
//             inscriptionData,
//             timestamp: Date.now(),
//         });

//         return inscriptionData;
//     };

//     // ==========================================
//     // ✅ MODIFIED: Mint and List with Wagmi
//     // ==========================================
//     const executeMintAndList = async (
//         flowData: FlowData,
//         inscriptionData: { metadataHRL: string; topicId: string },
//         collectionData: { tokenId: string }
//     ) => {
//         setProcessingMessage('Minting and listing NFTs...');

//         // ✅ Check wallet connection
//         if (!wallet.isConnected) {
//             throw new Error('Please connect a wallet first');
//         }

//         console.log(`🔄 Creating direct listing on ${wallet.type} wallet...`);

//         const numberOfCopies = parseInt(flowData.listing!.supply) || 1;

//         const result = await retryWithBackoff(async () => {
//             // ✅ Use Wagmi hook - automatically routes to correct wallet
//             return await wagmiCreateDirectListing(
//                 episodeId,
//                 BigInt(parseFloat(flowData.listing!.price) * 100_000_000), // Convert to tinybars
//                 BigInt(numberOfCopies),
//                 {
//                     onSuccess: (hash) => {
//                         console.log('✅ Direct listing created:', hash);
//                         setProcessingMessage('NFTs listed successfully!');
//                     },
//                     onError: (err) => {
//                         console.error('❌ Listing failed:', err);
//                         setProcessingMessage(`Error: ${err.message}`);
//                     }
//                 }
//             );
//         });

//         console.log("✅ NFTs minted and listed:", result);

//         const mintingData: MintResult = {
//             tokenId: collectionData.tokenId,
//             status: 'listed',
//             serials: [],
//             transactionId: result || "",
//             listingId: result || "",
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

//     // ==========================================
//     // Main Transaction Execution (unchanged logic)
//     // ==========================================
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

//             if (!resumeFromState) {
//                 saveTransactionState(currentState);
//             }

//             let collectionData = currentState.collectionData;
//             let inscriptionData = currentState.inscriptionData;
//             let mintingData = currentState.mintingData;

//             // Step 1: Create Collection
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
//             }

//             // Step 2: Create Inscription
//             if (!inscriptionData) {
//                 try {
//                     currentState.stage = 'creating_inscription';
//                     saveTransactionState(currentState);
//                     inscriptionData = await executeCreateInscription(episodeData);
//                 } catch (error: any) {
//                     console.error("❌ Inscription creation failed:", error);
//                     saveTransactionState({
//                         ...currentState,
//                         stage: 'failed',
//                         error: {
//                             stage: 'creating_inscription',
//                             message: error.message,
//                             timestamp: Date.now(),
//                         },
//                     });
//                     throw error;
//                 }
//             }

//             // Step 3: Mint and List
//             if (!mintingData) {
//                 try {
//                     currentState.stage = 'minting_and_listing';
//                     saveTransactionState(currentState);
//                     mintingData = await executeMintAndList(flowData, inscriptionData, collectionData);
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
//             }

//             // Success
//             currentState.stage = 'completed';
//             saveTransactionState(currentState);

//             setMintedNFTs(mintingData);
//             setCurrentStep('success');
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     // ==========================================
//     // ✅ NEW: Wallet Check Before Rendering Flow
//     // ==========================================
//     const handleStartListing = () => {
//         // Check wallet connection before proceeding
//         if (!wallet.isConnected) {
//             alert(`❌ Please connect a wallet first. Current: ${wallet.type}`);
//             return;
//         }

//         console.log(`✅ Using ${wallet.type} wallet for listing`);
//         setCurrentStep('rarity');
//     };

//     // ==========================================
//     // Render
//     // ==========================================
//     if (!wallet.isConnected) {
//         return (
//             <div className="p-6 text-center">
//                 <h2>Connect Your Wallet</h2>
//                 <p className="text-gray-600">
//                     Please connect a wallet (RainbowKit for Ethereum or HashPack for Hedera) to create listings.
//                 </p>
//                 <p className="text-sm text-gray-400 mt-2">
//                     Wallet Status: {wallet.type === WalletType.NONE ? '❌ Not Connected' : `🟢 ${wallet.type}`}
//                 </p>
//             </div>
//         );
//     }

//     // Show wallet info in UI
//     const renderWalletBadge = () => (
//         <div className="mb-4 p-3 bg-blue-100 rounded-lg text-sm">
//             <p>🔐 Connected Wallet: <strong>{wallet.type}</strong></p>
//             {wallet.address && (
//                 <p className="text-xs text-gray-600">
//                     {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
//                 </p>
//             )}
//         </div>
//     );

//     // Render appropriate step
//     return (
//         <div className="comic-listing-container">
//             {renderWalletBadge()}
            
//             {/* Show error message if contract has error */}
//             {contractError && (
//                 <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
//                     Contract Error: {contractError.message}
//                 </div>
//             )}

//             {currentStep === 'rarity' && (
//                 <EpisodeRarity
//                     selected={flowData.rarity}
//                     options={RARITY_OPTIONS}
//                     onSelect={(rarity) => {
//                         setFlowData({ ...flowData, rarity });
//                         setCurrentStep('listing');
//                     }}
//                 />
//             )}

//             {currentStep === 'listing' && (
//                 <ListingDetails
//                     onNext={(listing) => {
//                         setFlowData({ ...flowData, listing });
//                         setCurrentStep('review');
//                     }}
//                     onBack={() => setCurrentStep('rarity')}
//                 />
//             )}

//             {currentStep === 'review' && (
//                 <ReviewDetails
//                     flowData={flowData}
//                     episodeData={episodeData}
//                     isProcessing={isProcessing || contractProcessing}
//                     processingMessage={processingMessage}
//                     onConfirm={() => executeTransaction()}
//                     onBack={() => setCurrentStep('listing')}
//                 />
//             )}

//             {currentStep === 'success' && mintedNFTs && (
//                 <ListingSuccessModal
//                     nftData={mintedNFTs}
//                     onClose={() => {
//                         clearTransactionState();
//                         router.push(`/dashboard`);
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default ListView;

// // ============================================
// // Summary of Changes:
// // ============================================
// /*
//  * 1. ✅ Added `useWalletDetector()` to detect wallet type
//  * 2. ✅ Added `useWagmiComicContract()` for wagmi-based contract calls
//  * 3. ✅ Added wallet connection check before operations
//  * 4. ✅ Modified `executeCreateCollection()` to use wagmi hook
//  * 5. ✅ Modified `executeMintAndList()` to use wagmi hook
//  * 6. ✅ Added wallet badge to UI showing connected wallet
//  * 7. ✅ Automatic routing - no need to check wallet type in contract calls
//  * 8. ✅ Kept legacy hooks for gradual migration
//  * 9. ✅ Added error handling with wallet-specific messages
//  * 10. ✅ BigInt conversion for amounts
//  *
//  * The same pattern can be applied to other components.
//  * Just import the hooks and use them - they handle everything!
//  */
