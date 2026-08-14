import { MainButton } from "@/components/button";
import Picture from "@/components/picture/Index";
import TitleText from "@/components/text/TitleText";
import React from "react";

const NoToolsNoProblem = () => {
	const tools = [
		{ name: "Pen", image: "/dev_images/tool-1.png" },
		{ name: "Pencil", image: "/dev_images/tool-2.png" },
		{ name: "Eraser", image: "/dev_images/tool-3.png" },
		{ name: "Ruler", image: "/dev_images/tool-4.png" },
		{ name: "Brush", image: "/dev_images/tool-5.png" },
		{ name: "Highlighter", image: "/dev_images/tool-6.png" },
		{ name: "Marker", image: "/dev_images/tool-7.png" },
		{ name: "Compass", image: "/dev_images/tool-8.png" },
		{ name: "Protractor", image: "/dev_images/tool-9.png" },
		{ name: "Scissors", image: "/dev_images/tool-10.png" },
		{ name: "Glue", image: "/dev_images/tool-11.png" },
		{ name: "Stapler", image: "/dev_images/tool-12.png" },
		{ name: "Notebook", image: "/dev_images/tool-13.png" },
		{ name: "Calculator", image: "/dev_images/tool-14.png" },
		{ name: "Clipboard", image: "/dev_images/tool-15.png" },
		{ name: "Sticky Notes", image: "/dev_images/tool-16.png" },
	];

	return (
		<section className='bg-black-900 min-h-screen pt-12 pb-16 lg:py-24'>
			<div className='xl:max-w-screen-xl mx-auto'>
				<div className='space-y-8 px-5 lg:px-0 max-w-[850px] text-center mx-auto'>
					<TitleText title='No Tools? No Problem.' className='text-light-100' />

					<div className='w-[100%] py-5 lg:py-16 px-2 lg:px-12 bg-linear-black-gradient rounded-3xl border-[25px] border-gray-300 mx-auto'>
						<div className='grid grid-cols-2 lg:grid-cols-5 gap-5 h-full'>
							{tools.map((tool) => (
								<div
									key={tool.name}
									className='bg-black-100 border w-full h-[90px] lg:h-[100px] border-gray-700 rounded-xl flex flex-col items-center justify-center text-white hover:scale-110 space-y-2 transition-[.3]'
								>
									<Picture
										src={tool.image}
										alt='home bg'
										loading='eager'
										className='size-[50%] lg:size-[35%] object-contain'
									/>
									<div className='text-xs sm:text-sm font-medium'>
										{tool.name}
									</div>
								</div>
							))}
						</div>
					</div>
					<p className='text-light-200 font-poppins text-bas	e lg:text-lg'>
						Whether you&apos;re a pro artist or just getting started, Quiva
						gives you the tools to draw, layout, and publish comics — right in
						your browser.
					</p>

					<MainButton className='w-fit !px-10 bg-secondary-200'>
						Start Creating
					</MainButton>
				</div>
			</div>
		</section>
	);
};

export default NoToolsNoProblem;
