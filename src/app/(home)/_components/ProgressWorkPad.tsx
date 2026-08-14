"use client";
import React, { useEffect, useRef, useState } from "react";
import {
	progress_1,
	progress_2,
	progress_3,
	progress_4,
	progress_5,
	mobile_progress_1,
	mobile_progress_2,
	mobile_progress_3,
	mobile_progress_4,
	mobile_progress_5,
	tag_img,
} from "../../../../public/dev_images";
import { motion, AnimatePresence } from "framer-motion";
import Picture from "@/components/picture/Index";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import Image from "next/image";
import MobileProgressCarousel from "./MobileProgressCarousel";

const slideSteps = [
	{
		title: "Choose your Comic Project",
		image: progress_1,
		mobileImage: mobile_progress_1,
		step: 0,
	},
	{
		title: "Create or Upload your Comic NFTs",
		image: progress_2,
		mobileImage: mobile_progress_2,
		step: 1,
	},
	{
		title: "Set Minting & Rewards Rules",
		image: progress_3,
		mobileImage: mobile_progress_3,
		step: 2,
	},
	{
		title: "Go Live – Let Fans Mint & Read",
		image: progress_4,
		mobileImage: mobile_progress_4,
		step: 3,
	},
	{
		title: "Earn & Build Your Community",
		image: progress_5,
		mobileImage: mobile_progress_5,
		step: 4,
	},
];

const ProgressWorkPad = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isScrolling, setIsScrolling] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);
	const scrollTimeout = useRef<NodeJS.Timeout>();

	// Check if mobile on mount and resize
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Handle wheel events for horizontal scrolling (desktop only)
	useEffect(() => {
		if (isMobile) return;
		
		const container = containerRef.current;
		if (!container) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();

			if (isScrolling) return;
			setIsScrolling(true);

			clearTimeout(scrollTimeout.current);
			scrollTimeout.current = setTimeout(() => {
				setIsScrolling(false);
			}, 1000);

			if (e.deltaY > 0) {
				if (currentStep < slideSteps.length - 1) {
					setDirection(1);
					setCurrentStep((prev) => prev + 1);
				}
			} else {
				if (currentStep > 0) {
					setDirection(-1);
					setCurrentStep((prev) => prev - 1);
				}
			}
		};

		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => container.removeEventListener("wheel", handleWheel);
	}, [currentStep, isScrolling, isMobile]);

	const goPrev = () => {
		if (currentStep > 0) {
			setDirection(-1);
			setCurrentStep((prev) => prev - 1);
		}
	};

	const goNext = () => {
		if (currentStep < slideSteps.length - 1) {
			setDirection(1);
			setCurrentStep((prev) => prev + 1);
		}
	};

	// Auto-slide for desktop only
	useEffect(() => {
		if (isMobile) return;

		const timer = setInterval(() => {
			if (currentStep < slideSteps.length - 1) {
				goNext();
			} else {
				setCurrentStep(0);
			}
		}, 5000);
		return () => clearInterval(timer);
	}, [currentStep, isMobile]);

	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? "100%" : "-100%",
			opacity: 0,
		}),
		center: {
			x: 0,
			opacity: 1,
		},
		exit: (direction: number) => ({
			x: direction < 0 ? "100%" : "-100%",
			opacity: 0,
		}),
	};

	// Render mobile carousel
	if (isMobile) {
		return (
			<div className='mt-14 relative'>
				<MobileProgressCarousel 
					steps={slideSteps}
					autoSlideInterval={5000}
				/>
			</div>
		);
	}

	return (
		<div className='mt-14 relative'>
			{/* Step Tracker Bar */}
			<div className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-5 pt-10 pb-24 relative'>
				{/* Horizontal progress bar for desktop */}
				<div className='hidden md:block absolute top-0 left-0 w-full h-0.5 bg-primary-100/50'></div>
				<div
					className='hidden md:block absolute top-0 left-0 h-0.5 bg-primary-100 transition-all duration-500 ease-in-out'
					style={{
						width: `${((currentStep + 1) / slideSteps.length) * 100}%`,
					}}
				></div>

				{/* Step tag image (adjusted for desktop) */}
				<Image
					src={tag_img}
					alt='map pattern'
					loading='eager'
					className='w-[60px] md:w-[85px] absolute hidden lg:block transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 -top-6 md:-top-7'
					style={{
						left: `calc(${currentStep * 20}% + 10%)`,
					}}
				/>

				{/* Step items */}
				{slideSteps.map((step, index) => {
					const isActive = index === currentStep;
					return (
						<div
							key={index}
							onClick={() => setCurrentStep(step.step || index)}
							className='cursor-pointer flex flex-col mx-auto lg:mx-0 justify-center md:justify-start items-center lg:items-start md:w-1/5 space-y-1 md:space-y-3 md:pl-0 relative'
						>
							<div
								className={`text-sm ${
									isActive ? "text-white/80" : "text-white/25"
								}`}
							>
								Step {index + 1}
							</div>
							<div
								className={`text-sm sm:text-base md:text-lg font-medium leading-6 md:leading-7 w-[90%] text-center lg:text-start ${
									isActive ? "text-white" : "text-white/25"
								}`}
							>
								{step.title}
							</div>
						</div>
					);
				})}
			</div>

			{/* Slide Section */}
			<div
				ref={containerRef}
				className='relative w-full max-w-4xl mx-auto overflow-hidden'
			>
				{/* Slider Container */}
				<div ref={sliderRef} className='relative h-[500px] lg:h-[600px]'>
					<AnimatePresence custom={direction} initial={false}>
						<motion.div
							key={currentStep}
							custom={direction}
							variants={variants}
							initial='enter'
							animate='center'
							exit='exit'
							transition={{
								x: { type: "spring", stiffness: 300, damping: 30 },
								opacity: { duration: 0.2 },
							}}
							className='absolute inset-0 flex flex-col items-center justify-center'
						>
							<div className='w-full h-full flex items-center justify-center'>
								<Picture
									src={slideSteps[currentStep]?.image}
									alt={slideSteps[currentStep]?.title}
									className='w-full h-full object-contain max-h-[80%]'
								/>
							</div>
							<h3 className='text-xl md:text-2xl font-bold mt-6 text-center px-4'>
								{slideSteps[currentStep]?.title}
							</h3>
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Navigation Arrows */}
				<button
					onClick={goPrev}
					disabled={currentStep === 0}
					className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20 disabled:opacity-30 transition-all duration-200 z-10'
				>
					<HiOutlineArrowLeft className='w-6 h-6' />
				</button>
				<button
					onClick={goNext}
					disabled={currentStep === slideSteps.length - 1}
					className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/20 disabled:opacity-30 transition-all duration-200 z-10'
				>
					<HiOutlineArrowRight className='w-6 h-6' />
				</button>

				{/* Progress Dots */}
				<div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
					{slideSteps.map((_, index) => (
						<button
							key={index}
							onClick={() => {
								setDirection(index > currentStep ? 1 : -1);
								setCurrentStep(index);
							}}
							className={`w-3 h-3 rounded-full transition-all duration-300 ${
								index === currentStep
									? "bg-white w-6"
									: "bg-white/30 hover:bg-white/50"
							}`}
							aria-label={`Go to step ${index + 1}`}
						/>
					))}
				</div>
			</div>
			<Picture
				src={tag_img}
				alt='map pattern'
				loading='eager'
				className='w-[85px] absolute bottom-0 right-0 hidden lg:block'
			/>
		</div>
	);
};

export default ProgressWorkPad;