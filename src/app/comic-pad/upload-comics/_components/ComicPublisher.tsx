// components/ComicPublisher.tsx (Enhanced with KiloScribe)
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Upload, Zap, Database, Hash } from "lucide-react";
import { ComicNotification } from "./ComicNotification";
import Picture from "@/components/picture/Index";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
// import { useComicMinting } from "../../;
// import { useFreeComicMinting } from "@/hook/useFreeComicMinting";
// import { useAccount } from "@/hook/useUnifiedWallet";
import { kiloScribeService, InscriptionProgress, InscriptionResult } from "@/lib/kiloscribe-service";
import { useMintComic } from "@/hook/useMintComic";
import { useComicInscription } from "@/hook/useComicInscription"
import { useAccount } from "wagmi";
import { useHederaWallet } from "@/providers/HashPackProvider";
import {LedgerId, AccountId} from "@hiero-ledger/sdk"
interface ExtractedFile {
	name: string;
	blob: Blob;
	preview: string;
	type?: 'image' | 'pdf-file' | 'zip-images';
	originalFileName?: string;
	fileSize?: number;
	pageCount?: number;
}

interface ComicData {
	title: string;
	description: string;
	genre: string[];
	tags: string[];
	ageRating: string;
	coverImage: File | null;
	pages: ExtractedFile[];
	sourceType?: string;
	pdfMetadata?: {
		originalFileName?: string;
		fileSize?: number;
		estimatedPageCount?: number;
	};
}

interface MonetizationData {
	publishType: "free" | "paid";
	price?: number;
	mintAsNFT: boolean;
	nftCopies?: number;
	nftPrice?: number;
	enableHashinal?: boolean; // New option for Hashinal inscription
}

interface ComicPublisherProps {
	onclose: () => void;
	comicData: ComicData;
	monetizationData: MonetizationData;
}

interface HashinalInscriptionState {
	isInscribing: boolean;
	progress: InscriptionProgress | null;
	result: InscriptionResult | null;
	error: string | null;
	isSupported: boolean;
	supportReason?: string;
}

export default function ComicPublisher({ onclose, comicData, monetizationData }: ComicPublisherProps) {
	const [showNotification, setShowNotification] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [publishingStep, setPublishingStep] = useState<string>('');
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	
	// KiloScribe Hashinal inscription state
	const [hashinalState, setHashinalState] = useState<HashinalInscriptionState>({
		isInscribing: false,
		progress: null,
		result: null,
		error: null,
		isSupported: true,
		supportReason: undefined
	});
	
	const dispatch = useAppDispatch();
	const {user} = useAppSelector((state:any) => state.wallet);
	// const { isConnected } = useAccount();
	const { 
		account,
		isConnected, 
		connector,
		signer,
		connectWallet 
	} = useHederaWallet();

	// State for Hashinals SDK signer
	const [hashinalSigner, setHashinalSigner] = useState<any>(null);
	const [hashinalAccountId, setHashinalAccountId] = useState<string | null>(null);
	const [isInitializingWallet, setIsInitializingWallet] = useState(false);

	
	// Check if we have a PDF file
	const hasPdfFile = comicData.sourceType === 'pdf-file';
	const pdfFile = hasPdfFile ? comicData.pages.find(file => file.type === 'pdf-file') : null;
	
	// Hook for full NFT minting (inscription + NFT creation)
	const { 
		createComicNFT, 
		mintAdditionalCopies,
		status: mintStatus, 
		progress: mintProgress, 
		result: mintResult, 
		error: mintHookError,
		statusText: mintStatusText,
		reset: resetMint 
	} = useMintComic();

	const { createInscription, status: inscriptionStatus, progress: inscriptionProgress, result: inscriptionResult, error: inscriptionError, uploadProgress } = useComicInscription({
	accountId: account || user?.walletAddress || '',
	signer: signer, // DAppSigner from connector.getSigner()
	network: 'testnet'
	})

	const isCurrentlyPaid = monetizationData.publishType === "paid";

	// Use the appropriate states based on publish type
	// When the full minting/uploading hooks are disabled or commented out we still
	// need these variables to exist so the component can compile and render safely.
	// These defaults are neutral (no activity) and will be replaced by real values
	// when the minting/upload hooks are enabled.
	const isUploading: boolean = inscriptionStatus === 'inscribing' && uploadProgress < 100;
	const isMinting: boolean = mintStatus === 'minting';
	const mintingProgress: number = mintProgress;
	const isWritePending: boolean = false;
	const isConfirming: boolean = false;
	const isListing: boolean = false;
	const isComplete: boolean = false;
	const mintError: any = null;
	const tokenId: any = null;
	const mintHash: string | null = null;

	// Check Hashinal inscription support on component mount
	// useEffect(() => {
		const checkHashinalSupport = async () => {
			if (monetizationData.enableHashinal) {
				try {
					const supportCheck = await kiloScribeService.isInscriptionSupported(comicData, comicData.pages);
					setHashinalState(prev => ({
						...prev,
						isSupported: supportCheck.supported,
						supportReason: supportCheck.reason
					}));
				} catch (error) {
					console.error('Error checking Hashinal support:', error);
					setHashinalState(prev => ({
						...prev,
						isSupported: false,
						supportReason: 'Error checking inscription compatibility'
					}));
				}
			}
		};

		checkHashinalSupport();

	// Monitor completion and handle Hashinal inscription
	// useEffect(() => {
	// 	const handleCompletion = async () => {
	// 		if (isComplete && tokenId && mintHash && !hashinalState.isInscribing) {
	// 			console.log('✅ NFT Transaction Complete!');
	// 			console.log('🎫 Token ID:', tokenId.toString());
	// 			console.log('🔗 Transaction Hash:', mintHash);
				
	// 			// Check if we should also inscribe as Hashinal
	// 			if (monetizationData.enableHashinal && hashinalState.isSupported && user?.walletAddress) {
	// 				await handleHashinalInscription();
	// 			} else {
	// 				// Complete without Hashinal inscription
	// 				setShowSuccessModal(true);
	// 				setIsPublishing(false);
	// 			}
	// 		}
	// 	};

	// 	handleCompletion();
	// }, [isComplete, tokenId, mintHash, hashinalState.isInscribing, monetizationData.enableHashinal, hashinalState.isSupported]);

	// /**
	//  * Handle Hashinal inscription after successful NFT minting
	 
	// const handleHashinalInscription = async () => {
	// 	if (!user?.walletAddress) {
	// 		console.error('No wallet address available for Hashinal inscription');
	// 		setShowSuccessModal(true);
	// 		setIsPublishing(false);
	// 		return;
	// 	}

	// 	try {
	// 		setHashinalState(prev => ({
	// 			...prev,
	// 			isInscribing: true,
	// 			progress: null,
	// 			result: null,
	// 			error: null
	// 		}));

	// 		console.log('🔷 Starting Hashinal inscription for comic...');
			
	// 		const inscriptionResult = await kiloScribeService.inscribeComic(
	// 			comicData,
	// 			comicData.pages,
	// 			user.walletAddress,
	// 			(progress: InscriptionProgress) => {
	// 				setHashinalState(prev => ({
	// 					...prev,
	// 					progress
	// 				}));
	// 			}
	// 		);

	// 		setHashinalState(prev => ({
	// 			...prev,
	// 			isInscribing: false,
	// 			result: inscriptionResult
	// 		}));

	// 		if (inscriptionResult.status === 'completed') {
	// 			console.log('🎉 Hashinal inscription completed successfully!');
	// 			console.log('🔷 Inscription ID:', inscriptionResult.inscriptionId);
	// 			console.log('🌐 Hashinals URL:', inscriptionResult.hashinalsUrl);
	// 		} else {
	// 			console.error('❌ Hashinal inscription failed:', inscriptionResult.error);
	// 			setHashinalState(prev => ({
	// 				...prev,
	// 				error: inscriptionResult.error || 'Inscription failed'
	// 			}));
	// 		}

	// 	} catch (error) {
	// 		console.error('❌ Error during Hashinal inscription:', error);
	// 		setHashinalState(prev => ({
	// 			...prev,
	// 			isInscribing: false,
	// 			error: error instanceof Error ? error.message : 'Inscription failed'
	// 		}));
	// 	}

	// 	// Show success modal regardless of Hashinal inscription result
	// 	setShowSuccessModal(true);
	// 	setIsPublishing(false);
	// };

	const validateComicData = (): boolean => {
		const errors: string[] = [];
		
		// Existing validation logic...
		if (!comicData.title || comicData.title.trim().length === 0) {
			errors.push("Comic title is required");
		}

		if (!comicData.description || comicData.description.trim().length === 0) {
			errors.push("Comic description is required");
		}

		if (!comicData.genre || comicData.genre.length === 0) {
			errors.push("At least one genre must be selected");
		}

		if (!comicData.pages || comicData.pages.length === 0) {
			errors.push("At least one comic page or PDF file is required");
		}

		if (!comicData.ageRating) {
			errors.push("Age rating is required");
		}

		if (monetizationData.publishType === "paid") {
			if (!monetizationData.price || monetizationData.price <= 0) {
				errors.push("Valid price is required for paid comics");
			}
		}

		if (monetizationData.mintAsNFT) {
			if (!monetizationData.nftCopies || monetizationData.nftCopies <= 0) {
				errors.push("Valid number of max supply is required");
			}
			if (monetizationData.publishType === "paid") {
				if (!monetizationData.nftPrice || monetizationData.nftPrice <= 0) {
					errors.push("Valid NFT mint price is required");
				}
			}
		}

		// Hashinal-specific validation
		if (monetizationData.enableHashinal && !hashinalState.isSupported) {
			errors.push(`Hashinal inscription not supported: ${hashinalState.supportReason}`);
		}

		if (hasPdfFile && pdfFile) {
			if (!pdfFile.blob || pdfFile.blob.size === 0) {
				errors.push("PDF file appears to be corrupted or empty");
			}
			if (pdfFile.blob.size > 100 * 1024 * 1024) {
				errors.push("PDF file is too large (max 100MB)");
			}
		}

		setValidationErrors(errors);
		return errors.length === 0;
	};

	const handlePublish = async () => {
		setError(null);
		setValidationErrors([]);
		setPublishingStep('');

		if (!validateComicData()) {
			setError("Please fix the validation errors before publishing");
			return;
		}

		if (!user) {
			setError("Please connect your wallet to publish your comic");
			return;
		}

		// if ((monetizationData.publishType === "paid" || monetizationData.mintAsNFT) && !isConnected) {
		// 	setError("Please connect your wallet to publish paid comics or mint NFTs");
		// 	return;
		// }

		try {
			setIsPublishing(true);
			setShowSuccessModal(false);

			// Ensure wallet is connected before minting
			setPublishingStep('Connecting wallet...');
			// const walletReady = await ensureWalletConnected();
			if (!signer || !account) {
				setError("Please connect a Hedera wallet to mint your comic NFT");
				setIsPublishing(false);
				return;
			}

			const enhancedComicData = {
				...comicData,
				processingInstructions: hasPdfFile ? {
					type: 'pdf',
					extractPages: true,
					targetDPI: 300,
					outputFormat: 'jpeg',
					quality: 0.95
				} : {
					type: 'images',
					preserveOrder: true
				}
			};

			// if (monetizationData.publishType === "paid") {
			// 	const result = await publishComic({
			// 		comicData: enhancedComicData,
			// 		monetizationData,
			// 		user,
			// 	});
			// 	console.log('🎉 Paid Comic published successfully:', result);
			// } else {
			// 	const maxSupply = monetizationData.mintAsNFT && monetizationData.nftCopies 
			// 		? monetizationData.nftCopies 
			// 		: 1000;
				
			// 	const freeComic = await publishFreeComic({
			// 		comicData: enhancedComicData,
			// 		freeComicData: {	
			// 			maxSupply: maxSupply,
			// 			royaltyPercentage: 0
			// 		},
			// 		user,
			// 	});
			// 	console.log('🎉 Free Comic published successfully:', freeComic);
			// }
            console.log("Comic data:", comicData);
			
			// Determine source type and prepare files accordingly
			const zipPage = comicData.pages.find(page => page.type === 'zip-images');
			const pdfPage = comicData.pages.find(page => page.type === 'pdf-file');
			const imagePages = comicData.pages.filter(page => page.type === 'image');
			
			// Helper function to ensure we have a proper File object from ExtractedFile
			const extractFileFromBlob = (extractedFile: { blob: Blob; name: string; type?: string }, mimeType: string): File => {
				// If the blob is already a File, return it as-is
				if (extractedFile.blob instanceof File) {
					console.log(`✅ Blob is already a File: ${extractedFile.blob.name}`);
					return extractedFile.blob;
				}
				// Otherwise, create a new File from the Blob
				console.log(`📦 Converting Blob to File: ${extractedFile.name}, size: ${extractedFile.blob.size}`);
				return new File([extractedFile.blob], extractedFile.name, { type: mimeType });
			};
			
			// Prepare files - ensure they are properly extracted as File objects
			let zipFile: File | undefined;
			let pdfFileForInscription: File | undefined;
			let imageFilesForInscription: File[] = [];
			
			if (zipPage) {
				zipFile = extractFileFromBlob(zipPage, 'application/zip');
				console.log("📦 Prepared ZIP file:", zipFile.name, "Size:", zipFile.size, "Type:", zipFile.type);
			}
			
			if (pdfPage) {
				pdfFileForInscription = extractFileFromBlob(pdfPage, 'application/pdf');
				console.log("📄 Prepared PDF file:", pdfFileForInscription.name, "Size:", pdfFileForInscription.size, "Type:", pdfFileForInscription.type);
			}
			
			// Handle individual image files if no ZIP or PDF
			if (!zipPage && !pdfPage && imagePages.length > 0) {
				console.log(`🖼️ Processing ${imagePages.length} image file(s)...`);
				imageFilesForInscription = imagePages.map((imgPage, index) => {
					const mimeType = imgPage.blob.type || 'image/jpeg';
					const file = extractFileFromBlob(imgPage, mimeType);
					console.log(`  📷 Image ${index + 1}: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
					return file;
				});
			}
			
			// Determine the cover URI (use first page preview or cover image)
			const coverUri = comicData.coverImage 
				? URL.createObjectURL(comicData.coverImage)
				: comicData.pages[0]?.preview || '';

			let result: any;

			// Check if we should mint as NFT or just inscribe
			if (monetizationData.mintAsNFT) {
				// Full NFT minting flow (inscription + NFT creation)
				setPublishingStep('Creating Comic NFT...');
				console.log("🪙 Minting comic as NFT...");
				return;
				// result = await createComicNFT({
				// 	name: comicData.title,
				// 	creator: account || user?.walletAddress || '',
				// 	description: comicData.description,
				// 	genres: comicData.genre,
				// 	copiesOfComic: monetizationData.nftCopies || 100,
				// 	ageRating: comicData.ageRating,
				// 	coverUri: coverUri,
				// 	coverFile: comicData.coverImage || undefined,
				// 	zipFile: zipFile,
				// 	pdfFile: pdfFileForInscription,
				// 	pageFiles: imageFilesForInscription.length > 0 ? imageFilesForInscription : undefined,
				// 	sourceType: zipFile ? 'zip-images' : (pdfFileForInscription ? 'pdf-file' : 'image'),
				// 	priceHbar: monetizationData.publishType === "paid" && monetizationData.nftPrice 
				// 		? monetizationData.nftPrice 
				// 		: 0,
				// });
				

				// const moreCopies = await mintAdditionalCopies(result.tokenId, monetizationData.nftCopies, result.metadataTopicIds)  // Assuming result contains tokenId)

				// console.log('🎉 Comic NFT created successfully:', result);
				// console.log('🪙 Token ID:', result?.tokenId);
				// console.log('📝 Serial:', result?.serial);
				// console.log('MetadaTopicIds:', result.metadataTopicIds);
				// console.log('🔷 Additional copies minted successfully:', moreCopies);
				
			} else {
				// Just inscription (no NFT minting)
				setPublishingStep('Inscribing comic to Hedera...');
				console.log("📝 Inscribing comic (no NFT)...");
				
				// Pass comicData and monetizationData to createInscription
				// result = await createInscription(comicData, monetizationData);

				// console.log('🎉 Comic inscribed successfully:', result);
				// console.log('📝 Topic ID:', result?.topic_id);
				// console.log('🔗 Transaction ID:', result?.transactionId);

				return;
			}

			// Check if operation was successful
			if (!result) {
				throw new Error(monetizationData.mintAsNFT 
					? 'NFT minting failed - no result returned'
					: 'Inscription failed - no result returned');
			}

			setShowNotification(true);
            setIsPublishing(false);
            setShowSuccessModal(true);

		} catch (err: any) {
			console.error('Error publishing comic:', err);
			
			let errorMessage = 'Failed to publish comic. Please try again.';
			
			if (err?.response?.data?.message) {
				errorMessage = err.response.data.message;
			} else if (err?.response?.data?.error) {
				errorMessage = err.response.data.error;
			} else if (err?.message) {
				errorMessage = err.message;
			} else if (typeof err === 'string') {
				errorMessage = err;
			}

			if (errorMessage.toLowerCase().includes('network')) {
				errorMessage = 'Network error. Please check your connection and try again.';
			} else if (errorMessage.toLowerCase().includes('timeout')) {
				errorMessage = 'Request timed out. Your file might be too large. Please try again.';
			} else if (errorMessage.toLowerCase().includes('unauthorized')) {
				errorMessage = 'Authentication error. Please log in again.';
			} else if (errorMessage.toLowerCase().includes('validation')) {
				errorMessage = 'Validation error. Please check your comic details.';
			} else if (errorMessage.toLowerCase().includes('wallet')) {
				errorMessage = 'Wallet connection error. Please check your wallet and try again.';
			} else if (errorMessage.toLowerCase().includes('gas')) {
				errorMessage = 'Insufficient gas fees. Please add funds to your wallet and try again.';
			} else if (errorMessage.toLowerCase().includes('rejected')) {
				errorMessage = 'Transaction was rejected. Please approve the transaction in your wallet.';
			} else if (errorMessage.toLowerCase().includes('pdf')) {
				errorMessage = 'PDF processing error. Please check your PDF file and try again.';
			} else if (errorMessage.toLowerCase().includes('inscription')) {
				errorMessage = 'Inscription error. Please check your file and try again.';
			} else if (errorMessage.toLowerCase().includes('signer')) {
				errorMessage = 'Wallet signer error. Please reconnect your wallet and try again.';
			}

			setError(errorMessage);
		} finally {
			if (!monetizationData.enableHashinal) {
				setIsPublishing(false);
			}
			setPublishingStep('');
		}
	};

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
		setIsPublishing(false);
		onclose();
	};

	const getContentDisplayInfo = () => {
		if (hasPdfFile && pdfFile) {
			return {
				preview: pdfFile.preview,
				title: comicData.title,
				contentType: 'Comic Book',
				pageInfo: `~${comicData.pdfMetadata?.estimatedPageCount || 'Unknown'} pages`,
				fileName: comicData.pdfMetadata?.originalFileName,
				fileSize: comicData.pdfMetadata?.fileSize ? 
					`${(comicData.pdfMetadata.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'
			};
		} else {
			return {
				preview: comicData.coverImage 
					? URL.createObjectURL(comicData.coverImage) 
					: comicData.pages[0]?.preview || '',
				title: comicData.title,
				contentType: comicData.pages.length === 1 ? 'Single Image' : 'Image Collection',
				pageInfo: `${comicData.pages.length} page${comicData.pages.length !== 1 ? 's' : ''}`,
				fileName: undefined,
				fileSize: undefined
			};
		}
	};

	const contentInfo = getContentDisplayInfo();

	return (
		<>
			{!showNotification && (
				<div className='relative overflow-y-auto pr-2 max-h-[80vh]'>
					{/* Header */}
					<div className='px-2 pt-6 pb-4 mx-auto text-center'>
						<p className='text-white/80 text-xs font-medium tracking-widest uppercase mb-2'>
							PUBLISH YOUR COMIC · STEP 4 OF 4
						</p>
						<h2 className='text-3xl tracking-wider font-bold text-white/80'>
							Almost there!
						</h2>
						<p className='text-white/50 text-sm leading-relaxed'>
							Review your choices one last time. This is it!
						</p>
					</div>

					<div className='bg-black-200 pb-4 rounded-b-lg'>
						{/* Comic Preview */}
						<div className='bg-gray-900 rounded-t-lg overflow-hidden border border-gray-700 mb-4'>
							<Picture
								src={contentInfo.preview}
								alt='Comic preview'
								className='w-full h-48 object-cover'
							/>
						</div>

						{/* Comic Details */}
						<div className='mb-6 px-4'>
							<h3 className='text-lg font-semibold mb-3 text-white/90 tracking-wider'>
								{contentInfo.title}
							</h3>

							<div className='space-y-2 text-sm text-white/80 tracking-wide'>
								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Description:</span>
									<span className='line-clamp-2'>{comicData.description}</span>
								</div>

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Genres:</span>
									<span>{comicData.genre.join(', ')}</span>
								</div>

								{comicData.tags.length > 0 && (
									<div className='flex items-center gap-3'>
										<span className='text-white/60'>Tags:</span>
										<span>{comicData.tags.join(', ')}</span>
									</div>
								)}

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Age Rating:</span>
									<span>
										{comicData.ageRating === 'all-ages' 
											? 'All Ages' 
											: comicData.ageRating === 'teen' 
											? 'Teen (13+)' 
											: 'Mature (18+)'}
									</span>
								</div>

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Content Type:</span>
									<span className='flex items-center gap-1'>
										{contentInfo.contentType}
									</span>
								</div>

								{hasPdfFile && contentInfo.fileName && (
									<div className='flex items-center gap-3'>
										<span className='text-white/60'>Source File:</span>
										<span>{contentInfo.fileName}</span>
									</div>
								)}

								{contentInfo.fileSize && (
									<div className='flex items-center gap-3'>
										<span className='text-white/60'>File Size:</span>
										<span>{contentInfo.fileSize}</span>
									</div>
								)}

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Reader Access:</span>
									<span>
										{monetizationData.publishType === 'free' 
											? 'Free to Read' 
											: `Pay-To-Read ($${monetizationData.price?.toFixed(2)} HBAR)`
										}
									</span>
								</div>

								{monetizationData.mintAsNFT && (
									<>
										<div className='flex items-center gap-3'>
											<span className='text-white/60'>Max Supply:</span>
											<span>{monetizationData.nftCopies} editions</span>
										</div>
										{monetizationData.publishType === "paid" && monetizationData.nftPrice && (
											<div className='flex items-center gap-3'>
												<span className='text-white/60'>Mint Price:</span>
												<span>${monetizationData.nftPrice.toFixed(2)} HBAR per NFT</span>
											</div>
										)}
										{monetizationData.publishType === "free" && (
											<div className='flex items-center gap-3'>
												<span className='text-white/60'>NFT Type:</span>
												<span className='text-green-400'>Free Claimable (Gas fees only)</span>
											</div>
										)}
									</>
								)}

								{/* Hashinal Inscription Status */}
								{monetizationData.enableHashinal && (
									<div className='flex items-center gap-3'>
										<span className='text-white/60'>Hashinal Inscription:</span>
										<span className='flex items-center gap-1'>
											{hashinalState.isSupported ? (
												<>
													<Hash size={14} className='text-blue-400' />
													<span className='text-blue-400'>Enabled</span>
												</>
											) : (
												<>
													<AlertCircle size={14} className='text-yellow-400' />
													<span className='text-yellow-400'>
														Not Supported ({hashinalState.supportReason})
													</span>
												</>
											)}
										</span>
									</div>
								)}

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Pages:</span>
									<span>{contentInfo.pageInfo} (Chapter 1)</span>
								</div>

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Status:</span>
									<span className='flex items-center gap-1'>
										<CheckCircle size={14} className='text-green-400' />
										Ready to Publish
									</span>
								</div>
							</div>

							<p className='mt-3 text-sm text-white/80 tracking-wide leading-relaxed'>
								By clicking <b className='text-primary-400'>&quot;PUBLISH COMIC!&quot;</b>, your comic will
								become live on Quiva and readers can start enjoying it immediately.
								{monetizationData.mintAsNFT && ' Your NFT collection will also be created and available for minting.'}
								{monetizationData.enableHashinal && hashinalState.isSupported && 
									' Additionally, your comic will be permanently inscribed as a Hashinal on the Hedera network.'
								}
							</p>
						</div>
					</div>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className='mx-6 mb-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle size={18} className='text-yellow-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-primary-400 font-semibold text-sm mb-1'>Validation Errors:</p>
									<ul className='list-disc list-inside text-yellow-300 text-sm space-y-1'>
										{validationErrors.map((err, idx) => (
											<li key={idx}>{err}</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-red-400 font-semibold text-sm mb-1'>Error Publishing Comic</p>
									<p className='text-red-300 text-sm'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Publishing Progress */}
					{(isUploading || inscriptionStatus === 'inscribing' || isMinting || isListing || isWritePending || isConfirming) && (
						<div className='mx-6 mb-4 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4'>
							<div className='space-y-3'>
								{/* Upload Progress */}
								<div className='flex items-center gap-3'>
									<Upload size={18} className={uploadProgress >= 100 ? 'text-green-400' : 'text-primary-400'} />
									<div className='flex-1'>
										<div className='flex justify-between items-center mb-1'>
											<span className={`text-sm font-medium ${uploadProgress >= 100 ? 'text-green-300' : 'text-blue-300'}`}>
												{uploadProgress >= 100 ? '✓ Upload Complete' : (hasPdfFile ? 'Uploading PDF to IPFS...' : 'Uploading to IPFS...')}
											</span>
											<span className={`text-xs ${uploadProgress >= 100 ? 'text-green-300' : 'text-blue-300'}`}>{uploadProgress}%</span>
										</div>
										<div className='w-full bg-white/10 rounded-full h-2'>
											<div 
												className={`h-2 rounded-full transition-all duration-300 ${uploadProgress >= 100 ? 'bg-green-400' : 'bg-primary-400'}`}
												style={{ width: `${uploadProgress}%` }}
											/>
										</div>
									</div>
								</div>

								{/* Inscription Progress */}
								{(inscriptionStatus === 'inscribing' || inscriptionStatus === 'done') && uploadProgress >= 100 && (
									<div className='flex items-center gap-3'>
										<Database size={18} className={inscriptionStatus === 'done' ? 'text-green-400' : 'text-purple-400'} />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className={`text-sm font-medium ${inscriptionStatus === 'done' ? 'text-green-300' : 'text-purple-300'}`}>
													{inscriptionStatus === 'done' ? '✓ Inscription Complete' : 'Inscribing to Hedera...'}
												</span>
												<span className={`text-xs ${inscriptionStatus === 'done' ? 'text-green-300' : 'text-purple-300'}`}>{inscriptionProgress}%</span>
											</div>
											<div className='w-full bg-white/10 rounded-full h-2'>
												<div 
													className={`h-2 rounded-full transition-all duration-300 ${inscriptionStatus === 'done' ? 'bg-green-400' : 'bg-purple-400'}`}
													style={{ width: `${inscriptionProgress}%` }}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Minting Progress */}
								{(isMinting || isWritePending || isConfirming) && !isListing && (
									<div className='flex items-center gap-3'>
										<Zap size={18} className='text-primary-400' />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-primary-400 text-sm font-medium'>
													{isWritePending ? 'Preparing blockchain transaction...' : 
													isConfirming ? 'Confirming on blockchain...' : 
													'Minting NFT...'}
												</span>
												{(isMinting ) && <span className='text-primary-400 text-xs'>{mintingProgress}%</span>}
											</div>
											{(isMinting ) && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div 
														className='bg-primary-400 h-2 rounded-full transition-all duration-300'
														style={{ width: `${mintingProgress}%` }}
													/>
												</div>
											)}
											{isWritePending && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div className='bg-primary-400 h-2 rounded-full animate-pulse w-1/3' />
												</div>
											)}
											{isConfirming && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div className='bg-primary-400 h-2 rounded-full animate-pulse w-2/3' />
												</div>
											)}
										</div>
									</div>
								)}

								{/* Listing Progress */}
								{isListing && (
									<div className='flex items-center gap-3'>
										<Database size={18} className='text-green-400' />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-green-400 text-sm font-medium'>
													Listing NFT on marketplace...
												</span>
												<span className='text-green-400 text-xs'>{mintingProgress}%</span>
											</div>
											<div className='w-full bg-white/10 rounded-full h-2'>
												<div 
													className='bg-green-400 h-2 rounded-full transition-all duration-300'
													style={{ width: `${mintingProgress}%` }}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Success Messages */}
								{(tokenId) && (
									<div className='flex items-center gap-2 text-primary-400 text-sm'>
										<CheckCircle size={16} />
										<span>NFT minted successfully! Token ID: {tokenId.toString()}</span>
									</div>
								)}

								{(mintHash) && (
									<div className='flex items-center gap-2 text-primary-400 text-sm'>
										<CheckCircle size={16} />
										<span>Transaction: {mintHash.slice(0, 10)}...{mintHash.slice(-8)}</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Mint/Inscription Progress */}
					{(mintStatus !== 'idle' && mintStatus !== 'done') || (inscriptionStatus !== 'idle' && inscriptionStatus !== 'done') ? (
						<div className='mx-6 mb-4 bg-purple-500/20 border border-purple-500/50 rounded-lg p-4'>
							<div className='flex items-center gap-3'>
								<Hash size={18} className='text-purple-400 animate-spin' />
								<div className='flex-1'>
									<div className='flex justify-between items-center mb-1'>
										<span className='text-purple-400 text-sm font-medium'>
											{mintStatus === 'inscribing' && 'Inscribing comic to Hedera...'}
											{mintStatus === 'minting' && 'Creating NFT collection...'}
											{inscriptionStatus === 'inscribing' && mintStatus === 'idle' && 'Inscribing comic to Hedera...'}
											{mintStatusText && <span className='ml-2 text-xs opacity-75'>({mintStatusText})</span>}
										</span>
										<span className='text-purple-400 text-xs'>{mintProgress || inscriptionProgress}%</span>
									</div>
									<div className='w-full bg-white/10 rounded-full h-2'>
										<div 
											className='bg-purple-400 h-2 rounded-full transition-all duration-300'
											style={{ width: `${mintProgress || inscriptionProgress}%` }}
										/>
									</div>
								</div>
							</div>
						</div>
					) : null}

					{/* Hashinal Success/Error */}
					{hashinalState.result && (
						<div className={`mx-6 mb-4 ${
							hashinalState.result.status === 'completed' 
								? 'bg-purple-500/20 border-purple-500/50' 
								: 'bg-red-500/20 border-red-500/50'
							} border rounded-lg p-3`}>
							<div className='flex items-start gap-2'>
								{hashinalState.result.status === 'completed' ? (
									<CheckCircle size={18} className='text-purple-400 flex-shrink-0 mt-0.5' />
								) : (
									<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
								)}
								<div>
									<p className={`${
										hashinalState.result.status === 'completed' 
											? 'text-purple-400' 
											: 'text-red-400'
									} font-semibold text-sm mb-1`}>
										{hashinalState.result.status === 'completed' 
											? 'Hashinal Inscription Successful!' 
											: 'Hashinal Inscription Failed'}
									</p>
									{hashinalState.result.status === 'completed' ? (
										<div className='text-purple-300 text-sm space-y-1'>
											<p>Inscription ID: {hashinalState.result.inscriptionId}</p>
											{hashinalState.result.hashinalsUrl && (
												<p>
													<a 
														href={hashinalState.result.hashinalsUrl} 
														target="_blank" 
														rel="noopener noreferrer"
														className='underline hover:text-purple-200'
													>
														View on Hashinals
													</a>
												</p>
											)}
										</div>
									) : (
										<p className='text-red-300 text-sm'>{hashinalState.error}</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* NFT Mint Result */}
					{mintResult && (
						<div className='mx-6 mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<CheckCircle size={18} className='text-green-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-green-400 font-semibold text-sm mb-1'>Comic NFT Created Successfully!</p>
									<div className='text-green-300 text-sm space-y-1'>
										{mintResult.tokenId && <p>Token ID: {mintResult.tokenId}</p>}
										{mintResult.serials && <p>Serial #: {mintResult.serials}</p>}
										{mintResult.transactionId && <p>Transaction: {mintResult.transactionId}</p>}
										{mintResult.inscriptionTopicId && <p>Inscription Topic: {mintResult.inscriptionTopicId}</p>}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Mint Hook Error */}
					{mintHookError && (
						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-red-400 font-semibold text-sm mb-1'>NFT Minting Error</p>
									<p className='text-red-300 text-sm'>{mintHookError}</p>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className='px-6 pb-6 space-y-3 mt-4'>
						<button
							onClick={handlePublish}
							disabled={isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming || hashinalState.isInscribing || inscriptionStatus === 'inscribing' || mintStatus === 'inscribing' || mintStatus === 'minting'}
							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2'
						>
							{isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming || hashinalState.isInscribing || inscriptionStatus === 'inscribing' || mintStatus === 'inscribing' || mintStatus === 'minting' ? (
								<>
									<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
									{isUploading ? 'Uploading to IPFS...' : 
									isMinting || isWritePending ? 'Minting NFT...' : 
									isListing ? 'Listing on marketplace...' :
									isConfirming ? 'Confirming...' : 
									hashinalState.isInscribing ? 'Inscribing Hashinal...' :
									mintStatus === 'inscribing' ? 'Inscribing to Hedera...' :
									mintStatus === 'minting' ? 'Creating NFT Collection...' :
									inscriptionStatus === 'inscribing' ? 'Inscribing to Hedera...' :
									'Publishing...'}
								</>
							) : (
								<>
									{monetizationData.enableHashinal ? <Hash size={18} /> : <Database size={18} />}
									{monetizationData.mintAsNFT ? 
										(monetizationData.enableHashinal ? 'Publish, Mint & Inscribe' : 'Publish & Mint NFT') : 
										'Publish Comic'
									}
								</>
							)}
						</button>

						<button
							onClick={onclose}
							disabled={isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming || hashinalState.isInscribing || mintStatus === 'inscribing' || mintStatus === 'minting'}
							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
						>
							{isPublishing || isUploading || isMinting || isListing || hashinalState.isInscribing || mintStatus === 'inscribing' || mintStatus === 'minting' ? 'Please wait...' : 'Go Back'}
						</button>
					</div>
				</div>
			)}

			{/* SUCCESS MODAL */}
			{showSuccessModal && showNotification && (mintResult || inscriptionResult) && (
				<ComicNotification 
					onclose={() => setShowNotification(true)} 
					comicData={comicData}
					monetizationData={monetizationData} 
					mintHash={mintResult?.transactionId || inscriptionResult?.transactionId || null}
					tokenId={mintResult?.tokenId || null}
					hashinalResult={mintResult || inscriptionResult}
				/>
			)}
		</>
	);
}

// components/ComicPublisher.tsx (Enhanced with integrated inscription & minting)
// "use client";

// import { useEffect, useState } from "react";
// import { AlertCircle, CheckCircle, Upload, Zap, Database, Hash } from "lucide-react";
// import { ComicNotification } from "./ComicNotification";
// import Picture from "@/components/picture/Index";
// import { useAppDispatch, useAppSelector } from "@/redux/hook";
// import { useMintComic } from "@/hook/useMintComic"; // Using the refactored hook
// import { useHederaWallet } from "@/providers/HashPackProvider";

// interface ExtractedFile {
// 	name: string;
// 	blob: Blob;
// 	preview: string;
// 	type?: 'image' | 'pdf-file' | 'zip-images';
// 	originalFileName?: string;
// 	fileSize?: number;
// 	pageCount?: number;
// }

// interface ComicData {
// 	title: string;
// 	description: string;
// 	genre: string[];
// 	tags: string[];
// 	ageRating: string;
// 	coverImage: File | null;
// 	pages: ExtractedFile[];
// 	sourceType?: string;
// 	pdfMetadata?: {
// 		originalFileName?: string;
// 		fileSize?: number;
// 		estimatedPageCount?: number;
// 	};
// }

// interface MonetizationData {
// 	publishType: "free" | "paid";
// 	price?: number;
// 	mintAsNFT: boolean;
// 	nftCopies?: number;
// 	nftPrice?: number;
// 	enableHashinal?: boolean;
// }

// interface ComicPublisherProps {
// 	onclose: () => void;
// 	comicData: ComicData;
// 	monetizationData: MonetizationData;
// }

// export default function ComicPublisher({ onclose, comicData, monetizationData }: ComicPublisherProps) {
// 	const [showNotification, setShowNotification] = useState(false);
// 	const [isPublishing, setIsPublishing] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const [validationErrors, setValidationErrors] = useState<string[]>([]);
// 	const [publishingStep, setPublishingStep] = useState<string>('');
// 	const [showSuccessModal, setShowSuccessModal] = useState(false);
	
// 	const dispatch = useAppDispatch();
// 	const { user } = useAppSelector((state) => state.wallet);
// 	const { 
// 		account,
// 		isConnected, 
// 		connector,
// 		signer,
// 		connectWallet 
// 	} = useHederaWallet();

// 	// Check if we have a PDF or ZIP file
// 	const hasPdfFile = comicData.sourceType === 'pdf-file';
// 	const hasZipFile = comicData.sourceType === 'zip-images';
// 	const pdfFile = hasPdfFile ? comicData.pages.find(file => file.type === 'pdf-file') : null;
// 	const zipFile = hasZipFile ? comicData.pages.find(file => file.type === 'zip-images') : null;
	
// 	// Use the refactored hook that handles both inscription and minting
// 	const { 
// 		createComicNFT, 
// 		status, 
// 		progress, 
// 		result, 
// 		error: mintError, 
// 		statusText,
// 		reset,
// 		inscriptionStatus,
// 		inscriptionProgress,
// 		inscriptionResult
// 	} = useMintComic({
// 		accountId: account || user?.walletAddress || '',
// 		signer: signer,
// 		network: 'testnet'
// 	});

// 	const isCurrentlyPaid = monetizationData.publishType === "paid";

// 	// Validation
// 	const validate = (): string[] => {
// 		const errors: string[] = [];
		
// 		if (!comicData.title || comicData.title.trim() === '') {
// 			errors.push("Comic title is required");
// 		}
		
// 		if (!comicData.coverImage) {
// 			errors.push("Cover image is required");
// 		}
		
// 		if (!pdfFile && !zipFile && (!comicData.pages || comicData.pages.length === 0)) {
// 			errors.push("Comic pages are required");
// 		}
		
// 		if (isCurrentlyPaid && (!monetizationData.price || monetizationData.price <= 0)) {
// 			errors.push("Price must be greater than 0 for paid comics");
// 		}
		
// 		if (monetizationData.mintAsNFT) {
// 			if (!monetizationData.nftCopies || monetizationData.nftCopies <= 0) {
// 				errors.push("Number of NFT copies must be greater than 0");
// 			}
// 			if (!monetizationData.nftPrice || monetizationData.nftPrice <= 0) {
// 				errors.push("NFT price must be greater than 0");
// 			}
// 		}
		
// 		if (!account && monetizationData.mintAsNFT) {
// 			errors.push("Please connect your wallet to mint NFT");
// 		}
		
// 		return errors;
// 	};

// 	/**
// 	 * Prepare file for inscription/minting
// 	 */
// 	const prepareComicFile = async (): Promise<{ zipFile?: File; pdfFile?: File } | null> => {
// 		try {
// 			// If we have a PDF file
// 			if (pdfFile) {
// 				const pdfBlob = pdfFile.blob;
// 				const file = new File([pdfBlob], pdfFile.originalFileName || 'comic.pdf', {
// 					type: 'application/pdf'
// 				});
// 				return { pdfFile: file };
// 			}
			
// 			// If we have a ZIP file
// 			if (zipFile) {
// 				const zipBlob = zipFile.blob;
// 				const file = new File([zipBlob], zipFile.originalFileName || 'comic.zip', {
// 					type: 'application/zip'
// 				});
// 				return { zipFile: file };
// 			}
			
// 			// If we have individual pages, create a ZIP
// 			if (comicData.pages && comicData.pages.length > 0) {
// 				// You'll need to implement ZIP creation from individual pages
// 				// For now, we'll just use the first page as an example
// 				console.warn("Creating ZIP from individual pages not yet implemented");
// 				return null;
// 			}
			
// 			return null;
// 		} catch (error) {
// 			console.error("Error preparing comic file:", error);
// 			return null;
// 		}
// 	};

// 	/**
// 	 * Handle the publish action
// 	 */
// 	const handlePublish = async () => {
// 		try {
// 			// Validate inputs
// 			const errors = validate();
// 			if (errors.length > 0) {
// 				setValidationErrors(errors);
// 				return;
// 			}

// 			setIsPublishing(true);
// 			setError(null);
// 			setValidationErrors([]);

// 			// Check wallet connection for NFT minting
// 			if (monetizationData.mintAsNFT && !signer) {
// 				setError("Please connect your wallet to mint NFT");
// 				setIsPublishing(false);
// 				return;
// 			}

// 			// Prepare the comic file
// 			const comicFile = await prepareComicFile();
// 			if (!comicFile) {
// 				setError("Failed to prepare comic file");
// 				setIsPublishing(false);
// 				return;
// 			}

// 			// Prepare cover image
// 			let coverUri = '';
// 			if (comicData.coverImage) {
// 				// You might want to upload the cover to IPFS or another service
// 				// For now, we'll use a placeholder
// 				coverUri = 'cover-placeholder';
// 			}

// 			// Execute inscription and minting
// 			const mintResult = await createComicNFT({
// 				name: comicData.title,
// 				creator: user?.username || account || 'Unknown',
// 				description: comicData.description || '',
// 				genres: comicData.genre || [],
// 				copiesOfComic: monetizationData.nftCopies || 100,
// 				ageRating: comicData.ageRating || 'T',
// 				coverUri: coverUri,
// 				coverFile: comicData.coverImage || undefined,
// 				zipFile: comicFile.zipFile,
// 				pdfFile: comicFile.pdfFile,
// 				sourceType: comicData.sourceType as any,
// 				priceHbar: monetizationData.nftPrice || 10,
// 				mintNow: 1, // Mint at least 1 copy initially
// 			});

// 			console.log("✅ Comic NFT created successfully:", mintResult);
			
// 			// Show success notification
// 			setShowSuccessModal(true);
// 			setShowNotification(true);
			
// 		} catch (err: any) {
// 			console.error("Error publishing comic:", err);
// 			setError(err.message || "Failed to publish comic");
// 		} finally {
// 			setIsPublishing(false);
// 		}
// 	};

// 	// Get display status text
// 	const getStatusDisplay = () => {
// 		if (status === 'inscribing' || inscriptionStatus === 'inscribing') {
// 			return {
// 				text: statusText || 'Inscribing comic to Hedera...',
// 				progress: inscriptionProgress || progress,
// 				color: 'purple'
// 			};
// 		} else if (status === 'minting') {
// 			return {
// 				text: 'Creating NFT collection...',
// 				progress: progress,
// 				color: 'green'
// 			};
// 		} else if (status === 'done') {
// 			return {
// 				text: 'Comic NFT created successfully!',
// 				progress: 100,
// 				color: 'green'
// 			};
// 		}
// 		return null;
// 	};

// 	const statusDisplay = getStatusDisplay();

// 	return (
// 		<>
// 			{/* Preview Section */}
// 			{!showSuccessModal && (
// 				<div className='max-w-2xl mx-auto'>
// 					{/* Header */}
// 					<div className='text-center mb-6'>
// 						<h2 className='text-2xl font-bold text-white mb-2'>
// 							Final Review & Publish
// 						</h2>
// 						<p className='text-white/70'>
// 							Review your comic details before publishing
// 						</p>
// 					</div>

// 					{/* Comic Preview */}
// 					<div className='bg-white/5 backdrop-blur rounded-lg mb-4'>
// 						<div className='px-6 py-4 border-b border-white/10'>
// 							<h3 className='text-white font-semibold'>Comic Details</h3>
// 						</div>
// 						<div className='p-6 space-y-4'>
// 							{/* Title and Cover */}
// 							<div className='flex gap-4'>
// 								{comicData.coverImage && (
// 									<div className='w-24 h-32 bg-white/10 rounded-lg overflow-hidden'>
// 										<Picture
// 											src={URL.createObjectURL(comicData.coverImage)}
// 											alt="Cover"
// 											className='w-full h-full object-cover'
// 										/>
// 									</div>
// 								)}
// 								<div className='flex-1'>
// 									<h4 className='text-white font-semibold text-lg mb-1'>
// 										{comicData.title}
// 									</h4>
// 									<p className='text-white/70 text-sm'>
// 										{comicData.description || 'No description provided'}
// 									</p>
// 									<div className='flex flex-wrap gap-2 mt-2'>
// 										{comicData.genre.map((g, i) => (
// 											<span key={i} className='px-2 py-1 bg-secondary-200/20 text-secondary-200 rounded text-xs'>
// 												{g}
// 											</span>
// 										))}
// 									</div>
// 								</div>
// 							</div>

// 							{/* File Info */}
// 							<div className='grid grid-cols-2 gap-4 text-sm'>
// 								<div>
// 									<span className='text-white/50'>Source Type:</span>
// 									<span className='text-white ml-2'>
// 										{hasPdfFile ? 'PDF' : hasZipFile ? 'ZIP Archive' : `${comicData.pages.length} Pages`}
// 									</span>
// 								</div>
// 								<div>
// 									<span className='text-white/50'>Age Rating:</span>
// 									<span className='text-white ml-2'>{comicData.ageRating || 'Not Rated'}</span>
// 								</div>
// 							</div>

// 							{/* Monetization Info */}
// 							{monetizationData.mintAsNFT && (
// 								<div className='p-4 bg-primary-600/20 rounded-lg border border-primary-600/30'>
// 									<div className='flex items-center gap-2 mb-2'>
// 										<Database size={16} className='text-primary-400' />
// 										<span className='text-primary-400 font-semibold text-sm'>
// 											NFT Details
// 										</span>
// 									</div>
// 									<div className='grid grid-cols-2 gap-3 text-sm'>
// 										<div>
// 											<span className='text-white/50'>Edition Size:</span>
// 											<span className='text-white ml-2'>{monetizationData.nftCopies}</span>
// 										</div>
// 										<div>
// 											<span className='text-white/50'>Price:</span>
// 											<span className='text-white ml-2'>{monetizationData.nftPrice} HBAR</span>
// 										</div>
// 									</div>
// 									{monetizationData.enableHashinal && (
// 										<div className='mt-2 text-purple-400 text-xs'>
// 											✨ Will be inscribed as Hashinal
// 										</div>
// 									)}
// 								</div>
// 							)}
// 						</div>
// 					</div>

// 					{/* Validation Errors */}
// 					{validationErrors.length > 0 && (
// 						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
// 							<div className='flex items-start gap-2'>
// 								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
// 								<div>
// 									<p className='text-red-400 font-semibold text-sm mb-1'>Please fix the following:</p>
// 									<ul className='text-red-300 text-sm space-y-1'>
// 										{validationErrors.map((err, i) => (
// 											<li key={i}>• {err}</li>
// 										))}
// 									</ul>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* General Error */}
// 					{error && (
// 						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
// 							<div className='flex items-start gap-2'>
// 								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
// 								<div>
// 									<p className='text-red-400 font-semibold text-sm mb-1'>Error</p>
// 									<p className='text-red-300 text-sm'>{error}</p>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* Mint Error */}
// 					{mintError && (
// 						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
// 							<div className='flex items-start gap-2'>
// 								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
// 								<div>
// 									<p className='text-red-400 font-semibold text-sm mb-1'>Minting Error</p>
// 									<p className='text-red-300 text-sm'>{mintError}</p>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* Progress Indicator */}
// 					{statusDisplay && status !== 'idle' && status !== 'error' && (
// 						<div className={`mx-6 mb-4 bg-${statusDisplay.color}-500/20 border border-${statusDisplay.color}-500/50 rounded-lg p-4`}>
// 							<div className='flex items-center gap-3'>
// 								{status === 'done' ? (
// 									<CheckCircle size={18} className={`text-${statusDisplay.color}-400`} />
// 								) : (
// 									<Hash size={18} className={`text-${statusDisplay.color}-400 animate-spin`} />
// 								)}
// 								<div className='flex-1'>
// 									<div className='flex justify-between items-center mb-1'>
// 										<span className={`text-${statusDisplay.color}-400 text-sm font-medium`}>
// 											{statusDisplay.text}
// 										</span>
// 										<span className={`text-${statusDisplay.color}-400 text-xs`}>
// 											{Math.round(statusDisplay.progress)}%
// 										</span>
// 									</div>
// 									<div className='w-full bg-white/10 rounded-full h-2'>
// 										<div 
// 											className={`bg-${statusDisplay.color}-400 h-2 rounded-full transition-all duration-300`}
// 											style={{ width: `${statusDisplay.progress}%` }}
// 										/>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* Success Message */}
// 					{result && (
// 						<div className='mx-6 mb-4 bg-green-500/20 border border-green-500/50 rounded-lg p-3'>
// 							<div className='flex items-start gap-2'>
// 								<CheckCircle size={18} className='text-green-400 flex-shrink-0 mt-0.5' />
// 								<div>
// 									<p className='text-green-400 font-semibold text-sm mb-1'>
// 										Comic NFT Created Successfully!
// 									</p>
// 									<div className='text-green-300 text-sm space-y-1'>
// 										<p>Token ID: {result.tokenId}</p>
// 										<p>Serial: #{result.serial}</p>
// 										{result.inscriptionTopicId && (
// 											<p>Inscription: {result.inscriptionTopicId}</p>
// 										)}
// 										{result.metadataTopicIds && result.metadataTopicIds.length > 0 && (
// 											<p>Metadata Topics: {result.metadataTopicIds.length} topics created</p>
// 										)}
// 										<p className='text-xs mt-2'>
// 											Transaction: {result.transactionId.slice(0, 10)}...{result.transactionId.slice(-8)}
// 										</p>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* Action Buttons */}
// 					<div className='px-6 pb-6 space-y-3 mt-4'>
// 						<button
// 							onClick={handlePublish}
// 							disabled={isPublishing || status !== 'idle'}
// 							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2'
// 						>
// 							{status !== 'idle' && status !== 'done' && status !== 'error' ? (
// 								<>
// 									<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
// 									{status === 'inscribing' ? 'Inscribing...' : 
// 									 status === 'minting' ? 'Minting NFT...' : 
// 									 'Processing...'}
// 								</>
// 							) : (
// 								<>
// 									<Database size={18} />
// 									{monetizationData.mintAsNFT ? 
// 										'Publish & Mint NFT' : 
// 										'Publish Comic'
// 									}
// 								</>
// 							)}
// 						</button>

// 						<button
// 							onClick={onclose}
// 							disabled={isPublishing || (status !== 'idle' && status !== 'done' && status !== 'error')}
// 							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
// 						>
// 							{status !== 'idle' && status !== 'done' && status !== 'error' ? 
// 								'Please wait...' : 
// 								'Go Back'
// 							}
// 						</button>

// 						{status === 'error' && (
// 							<button
// 								onClick={reset}
// 								className='w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-full transition'
// 							>
// 								Reset & Try Again
// 							</button>
// 						)}
// 					</div>
// 				</div>
// 			)}

// 			{/* SUCCESS MODAL */}
// 			{showSuccessModal && result && showNotification && (
// 				<ComicNotification 
// 					onclose={() => {
// 						setShowNotification(false);
// 						setShowSuccessModal(false);
// 						reset();
// 						onclose();
// 					}} 
// 					comicData={comicData}
// 					monetizationData={monetizationData} 
// 					mintHash={result.transactionId}
// 					tokenId={result.tokenId}
// 					hashinalResult={{
// 						...result,
// 						status: 'completed' as const
// 					}}
// 				/>
// 			)}
// 		</>
// 	);
// }