import { MainButton } from "@/components/button";
import TitleText from "@/components/text/TitleText";
import React from "react";

const WhatYouCanDoWithTMS = () => {
	const features = [
		{
			id: 1,
			title: "Bring Your Stories to Life",
			description:
				"Mint your comics as NFTs, set your rules, and let fans fund your journey—no gatekeepers, just creativity.",
			gradient: "from-[#F93A5A] via-[#FC5B3F] to-[#F8C6E5]",
		},
		{
			id: 2,
			title: "Collect What You Love",
			description:
				"Own rare drops, limited editions, and exclusive chapters. Your favorite stories, now in your wallet.",
			gradient: "from-[#120078] via-[#00FF87] to-[#E0FF4F]",
		},
		{
			id: 3,
			title: "Read. Play. Win.",
			description:
				"Engage with interactive games like Jumble Jester and earn rewards while having fun.",
			gradient: "from-[#F93A5A] via-[#FCF6BD] to-[#A1C4FD]",
		},
	];

	return (
		<section className='bg-black-500 min-h-screen pt-10 lg:pt-24 pb-10 lg:pb-40 section-padding'>
			<div className='px-4 lg:px-0 xl:max-w-screen-xl mx-auto'>
				<div className='space-y-8 lg:space-y-20 text-start'>
					<div className='space-y-6 w-[90%]'>
						<TitleText
							title='What Can You Do With $Q?'
							className='text-light-100'
						/>

						<p className='text-light-200 font-poppins lg:text-lg'>
							More than a token — it’s your key to the Quiva universe.
						</p>

						<MainButton className='w-fit !px-8 bg-secondary-200 border border-secondary-200'>
							Start Creating
						</MainButton>
					</div>

					<div className='mt-5 lg:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-16'>
						{features.map(({ id, title, description, gradient }) => (
							<div
								key={id}
								className='bg-black-100 rounded-3xl overflow-hidden text-white shadow-lg'
							>
								<div
									className={`h-24 rounded-t-2xl bg-gradient-to-r ${gradient}`}
								/>
								<div className='relative px-6 pt-4 lg:pt-16 pb-10 lg:pb-20 space-y-4 font-recursive'>
									<div className='size-16 lg:size-24 absolute -top-8 shadow-custom-orange flex items-center justify-center bg-black-100 text-white text-2xl lg:text-5xl font-bold rounded-xl mb-4 font-recursive'>
										{id}
									</div>
									<h3 className='text-base lg:text-lg font-bold mb-2 tracking-wide'>
										{title}
									</h3>
									<p className='text-sm lg:text-base text-white/80 leading-7'>
										{description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default WhatYouCanDoWithTMS;
