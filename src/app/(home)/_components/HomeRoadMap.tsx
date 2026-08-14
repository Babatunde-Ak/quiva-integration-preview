import Picture from "@/components/picture/Index";
import TitleText from "@/components/text/TitleText";
import React from "react";
import {
	footerImg,
	mapPattern,
	roadmapImg,
	tag_img,
} from "../../../../public/dev_images";

const ROADMAP_DATA = [
	{
		quarter: "Q1",
		title: "Community Growth",
		items: [
			"Built the first Telegram game",
			"Grow our early fanbase",
			"Home & content campaigns",
		],
		image: roadmapImg, // Make sure to import this
	},
	{
		quarter: "Q2",
		title: "Game Development",
		items: [
			"Launched Jumble Jester (Telegram word game)",
			"Built early leaderboard + reward loops",
			"Started integrating with $TON token",
		],
		image: roadmapImg, // You can use different images for each if needed
	},
	{
		quarter: "Q3",
		title: "ComicPad Alpha",
		items: [
			"Rollout of ComicPad V1 for creators",
			"Onboard early creators for minting",
			"Launch of staking & token rewards",
			"Beta test for WebApp & NFTs",
		],
		image: roadmapImg,
	},
	{
		quarter: "Q4",
		title: "Full Launch",
		items: [
			"Public ComicPad Launch",
			"Spin-to-Win events",
			"Creator reward system + leaderboard",
			"Start building DAO & AR Comic features",
		],
		image: roadmapImg,
	},
];

const HomeRoadMap = () => {
	return (
		<section className='bg-black-500 pt-12 pb-16 lg:pt-24 lg:pb-48 relative'>
			<div className='absolute inset-0 z-10'>
				<Picture
					src={mapPattern}
					alt='map pattern'
					loading='eager'
					className='w-full h-full object-fill'
				/>
			</div>

			<div className='px-3 lg:px-0 xl:max-w-screen-xl mx-auto'>
				<TitleText title='Roadmap' className='text-light-100 text-center' />

				<div className='lg:w-[90%] mx-auto mt-7 lg:mt-20 text-white'>
					{/* Roadmap Content */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-y-8 lg:gap-y-24 lg:gap-x-8'>
						{ROADMAP_DATA.map((item, index) => (
							<div
								key={index}
								className='flex flex-col lg:flex-row items-start gap-2 lg:gap-0'
							>
								<Picture
									src={item.image}
									alt='map pattern'
									loading='eager'
									className='hidden lg:block w-[111px] h-[255px] object-fill'
								/>
								<Picture
									src={tag_img}
									alt='map pattern'
									loading='eager'
									className='w-[85px] lg:hidden'
								/>
								<div className='font-recursive pl-6 space-y-6 flex flex-col h-4/5 justify-around'>
									<div className='space-y-2'>
										<h3 className='text-xl lg:text-3xl font-semibold text-secondary-200'>
											{item.quarter}
										</h3>
										<p className='font-medium'>{item.title}</p>
									</div>

									<ul className='list-disc pl-3 lg:pl-5 space-y-3 lg:space-y-6 text-sm lg:text-lg'>
										{item.items.map((point, pointIndex) => (
											<li key={pointIndex}>{point}</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default HomeRoadMap;
