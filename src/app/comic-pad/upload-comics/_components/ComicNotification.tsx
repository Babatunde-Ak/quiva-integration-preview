// components/ComicNotification.tsx (Updated with Hashinal support)
"use client";

import Link from "next/link";
import { Share2, Hash, CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import Picture from "@/components/picture/Index";
import { QuivaLogo } from "@/components/utils/function";
import { useState } from "react";
import type { InscriptionResult } from "@/lib/kiloscribe-types";

interface ComicNotificationProps {
	onclose: () => void;
	comicData: any;
	monetizationData: any;
	tokenId: string | number | bigint;
	mintHash: string;
	hashinalResult?: InscriptionResult | null; // New prop for Hashinal results
}

export function ComicNotification({ 
	onclose, 
	comicData, 
	monetizationData, 
	tokenId, 
	mintHash,
	hashinalResult 
}: ComicNotificationProps) {
	const [copiedHash, setCopiedHash] = useState(false);
	const [copiedInscriptionId, setCopiedInscriptionId] = useState(false);

	const copyToClipboard = async (text: string, type: 'hash' | 'inscriptionId') => {
		try {
			await navigator.clipboard.writeText(text);
			
			if (type === 'hash') {
				setCopiedHash(true);
				setTimeout(() => setCopiedHash(false), 2000);
			} else if (type === 'inscriptionId') {
				setCopiedInscriptionId(true);
				setTimeout(() => setCopiedInscriptionId(false), 2000);
			}
		} catch (err) {
			console.error('Failed to copy to clipboard:', err);
		}
	};

	const isHashinalEnabled = monetizationData?.enableHashinal;
	const hasHashinalResult = hashinalResult && hashinalResult.status === 'completed';

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
				Your comic <span className='text-primary-400'>&quot;{comicData.title || "Untitled"}&quot;</span>{" "}
				is LIVE!
				{hasHashinalResult && (
					<><br />
					<span className='text-purple-400 text-lg flex items-center justify-center gap-2 mt-1'>
						<Hash size={20} />
						& permanently inscribed!
					</span></>
				)}
			</p>

			{/* NFT Details Card */}
			<div className=''>
				<div className='space-y-3'>
					{/* Token ID Display */}
					<div className='bg-black/30 rounded-lg p-3'>
						<div className='flex justify-between items-center'>
							<span className='text-xs text-white/60'>Token ID:</span>
							<span className='text-lg font-mono font-bold text-primary-400'>
								#{tokenId.toString()}
							</span>
						</div>
					</div>

					{/* Transaction Hash Display */}
					<div className='bg-black/30 rounded-lg p-3'>
						<div>
							<div className='flex justify-between items-center mb-2'>
								<span className='text-xs text-white/60 block'>Transaction Hash:</span>
								<button
									onClick={() => copyToClipboard(mintHash, 'hash')}
									className='p-1 hover:bg-white/10 rounded transition text-white/60 hover:text-white'
									title='Copy Transaction Hash'
								>
									{copiedHash ? (
										<CheckCircle size={14} className='text-green-400' />
									) : (
										<Copy size={14} />
									)}
								</button>
							</div>
							<span className='text-xs font-mono text-white/90 break-all block'>
								{mintHash}
							</span>
						</div>
					</div>

					{/* Hashinal Inscription Details (if available) */}
					{isHashinalEnabled && (
						<div className={`rounded-lg p-3 ${
							hasHashinalResult 
								? 'bg-purple-500/10 border border-purple-500/30' 
								: hashinalResult?.status === 'failed'
								? 'bg-red-500/10 border border-red-500/30'
								: 'bg-yellow-500/10 border border-yellow-500/30'
						}`}>
							{hasHashinalResult ? (
								<>
									<div className='flex items-center gap-2 mb-2'>
										<Hash size={16} className='text-purple-400' />
										<span className='text-xs text-purple-400 font-semibold'>HASHINAL INSCRIPTION</span>
									</div>
									
									{hashinalResult.inscriptionId && (
										<div className='mb-2'>
											<div className='flex justify-between items-center mb-1'>
												<span className='text-xs text-white/60'>Inscription ID:</span>
												<button
													onClick={() => copyToClipboard(hashinalResult.inscriptionId!, 'inscriptionId')}
													className='p-1 hover:bg-white/10 rounded transition text-white/60 hover:text-white'
													title='Copy Inscription ID'
												>
													{copiedInscriptionId ? (
														<CheckCircle size={14} className='text-green-400' />
													) : (
														<Copy size={14} />
													)}
												</button>
											</div>
											<span className='text-xs font-mono text-purple-400 break-all block'>
												{hashinalResult.inscriptionId}
											</span>
										</div>
									)}
									
									<p className='text-xs text-purple-300 bg-purple-500/10 p-2 rounded border border-purple-500/20'>
										🔷 Your comic is now permanently stored on Hedera as a Hashinal, ensuring true ownership and immutable preservation.
									</p>
								</>
							) : hashinalResult?.status === 'failed' ? (
								<>
									<div className='flex items-center gap-2 mb-2'>
										<AlertCircle size={16} className='text-red-400' />
										<span className='text-xs text-red-400 font-semibold'>HASHINAL INSCRIPTION FAILED</span>
									</div>
									<p className='text-xs text-red-300'>
										{hashinalResult.error || 'Inscription failed, but your NFT was minted successfully.'}
									</p>
								</>
							) : (
								<>
									<div className='flex items-center gap-2 mb-2'>
										<Hash size={16} className='text-yellow-400' />
										<span className='text-xs text-yellow-400 font-semibold'>HASHINAL STATUS</span>
									</div>
									<p className='text-xs text-yellow-300'>
										Hashinal inscription was not completed. Your comic and NFT are published successfully.
									</p>
								</>
							)}
						</div>
					)}
					
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

				{/* Explorer Links */}
				<div className='mt-4 pt-4 border-t border-primary-500/20 space-y-2'>
					{/* HashScan Explorer Link */}
					<a
						href={`https://hashscan.io/testnet/transaction/${mintHash}`}
						target='_blank'
						rel='noopener noreferrer'
						className='flex items-center justify-center gap-2 text-xs text-primary-400 hover:text-secondary-300 transition-colors'
					>
						<span>View Transaction on HashScan</span>
						<ExternalLink className='w-3 h-3' />
					</a>

					{/* Hashinal Explorer Link */}
					{hasHashinalResult && hashinalResult.hashinalsUrl && (
						<a
							href={hashinalResult.hashinalsUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center justify-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors'
						>
							<Hash className='w-3 h-3' />
							<span>View Hashinal on Network</span>
							<ExternalLink className='w-3 h-3' />
						</a>
					)}
				</div>
			</div>

			{/* Action buttons */}
			<div className='space-y-3 mt-6'>
				<Link href='/comic-pad/my-comics'>
					<button className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'>
						View comic
					</button>
				</Link>

				<button className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition'>
					<Share2 className='text-xl' />
					Share comic
					{hasHashinalResult && <Hash size={16} className='text-purple-400' />}
				</button>
			</div>
		</div>
	);
}
