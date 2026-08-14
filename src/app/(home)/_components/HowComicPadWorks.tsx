import TitleText from "@/components/text/TitleText";
import React from "react";
import ProgressWorkPad from "./ProgressWorkPad";
import { SecondaryAnchorButton } from "@/components/button";

const HowComicPadWorks = () => {
	return (
		<section className='bg-black-500 py-6 md:py-12 md:min-h-screen lg:py-24 section-padding'>
			<div className='xl:max-w-screen-xl mx-auto px-4 lg:px-0'>
				<div className='space-y-4 lg:space-y-8 max-w-[850px]'>
					<TitleText
						title='How ComicPad Works'
						className='text-light-100 w-[80%] sm:w-full text-center lg:text-start mx-auto sm:mx-0 tracking-wide lg:tracking-normal'
					/>
					<p className='text-light-200 font-poppins text-base lg:text-lg text-center lg:text-start'>
						Unleash your creativity with our simple process. From choosing your
						comic to tracking your earnings, it&apos;s all streamlined for you.
					</p>
				</div>

				<ProgressWorkPad />
				
				<div className="flex justify-center mt-10 lg:mt-16">
					<SecondaryAnchorButton href={`${'https://quiva.app'}/waitlist`} className='bg-transparent capitalize'>
						join creators Waitlist 
					</SecondaryAnchorButton>
				</div>
			</div>
		</section>
	);
};

export default HowComicPadWorks;
