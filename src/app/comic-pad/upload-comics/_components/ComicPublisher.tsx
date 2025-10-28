"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Upload, Zap, Database } from "lucide-react";
import { ComicNotification } from "./ComicNotification";
import Picture from "@/components/picture/Index";
import { createFullComic } from "@/redux/slices/comicSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useComicMinting } from "@/hook/useComicMinting";
import { useFreeComicMinting } from "@/hook/useFreeComicMinting";
import { useAccount } from "wagmi";

interface ExtractedFile {
	name: string;
	blob: Blob;
	preview: string;
}

interface ComicData {
	title: string;
	description: string;
	genre: string[];
	tags: string[];
	ageRating: string;
	coverImage: File | null;
	pages: ExtractedFile[];
}

interface MonetizationData {
	publishType: "free" | "paid";
	price?: number;
	mintAsNFT: boolean;
	nftCopies?: number;
	nftPrice?: number;
}

interface ComicPublisherProps {
	onclose: () => void;
	comicData: ComicData;
	monetizationData: MonetizationData;
}

export default function ComicPublisher({ onclose, comicData, monetizationData }: ComicPublisherProps) {
	const [showNotification, setShowNotification] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [validationErrors, setValidationErrors] = useState<string[]>([]);
	const [publishingStep, setPublishingStep] = useState<string>('');
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	
	const dispatch = useAppDispatch();
	const {user} = useAppSelector((state) => state.wallet);
	const { isConnected } = useAccount();
	
	// Use the new comic minting hook
	const {
		publishComic,
		isUploading,
		isMinting,
		isListing,
		uploadProgress,
		mintingProgress,
		isWritePending,
		isConfirming,
		isMintSuccess,
		isComplete,
		mintError,
		tokenId,
		mintHash,
		comicId,
	} = useComicMinting();

	const {
		isUploading: freeIsUploading,
		isMinting: freeIsMinting,
	publishFreeComic,
    updateComicWithMintData,
    reset,
    checkCreatorApproval,
	// tokenId,
    mintHash: hash,
    // comicId,
    // mintError,
    
    // Approval states
    approvalStatus,


	} = useFreeComicMinting();

	useEffect(() => {
		if (isComplete && tokenId && mintHash) {
			console.log('✅ Transaction Complete! Opening success modal...');
			console.log('🎫 Token ID:', tokenId.toString());
			console.log('🔗 Transaction Hash:', mintHash);
			setShowSuccessModal(true);
			setIsPublishing(false);
		}
	}, [isComplete, tokenId, mintHash]);

	// const validateComicData = (): boolean => {
	// 	const errors: string[] = [];

	// 	// Validate title
	// 	if (!comicData.title || comicData.title.trim().length === 0) {
	// 		errors.push("Comic title is required");
	// 	}

	// 	// Validate description
	// 	if (!comicData.description || comicData.description.trim().length === 0) {
	// 		errors.push("Comic description is required");
	// 	}

	// 	// Validate genres
	// 	if (!comicData.genre || comicData.genre.length === 0) {
	// 		errors.push("At least one genre must be selected");
	// 	}

	// 	// Validate pages
	// 	if (!comicData.pages || comicData.pages.length === 0) {
	// 		errors.push("At least one comic page is required");
	// 	}

	// 	// Validate age rating
	// 	if (!comicData.ageRating) {
	// 		errors.push("Age rating is required");
	// 	}

	// 	// Validate monetization
	// 	if (monetizationData.publishType === "paid") {
	// 		if (!monetizationData.price || monetizationData.price <= 0) {
	// 			errors.push("Valid price is required for paid comics");
	// 		}
	// 	}

	// 	// Validate NFT data
	// 	if (monetizationData.mintAsNFT) {
	// 		if (!monetizationData.nftCopies || monetizationData.nftCopies <= 0) {
	// 			errors.push("Valid number of NFT copies is required");
	// 		}
	// 		if (!monetizationData.nftPrice || monetizationData.nftPrice <= 0) {
	// 			errors.push("Valid NFT mint price is required");
	// 		}
	// 	}

	// 	setValidationErrors(errors);
	// 	return errors.length === 0;
	// };

	

const validateComicData = (): boolean => {
	const errors: string[] = [];
	// Validate title
	if (!comicData.title || comicData.title.trim().length === 0) {
		errors.push("Comic title is required");
	}

	// Validate description
	if (!comicData.description || comicData.description.trim().length === 0) {
		errors.push("Comic description is required");
	}

	// Validate genres
	if (!comicData.genre || comicData.genre.length === 0) {
		errors.push("At least one genre must be selected");
	}

	// Validate pages
	if (!comicData.pages || comicData.pages.length === 0) {
		errors.push("At least one comic page is required");
	}

	// Validate age rating
	if (!comicData.ageRating) {
		errors.push("Age rating is required");
	}

	// Validate monetization
	if (monetizationData.publishType === "paid") {
		if (!monetizationData.price || monetizationData.price <= 0) {
			errors.push("Valid price is required for paid comics");
		}
	}

	// Validate NFT data - FIXED: Only require price for paid comics
	if (monetizationData.mintAsNFT) {
		if (!monetizationData.nftCopies || monetizationData.nftCopies <= 0) {
			errors.push("Valid number of NFT copies is required");
		}
		// Only require price for paid comics
		if (monetizationData.publishType === "paid") {
			if (!monetizationData.nftPrice || monetizationData.nftPrice <= 0) {
				errors.push("Valid NFT mint price is required");
			}
		}
	}

	setValidationErrors(errors);
	return errors.length === 0;
};

// FIXED FUNCTION 2: handlePublish (replaces lines ~150-233)
const handlePublish = async () => {
	// Clear previous errors
	setError(null);
	setValidationErrors([]);
	setPublishingStep('');

	// Validate data first
	if (!validateComicData()) {
		setError("Please fix the validation errors before publishing");
		return;
	}

	if (!user) {
		setError("Please connect your wallet to publish your comic");
		return;
	}

	// Additional validation for paid comics and NFTs
	if ((monetizationData.publishType === "paid" || monetizationData.mintAsNFT) && !isConnected) {
		setError("Please connect your wallet to publish paid comics or mint NFTs");
		return;
	}

	try {
		setIsPublishing(true);
		setShowSuccessModal(false);

		// Use the new comic minting hook for enhanced publishing
		if(monetizationData.publishType === "paid"){
			const result = await publishComic({
				comicData,
				monetizationData,
				user,
			});
                         
			console.log('🎉 Paid Comic published successfully:', result);

		} else {
			// FIXED: For free comics, use nftCopies if provided
			const maxSupply = monetizationData.mintAsNFT && monetizationData.nftCopies 
				? monetizationData.nftCopies 
				: 1000;
			
			const freeComic = await publishFreeComic({
				comicData,
				freeComicData: {
					maxSupply: maxSupply,
					royaltyPercentage: 0 // No royalties for free comics
				},
				user,
			});
			console.log('🎉 Free Comic published successfully:', freeComic);
		}

		// Show success notification
		setShowNotification(true);

	} catch (err: any) {
		console.error('Error publishing comic:', err);
		
		// Extract meaningful error message
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

		// Handle specific error types
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
		}

		setError(errorMessage);
	} finally {
		setIsPublishing(false);
		setPublishingStep('');
	}
};

	// const handlePublish = async () => {
	// 	// Clear previous errors
	// 	setError(null);
	// 	setValidationErrors([]);
	// 	setPublishingStep('');

	// 	// Validate data first
	// 	if (!validateComicData()) {
	// 		setError("Please fix the validation errors before publishing");
	// 		return;
	// 	}

	// 	if (!user) {
	// 		setError("Please connect your wallet to publish your comic");
	// 		return;
	// 	}

	// 	// Additional validation for paid comics and NFTs
	// 	if ((monetizationData.publishType === "paid" || monetizationData.mintAsNFT) && !isConnected) {
	// 		setError("Please connect your wallet to publish paid comics or mint NFTs");
	// 		return;
	// 	}

	// 	try {
	// 		setIsPublishing(true);
	// 		setShowSuccessModal(false);

	// 		// Use the new comic minting hook for enhanced publishing
	// 		if(monetizationData.publishType === "paid"){
	// 		const result = await publishComic({
	// 			comicData,
	// 			monetizationData,
	// 			user,
	// 		});
                         
	// 		console.log('🎉 Paid Comic published successfully:', result);

	// 	} else {
	// 		const freeComic = await publishFreeComic({
	// 			comicData,
	// 			freeComicData: {
	// 				maxSupply: 1000, // Set a default max supply for free comics
	// 				royaltyPercentage: 0 // No royalties for free comics
	// 			},
	// 			user,
	// 		});
	// 		console.log('🎉 Free Comic published successfully:', freeComic);
	// 	}

	// 		// Show success notification
	// 		setShowNotification(true);

	// 	} catch (err: any) {
	// 		console.error('Error publishing comic:', err);
			
	// 		// Extract meaningful error message
	// 		let errorMessage = 'Failed to publish comic. Please try again.';
			
	// 		if (err?.response?.data?.message) {
	// 			errorMessage = err.response.data.message;
	// 		} else if (err?.response?.data?.error) {
	// 			errorMessage = err.response.data.error;
	// 		} else if (err?.message) {
	// 			errorMessage = err.message;
	// 		} else if (typeof err === 'string') {
	// 			errorMessage = err;
	// 		}

	// 		// Handle specific error types
	// 		if (errorMessage.toLowerCase().includes('network')) {
	// 			errorMessage = 'Network error. Please check your connection and try again.';
	// 		} else if (errorMessage.toLowerCase().includes('timeout')) {
	// 			errorMessage = 'Request timed out. Your file might be too large. Please try again.';
	// 		} else if (errorMessage.toLowerCase().includes('unauthorized')) {
	// 			errorMessage = 'Authentication error. Please log in again.';
	// 		} else if (errorMessage.toLowerCase().includes('validation')) {
	// 			errorMessage = 'Validation error. Please check your comic details.';
	// 		} else if (errorMessage.toLowerCase().includes('wallet')) {
	// 			errorMessage = 'Wallet connection error. Please check your wallet and try again.';
	// 		} else if (errorMessage.toLowerCase().includes('gas')) {
	// 			errorMessage = 'Insufficient gas fees. Please add funds to your wallet and try again.';
	// 		} else if (errorMessage.toLowerCase().includes('rejected')) {
	// 			errorMessage = 'Transaction was rejected. Please approve the transaction in your wallet.';
	// 		}

	// 		setError(errorMessage);
	// 	} finally {
	// 		setIsPublishing(false);
	// 		setPublishingStep('');
	// 	}
	// };

	const handleCloseSuccessModal = () => {
		setShowSuccessModal(false);
		setIsPublishing(false);
		onclose();
	};

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
								src={comicData.coverImage 
									? URL.createObjectURL(comicData.coverImage) 
									: comicData.pages[0]?.preview || ''
								}
								alt='Comic preview'
								className='w-full h-48 object-cover'
							/>
						</div>

						{/* Comic Details */}
						<div className='mb-6 px-4'>
							<h3 className='text-lg font-semibold mb-3 text-white/90 tracking-wider'>
								{comicData.title}
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
									<span className='text-white/60'>Reader Access:</span>
									<span>
										{monetizationData.publishType === 'free' 
											? 'Free to Read' 
											: `Pay-Per-View ($${monetizationData.price?.toFixed(2)} HBAR)`
										}
									</span>
								</div>

								{/* {monetizationData.mintAsNFT && (
									<>
										<div className='flex items-center gap-3'>
											<span className='text-white/60'>NFT Edition:</span>
											<span className='flex items-center gap-1'>
												<CheckCircle size={14} className='text-green-400' />
												Limited Edition
											</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className='text-white/60'>NFT Copies:</span>
											<span>{monetizationData.nftCopies} editions</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className='text-white/60'>Mint Price:</span>
											<span>${monetizationData.nftPrice?.toFixed(2)} HBAR per NFT</span>
										</div>
									</>
								)} */}
								{monetizationData.mintAsNFT && (
	<>
		<div className='flex items-center gap-3'>
			<span className='text-white/60'>NFT Edition:</span>
			<span className='flex items-center gap-1'>
				<CheckCircle size={14} className='text-green-400' />
				Limited Edition
			</span>
		</div>
		<div className='flex items-center gap-3'>
			<span className='text-white/60'>NFT Copies:</span>
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

								<div className='flex items-center gap-3'>
									<span className='text-white/60'>Pages:</span>
									<span>{comicData.pages.length} pages (Chapter 1)</span>
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
								By clicking <b className='text-orange-400'>&quot;PUBLISH COMIC!&quot;</b>, your comic will
								become live on Quiva and readers can start enjoying it immediately.
								{monetizationData.mintAsNFT && ' Your NFT collection will also be created and available for minting.'}
							</p>
						</div>
					</div>

					{/* Validation Errors */}
					{validationErrors.length > 0 && (
						<div className='mx-6 mb-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle size={18} className='text-yellow-400 flex-shrink-0 mt-0.5' />
								<div>
									<p className='text-orange-400 font-semibold text-sm mb-1'>Validation Errors:</p>
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
					{(isUploading || isMinting || isListing || isWritePending || isConfirming) && (
						<div className='mx-6 mb-4 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4'>
							<div className='space-y-3'>
								{/* Upload Progress */}
								{isUploading && (
									<div className='flex items-center gap-3'>
										<Upload size={18} className='text-orange-400' />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-blue-300 text-sm font-medium'>Uploading to IPFS...</span>
												<span className='text-blue-300 text-xs'>{uploadProgress}%</span>
											</div>
											<div className='w-full bg-white/10 rounded-full h-2'>
												<div 
													className='bg-orange-400 h-2 rounded-full transition-all duration-300'
													style={{ width: `${uploadProgress}%` }}
												/>
											</div>
										</div>
									</div>
								)}

								{/* Minting Progress */}
								{(isMinting || isWritePending || isConfirming) && !isListing && (
									<div className='flex items-center gap-3'>
										<Zap size={18} className='text-orange-400' />
										<div className='flex-1'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-orange-400 text-sm font-medium'>
													{isWritePending ? 'Preparing blockchain transaction...' : 
													 isConfirming ? 'Confirming on blockchain...' : 
													 'Minting NFT...'}
												</span>
												{isMinting && <span className='text-orange-400 text-xs'>{mintingProgress}%</span>}
											</div>
											{isMinting && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div 
														className='bg-orange-400 h-2 rounded-full transition-all duration-300'
														style={{ width: `${mintingProgress}%` }}
													/>
												</div>
											)}
											{isWritePending && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div className='bg-orange-400 h-2 rounded-full animate-pulse w-1/3' />
												</div>
											)}
											{isConfirming && (
												<div className='w-full bg-white/10 rounded-full h-2'>
													<div className='bg-orange-400 h-2 rounded-full animate-pulse w-2/3' />
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
								{tokenId && (
									<div className='flex items-center gap-2 text-orange-400 text-sm'>
										<CheckCircle size={16} />
										<span>NFT minted successfully! Token ID: {tokenId.toString()}</span>
									</div>
								)}

								{mintHash && (
									<div className='flex items-center gap-2 text-orange-400 text-sm'>
										<CheckCircle size={16} />
										<span>Transaction: {mintHash.slice(0, 10)}...{mintHash.slice(-8)}</span>
									</div>
								)}
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
							disabled={isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming}
							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2'
						>
							{isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming ? (
								<>
									<div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
									{isUploading ? 'Uploading to IPFS...' : 
									 isMinting || isWritePending ? 'Minting NFT...' : 
									 isListing ? 'Listing on marketplace...' :
									 isConfirming ? 'Confirming...' : 
									 'Publishing...'}
								</>
							) : (
								<>
									<Database size={18} />
									{monetizationData.mintAsNFT ? 'Publish & Mint NFT' : 'Publish Comic'}
								</>
							)}
						</button>

						<button
							onClick={onclose}
							disabled={isPublishing || isUploading || isMinting || isListing || isWritePending || isConfirming}
							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
						>
							{isPublishing || isUploading || isMinting || isListing ? 'Please wait...' : 'Go Back'}
						</button>
					</div>
				</div>
			)}

			{/* SUCCESS MODAL */}
			{showSuccessModal && isComplete && tokenId && mintHash && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]'>
					<div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-orange-400/30 shadow-2xl relative'>
						{/* Close Button */}
						<button
							onClick={handleCloseSuccessModal}
							className='absolute top-4 right-4 text-white/50 hover:text-white transition-colors'
						>
							<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>

						<div className='text-center'>
							{/* Success Icon with Animation */}
							<div className='mb-6'>
								<div className='w-20 h-20 mx-auto bg-orange-400/20 rounded-full flex items-center justify-center border-4 border-orange-400 animate-bounce'>
									<CheckCircle className='w-12 h-12 text-orange-400' />
								</div>
							</div>

							{/* Success Title */}
							<h2 className='text-3xl font-bold mb-2 text-white'>
								Comic Successfully Minted! 🎉
							</h2>
							
							{/* Success Description */}
							<p className='text-white/70 mb-6 text-sm'>
								Your comic has been published and minted as an NFT on the blockchain.
							</p>
							
							{/* NFT Details Card */}
							<div className='bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-xl p-5 mb-6 text-left border border-orange-500/30'>
								<p className='text-sm font-semibold text-orange-400 mb-4 tracking-wider uppercase'>
									NFT Details
								</p>
								
								<div className='space-y-3'>
									{/* Token ID Display */}
									<div className='bg-black/30 rounded-lg p-3'>
										<div className='flex justify-between items-center'>
											<span className='text-xs text-white/60'>Token ID:</span>
											<span className='text-lg font-mono font-bold text-orange-400'>
												#{tokenId.toString()}
											</span>
										</div>
									</div>

									{/* Transaction Hash Display */}
									<div className='bg-black/30 rounded-lg p-3'>
										<div>
											<span className='text-xs text-white/60 block mb-2'>Transaction Hash:</span>
											<span className='text-xs font-mono text-white/90 break-all block'>
												{mintHash}
											</span>
										</div>
									</div>
									
									{/* Comic Title */}
									{comicData?.title && (
										<div className='bg-black/30 rounded-lg p-3'>
											<div className='flex justify-between items-center'>
												<span className='text-xs text-white/60'>Comic:</span>
												<span className='text-sm font-medium text-white/90'>
													{comicData.title}
												</span>
											</div>
										</div>
									)}

									{/* NFT Supply */}
									{monetizationData?.nftCopies && (
										<div className='bg-black/30 rounded-lg p-3'>
											<div className='flex justify-between items-center'>
												<span className='text-xs text-white/60'>Supply:</span>
												<span className='text-sm font-medium text-white/90'>
													{monetizationData.nftCopies} copies
												</span>
											</div>
										</div>
									)}
								</div>

								{/* HashScan Explorer Link */}
								<a
									href={`https://hashscan.io/testnet/transaction/${mintHash}`}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center justify-center gap-2 text-xs text-orange-400 hover:text-orange-300 mt-4 pt-4 border-t border-orange-500/20 transition-colors'
								>
									<span>View Transaction on HashScan</span>
									<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
									</svg>
								</a>
							</div>
							
							{/* Action Buttons */}
							<div className='space-y-3'>
								{/* View Comic Button */}
								<button
									onClick={() => {
										window.location.href = `/comic-pad/my-comics`;
									}}
									className='w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-orange-500/50'
								>
									View Comic
								</button>
								
								{/* Create Another Comic Button */}
								<button
									onClick={handleCloseSuccessModal}
									className='w-full py-2 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors border border-white/10'
								>
									Create Another Comic
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* SUCCESS MODAL */}
			{showSuccessModal && isComplete && tokenId && mintHash && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]'>
					<div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-orange-400/30 shadow-2xl relative'>
						{/* Close Button */}
						<button
							onClick={handleCloseSuccessModal}
							className='absolute top-4 right-4 text-white/50 hover:text-white transition-colors'
						>
							<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
							</svg>
						</button>

						<div className='text-center'>
							{/* Success Icon with Animation */}
							<div className='mb-6'>
								<div className='w-20 h-20 mx-auto bg-orange-400/20 rounded-full flex items-center justify-center border-4 border-orange-400 animate-bounce'>
									<CheckCircle className='w-12 h-12 text-orange-400' />
								</div>
							</div>

							{/* Success Title */}
							<h2 className='text-3xl font-bold mb-2 text-white'>
								Comic Successfully Minted! 🎉
							</h2>
							
							{/* Success Description */}
							<p className='text-white/70 mb-6 text-sm'>
								Your comic has been published and minted as an NFT on the blockchain.
							</p>
							
							{/* NFT Details Card */}
							<div className='bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-xl p-5 mb-6 text-left border border-orange-500/30'>
								<p className='text-sm font-semibold text-orange-400 mb-4 tracking-wider uppercase'>
									NFT Details
								</p>
								
								<div className='space-y-3'>
									{/* Token ID Display */}
									<div className='bg-black/30 rounded-lg p-3'>
										<div className='flex justify-between items-center'>
											<span className='text-xs text-white/60'>Token ID:</span>
											<span className='text-lg font-mono font-bold text-orange-400'>
												#{tokenId.toString()}
											</span>
										</div>
									</div>

									{/* Transaction Hash Display */}
									<div className='bg-black/30 rounded-lg p-3'>
										<div>
											<span className='text-xs text-white/60 block mb-2'>Transaction Hash:</span>
											<span className='text-xs font-mono text-white/90 break-all block'>
												{mintHash}
											</span>
										</div>
									</div>
									
									{/* Comic Title */}
									{comicData?.title && (
										<div className='bg-black/30 rounded-lg p-3'>
											<div className='flex justify-between items-center'>
												<span className='text-xs text-white/60'>Comic:</span>
												<span className='text-sm font-medium text-white/90'>
													{comicData.title}
												</span>
											</div>
										</div>
									)}

									{/* NFT Supply */}
									{monetizationData?.nftCopies && (
										<div className='bg-black/30 rounded-lg p-3'>
											<div className='flex justify-between items-center'>
												<span className='text-xs text-white/60'>Supply:</span>
												<span className='text-sm font-medium text-white/90'>
													{monetizationData.nftCopies} copies
												</span>
											</div>
										</div>
									)}
								</div>

								{/* HashScan Explorer Link */}
								<a
									href={`https://hashscan.io/testnet/transaction/${mintHash}`}
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center justify-center gap-2 text-xs text-orange-400 hover:text-orange-300 mt-4 pt-4 border-t border-orange-500/20 transition-colors'
								>
									<span>View Transaction on HashScan</span>
									<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
									</svg>
								</a>
							</div>
							
							{/* Action Buttons */}
							<div className='space-y-3'>
								{/* View Comic Button */}
								<button
									onClick={() => {
										window.location.href = `/comic-pad/my-comics`;
									}}
									className='w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-orange-500/50'
								>
									View Comic
								</button>
								
								{/* Create Another Comic Button */}
								<button
									onClick={handleCloseSuccessModal}
									className='w-full py-2 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors border border-white/10'
								>
									Create Another Comic
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{showNotification && <ComicNotification onclose={() => setShowNotification(true)} comicData={comicData} />}
		</>
	);
}



// src/app/comic-pad/upload-comics/_components/ComicPublisher.tsx
// UPDATED VERSION - Now handles both paid and free comics

// "use client";

// import { useEffect, useState } from "react";
// import { AlertCircle, CheckCircle, Upload, Zap, Database } from "lucide-react";
// import { ComicNotification } from "./ComicNotification";
// import Picture from "@/components/picture/Index";
// import { useAppDispatch, useAppSelector } from "@/redux/hook";
// import { useComicMinting } from "@/hook/useComicMinting";
// import { useFreeComicMinting } from "@/hook/useFreeComicMinting"; // NEW IMPORT
// import { useAccount } from "wagmi";
// import { useRouter } from "next/navigation";

// interface ExtractedFile {
// 	name: string;
// 	blob: Blob;
// 	preview: string;
// }

// interface ComicData {
// 	title: string;
// 	description: string;
// 	genre: string[];
// 	tags: string[];
// 	ageRating: string;
// 	coverImage: File | null;
// 	pages: ExtractedFile[];
// }

// interface MonetizationData {
// 	publishType: "free" | "paid";
// 	price?: number;
// 	mintAsNFT: boolean;
// 	nftCopies?: number;
// 	nftPrice?: number;
// 	// NEW: Free comic specific fields
// 	isFreeNFT?: boolean;
// 	maxFreeSupply?: number;
// }

// interface ComicPublisherProps {
// 	onclose: () => void;
// 	comicData: ComicData;
// 	monetizationData: MonetizationData;
// }

// export default function ComicPublisher({ 
// 	onclose, 
// 	comicData, 
// 	monetizationData 
// }: ComicPublisherProps) {
// 	const router = useRouter();
// 	const [showNotification, setShowNotification] = useState(false);
// 	const [error, setError] = useState<string | null>(null);
// 	const [showSuccessModal, setShowSuccessModal] = useState(false);
	
// 	const dispatch = useAppDispatch();
// 	const { user } = useAppSelector((state) => state.wallet);
// 	const { isConnected } = useAccount();
	
// 	// NEW: Determine which flow to use
// 	const isFreeComicWithNFT = monetizationData.publishType === "free" && monetizationData.isFreeNFT;
// 	const isPaidComic = monetizationData.publishType === "paid";

// 	// Use paid comic minting hook (existing)
// 	const paidHook = useComicMinting();
	
// 	// NEW: Use free comic minting hook
// 	const freeHook = useFreeComicMinting();
	
// 	// NEW: Select the appropriate hook based on comic type
// 	const activeHook = isFreeComicWithNFT ? freeHook : paidHook;
	
// 	const {
// 		isUploading,
// 		isMinting,
// 		uploadProgress,
// 		mintingProgress,
// 		isWritePending,
// 		isConfirming,
// 		isMintSuccess,
// 		isComplete,
// 		mintError,
// 		tokenId,
// 		mintHash,
// 		comicId,
// 		reset,
// 	} = activeHook;

// 	// Get additional properties based on hook type
// 	const isListing = !isFreeComicWithNFT && 'isListing' in activeHook ? activeHook.isListing : false;
// 	const approvalStatus = isFreeComicWithNFT && 'approvalStatus' in activeHook ? activeHook.approvalStatus : null;

// 	// Handle completion
// 	useEffect(() => {
// 		if (isComplete && tokenId && mintHash) {
// 			console.log('✅ Comic Publishing Complete!', {
// 				type: isFreeComicWithNFT ? 'Free Claimable' : 'Paid',
// 				tokenId: tokenId.toString(),
// 				transactionHash: mintHash,
// 				comicId
// 			});
// 			setShowSuccessModal(true);
// 		}
// 	}, [isComplete, tokenId, mintHash, comicId, isFreeComicWithNFT]);

// 	// Handle errors
// 	useEffect(() => {
// 		if (mintError) {
// 			setError(mintError.message || 'An error occurred during publishing');
// 		}
// 	}, [mintError]);

// 	// Handle publish
// 	const handlePublish = async () => {
// 		try {
// 			setError(null);
			
// 			if (!isConnected) {
// 				setError('Please connect your wallet to publish');
// 				return;
// 			}

// 			if (!user) {
// 				setError('User information not available');
// 				return;
// 			}

// 			console.log('🚀 Publishing comic with data:', {
// 				type: isFreeComicWithNFT ? 'Free Claimable NFT' : 'Paid Comic',
// 				comicData,
// 				monetizationData,
// 				user
// 			});

// 			// NEW: Route to appropriate publish function
// 			if (isFreeComicWithNFT) {
// 				// Publish as free claimable NFT
// 				await freeHook.publishFreeComic({
// 					comicData,
// 					freeComicData: {
// 						maxSupply: monetizationData.maxFreeSupply || 100,
// 						royaltyPercentage: 10,
// 					},
// 					user,
// 				});
// 			} else {
// 				// Publish as paid comic (existing flow)
// 				await paidHook.publishComic({
// 					comicData,
// 					monetizationData,
// 					user,
// 				});
// 			}

// 		} catch (error: any) {
// 			console.error('❌ Publish error:', error);
// 			setError(error.message || 'Failed to publish comic');
// 		}
// 	};

// 	// Get current progress message
// 	const getProgressMessage = () => {
// 		if (approvalStatus?.isApproving) {
// 			return 'Requesting creator approval...';
// 		}
// 		if (isUploading) {
// 			return `Uploading to IPFS... ${uploadProgress}%`;
// 		}
// 		if (isMinting || isWritePending) {
// 			return 'Preparing blockchain transaction...';
// 		}
// 		if (isConfirming) {
// 			return 'Confirming on blockchain...';
// 		}
// 		if (isListing) {
// 			return 'Listing on marketplace...';
// 		}
// 		if (isMintSuccess && !isComplete) {
// 			return 'Finalizing...';
// 		}
// 		return '';
// 	};

// 	const isPublishing = isUploading || isMinting || isWritePending || isConfirming || isListing || approvalStatus?.isApproving;

// 	// NEW: Get theme colors based on comic type
// 	const themeColors = isFreeComicWithNFT 
// 		? { primary: 'from-green-600 to-blue-600', accent: 'green' }
// 		: { primary: 'from-orange-600 to-orange-600', accent: 'orange' };

// 	return (
// 		<>
// 			<div className='fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4'>
// 				<div className='bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl border border-white/10'>
// 					{/* Header - NEW: Dynamic based on comic type */}
// 					<div className={`bg-gradient-to-r ${themeColors.primary} p-6 rounded-t-2xl`}>
// 						<h2 className='text-3xl font-bold text-white tracking-wider text-center'>
// 							{isFreeComicWithNFT ? '🎁 Publish Free Claimable Comic' : '🚀 Publish Comic'}
// 						</h2>
// 						<p className='text-white/80 text-center mt-2 text-sm'>
// 							{isFreeComicWithNFT 
// 								? 'Your comic will be minted as a free NFT that readers can claim'
// 								: monetizationData.publishType === 'free'
// 								? 'Your comic will be available to all readers for free'
// 								: 'Your comic will be minted and listed on the marketplace'}
// 						</p>
// 					</div>

// 					<div className='p-8'>
// 						{/* Comic Preview */}
// 						<div className='bg-white/5 rounded-xl p-6 mb-6 border border-white/10'>
// 							<div className='flex gap-6'>
// 								{comicData.coverImage && (
// 									<div className='flex-shrink-0'>
// 										<Picture
// 											src={URL.createObjectURL(comicData.coverImage)}
// 											alt={comicData.title}
// 											className={`w-32 h-48 object-cover rounded-lg border-2 ${
// 												isFreeComicWithNFT ? 'border-green-500/50' : 'border-orange-500/50'
// 											}`}
// 										/>
// 									</div>
// 								)}
								
// 								<div className='flex-1 space-y-3'>
// 									<h3 className='text-2xl font-bold text-white'>
// 										{comicData.title}
// 									</h3>

// 									<div className='grid grid-cols-2 gap-3 text-sm'>
// 										<div className='flex items-center gap-3'>
// 											<span className='text-white/60'>Genre:</span>
// 											<span className='text-white'>{comicData.genre.join(', ')}</span>
// 										</div>

// 										<div className='flex items-center gap-3'>
// 											<span className='text-white/60'>Rating:</span>
// 											<span className='text-white'>
// 												{comicData.ageRating === 'everyone' 
// 													? 'All Ages' 
// 													: comicData.ageRating === 'teen' 
// 													? 'Teen (13+)' 
// 													: 'Mature (18+)'}
// 											</span>
// 										</div>

// 										<div className='flex items-center gap-3'>
// 											<span className='text-white/60'>Access:</span>
// 											<span className={`flex items-center gap-1 ${
// 												isFreeComicWithNFT ? 'text-green-400' : 
// 												monetizationData.publishType === 'free' ? 'text-green-400' : 
// 												'text-orange-400'
// 											} font-medium`}>
// 												<CheckCircle size={14} />
// 												{isFreeComicWithNFT ? 'Free to Claim' :
// 												 monetizationData.publishType === 'free' ? 'Free to Read' :
// 												 `Pay-Per-View ($${monetizationData.price?.toFixed(2)} HBAR)`}
// 											</span>
// 										</div>

// 										{/* NEW: Show appropriate details based on type */}
// 										{isFreeComicWithNFT ? (
// 											<>
// 												<div className='flex items-center gap-3'>
// 													<span className='text-white/60'>NFT Type:</span>
// 													<span className='flex items-center gap-1 text-green-400'>
// 														<CheckCircle size={14} />
// 														Claimable NFT
// 													</span>
// 												</div>
// 												<div className='flex items-center gap-3'>
// 													<span className='text-white/60'>Max Claims:</span>
// 													<span className='text-white'>{monetizationData.maxFreeSupply} readers</span>
// 												</div>
// 											</>
// 										) : monetizationData.mintAsNFT && (
// 											<>
// 												<div className='flex items-center gap-3'>
// 													<span className='text-white/60'>NFT Edition:</span>
// 													<span className='flex items-center gap-1'>
// 														<CheckCircle size={14} className='text-green-400' />
// 														Limited Edition
// 													</span>
// 												</div>
// 												<div className='flex items-center gap-3'>
// 													<span className='text-white/60'>NFT Copies:</span>
// 													<span>{monetizationData.nftCopies} editions</span>
// 												</div>
// 												<div className='flex items-center gap-3'>
// 													<span className='text-white/60'>Mint Price:</span>
// 													<span>${monetizationData.nftPrice?.toFixed(2)} HBAR per NFT</span>
// 												</div>
// 											</>
// 										)}

// 										<div className='flex items-center gap-3'>
// 											<span className='text-white/60'>Pages:</span>
// 											<span className='text-white'>{comicData.pages.length} pages</span>
// 										</div>
// 									</div>
// 								</div>
// 							</div>

// 							<p className='mt-4 text-sm text-white/80 tracking-wide leading-relaxed border-t border-white/10 pt-4'>
// 								By clicking <b className={`text-${themeColors.accent}-400`}>&quot;PUBLISH COMIC!&quot;</b>, 
// 								{isFreeComicWithNFT 
// 									? ' your comic will be minted as an NFT on the blockchain. Readers will be able to claim one copy each for free (gas fees only) until the maximum supply is reached.'
// 									: monetizationData.publishType === 'free'
// 									? ' your comic will become live on Quiva and readers can start enjoying it immediately for free.'
// 									: ' your comic will become live on Quiva and readers can start enjoying it immediately.'
// 								}
// 								{monetizationData.mintAsNFT && !isFreeComicWithNFT && ' Your NFT collection will also be created and available for minting.'}
// 							</p>
// 						</div>

// 						{/* Progress Section */}
// 						{isPublishing && (
// 							<div className={`bg-${themeColors.accent}-500/10 border border-${themeColors.accent}-500/30 rounded-xl p-6 mb-6`}>
// 								<div className='flex items-center gap-4 mb-4'>
// 									<div className='relative w-12 h-12'>
// 										<div className={`absolute inset-0 rounded-full border-4 border-${themeColors.accent}-500/20`}></div>
// 										<div className={`absolute inset-0 rounded-full border-4 border-${themeColors.accent}-500 border-t-transparent animate-spin`}></div>
// 									</div>
// 									<div className='flex-1'>
// 										<h4 className='text-white font-semibold mb-1'>
// 											{getProgressMessage()}
// 										</h4>
// 										<div className='w-full bg-white/10 rounded-full h-2'>
// 											<div 
// 												className={`bg-gradient-to-r ${themeColors.primary} h-2 rounded-full transition-all duration-300`}
// 												style={{ 
// 													width: `${isUploading ? uploadProgress : mintingProgress}%` 
// 												}}
// 											></div>
// 										</div>
// 									</div>
// 								</div>

// 								<div className='space-y-2 text-sm text-white/70'>
// 									<div className='flex items-center gap-2'>
// 										{uploadProgress === 100 ? (
// 											<CheckCircle size={16} className={`text-${themeColors.accent}-400`} />
// 										) : (
// 											<div className='w-4 h-4 border-2 border-white/30 rounded-full' />
// 										)}
// 										<span>Upload to IPFS</span>
// 									</div>
// 									{(approvalStatus || isFreeComicWithNFT) && (
// 										<div className='flex items-center gap-2'>
// 											{approvalStatus?.isApproved || mintingProgress > 20 ? (
// 												<CheckCircle size={16} className={`text-${themeColors.accent}-400`} />
// 											) : (
// 												<div className='w-4 h-4 border-2 border-white/30 rounded-full' />
// 											)}
// 											<span>Creator Verification</span>
// 										</div>
// 									)}
// 									<div className='flex items-center gap-2'>
// 										{isMintSuccess ? (
// 											<CheckCircle size={16} className={`text-${themeColors.accent}-400`} />
// 										) : (
// 											<div className='w-4 h-4 border-2 border-white/30 rounded-full' />
// 										)}
// 										<span>Mint {isFreeComicWithNFT ? 'Free' : ''} NFT</span>
// 									</div>
// 									{!isFreeComicWithNFT && monetizationData.mintAsNFT && (
// 										<div className='flex items-center gap-2'>
// 											{isComplete ? (
// 												<CheckCircle size={16} className={`text-${themeColors.accent}-400`} />
// 											) : (
// 												<div className='w-4 h-4 border-2 border-white/30 rounded-full' />
// 											)}
// 											<span>List on Marketplace</span>
// 										</div>
// 									)}
// 									<div className='flex items-center gap-2'>
// 										{isComplete ? (
// 											<CheckCircle size={16} className={`text-${themeColors.accent}-400`} />
// 										) : (
// 											<div className='w-4 h-4 border-2 border-white/30 rounded-full' />
// 										)}
// 										<span>Finalize Publication</span>
// 									</div>
// 								</div>
// 							</div>
// 						)}

// 						{/* Error Display */}
// 						{error && (
// 							<div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6'>
// 								<div className='flex items-start gap-3'>
// 									<AlertCircle className='text-red-400 flex-shrink-0 mt-1' size={20} />
// 									<div className='flex-1'>
// 										<h4 className='text-red-400 font-semibold mb-1'>Error</h4>
// 										<p className='text-red-300 text-sm'>{error}</p>
// 									</div>
// 								</div>
// 							</div>
// 						)}

// 						{/* Action Buttons */}
// 						<div className='flex gap-4'>
// 							<button
// 								onClick={() => {
// 									reset();
// 									onclose();
// 								}}
// 								disabled={isPublishing}
// 								className='flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed'
// 							>
// 								Cancel
// 							</button>
// 							<button
// 								onClick={handlePublish}
// 								disabled={isPublishing || !isConnected}
// 								className={`flex-1 py-3 px-6 bg-gradient-to-r ${themeColors.primary} hover:from-${themeColors.accent}-700 hover:to-${themeColors.accent === 'green' ? 'blue' : 'orange'}-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-${themeColors.accent}-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
// 							>
// 								{isPublishing ? (
// 									<>
// 										<div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
// 										<span>Publishing...</span>
// 									</>
// 								) : (
// 									<>
// 										<Upload size={20} />
// 										<span>PUBLISH COMIC!</span>
// 									</>
// 								)}
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</div>

// 			{/* Success Modal */}
// 			{showSuccessModal && (
// 				<div className='fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4'>
// 					<div className='bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden'>
// 						<div className={`bg-gradient-to-r ${themeColors.primary} p-8 text-center`}>
// 							<div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
// 								<CheckCircle size={48} className={`text-${themeColors.accent}-600`} />
// 							</div>
// 							<h2 className='text-3xl font-bold text-white mb-2'>
// 								🎉 Comic Published Successfully!
// 							</h2>
// 							<p className='text-white/80 text-lg'>
// 								{isFreeComicWithNFT 
// 									? 'Your comic is now live and ready for readers to claim'
// 									: 'Your comic is now live on the marketplace'}
// 							</p>
// 						</div>

// 						<div className='p-8'>
// 							<div className='bg-white/5 rounded-xl p-6 mb-6 border border-white/10'>
// 								<h3 className='text-white font-semibold mb-4 text-center'>
// 									Transaction Details
// 								</h3>
// 								<div className='space-y-3 text-sm'>
// 									<div className='flex justify-between items-center'>
// 										<span className='text-white/60'>Token ID:</span>
// 										<span className={`text-${themeColors.accent}-400 font-mono`}>
// 											#{tokenId?.toString()}
// 										</span>
// 									</div>
// 									{isFreeComicWithNFT && (
// 										<div className='flex justify-between items-center'>
// 											<span className='text-white/60'>Max Claims:</span>
// 											<span className='text-white'>{monetizationData.maxFreeSupply} readers</span>
// 										</div>
// 									)}
// 									{!isFreeComicWithNFT && monetizationData.mintAsNFT && (
// 										<>
// 											<div className='flex justify-between items-center'>
// 												<span className='text-white/60'>NFT Copies:</span>
// 												<span className='text-white'>{monetizationData.nftCopies} editions</span>
// 											</div>
// 											<div className='flex justify-between items-center'>
// 												<span className='text-white/60'>Price:</span>
// 												<span className='text-white'>${monetizationData.nftPrice?.toFixed(2)} HBAR</span>
// 											</div>
// 										</>
// 									)}
// 									<div className='flex justify-between items-center'>
// 										<span className='text-white/60'>Transaction:</span>
// 										<a
// 											href={`https://hashscan.io/testnet/transaction/${mintHash}`}
// 											target='_blank'
// 											rel='noopener noreferrer'
// 											className='text-blue-400 hover:text-blue-300 underline'
// 										>
// 											View on HashScan
// 										</a>
// 									</div>
// 								</div>
// 							</div>

// 							<div className={`bg-${themeColors.accent}-500/10 border border-${themeColors.accent}-500/30 rounded-xl p-4 mb-6`}>
// 								<p className={`text-${themeColors.accent}-300 text-sm text-center`}>
// 									{isFreeComicWithNFT 
// 										? `Readers can now claim your comic for free! Each reader can claim one copy until the maximum supply of ${monetizationData.maxFreeSupply} is reached.`
// 										: monetizationData.publishType === 'free'
// 										? 'Your comic is now available for everyone to read for free!'
// 										: 'Your comic is now available on the marketplace for purchase!'}
// 								</p>
// 							</div>

// 							<div className='flex gap-4'>
// 								<button
// 									onClick={() => comicId && router.push(`/marketplace/detail?id=${comicId}`)}
// 									className={`flex-1 py-3 px-6 bg-gradient-to-r ${themeColors.primary} hover:from-${themeColors.accent}-700 hover:to-${themeColors.accent === 'green' ? 'blue' : 'orange'}-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-${themeColors.accent}-500/50`}
// 								>
// 									View Comic
// 								</button>
								
// 								<button
// 									onClick={() => {
// 										setShowSuccessModal(false);
// 										reset();
// 										onclose();
// 									}}
// 									className='flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-colors border border-white/10'
// 								>
// 									Create Another Comic
// 								</button>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			)}

// 			{showNotification && (
// 				<ComicNotification onclose={() => setShowNotification(false)} comicData={comicData} />
// 			)}
// 		</>
// 	);
// }