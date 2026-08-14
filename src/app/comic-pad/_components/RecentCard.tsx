import React from "react";
import { avatarImg, theNorthFace } from "../../../../public/dev_images";
import Picture from "@/components/picture/Index";
import { StaticImageData } from "next/image";

interface RecentCardProps {
	title: string;
	imageSrc: string | StaticImageData;
}

const RecentCard = ({ title, imageSrc }: RecentCardProps) => {
	return (
		<div className='w-full max-w-[280px] sm:w-48 md:w-56 lg:w-64 xl:w-[277px] flex-shrink-0'>
			<Picture
				src={imageSrc}
				className='w-full border h-fit sm:h-52 md:h-56 lg:h-60 xl:h-64 object-cover rounded-b-3xl rounded-l-3xl'
				alt='recent'
			/>
			<h5 className='text-white text-xs sm:text-base lg:text-lg xl:text-2xl px-3 sm:px-4 font-medium mt-1 line-clamp-2'>
				{title}
			</h5>
		</div>
	);
};

export default RecentCard;
