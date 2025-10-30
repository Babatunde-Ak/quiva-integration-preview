"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import Picture from "@/components/picture/Index";
import { QuivaLogo } from "@/components/utils/function";

interface ComicNotificationProps {
	onclose: () => void;
	comicData: any;
	monetizationData: any;
	tokenId: string | number | bigint;
	mintHash: string;
}

export function ComicNotification({ onclose, comicData, monetizationData, tokenId, mintHash }: ComicNotificationProps) {
	return (
		<div className=''>
			{/* Header with Quiva logo */}
			<QuivaLogo
				showText
				className={`invert lg:invert transition-[.4] !text-xl mx-auto`}
				logoClassName='!w-8 lg:!w-7 xl:!w-10'
			/>

			{/* Comic panels grid */}
			<div className='mt-2'>
				{/* Top row - 4 smaller panels */}
				<div className='grid grid-cols-4 gap-2 mb-2'>
					<div className='aspect-square rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1590833059589-21b5ab6f6637?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzN8fENvbWljJTIwcGFuZWx8ZW58MHx8MHx8fDA%3D'
							alt='Comic panel 1'
							className='w-full h-full object-cover'
						/>
					</div>
					<div className='aspect-square rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1633158106494-27c34f0b5768?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTl8fENvbWljJTIwcGFuZWwlMjBqb2tlcnxlbnwwfHwwfHx8MA%3D%3D'
							alt='Comic panel 2'
							className='w-full h-full object-cover'
						/>
					</div>
					<div className='aspect-square rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1663034297472-93c8127e9b9d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGRhcmslMjBoYWlyZWQlMjBhbmltZSUyMGNoYXJhY3Rlci5wbmd8ZW58MHx8MHx8fDA%3D'
							alt='Comic panel 3'
							className='w-full h-full object-cover'
						/>
					</div>
					<div className='aspect-square rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1705932461994-6fb2b07f27dd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFuaW1lJTIwY2hhcmFjdGVyJTIwd2l0aCUyMHllbGxvdyUyMGFjY2VudHN8ZW58MHx8MHx8fDA%3D'
							alt='Comic panel 4'
							className='w-full h-full object-cover'
						/>
					</div>
				</div>

				{/* Bottom row - 2 larger panels */}
				<div className='grid grid-cols-2 gap-2'>
					<div className='aspect-[4/3] rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1727428033763-ee801b92d570?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fGFuaW1lJTIwY2hhcmFjdGVyJTIwd2l0aCUyMHJlZCUyMGNhcCUyMGluJTIwdXJiYW4lMjBzZXR0aW5nfGVufDB8fDB8fHww'
							alt='Comic panel 5'
							className='w-full h-full object-cover'
						/>
					</div>
					<div className='aspect-[4/3] rounded-lg overflow-hidden'>
						<Picture
							src='https://images.unsplash.com/photo-1702138129392-364adea0ad00?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fGNvbWl4JTIwc3VwZXJtYW58ZW58MHx8MHx8fDA%3D'
							alt='Comic panel 6'
							className='w-full h-full object-cover'
						/>
					</div>
				</div>
			</div>

			{/* Status text */}
			<p className='text-white text-2xl font-medium text-center mt-2 mb-4 tracking-wider'>
				Your comic <span className='text-orange-400'>&quot;{comicData.title || "Untitled"}&quot;</span>{" "}
				is LIVE!
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
									className='flex items-center justify-center gap-2 text-xs text-primary-400 hover:text-secondary-300 mt-4 pt-4 border-t border-orange-500/20 transition-colors'
								>
									<span>View Transaction on HashScan</span>
									<svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
									</svg>
								</a>
							</div>

			{/* Action buttons` */}
			<div className='space-y-3'>
				<Link href='/comic-pad/my-comics'>
					<button className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'>
						View comic
					</button>
				</Link>

				<button className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition'>
					<Share2 className='text-xl' />
					Share comic
				</button>
			</div>
		</div>
	);
}
