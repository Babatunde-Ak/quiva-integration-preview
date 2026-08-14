import { MainButton } from "@/components/button";
import TitleText from "@/components/text/TitleText";
import React from "react";
import { comic, comic2, comicpadImg } from "../../../../public/dev_images";
import Picture from "@/components/picture/Index";

const WhyQuiva = () => {
	return (
		<section className='bg-black-500 min-h-screen pt-10 lg:pt-24 pb-14 lg:pb-40'>
			<div className='xl:max-w-screen-xl mx-auto'>
				<div className='space-y-12 px-4 lg:px-0 max-w-[850px] text-center mx-auto'>
					<TitleText title='Why Quiva?' className='text-light-100' />
					<div
						className={`w-full grid lg:grid-cols-2 h-fit lg:h-[400px] mx-auto object-cover dashed-border-strong-2`}
					>
						<Picture
							src={comic}
							alt='comic logo'
							loading='eager'
							className={`w-full h-full mx-auto object-cover`}
						/>
						<Picture
							src={comic2}
							alt='comic logo 2'
							loading='eager'
							className={`w-full h-full mx-auto object-cover`}
						/>
					</div>

					<MainButton className='w-fit !px-12 bg-secondary-200'>
						See It In Action
					</MainButton>
				</div>
			</div>
		</section>
	);
};

export default WhyQuiva;
