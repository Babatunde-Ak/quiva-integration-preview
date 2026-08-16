"use client";
import React from "react";
import { mobileHeaderLinkUrl } from "../utils/constant";
import { usePathname } from "next/navigation";
import Link from "next/link";

const AppMenu = () => {
	const pathname = usePathname();

	return (
		<>
			<div className='lg:hidden fixed bottom-0 z-50 w-full'>
				{/* Comic-themed curved background with gradient */}
				<div className='relative bg-gradient-to-r from-primary-600 via-violet-500 to-primary-800 text-white flex items-center justify-between px-1 mx-auto pt-4 pb-3 rounded-t-3xl shadow-2xl border-t-2 border-blue-400'>
					{/* Comic "dot pattern" overlay */}
					<div
						className='absolute inset-0 rounded-t-3xl opacity-10'
						style={{
							backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
							backgroundSize: "10px 10px",
						}}
					/>

					{/* Navigation Items */}
					<div className='grid grid-cols-10 gap-2 w-full items-center justify-center relative z-10'>
						{mobileHeaderLinkUrl.map((menuItem, index) => {
							const isSpacer = index === 2;
							const isActive = pathname === menuItem.url;

							const iconClassName = `${
								isActive ? "text-yellow-300 scale-110" : "text-white/80"
							} group-hover:text-yellow-300 group-hover:scale-105 transition-all duration-300 ease-out`;

							if (isSpacer) {
								return (
									<div
										key={`spacer-${index}`}
										className='col-span-2 flex justify-center'
									/>
								);
							}

							return (
								<Link
									href={menuItem.url}
									key={index}
									className='col-span-2 flex flex-col space-y-1 items-center text-xs group transition-all duration-300 hover:translate-y-[-2px]'
								>
									{/* Active indicator bubble */}
									<div
										className={`relative transition-all duration-300 ${
											isActive ? "scale-110" : "scale-100"
										}`}
									>
										<div
											className={`absolute -inset-2 bg-yellow-400 rounded-full opacity-0 ${
												isActive ? "opacity-20" : ""
											} transition-opacity duration-300`}
										/>
										{menuItem.icon(iconClassName)}
									</div>
								</Link>
							);
						})}
					</div>

					{/* Central Create Button - Comic Style */}
					<div className='absolute -top-0 left-1/2 transform -translate-x-1/2 z-50'>
						<Link
							href={"/comic-pad/script-builder"}
							className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 size-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-400 ease-out hover:scale-105 hover:rotate-6 border-3 border-white border-double hover:shadow-yellow-400/40 hover:shadow-lg relative overflow-hidden`}
						>
							<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-800' />

							<svg
								viewBox='0 0 24 24'
								fill='white'
								className='size-6 relative z-10'
							>
								<path
									className='transition-all duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]'
									d='M12 4v16m8-8H4'
									stroke='white'
									strokeWidth='2.5'
									strokeLinecap='round'
									strokeLinejoin='round'
								/>
							</svg>

							<div className='absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300'>
								<div className='absolute -inset-1 bg-yellow-400 rounded-full blur-sm animate-blink' />
							</div>
						</Link>
					</div>

					{/* Comic-style speech bubble tip at the top */}
					<div className='absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-inherit clip-comic-bubble' />
				</div>
			</div>

			{/* Add custom styles for comic bubble */}
			{/* <style jsx>{`
				.clip-comic-bubble {
					clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
				}
				.font-comic {
					font-family: "Comic Neue", "Comic Sans MS", cursive, sans-serif;
				}
			`}</style> */}
		</>
	);
};

export default AppMenu;
