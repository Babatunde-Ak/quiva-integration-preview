import React from "react";
import Picture from "@/components/picture/Index";
import { StaticImageData } from "next/image";
import Link from "next/link";

interface MyComicCardProps {
	id: number;
	title: string;
	subtitle: string;
	imageSrc: string | StaticImageData;
}

const MyComicCard = ({ id, title, subtitle, imageSrc }: MyComicCardProps) => {
	return (
		<Link href={`/comic-pad/my-comics/${id}`} className='max-w-[317px]'>
			<Picture
				src={imageSrc}
				className='w-full border lg:h-64 object-fill '
				alt='recent'
			/>
			<h5 className={`text-white text-sm lg:text-2xl px-4 font-medium mt-1`}>
				{title}
			</h5>
			<h6
				className={`text-white/70 text-sm lg:text-base px-4 font-medium mt-1`}
			>
				{subtitle}
			</h6>
		</Link>
	);
};

export default MyComicCard;
