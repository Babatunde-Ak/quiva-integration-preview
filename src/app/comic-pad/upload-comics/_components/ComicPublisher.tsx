// components/ComicPublisher.tsx (Enhanced with KiloScribe)
"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Upload, Zap, Database, Hash } from "lucide-react";
import { ComicNotification } from "./ComicNotification";
import Picture from "@/components/picture/Index";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useComicMinting } from "@/hook/useComicMinting";
import { useFreeComicMinting } from "@/hook/useFreeComicMinting";
import { useAccount } from "wagmi";
import { kiloScribeService, InscriptionProgress, InscriptionResult } from "@/lib/kiloscribe-service";

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
	const {user} = useAppSelector((state) => state.wallet);
	const { isConnected } = useAccount();
	
	// Check if we have a PDF file
	const hasPdfFile = comicData.sourceType === 'pdf-file';
	const pdfFile = hasPdfFile ? comicData.pages.find(file => file.type === 'pdf-file') : null;
	
	// Use the comic minting hooks
	const {
	publishComic,
	isUploading: paidIsUploading,
	isMinting: paidIsMinting,
	isListing,
	uploadProgress: paidUploadProgress,
	mintingProgress: paidMintingProgress,
	isWritePending: paidIsWritePending,
	isConfirming: paidIsConfirming,
	isMintSuccess,
	isComplete: paidIsComplete,
	mintError: paidMintError,
	tokenId: paidTokenId,
	mintHash: paidMintHash,
	comicId,
	} = useComicMinting();

	const {
	isUploading: freeIsUploading,
	isMinting: freeIsMinting,
	uploadProgress: freeUploadProgress,
	mintingProgress: freeMintingProgress,
	publishFreeComic,
	updateComicWithMintData,
	reset,
	checkCreatorApproval,
	isWritePending: freeIsWritePending,
	isConfirming: freeIsConfirming,
	mintHash: freeMintHash,
	approvalStatus,
	isComplete: freeIsComplete,
	mintError: freeError,
	tokenId: freeTokenId,
	} = useFreeComicMinting();

	const isCurrentlyPaid = monetizationData.publishType === "paid";

	// Use the appropriate states based on publish type
	const isUploading = isCurrentlyPaid ? paidIsUploading : freeIsUploading;
	const isMinting = isCurrentlyPaid ? paidIsMinting : freeIsMinting;
	const uploadProgress = isCurrentlyPaid ? paidUploadProgress : freeUploadProgress;
	const mintingProgress = isCurrentlyPaid ? paidMintingProgress : freeMintingProgress;
	const isWritePending = isCurrentlyPaid ? paidIsWritePending : freeIsWritePending;
	const isConfirming = isCurrentlyPaid ? paidIsConfirming : freeIsConfirming;
	const isComplete = isCurrentlyPaid ? paidIsComplete : freeIsComplete;
	const mintError = isCurrentlyPaid ? paidMintError : freeError;
	const tokenId = isCurrentlyPaid ? paidTokenId : freeTokenId;
	const mintHash = isCurrentlyPaid ? paidMintHash : freeMintHash;

	// Check Hashinal inscription support on component mount
	useEffect(() => {
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
	}, [comicData, monetizationData.enableHashinal]);

	// Monitor completion and handle Hashinal inscription
	useEffect(() => {
		const handleCompletion = async () => {
			if (isComplete && tokenId && mintHash && !hashinalState.isInscribing) {
				console.log('✅ NFT Transaction Complete!');
				console.log('🎫 Token ID:', tokenId.toString());
				console.log('🔗 Transaction Hash:', mintHash);
				
				// Check if we should also inscribe as Hashinal
				if (monetizationData.enableHashinal && hashinalState.isSupported && user?.walletAddress) {
					await handleHashinalInscription();
				} else {
					// Complete without Hashinal inscription
					setShowSuccessModal(true);
					setIsPublishing(false);
				}
			}
		};

		handleCompletion();
	}, [isComplete, tokenId, mintHash, hashinalState.isInscribing, monetizationData.enableHashinal, hashinalState.isSupported]);

	/**
	 * Handle Hashinal inscription after successful NFT minting
	 */
	const handleHashinalInscription = async () => {
		if (!user?.walletAddress) {
			console.error('No wallet address available for Hashinal inscription');
			setShowSuccessModal(true);
			setIsPublishing(false);
			return;
		}

		try {
			setHashinalState(prev => ({
				...prev,
				isInscribing: true,
				progress: null,
				result: null,
				error: null
			}));

			console.log('🔷 Starting Hashinal inscription for comic...');
			
			const inscriptionResult = await kiloScribeService.inscribeComic(
				comicData,
				comicData.pages,
				user.walletAddress,
				(progress: InscriptionProgress) => {
					setHashinalState(prev => ({
						...prev,
						progress
					}));
				}
			);

			setHashinalState(prev => ({
				...prev,
				isInscribing: false,
				result: inscriptionResult
			}));

			if (inscriptionResult.status === 'completed') {
				console.log('🎉 Hashinal inscription completed successfully!');
				console.log('🔷 Inscription ID:', inscriptionResult.inscriptionId);
				console.log('🌐 Hashinals URL:', inscriptionResult.hashinalsUrl);
			} else {
				console.error('❌ Hashinal inscription failed:', inscriptionResult.error);
				setHashinalState(prev => ({
					...prev,
					error: inscriptionResult.error || 'Inscription failed'
				}));
			}

		} catch (error) {
			console.error('❌ Error during Hashinal inscription:', error);
			setHashinalState(prev => ({
				...prev,
				isInscribing: false,
				error: error instanceof Error ? error.message : 'Inscription failed'
			}));
		}

		// Show success modal regardless of Hashinal inscription result
		setShowSuccessModal(true);
		setIsPublishing(false);
	};

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

		if ((monetizationData.publishType === "paid" || monetizationData.mintAsNFT) && !isConnected) {
			setError("Please connect your wallet to publish paid comics or mint NFTs");
			return;
		}

		try {
			setIsPublishing(true);
			setShowSuccessModal(false);

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

			if (monetizationData.publishType === "paid") {
				const result = await publishComic({
					comicData: enhancedComicData,
					monetizationData,
					user,
				});
				console.log('🎉 Paid Comic published successfully:', result);
			} else {
				const maxSupply = monetizationData.mintAsNFT && monetizationData.nftCopies 
					? monetizationData.nftCopies 
					: 1000;
				
				const freeComic = await publishFreeComic({
					comicData: enhancedComicData,
					freeComicData: {	
						maxSupply: maxSupply,
						royaltyPercentage: 0
					},
					user,
				});
				console.log('🎉 Free Comic published successfully:', freeComic);
			}

			setShowNotification(true);

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
					{(isUploading || isMinting  || isListing || isWritePending || isConfirming) && (
						<div className='mx-6 mb-4 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4'>
							<div className='space-y-3'>
								{/* Upload Progress */}
								{isUploading && (
									<div className='flex items-center gap-3'>
										<Upload size={18} className='text-primary-400' />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-blue-300 text-sm font-medium'>
													{hasPdfFile ? 'Uploading PDF to IPFS...' : 'Uploading to IPFS...'}
												</span>
												<span className='text-blue-300 text-xs'>{uploadProgress}%</span>
											</div>
											<div className='w-full bg-white/10 rounded-full h-2'>
												<div 
													className='bg-primary-400 h-2 rounded-full transition-all duration-300'
													style={{ width: `${uploadProgress}%` }}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Minting Progress */}
								{(isMinting  || isWritePending || isConfirming) && !isListing && (
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

					{/* Hashinal Inscription Progress */}
					{hashinalState.isInscribing && hashinalState.progress && (
						<div className='mx-6 mb-4 bg-purple-500/20 border border-purple-500/50 rounded-lg p-4'>
							<div className='flex items-center gap-3'>
								<Hash size={18} className='text-purple-400 animate-spin' />
								<div className='flex-1'>
									<div className='flex justify-between items-center mb-1'>
										<span className='text-purple-400 text-sm font-medium'>
											{hashinalState.progress.message}
										</span>
										<span className='text-purple-400 text-xs'>{hashinalState.progress.percentage}%</span>
									</div>
									<div className='w-full bg-white/10 rounded-full h-2'>
										<div 
											className='bg-purple-400 h-2 rounded-full transition-all duration-300'
											style={{ width: `${hashinalState.progress.percentage}%` }}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

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

					{/* Mint Error */}
					{mintError && (
						<div className='mx-6 mb-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle size={18} className='text-red-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-red-400 font-semibold text-sm mb-1'>NFT Minting Error</p>
									<p className='text-red-300 text-sm'>{mintError.message || 'Failed to mint NFT'}</p>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className='px-6 pb-6 space-y-3 mt-4'>
						<button
							onClick={handlePublish}
							disabled={isPublishing || isUploading || isMinting  || isListing || isWritePending || isConfirming || hashinalState.isInscribing}
							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2'
						>
							{isPublishing || isUploading || isMinting  || isListing || isWritePending || isConfirming || hashinalState.isInscribing ? (
								<>
									<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
									{isUploading ? 'Uploading to IPFS...' : 
									isMinting || isWritePending  ? 'Minting NFT...' : 
									isListing ? 'Listing on marketplace...' :
									isConfirming ? 'Confirming...' : 
									hashinalState.isInscribing ? 'Inscribing Hashinal...' :
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
							disabled={isPublishing || isUploading || isMinting  || isListing || isWritePending || isConfirming || hashinalState.isInscribing}
							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
						>
							{isPublishing || isUploading || isMinting  || isListing || hashinalState.isInscribing ? 'Please wait...' : 'Go Back'}
						</button>
					</div>
				</div>
			)}

			{/* SUCCESS MODAL */}
			{showSuccessModal && isComplete && tokenId && mintHash && showNotification && (
				<ComicNotification 
					onclose={() => setShowNotification(true)} 
					comicData={comicData}
					monetizationData={monetizationData} 
					mintHash={mintHash}
					tokenId={tokenId}
					hashinalResult={hashinalState.result} // Pass Hashinal results to notification
				/>
			)}
		</>
	);
}