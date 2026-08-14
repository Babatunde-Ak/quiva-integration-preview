"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
	motion,
	useScroll,
	useTransform,
	AnimatePresence,
	Variants,
} from "framer-motion";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import Image, { StaticImageData } from "next/image";
import Picture from "@/components/picture/Index";
import {
	progress_1,
	progress_2,
	progress_3,
	progress_4,
	progress_5,
	tag_img,
} from "../../../../public/dev_images";

interface SlideStep {
	title: string;
	image: string | StaticImageData;
}

const slideSteps: SlideStep[] = [
	{
		title: "Choose your Comic Project",
		image: progress_1,
	},
	{
		title: "Create or Upload your Comic NFTs",
		image: progress_2,
	},
	{
		title: "Set Minting & Rewards Rules",
		image: progress_3,
	},
	{
		title: "Go Live – Let Fans Mint & Read",
		image: progress_4,
	},
	{
		title: "Track, Earn, & Build Your Community",
		image: progress_5,
	},
];

const ProgressWorkPad2 = () => {
	const [currentStep, setCurrentStep] = useState<number>(0);
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [isInView, setIsInView] = useState<boolean>(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const sectionRef = useRef<HTMLDivElement>(null);

	// Handle mobile detection
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Scroll progress tracking for the entire section
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Track when section is in view
	const { scrollYProgress: viewProgress } = useScroll({
		target: sectionRef,
		offset: ["start center", "end center"],
	});

	// Transform scroll progress to step index
	const stepProgress = useTransform(
		scrollYProgress,
		[0.1, 0.9], // Adjusted to prevent early/late triggering
		[0, slideSteps.length - 1],
	);

	// Update current step based on scroll
	useEffect(() => {
		const unsubscribe = stepProgress.onChange((latest) => {
			const newStep = Math.round(
				Math.max(0, Math.min(latest, slideSteps.length - 1)),
			);
			if (newStep !== currentStep) {
				setCurrentStep(newStep);
			}
		});
		return () => unsubscribe();
	}, [stepProgress, currentStep]);

	// Track if section is in view
	useEffect(() => {
		const unsubscribe = viewProgress.onChange((latest) => {
			setIsInView(latest > 0.1 && latest < 0.9);
		});
		return () => unsubscribe();
	}, [viewProgress]);

	const goPrev = useCallback(() => {
		setCurrentStep((prev) => Math.max(0, prev - 1));
	}, []);

	const goNext = useCallback(() => {
		setCurrentStep((prev) => Math.min(slideSteps.length - 1, prev + 1));
	}, []);

	// Animation variants
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const stepVariants: Variants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	const imageVariants: Variants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.7,
				ease: [0.25, 0.46, 0.45, 0.94],
			},
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			transition: {
				duration: 0.3,
			},
		},
	};

	return (
		<div ref={sectionRef} className='relative'>
			{/* Scroll trigger container */}
			<div ref={containerRef} className='h-[400vh] relative' />

			{/* Content container */}
			<motion.div
				ref={contentRef}
				className={`${
					isInView ? "fixed inset-0" : "relative"
				} flex items-center justify-center z-10 pointer-events-none`}
				variants={containerVariants}
				initial='hidden'
				animate='visible'
			>
				<div className='mt-14 relative w-full max-w-7xl mx-auto px-4 pointer-events-auto'>
					{/* Progress Tracker */}
					<motion.div
						className='flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-5 pt-10 pb-24 relative'
						variants={containerVariants}
					>
						{/* Horizontal progress bar for desktop */}
						<div className='hidden md:block absolute top-0 left-0 w-full h-0.5 bg-primary-100/50'></div>
						<motion.div
							className='hidden md:block absolute top-0 left-0 h-0.5 bg-primary-100'
							initial={{ width: "0%" }}
							animate={{
								width: `${((currentStep + 1) / slideSteps.length) * 100}%`,
							}}
							transition={{
								duration: 0.8,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
						/>

						{/* Vertical progress line for mobile */}
						<div className='md:hidden absolute left-1/2 top-0 h-full w-0.5 bg-primary-100/10 -translate-x-1/2'></div>
						<motion.div
							className='md:hidden absolute left-1/2 top-0 w-0.5 bg-primary-100 -translate-x-1/2'
							initial={{ height: "0%" }}
							animate={{
								height: `${((currentStep + 1) / slideSteps.length) * 100}%`,
							}}
							transition={{
								duration: 0.8,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
						/>

						{/* Step indicator */}
						<motion.div
							className='absolute -top-6 md:-top-7'
							animate={{
								left: isMobile ? "50%" : `calc(${currentStep * 20}% + 10%)`,
								top: isMobile ? `calc(${currentStep * 20}% + 1%)` : "-1.75rem",
								x: isMobile ? "-50%" : "0%",
							}}
							transition={{
								duration: 0.8,
								ease: [0.25, 0.46, 0.45, 0.94],
							}}
						>
							<motion.div
								whileHover={{ scale: 1.1, rotate: 5 }}
								transition={{ duration: 0.2 }}
							>
								<Image
									src={tag_img}
									alt='Step indicator'
									width={85}
									height={85}
									className='w-[60px] md:w-[85px]'
									priority
								/>
							</motion.div>
						</motion.div>

						{/* Step items */}
						{slideSteps.map((step, index) => {
							const isActive = index === currentStep;
							return (
								<motion.div
									key={`step-${index}`}
									className='flex flex-col mx-auto lg:mx-0 justify-center md:justify-start items-center lg:items-start md:w-1/5 space-y-1 md:space-y-3 md:pl-0 relative'
									variants={stepVariants}
									whileHover={{ scale: 1.02 }}
									transition={{ duration: 0.2 }}
								>
									<motion.div
										className={`text-sm transition-colors duration-300 ${
											isActive ? "text-white/80" : "text-white/25"
										}`}
										animate={{
											opacity: isActive ? 1 : 0.4,
											scale: isActive ? 1.05 : 1,
										}}
										transition={{ duration: 0.3 }}
									>
										Step {index + 1}
									</motion.div>
									<motion.div
										className={`text-sm sm:text-base md:text-lg font-medium leading-6 md:leading-7 w-[90%] text-center lg:text-start transition-colors duration-300 ${
											isActive ? "text-white" : "text-white/25"
										}`}
										animate={{
											opacity: isActive ? 1 : 0.4,
											y: isActive ? 0 : 5,
										}}
										transition={{ duration: 0.3 }}
									>
										{step.title}
									</motion.div>
								</motion.div>
							);
						})}
					</motion.div>

					{/* Main Content */}
					<div className='relative w-[70%] hidden lg:flex flex-col justify-center mx-auto items-center py-8 text-white'>
						<div className='relative w-full h-auto overflow-hidden rounded-lg'>
							<AnimatePresence mode='wait'>
								<motion.div
									key={`slide-${currentStep}`}
									variants={imageVariants}
									initial='hidden'
									animate='visible'
									exit='exit'
									className='w-full'
								>
									<Picture
										src={slideSteps[currentStep].image}
										alt={slideSteps[currentStep].title}
										className='w-full h-auto object-cover'
										priority={currentStep <= 1} // Only prioritize first couple images
									/>
								</motion.div>
							</AnimatePresence>
						</div>

						<motion.div
							className='flex gap-4 items-center mt-14 justify-center'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							<motion.button
								onClick={goPrev}
								disabled={currentStep === 0}
								className='w-12 h-8 flex items-center justify-center rounded-full border-2 border-white/50 hover:border-white disabled:opacity-30 transition-all duration-200'
								whileHover={{
									scale: 1.1,
									borderColor: "rgba(255,255,255,0.8)",
								}}
								whileTap={{ scale: 0.95 }}
								transition={{ duration: 0.2 }}
								aria-label='Previous step'
							>
								<HiOutlineArrowLeft />
							</motion.button>
							<motion.button
								onClick={goNext}
								disabled={currentStep === slideSteps.length - 1}
								className='w-12 h-8 flex items-center justify-center rounded-full border-2 border-white/50 hover:border-white disabled:opacity-30 transition-all duration-200'
								whileHover={{
									scale: 1.1,
									borderColor: "rgba(255,255,255,0.8)",
								}}
								whileTap={{ scale: 0.95 }}
								transition={{ duration: 0.2 }}
								aria-label='Next step'
							>
								<HiOutlineArrowRight />
							</motion.button>
						</motion.div>
					</div>

					{/* Decorative element */}
					<motion.div
						className='absolute bottom-0 right-0 hidden lg:block'
						initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						transition={{ delay: 0.5, duration: 0.6 }}
						whileHover={{ scale: 1.1, rotate: 5 }}
					>
						<Picture
							src={tag_img}
							alt='Decorative element'
							className='w-[85px]'
						/>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default ProgressWorkPad2;
