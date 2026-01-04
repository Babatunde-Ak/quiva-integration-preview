import Picture from "@/components/picture/Index";
import React from "react";
import { avatarImg } from "../../../../public/dev_images";
import { StaticImageData } from "next/image";

interface CreateComicCardProps {
	imageSrc?: string | StaticImageData;
	title?: string;
	description?: string;
	buttonText?: string;
	className?: string;
	imageClassName?: string;
	titleClassName?: string;
	descriptionClassName?: string;
	onClick?: () => void;
}

const CreateComicCard = ({
	imageSrc = avatarImg,
	title = "Create New Comic",
	description = "Open your creative tools and begin from scratch.",
	className = "",
	buttonText = "Create",
	imageClassName = "size-12 object-contain",
	titleClassName = "text-white text-sm lg:text-xl font-medium",
	descriptionClassName = "text-white/60 text-xs lg:text-base leading-8",
	onClick,
}: CreateComicCardProps) => {
	return (
		<div
			className={`w-full sm:w-56 md:w-60 lg:w-64 xl:w-72 min-h-72 border-2 border-black-50 bg-black-100 p-4 sm:p-6 md:px-7 md:py-8 flex flex-col items-center text-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 ${className}`}
			onClick={onClick}
		>
			<Picture
				src={imageSrc}
				className={`size-10 sm:size-14 md:size-16 ${imageClassName}`}
				alt={title}
			/>
			<h5 className={`text-sm sm:text-base md:text-lg ${titleClassName}`}>
				{title}
			</h5>
			<p
				className={`text-xxs sm:text-sm text-gray-600 font-light leading-tight ${descriptionClassName}`}
			>
				{description}
			</p>

			<button className="w-full py-2 px-4 text-primary-500 text-center text-sm border border-primary-500 rounded-full hover:bg-primary-500/10 transition-colors mt-4">
				{buttonText}
			</button>
		</div>
	);
};

export default CreateComicCard;
