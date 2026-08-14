"use client";
import MyComicCard from "@/components/cards/MyComicCard";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getUserComics } from "@/redux/slices/comicSlice";
import { Loader2 } from "lucide-react";

const TABS = ["All", "Recent", "Popular", "Free", "Paid"];

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const MyComicList = () => {
	const [activeTab, setActiveTab] = useState("All");
	const dispatch = useAppDispatch();
	const { userComics, isLoading } = useAppSelector((state: any) => state.comic);

	// Fetch user comics on component mount
	useEffect(() => {
		dispatch(getUserComics());
	}, [dispatch]);

	// Transform API comics to match your UI format
	const transformedComics = useMemo(() => {
		if (!userComics?.data?.comics?.data) return [];

		return userComics.data.comics.data.map((comic: any) => {
			// Determine if paid based on nftId price
			const isPaid = comic.nftId?.price && comic.nftId.price > 0;

			// Get the best available image
			const imageSrc = comic.bannerImage ||
				comic.coverImage ||
				'';

			return {
				id: comic._id,
				title: comic.title,
				subtitle: comic.summary || comic.description || "",
				imageSrc,
				category: isPaid ? "Paid" : "Free",
				createdAt: comic.createdAt,
				views: comic.views || 0,
				status: comic.status,
				isPublished: comic.isPublished,
			};
		});
	}, [userComics]);

	// Sort by recent (latest first)
	const sortedByRecent = useMemo(() => {
		return [...transformedComics].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		);
	}, [transformedComics]);

	// Sort by popular (most views)
	const sortedByPopular = useMemo(() => {
		return [...transformedComics].sort((a, b) => b.views - a.views);
	}, [transformedComics]);

	// Filter comics based on active tab
	const filteredComics = useMemo(() => {
		switch (activeTab) {
			case "All":
				return transformedComics;
			case "Recent":
				return sortedByRecent;
			case "Popular":
				return sortedByPopular;
			case "Free":
				return transformedComics.filter((c) => c.category === "Free");
			case "Paid":
				return transformedComics.filter((c) => c.category === "Paid");
			default:
				return transformedComics;
		}
	}, [activeTab, transformedComics, sortedByRecent, sortedByPopular]);

	// Add these additional variants for comic-style animations
	const comicCardVariants = {
		hidden: {
			opacity: 0,
			x: -50,
			rotate: -5,
			scale: 0.8,
		},
		visible: {
			opacity: 1,
			x: 0,
			rotate: 0,
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 120,
				damping: 15,
			},
		},
		hover: {
			y: -10,
			scale: 1.05,
			rotateY: 10,
			boxShadow:
				"0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 5px 10px -5px rgba(0, 0, 0, 0.2)",
			transition: {
				type: "spring",
				stiffness: 500,
				damping: 15,
			},
		},
	};

	const comicTabVariants = {
		initial: {
			scale: 0.8,
			opacity: 0.6,
			textShadow: "0 0 0px currentColor",
		},
		animate: {
			scale: 1,
			opacity: 1,
			textShadow: "0 0 0px currentColor",
		},
		hover: {
			scale: 1.1,
			textShadow: "2px 2px 0px rgba(0,0,0,0.2)",
			y: -2,
		},
		tap: {
			scale: 0.9,
			textShadow: "0 0 0px currentColor",
		},
	};

	const loadingVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: { 
			opacity: 1, 
			scale: 1,
			transition: {
				duration: 0.3
			}
		},
	};

	return (
		<div className='mt-6'>
			{/* Comic-style Tabs */}
			<motion.div
				className='flex pl-2 sm:pl-0 gap-2 lg:gap-5 mb-6 overflow-x-auto pb-3 scrollbar-hide'
				initial='hidden'
				animate='visible'
				variants={containerVariants}
				style={{
					scrollbarWidth: "none", // Firefox
					msOverflowStyle: "none", // IE/Edge
				}}
			>
				{/* Hide scrollbar for Webkit browsers */}
				<style jsx>{`
					.scrollbar-hide::-webkit-scrollbar {
						display: none;
					}
				`}</style>

				{TABS.map((tab) => (
					<motion.button
						key={tab}
						onClick={() => setActiveTab(tab)}
						disabled={isLoading}
						className={`flex-shrink-0 px-4 py-0.5 rounded-full border-2 border-yellow-700 text-sm text-black-100 font-bold relative overflow-hidden ${
							activeTab === tab
								? "bg-yellow-700 !text-white"
								: "text-yellow-700 bg-white"
						} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
						variants={comicTabVariants}
						initial='initial'
						animate='animate'
						whileHover={!isLoading ? 'hover' : undefined}
						whileTap={!isLoading ? 'tap' : undefined}
						style={{
							fontFamily: "'Bangers', cursive, sans-serif",
						}}
					>
						{tab}
						{activeTab === tab && (
							<motion.div
								className='absolute inset-0 bg-yellow-500 text-white -z-10'
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{ duration: 0.3 }}
								style={{ originX: 0 }}
							/>
						)}
					</motion.button>
				))}
			</motion.div>

			{/* Loading State */}
			{isLoading ? (
				<motion.div 
					className='flex justify-center items-center py-20'
					variants={loadingVariants}
					initial='hidden'
					animate='visible'
				>
					<div className='text-center'>
						<Loader2 className='w-12 h-12 text-yellow-700 animate-spin mx-auto mb-4' />
						<p className='text-white/60 text-sm font-medium'>Loading your comics...</p>
					</div>
				</motion.div>
			) : (
				<>
					{/* Empty State */}
					{filteredComics.length === 0 ? (
						<motion.div 
							className='text-center py-20'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className='max-w-md mx-auto'>
								<div className='text-6xl mb-4'>📚</div>
								<h3 className='text-white text-xl font-bold mb-2'>No Comics Found</h3>
								<p className='text-white/60 text-sm'>
									{activeTab === "All" 
										? "You haven't created any comics yet. Start creating your first comic!"
										: `No comics found in the "${activeTab}" category.`
									}
								</p>
							</div>
						</motion.div>
					) : (
						/* Comic-style Comic List */
						<AnimatePresence mode='wait'>
							<motion.div
								key={activeTab}
								className='grid grid-cols-2 lg:flex gap-4 flex-wrap px-3 sm:px-0'
								initial='hidden'
								animate='visible'
								exit='hidden'
								variants={containerVariants}
							>
								{filteredComics.map((comic, index) => (
									<motion.div
										key={comic.id}
										// @ts-ignore
										variants={comicCardVariants}
										whileHover='hover'
										whileTap='tap'
										custom={index}
										className='relative'
									>
										<MyComicCard
											id={comic.id}
											imageSrc={comic.imageSrc}
											subtitle={comic.subtitle}
											title={comic.title}
										/>
									</motion.div>
								))}
							</motion.div>
						</AnimatePresence>
					)}
				</>
			)}
		</div>
	);
};

export default MyComicList;