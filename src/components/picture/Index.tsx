"use client";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { MdNearbyError } from "react-icons/md";
import { isValidImage } from "../utils/function";

interface PictureProps {
	alt: string;
	src: string | StaticImageData;
	width?: number;
	height?: number;
	loading?: "lazy" | "eager" | undefined;
	sizes?: string;
	className?: string;
	priority?: boolean;
	validate?: boolean;
	layout?: "fill" | "fixed" | "intrinsic" | "responsive";
	onError?: () => void;
	onLoad?: () => void;
}

const Picture = ({
	src,
	alt,
	width,
	height,
	loading = "lazy",
	sizes,
	layout,
	priority,
	validate,
	className,
	onError,
	onLoad
}: PictureProps) => {
	const [isValid, setIsValid] = useState<boolean>(true);

	useEffect(() => {
		if (typeof src === "string") {
			const checkImage = async () => {
				const valid = await isValidImage(src);
				setIsValid(valid);
			};
			checkImage();
		}
	}, [src]);

	return (
		<>
			{isValid && typeof src === "string" ? (
				<Image
					src={src}
					alt={alt || "image"}
					width={width || 800}
					height={height || 800}
					sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
					loading={loading}
					quality={75}
					priority={false}
					layout={layout}
					className={className || ""}
					onError={onError}
					onLoad={onLoad}
				/>
			) : typeof src !== "string" ? (
				<Image
					src={src}
					alt={alt || "image"}
					width={width || 800}
					height={height || 800}
					sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
					loading={loading}
					quality={75}
					priority={false}
					layout={layout}
					className={className || ""}
					onError={onError}
					onLoad={onLoad}
				/>
			) : (
				validate && (
					<div className='flex flex-col gap-1 items-center justify-center w-fit'>
						<MdNearbyError className='text-red-600 text-lg' />
						<h5 className='text-xs capitalize'>Invalid Image</h5>
					</div>
				)
			)}
		</>
	);
};

export default Picture;
