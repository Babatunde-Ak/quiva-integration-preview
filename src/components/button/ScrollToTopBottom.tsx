"use client";
import React, { useState, useEffect } from "react";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const ScrollIndicator = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [showUpArrow, setShowUpArrow] = useState(false);

	// Check scroll position to toggle arrows
	useEffect(() => {
		const toggleVisibility = () => {
			if (window.pageYOffset > 500) {
				setIsVisible(true);
				setShowUpArrow(true);
			} else {
				setIsVisible(true);
				setShowUpArrow(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollTo = (direction: "top" | "bottom") => {
		const viewportHeight = window.innerHeight;
		const currentScroll = window.pageYOffset;
		const target =
			direction === "bottom"
				? currentScroll + viewportHeight
				: Math.max(currentScroll - viewportHeight, 0);

		window.scrollTo({
			top: target,
			behavior: "smooth",
		});
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
					transition={{
						duration: 0.5,
						ease: [0.16, 1, 0.3, 1], // Custom easing for more natural motion
					}}
					className='fixed bottom-6 right-5 lg:right-12 z-50 flex flex-col gap-3'
				>
					{showUpArrow && (
						<motion.button
							whileHover={{
								scale: 1.05,
								backgroundColor: "rgba(255, 255, 255, 0.15)",
							}}
							whileTap={{ scale: 0.95 }}
							onClick={() => scrollTo("top")}
							className='w-7 h-10 lg:w-8 lg:h-12 border-2 shadow-xl border-white/30 rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm transition-all'
							aria-label='Scroll to top'
							initial={{ opacity: 0, y: 10 }}
							animate={{
								opacity: 1,
								y: 0,
								transition: { delay: 0.1 },
							}}
							exit={{ opacity: 0, y: 10 }}
							transition={{
								duration: 0.3,
								ease: "easeOut",
							}}
						>
							<motion.div
								animate={{ y: [-1, 1, -1] }}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								<HiOutlineArrowUp className='text-white text-sm lg:text-xl' />
							</motion.div>
						</motion.button>
					)}

					<motion.button
						whileHover={{
							scale: 1.05,
							backgroundColor: "rgba(255, 255, 255, 0.15)",
						}}
						whileTap={{ scale: 0.95 }}
						onClick={() => scrollTo("bottom")}
						className='w-7 h-10 lg:w-8 lg:h-12 border-2 shadow-xl border-white/30 rounded-full flex items-center justify-center hover:bg-white/10 backdrop-blur-sm transition-all'
						aria-label='Scroll to bottom'
						initial={{ opacity: 0, y: 10 }}
						animate={{
							opacity: 1,
							y: 0,
							transition: { delay: 0.2 },
						}}
						exit={{ opacity: 0, y: 10 }}
						transition={{
							duration: 0.3,
							ease: "easeOut",
						}}
					>
						<motion.div
							animate={{ y: [1, -1, 1] }}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 0.5,
							}}
						>
							<HiOutlineArrowDown className='text-white text-sm lg:text-xl' />
						</motion.div>
					</motion.button>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ScrollIndicator;
