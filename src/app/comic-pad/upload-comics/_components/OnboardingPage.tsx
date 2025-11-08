"use client";

import { useState } from "react";
import ComicPublisher from "./ComicPublisher";
import { MainButton } from "@/components/button";

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

interface OnboardingPageProps {
	onclose: () => void;
	comicData: ComicData;
}

export default function OnboardingPage({ onclose, comicData }: OnboardingPageProps) {
	const [publishType, setPublishType] = useState<"free" | "paid">("free");
	const [mintAsNFT, setMintAsNFT] = useState(false);
	const [nftCopies, setNftCopies] = useState<string>("");
	const [nftPrice, setNftPrice] = useState<string>("");
	const [showPublisher, setShowPublisher] = useState(false);

	// Check if we have a PDF file
	const hasPdfFile = comicData.sourceType === 'pdf-file';
	const pageCount = hasPdfFile 
		? comicData.pdfMetadata?.estimatedPageCount || 'Unknown'
		: comicData.pages.length;

	// When switching to paid, automatically enable NFT
	const handlePublishTypeChange = (type: "free" | "paid") => {
		setPublishType(type);
		if (type === "paid") {
			setMintAsNFT(true); // Auto-enable NFT for paid comics
		}
	};

	const handleContinue = () => {
		// For paid comics, NFT is required
		if (publishType === "paid") {
			if (!mintAsNFT) {
				alert("Paid comics must be minted as NFTs");
				return;
			}
			
			if (!nftCopies || parseInt(nftCopies) <= 0) {
				alert("Please enter a valid number of NFT copies");
				return;
			}
			
			if (!nftPrice || parseFloat(nftPrice) <= 0) {
				alert("Please enter a valid mint price per NFT");
				return;
			}
		}

		// For free comics with NFT, only validate copies
		if (publishType === "free" && mintAsNFT) {
			if (!nftCopies || parseInt(nftCopies) <= 0) {
				alert("Please enter a valid number of max supply");
				return;
			}
		}

		setShowPublisher(true);
	};

	const getMonetizationData = () => {
		return {
			publishType,
			price: publishType === "paid" && nftPrice ? parseFloat(nftPrice) : undefined,
			mintAsNFT,
			nftCopies: mintAsNFT ? parseInt(nftCopies) : undefined,
			nftPrice: publishType === "paid" && nftPrice ? parseFloat(nftPrice) : undefined,
		};
	};

	return (
		<>
			{!showPublisher ? (
				<div className='px-4 py-6 max-h-[85vh] overflow-y-auto'>
					{/* Header */}
					<div className='text-center mb-8'>
						<p className='text-white/80 text-sm font-medium tracking-widest uppercase mb-1'>
							PUBLISH YOUR COMIC: STEP 3 OF 4
						</p>
						<h1 className='text-white text-2xl tracking-wider font-semibold mb-2'>
							Choose your path to prosperity
						</h1>
						<p className='text-white/60 text-sm leading-relaxed'>
							Decide how you want to share and potentially earn from your comic.
						</p>
					</div>

					{/* Reading Access Section */}
					<div className='mb-8'>
						<h2 className='text-white font-medium tracking-widest mb-4'>
							Reading Access
						</h2>

						<div className='space-y-4'>
							{/* Free to Read Option */}
							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-primary-500/50 transition'>
								<input
									type='radio'
									name='reading-access'
									value='free'
									checked={publishType === "free"}
									onChange={() => handlePublishTypeChange("free")}
									className='accent-primary-500 mt-1'
								/>
								<div>
									<h4 className='text-white font-semibold'>Free to read</h4>
									<p className='text-white/60 text-sm mt-1'>
										Make your comic available to everyone at no cost. Perfect for building an audience.
									</p>
								</div>
							</label>

							{/* Pay Per Read Option */}
							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-primary-500/50 transition'>
								<input
									type='radio'
									name='reading-access'
									value='pay-per-read'
									checked={publishType === "paid"}
									onChange={() => handlePublishTypeChange("paid")}
									className='accent-primary-500 mt-1'
								/>
								<div className='flex-1'>
									<h4 className='text-white font-semibold'>Pay Per Read</h4>
									<p className='text-white/60 text-sm mt-1'>
										Readers pay to access your comic. Set your own price.
									</p>
								</div>
							</label>
						</div>
					</div>

					{/* NFT Section */}
					<div className='mb-8'>
						<h2 className='text-white font-medium tracking-widest mb-4'>
							Turn Your Comic into a Collectible NFT!
						</h2>

						<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-primary-500/50 transition'>
							<input
								type='checkbox'
								checked={mintAsNFT}
								onChange={(e) => setMintAsNFT(e.target.checked)}
								disabled={publishType === "paid"} // Disabled for paid (always checked)
								className='accent-primary-500 mt-1 w-4 h-4 disabled:opacity-50'
							/>
							<div className='flex-1'>
								<h4 className='text-white font-semibold'>
									Publish this comic episode on Comic Marketplace
									{publishType === "paid" && (
										<span className='ml-2 text-xs text-primary-400 font-normal'>
											(Required for paid comics)
										</span>
									)}
								</h4>

								{mintAsNFT && (
									<div className='mt-4 space-y-3'>
										{/* Number of copies - shown for both free and paid */}
										<div>
											<label className='block text-white/80 text-xs mb-2'>
												Max Supply: Number of comics to mint.
											</label>
											<input
												type='number'
												placeholder='How many supply to mint?'
												value={nftCopies}
												onChange={(e) => setNftCopies(e.target.value)}
												min='1'
												step='1'
												className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500'
											/>
										</div>
										
										{/* Price input - only shown for paid comics */}
										{publishType === "paid" && (
											<div>
												<label className='block text-white/80 text-xs mb-2'>
													Mint Price (HBAR per NFT)
												</label>
												<input
													type='number'
													placeholder='e.g., 2.00'
													value={nftPrice}
													onChange={(e) => setNftPrice(e.target.value)}
													min='0.01'
													step='0.01'
													className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500'
												/>
												<p className='text-white/40 text-xs mt-1'>
													Readers pay this price to access your comic as an NFT
												</p>
											</div>
										)}
										
										{/* Info text based on publish type and content type */}
										<div className='bg-white/5 rounded-lg p-3 border border-white/10'>
											<p className='text-white/70 text-xs leading-relaxed'>
												{publishType === "free" 
													? `✨ Free comics with NFTs: Readers can claim your comic as an NFT for free (gas fees only). Each reader can claim once until max supply is reached.`
													: `💰 Paid comics with NFTs: Each NFT copy can be purchased at the price you set above. NFT buyers get permanent access and can resell their copies.`
												}
											</p>
										</div>
									</div>
								)}
							</div>
						</label>
					</div>

					{/* Action Buttons */}
					<div className='flex gap-4 pt-4'>
						<button
							onClick={onclose}
							className='flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10'
						>
							Cancel
						</button>
						<button
							onClick={handleContinue}
							className='flex-1 py-3 px-6 text-white rounded-full font-semibold transition-all bg-secondary-200/80 hover:bg-secondary-200'
						>
							Next
						</button>
					</div>
				</div>
			) : (
				<ComicPublisher 
					onclose={() => {
						setShowPublisher(false);
						onclose();
					}} 
					comicData={comicData}
					monetizationData={getMonetizationData()}
				/>
			)}
		</>
	);
}