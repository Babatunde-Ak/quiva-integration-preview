"use client";
import Picture from "@/components/picture/Index";
import TitleText from "@/components/text/TitleText";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	comicpadImg,
	footerImg,
	jumbleImg,
	scrabbleImg,
} from "../../../../public/dev_images";
import { StaticImageData } from "next/image";

const ExcitingProducts = () => {
	type DeckKey = "ComicPad" | "Jumble Jester" | "Scrabble Arena";
	const deckKeys: DeckKey[] = ["ComicPad", "Jumble Jester", "Scrabble Arena"];
	const deckData: Record<
		DeckKey,
		{
			title: string;
			description: string;
			image: StaticImageData;
			gradient: string;
		}
	> = {
		ComicPad: {
			title: "ComicPad",
			description:
				"The heart of Quiva. The first Web3 launchpad built for anime, manga & meme artists.",
			image: comicpadImg,
			gradient: "bg-linear-blue-gradient",
		},
		"Jumble Jester": {
			title: "Jumble Jester",
			description:
				"A fun NFT game that lets you shuffle letters and win crypto prizes while competing globally.",
			image: jumbleImg,
			gradient: "bg-linear-blue-gradient",
		},
		"Scrabble Arena": {
			title: "Scrabble Arena",
			description:
				"Engage in Web3-powered word battles with NFTs and earn while you play Scrabble-style!",
			image: scrabbleImg,
			gradient: "bg-linear-blue-gradient",
		},
	};

	const [selected, setSelected] = useState<DeckKey>("ComicPad");

	const current = deckData[selected];

	useEffect(() => {
		const interval = setInterval(() => {
			setSelected((prev) => {
				const currentIndex = deckKeys.indexOf(prev);
				const nextIndex = (currentIndex + 1) % deckKeys.length;
				return deckKeys[nextIndex];
			});
		}, 6000); // Switch every 6 seconds

		return () => clearInterval(interval); // Cleanup
	}, []);

	return (
		<section className='bg-black-500 min-h-screen pb-8 lg:pb-24 section-padding'>
			<div className='space-y-6 lg:space-y-8 w-[80%] sm:max-w-[850px] text-center pt-16 lg:pt-32 mx-auto'>
				<TitleText
					title='Explore Our Exciting Product Offerings'
					className='text-light-100 w-[90%] sm:w-full text-center mx-auto sm:mx-0 tracking-wide lg:tracking-normal'
				/>
				<p className='text-light-200 font-poppins text-base lg:text-lg'>
					Dive into a world where comics meet technology. Our products are
					designed to elevate your comic experience through interactivity and
					creativity.
				</p>
			</div>
			<div className='px-2 lg:px-0 lg:max-w-screen-xl mt-12 grid place-items-center mx-auto'>
				<div className='flex flex-col-reverse lg:flex-row justify-center items-center lg:items-end xl:w-[1100px] mx-auto'>
					{/* Card */}
					<AnimatePresence mode='wait'>
						<motion.div
							key={selected} // very important for animation trigger
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.6, ease: "easeInOut" }}
							className='bg-black-600 w-[95%] lg:w-[90%] lg:h-[570px] shadow-2xl lg:border-2 border-secondary-200 rounded-[30px] flex flex-col-reverse lg:grid grid-cols-10 gap-12 lg:gap-0 lg:space-x-8 place-items-center px-5 lg:px-10 z-20 py-12 lg:py-0'
						>
							{/* Mobile Tab Titles */}
							<div className='lg:hidden text-start space-y-4 w-full'>
								{Object.keys(deckData).map((item: any) => (
									<p
										key={item}
										className={`text-white text-lg font-bold tracking-wide cursor-pointer ${
											selected === item ? "text-secondary-200" : "opacity-60"
										}`}
										onClick={() => setSelected(item)}
									>
										{item}
									</p>
								))}
							</div>

							{/* Left: Image */}
							<div
								className={`col-span-5 ${current.gradient} h-[50%] w-[95%] lg:h-[70%] lg:w-full rounded-md lg:rounded-3xl flex flex-col items-end lg:items-center justify-end lg:justify-center gap-8 lg:gap-0 lg:grid place-items-center`}
							>
								<TitleText
									title={current.title}
									className='text-light-100 w-[90%] lg:hidden sm:w-full text-center sm:text-start mx-auto sm:mx-0 tracking-wide lg:tracking-normal'
								/>
								<Picture
									src={current.image}
									alt={`${current.title} logo`}
									loading='eager'
									className='w-[85%] h-[75%] lg:w-[95%] lg:h-[85%] mx-auto'
								/>
							</div>

							{/* Right: Text */}
							<div className='col-span-5 lg:grid place-items-center'>
								<div className='space-y-3 lg:space-y-5'>
									<TitleText title={current.title} className='!text-white' />
									<p className='text-white/80 font-poppins text-base lg:text-lg leading-8 lg:w-4/5'>
										{current.description}
									</p>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
					{/* Deck Tabs - Desktop Only */}
					{Object.keys(deckData)
						.filter((key) => key !== selected)
						.map((item: any, i) => {
							const isTopDeck = i === 0;
							return (
								<AnimatePresence mode='wait' key={item}>
									<motion.div
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										transition={{ duration: 0.6, ease: "easeInOut" }}
										className={` border-[#161616] border-r-large  w-[10%] h-[560px] rounded-r-[30px] px-10 -ml-5 z-[${
											10 - i
										}] hidden lg:flex items-center justify-center bg-gray-${
											200 + i * 100
										} ${isTopDeck ? "top_deck" : "bottom_deck"}`}
										onClick={() => setSelected(item)}
										style={{ cursor: "pointer" }}
									>
										<div className='transform rotate-90 origin-center'>
											<p className='text-white text-4xl font-bold tracking-wide whitespace-nowrap inner-shadow-text'>
												{item}
											</p>
										</div>
									</motion.div>
								</AnimatePresence>
							);
						})}
				</div>
			</div>
		</section>
	);
};

export default ExcitingProducts;
