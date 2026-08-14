"use client";
import { MainButton } from "@/components/button";
import Picture from "@/components/picture/Index";
import TitleText from "@/components/text/TitleText";
import React, { useState, useRef, useEffect } from "react";
import {
	comicpadImg,
	contractsImg,
	launchImg,
	lockImg,
} from "../../../../public/dev_images";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";

const WhyBlockchain = () => {
	const [activeSlide, setActiveSlide] = useState(0);
	const swiperRef = useRef<SwiperType | null>(null);

	const SLIDES = [
		{
			id: 0,
			title: "Own Your Story",
			description:
				"Every comic you read or mint is yours. No middlemen, no loss. It's forever yours.",
			image: lockImg,
			bgColor: "bg-black-600",
			borderColor: "border-secondary-200",
			buttonText: "Own your story",
		},
		{
			id: 1,
			title: "No Secrets. Just Smart Contracts.",
			description:
				"All rights, rewards, and royalties are coded and public. What you see is what you get.",
			image: contractsImg,
			bgColor: "bg-black-600",
			borderColor: "border-secondary-200",
			buttonText: "No Secret",
		},
		{
			id: 2,
			title: "Launch from Anywhere.",
			description:
				"Whether you're in Lagos or Tokyo, Quiva lets you create, publish, and earn globally.",
			image: launchImg,
			bgColor: "bg-black-600",
			borderColor: "border-secondary-200",
			buttonText: "Launch",
		},
	];

	// Animation settings
	const SWIPER_SETTINGS = {
		spaceBetween: 30,
		slidesPerView: 1 as const,
		loop: true,
		autoplay: {
			delay: 5000,
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		},
		pagination: {
			clickable: true,
			dynamicBullets: true,
		},
		effect: "fade" as const,
		fadeEffect: {
			crossFade: true,
		},
		speed: 1000,
		modules: [Pagination, Autoplay, EffectFade],
		className: "w-full",
		onSlideChange: (swiper: SwiperType) => {
			const realIndex = swiper.realIndex;
			setActiveSlide(realIndex);
		},
		onSwiper: (swiper: SwiperType) => {
			swiperRef.current = swiper;
		},
	};

	const handleButtonClick = (slideIndex: number) => {
		if (
			swiperRef.current &&
			typeof swiperRef.current.slideToLoop === "function"
		) {
			swiperRef.current.slideToLoop(slideIndex);
			setActiveSlide(slideIndex);
		}
	};

	// Restart autoplay when manually changing slides
	useEffect(() => {
		if (swiperRef.current && swiperRef.current.autoplay) {
			// Stop current autoplay
			swiperRef.current.autoplay.stop();
			// Start autoplay again after a brief delay
			setTimeout(() => {
				if (swiperRef.current && swiperRef.current.autoplay) {
					swiperRef.current.autoplay.start();
				}
			}, 100);
		}
	}, [activeSlide]);

	return (
		<section className='bg-black-900 min-h-screen pt-12 pb-16 lg:py-24 section-padding'>
			<div className='px-4 lg:px-0 xl:max-w-screen-xl mx-auto'>
				<div className='space-y-7 lg:space-y-20 text-start'>
					<div className='space-y-6 lg:space-y-12 lg:w-[40%]'>
						<TitleText
							title='Why Blockchain Matters on Quiva'
							className='text-light-100'
						/>
						<div className='flex flex-wrap items-center gap-4'>
							{SLIDES.map((slide, index) => (
								<MainButton
									key={slide.id}
									onClick={() => handleButtonClick(index)}
									className={`w-fit !px-3 lg:!px-8 transition-all duration-300 transform hover:scale-105 ${
										activeSlide === index
											? "bg-secondary-200 border border-secondary-200 text-black shadow-lg scale-105"
											: "bg-transparent text-secondary-200 border border-secondary-200 hover:bg-secondary-200/10"
									}`}
								>
									{slide.buttonText}
								</MainButton>
							))}
						</div>
					</div>

					<div className='swiper-container'>
						<Swiper {...SWIPER_SETTINGS}>
							{SLIDES.map((slide, index) => (
								<SwiperSlide key={slide.id}>
									<div
										className={`${
											slide.bgColor
										} w-full lg:h-[570px] shadow-2xl border-2 ${
											slide.borderColor
										} rounded-[30px] flex flex-col-reverse lg:grid grid-cols-10 lg:space-x-8 gap-5 lg:gap-0 place-items-center lg:px-10 z-20 px-2 py-10 lg:py-0 transition-all duration-700 transform ${
											activeSlide === index ? "animate-fadeIn" : ""
										}`}
									>
										<div className='col-span-4 h-[80%] w-full relative overflow-hidden rounded-3xl'>
											<Picture
												src={slide.image}
												alt={slide.title}
												loading='eager'
												className={`w-full h-[100%] object-cover transition-all duration-1000 ${
													activeSlide === index
														? "scale-100 opacity-100"
														: "scale-110 opacity-90"
												} hover:scale-105`}
											/>
											{/* Overlay effect for smooth transitions */}
											<div
												className={`absolute inset-0 bg-gradient-to-r from-transparent to-black/10 transition-opacity duration-700 ${
													activeSlide === index ? "opacity-0" : "opacity-30"
												}`}
											/>
										</div>
										<div className='col-span-6 grid place-items-center'>
											<div
												className={`space-y-5 transform transition-all duration-700 ${
													activeSlide === index
														? "translate-y-0 opacity-100"
														: "translate-y-4 opacity-70"
												}`}
											>
												<TitleText
													title={slide.title}
													className={`!text-white transition-all duration-500 ${
														activeSlide === index
															? "animate-fadeIn transform translate-y-0"
															: "transform translate-y-2"
													}`}
												/>
												<p
													className={`text-white/70 font-poppins sm:text-xl lg:text-3xl leading-6 lg:leading-10 w-4/5 transition-all duration-700 delay-200 ${
														activeSlide === index
															? "animate-fadeIn transform translate-y-0 opacity-100"
															: "transform translate-y-3 opacity-70"
													}`}
												>
													{slide.description}
												</p>
											</div>
										</div>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>

					{/* Progress indicator */}
					<div className='flex justify-center space-x-2 mt-8'>
						{SLIDES.map((_, index) => (
							<button
								key={index}
								onClick={() => handleButtonClick(index)}
								className={`w-3 h-3 rounded-full transition-all duration-300 ${
									activeSlide === index
										? "bg-secondary-200 scale-125"
										: "bg-white/30 hover:bg-white/50"
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhyBlockchain;
