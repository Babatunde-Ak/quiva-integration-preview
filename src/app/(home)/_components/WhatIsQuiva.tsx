"use client";
import TitleText from "@/components/text/TitleText";
import { faqs } from "@/components/utils/constant";
import { IoIosArrowDown } from "react-icons/io";
import { Disclosure } from "@headlessui/react";
import React from "react";
import Picture from "@/components/picture/Index";
import { bg_what, curiousImg } from "../../../../public/dev_images";

const WhatIsQuiva = () => {
	return (
		<section className='bg-black-100 pt-2 lg:pt-24 pb-20 lg:pb-40 relative section-padding'>
			<div className='absolute inset-0'>
				<Picture
					src={bg_what}
					alt='bg what'
					loading='eager'
					className='w-full h-full object-fill'
				/>
			</div>

			<div className='px-4 lg:px-0 xl:max-w-screen-xl mx-auto grid gap-4 lg:gap-0 lg:grid-cols-10 font-recursive'>
				<div className='col-span-5 z-10 relative'>
					<TitleText
						title='What is Quiva, really?'
						className='text-light-100 text-lg lg:text-2xl xl:text-3xl mt-12'
					/>
				</div>
				<div className='col-span-5 space-y-3 z-10'>
					{faqs.map((faq, idx) => (
						<Disclosure key={idx}>
							{({ open }) => (
								<div className='border-b border-white/40 pb-3'>
									<Disclosure.Button className='flex w-full justify-between items-center text-left text-white py-3'>
										<span>{faq.question}</span>
										<IoIosArrowDown
											className={`w-5 h-5 transition-transform duration-300 ${
												open ? "rotate-180" : ""
											}`}
										/>
									</Disclosure.Button>
									<Disclosure.Panel className='text-sm text-white/60 pb-3 pt-1'>
										{faq.answer}
									</Disclosure.Panel>
								</div>
							)}
						</Disclosure>
					))}
				</div>
			</div>

			<Picture
				src={curiousImg}
				alt='curious image'
				loading='eager'
				className='w-[60%] lg:w-[600px] absolute bottom-0 left-5 lg:left-20 object-contain hidden lg:block'
			/>
		</section>
	);
};

export default WhatIsQuiva;
