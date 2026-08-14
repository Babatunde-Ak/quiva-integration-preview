import React from "react";
import TitleText from "../text/TitleText";
import { AnchorButton, MainButton } from "../button";
import { QuivaLogo } from "../utils/function";
import { emailAddress, phoneNum, SOCIAL_MEDIA_LINKS } from "../utils/constant";
import Link from "next/link";
import Picture from "../picture/Index";
import { footerImg, heroBgImg } from "../../../public/dev_images";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<div className='grid place-items-center relative overflow-hidden'>
			<div className='absolute inset-0 z-0'>
				<div className='relative w-full h-full'>
					<Picture
						src={heroBgImg}
						alt='home bg'
						loading='eager'
						className='w-full h-full object-fill'
					/>
				</div>
			</div>
			<div className='z-10 space-y-7 lg:space-y-12 w-[85%] lg:max-w-[850px] text-center pt-10 lg:pt-20 pb-5 lg:pb-40 mx-auto'>
				<TitleText
					title='Build. Play. Earn. Belong'
					className='!text-black-100'
				/>
				<p className='text-black-100 font-poppins text-lg'>
					Whether you draw, read or just vibe. Quiva is for you..
				</p>

				<Picture
					src={footerImg}
					alt='Quiva logo'
					loading='eager'
					className={`w-[90%] h-[200px] sm:h-fit lg:max-w-[850px] mx-auto`}
				/>
				<div className='flex flex-col items-center justify-center gap-4 w-full max-w-sm mx-auto'>
					<Link href="/waitlist" className="w-full">
						<MainButton className='w-full rounded-2xl py-3'>
							Join Creator Waitlist
						</MainButton>
					</Link>

					<AnchorButton
						href="https://t.me/Quivannouncement"
						className='bg-transparent w-full rounded-full py-3 border border-black'
					>
						Join the community
					</AnchorButton>
				</div>


				<h5 className='text-black-100 font-recursive text-sm lg:text-lg mt-6'>
					<a href='https://t.me/Quiva_bot/quivaGame' target="_blank" rel="noopener noreferrer">Quiva Games</a>
				</h5>
			</div>

			<div className='py-6 lg:grid grid-cols-2 w-full max-w-screen-xl section-padding'>
				<div className='space-y-4 px-8 pb-10 lg:pt-0 lg:px-0'>
					<QuivaLogo showText />
					<p className='text-black-100 font-poppins text-lg max-w-xs lg:max-w-sm'>
						Interactive, tokenized, powered by Blockchain Technology.
					</p>

					<h5 className='text-light-300/80 text-xs'>
						© {currentYear} Quiva LLC. All rights reserved. — Copyright
					</h5>
				</div>
				<div className='lg:flex justify-between space-y-8 lg:space-y-0 items-start px-8 lg:px-16 lg:py-6 text-sm border-t-2 border-red-100 lg:border-transparent pt-8'>
					{/* <div className='space-y-3'>
						<p className='text-red-100 uppercase tracking-wide text-xs mb-2'>
							Contact
						</p>
						<div className='space-y-1'>
							<h5 className='font-medium'>{phoneNum}</h5>
							<h5 className='font-medium'>{emailAddress}</h5>
						</div>
					</div> */}

					<div className='space-y-3'>
						<p className='text-red-100 uppercase tracking-wide text-xs'>
							Follow Us
						</p>
						<div className='flex gap-4'>
							{SOCIAL_MEDIA_LINKS.map((social) => (
								<Link
									key={social.id}
									href={social.url}
									target='_blank'
									rel='noopener noreferrer'
									className={`p-3 border rounded-full flex items-center justify-center !cursor-pointer group transition-[.5] border-red-100 z-10`}
								>
									<span className='group-hover:scale-110'>{social.icon}</span>
								</Link>
							))}
						</div>
					</div>
				</div>
				<div className='lg:hidden px-8 mt-8'>
					<h5 className='text-light-300/80 text-xs'>
						© {currentYear} Quiva LLC. All rights reserved. — Copyright
					</h5>
				</div>
			</div>

			<div className='w-1/2 h-[280px] hidden lg:block border border-red-100 border-b-transparent border-r-transparent rounded-tl-[120px] absolute -bottom-[60px] right-0' />
		</div>
	);
};

export default Footer;
