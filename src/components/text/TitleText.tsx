"use client";
import React from "react";
import { motion } from "framer-motion";

interface TitleTextProps {
	className?: string;
	title: string;
}

const TitleText = ({ className, title }: TitleTextProps) => {
	return (
		<motion.h4
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.5 }}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className={`font-recursive font-medium text-2xl sm:text-3xl lg:text-5xl xl:text-6xl text-light-100 ${className}`}
		>
			{title}
		</motion.h4>
	);
};

export default TitleText;
