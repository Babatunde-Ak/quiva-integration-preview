
// "use client";

// import { useState } from "react";
// import ComicPublisher from "./ComicPublisher";

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

// interface OnboardingPageProps {
// 	onclose: () => void;
// 	comicData: ComicData;
// }

// export default function OnboardingPage({ onclose, comicData }: OnboardingPageProps) {
// 	const [publishType, setPublishType] = useState<"free" | "paid">("free");
// 	const [price, setPrice] = useState<string>("");
// 	const [mintAsNFT, setMintAsNFT] = useState(false);
// 	const [nftCopies, setNftCopies] = useState<string>("");
// 	const [nftPrice, setNftPrice] = useState<string>("");
// 	const [showPublisher, setShowPublisher] = useState(false);

// 	const handleContinue = () => {
// 		// Validate reading access
// 		// if (publishType === "paid" && (!price || parseFloat(price) <= 0)) {
// 		// 	alert("Please enter a valid price for paid content");
// 		// 	return;
// 		// }

// 		// Validate NFT fields if minting is enabled
// 		if (mintAsNFT) {
// 			// Always require number of copies
// 			if (!nftCopies || parseInt(nftCopies) <= 0) {
// 				alert("Please enter a valid number of NFT copies");
// 				return;
// 			}
			
// 			// Only require price for paid comics
// 			if (publishType === "paid" && (!nftPrice || parseFloat(nftPrice) <= 0)) {
// 				alert("Please enter a valid mint price per NFT");
// 				return;
// 			}
// 		}

// 		setShowPublisher(true);
// 	};

// 	const getMonetizationData = () => ({
// 		publishType,
// 		// price: publishType === "paid" ? parseFloat(price) : undefined,
// 		mintAsNFT,
// 		nftCopies: mintAsNFT ? parseInt(nftCopies) : undefined,
// 		nftPrice: mintAsNFT && publishType === "paid" ? parseFloat(nftPrice) : undefined,
// 	});

// 	return (
// 		<>
// 			{!showPublisher ? (
// 				<div className='px-4 py-6 max-h-[85vh] overflow-y-auto'>
// 					{/* Header */}
// 					<div className='text-center mb-8'>
// 						<p className='text-white/80 text-sm font-medium tracking-widest uppercase mb-1'>
// 							PUBLISH YOUR COMIC: STEP 3 OF 4
// 						</p>
// 						<h1 className='text-white text-2xl tracking-wider font-semibold mb-2'>
// 							Choose your path to prosperity
// 						</h1>
// 						<p className='text-white/60 text-sm leading-relaxed'>
// 							Decide how you want to share and potentially earn from your comic.
// 						</p>
// 					</div>

// 					{/* Reading Access Section */}
// 					<div className='mb-8'>
// 						<h2 className='text-white font-medium tracking-widest mb-4'>
// 							Reading Access
// 						</h2>

// 						<div className='space-y-4'>
// 							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
// 								<input
// 									type='radio'
// 									name='reading-access'
// 									value='free'
// 									checked={publishType === "free"}
// 									onChange={() => setPublishType("free")}
// 									className='accent-orange-500 mt-1'
// 								/>
// 								<div>
// 									<h4 className='text-white font-semibold'>Free to read</h4>
// 									<p className='text-white/60 text-sm mt-1'>
// 										Make your comic available to everyone at no cost. Perfect for building an audience.
// 									</p>
// 								</div>
// 							</label>

// 							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
// 								<input
// 									type='radio'
// 									name='reading-access'
// 									value='pay-per-read'
// 									checked={publishType === "paid"}
// 									onChange={() => setPublishType("paid")}
// 									className='accent-orange-500 mt-1'
// 								/>
// 								<div className='flex-1'>
// 									<h4 className='text-white font-semibold'>Pay Per Read</h4>
// 									<p className='text-white/60 text-sm mt-1'>
// 										Readers pay to access your comic. Set your own price.
// 									</p>
// 								</div>
// 							</label>
// 						</div>
// 					</div>

// 					{/* NFT Section */}
// 					<div className='mb-8'>
// 						<h2 className='text-white font-medium tracking-widest mb-4'>
// 							Turn Your Comic into a Collectible NFT!
// 						</h2>

// 						<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
// 							<input
// 								type='checkbox'
// 								checked={mintAsNFT}
// 								onChange={(e) => setMintAsNFT(e.target.checked)}
// 								className='accent-orange-500 mt-1 w-4 h-4'
// 							/>
// 							<div className='flex-1'>
// 								<h4 className='text-white font-semibold'>
// 									Mint this comic episode as a limited NFT Edition.
// 								</h4>

// 								{mintAsNFT && (
// 									<div className='mt-4 space-y-3'>
// 										{/* Number of copies - shown for both free and paid */}
// 										<input
// 											type='number'
// 											placeholder='How many copies to mint?'
// 											value={nftCopies}
// 											onChange={(e) => setNftCopies(e.target.value)}
// 											min='1'
// 											step='1'
// 											className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500'
// 										/>
										
// 										{/* Price input - only shown for paid comics */}
// 										{publishType === "paid" && (
// 											<input
// 												type='number'
// 												placeholder='Mint price (USDT per NFT)'
// 												value={nftPrice}
// 												onChange={(e) => setNftPrice(e.target.value)}
// 												min='0.01'
// 												step='0.01'
// 												className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500'
// 											/>
// 										)}
										
// 										{/* Info text based on publish type */}
// 										<p className='text-white/50 text-xs'>
// 											{publishType === "free" 
// 												? "Free comics with NFTs: Readers can claim your comic as an NFT (gas fees only)"
// 												: "Paid comics with NFTs: Each NFT copy can be purchased at the price you set above"
// 											}
// 										</p>
// 									</div>
// 								)}
// 							</div>
// 						</label>
// 					</div>

// 					{/* Info Box based on selections */}
// 					{mintAsNFT && (
// 						<div className='mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-4'>
// 							<div className='flex items-start gap-3'>
// 								<div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0'>
// 									<span className='text-white text-sm font-bold'>💡</span>
// 								</div>
// 								<div>
// 									<h4 className='text-orange-300 font-semibold mb-1'>Blockchain Integration</h4>
// 									<p className='text-orange-200/80 text-sm leading-relaxed'>
// 										Your comic will be uploaded to IPFS for decentralized storage and minted as an NFT on the blockchain.
// 										{publishType === "free" 
// 											? " Readers will be able to claim a free NFT copy (they only pay gas fees)."
// 											: " Each NFT can be purchased by collectors at your set price."
// 										}
// 									</p>
// 								</div>
// 							</div>
// 						</div>
// 					)}

// 					{/* Action Buttons */}
// 					<div className='flex gap-4 pt-4'>
// 						<button
// 							onClick={onclose}
// 							className='flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10'
// 						>
// 							Cancel
// 						</button>
// 						<button
// 							onClick={handleContinue}
// 							className='flex-1 py-3 px-6 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-orange-500/50'
// 						>
// 							Next
// 						</button>
// 					</div>
// 				</div>
// 			) : (
// 				<ComicPublisher 
// 					onclose={() => {
// 						setShowPublisher(false);
// 						onclose();
// 					}} 
// 					comicData={comicData}
// 					monetizationData={getMonetizationData()}
// 				/>
// 			)}
// 		</>
// 	);
// }




"use client";

import { useState } from "react";
import ComicPublisher from "./ComicPublisher";

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
				alert("Please enter a valid number of NFT copies");
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
							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
								<input
									type='radio'
									name='reading-access'
									value='free'
									checked={publishType === "free"}
									onChange={() => handlePublishTypeChange("free")}
									className='accent-orange-500 mt-1'
								/>
								<div>
									<h4 className='text-white font-semibold'>Free to read</h4>
									<p className='text-white/60 text-sm mt-1'>
										Make your comic available to everyone at no cost. Perfect for building an audience.
									</p>
								</div>
							</label>

							{/* Pay Per Read Option */}
							<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
								<input
									type='radio'
									name='reading-access'
									value='pay-per-read'
									checked={publishType === "paid"}
									onChange={() => handlePublishTypeChange("paid")}
									className='accent-orange-500 mt-1'
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

						<label className='flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/20 hover:border-orange-500/50 transition'>
							<input
								type='checkbox'
								checked={mintAsNFT}
								onChange={(e) => setMintAsNFT(e.target.checked)}
								disabled={publishType === "paid"} // Disabled for paid (always checked)
								className='accent-orange-500 mt-1 w-4 h-4 disabled:opacity-50'
							/>
							<div className='flex-1'>
								<h4 className='text-white font-semibold'>
									Mint this comic episode as a limited NFT Edition.
									{publishType === "paid" && (
										<span className='ml-2 text-xs text-orange-400 font-normal'>
											(Required for paid comics)
										</span>
									)}
								</h4>

								{mintAsNFT && (
									<div className='mt-4 space-y-3'>
										{/* Number of copies - shown for both free and paid */}
										<div>
											<label className='block text-white/80 text-xs mb-2'>
												Number of NFT Copies
											</label>
											<input
												type='number'
												placeholder='How many copies to mint?'
												value={nftCopies}
												onChange={(e) => setNftCopies(e.target.value)}
												min='1'
												step='1'
												className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500'
											/>
										</div>
										
										{/* Price input - only shown for paid comics */}
										{publishType === "paid" && (
											<div>
												<label className='block text-white/80 text-xs mb-2'>
													Mint Price (USDT per NFT)
												</label>
												<input
													type='number'
													placeholder='e.g., 2.00'
													value={nftPrice}
													onChange={(e) => setNftPrice(e.target.value)}
													min='0.01'
													step='0.01'
													className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500'
												/>
												<p className='text-white/40 text-xs mt-1'>
													Readers pay this price to access your comic as an NFT
												</p>
											</div>
										)}
										
										{/* Info text based on publish type */}
										<div className='bg-white/5 rounded-lg p-3 border border-white/10'>
											<p className='text-white/70 text-xs leading-relaxed'>
												{publishType === "free" 
													? "✨ Free comics with NFTs: Readers can claim your comic as an NFT for free (gas fees only). Each reader can claim once until max supply is reached."
													: "💰 Paid comics with NFTs: Each NFT copy can be purchased at the price you set above. NFT buyers get permanent access and can resell their copies."
												}
											</p>
										</div>
									</div>
								)}
							</div>
						</label>
					</div>

					{/* Info Box based on selections */}
					{(publishType === "paid" || mintAsNFT) && (
						<div className='mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-lg p-4'>
							<div className='flex items-start gap-3'>
								<div className='w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0'>
									<span className='text-white text-sm font-bold'>💡</span>
								</div>
								<div>
									<h4 className='text-orange-300 font-semibold mb-1'>Blockchain Integration</h4>
									<p className='text-orange-200/80 text-sm leading-relaxed'>
										Your comic will be uploaded to IPFS for decentralized storage
										{mintAsNFT && " and minted as an NFT on the blockchain"}
										{publishType === "paid" && ". Readers purchase NFT copies to access your comic"}
										{publishType === "free" && mintAsNFT && ". Readers can claim a free NFT copy (gas fees only)"}
										.
									</p>
								</div>
							</div>
						</div>
					)}

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
							className='flex-1 py-3 px-6 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-orange-500/50'
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