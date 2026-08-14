"use client";
import Picture from "@/components/picture/Index";
import React, { useMemo, useState } from "react";
import { avatar2Img } from "../../../../../public/dev_images";
import {
	BookType,
	profileInfo,
	SAMPLE_BOOKS,
} from "@/components/utils/constant";
import { BookGrid, BookTabs } from "@/components/utils/function";

const RenderProfileContent = () => {
	const [activeBookTab, setActiveBookTab] = useState<"all" | "paid" | "free">(
		"all",
	);

	// Filter books based on active tab
	const filteredBooks = useMemo(() => {
		if (activeBookTab === "all") return SAMPLE_BOOKS;
		return SAMPLE_BOOKS.filter((book) => book.category === activeBookTab);
	}, [activeBookTab]);

	const handleBookClick = (book: BookType) => {
		console.log("Book clicked:", book);
	};

	return (
		<div className='mt-4 sm:mt-6 md:mt-8 space-y-8 sm:space-y-12 md:space-y-16'>
			{/* Cover Photo and Edit Button */}
			<div className='relative'>
				<div className='h-48 sm:h-64 md:h-80 lg:h-96 bg-[url("/dev_images/profile-image.png")] bg-cover bg-center rounded-lg flex items-end justify-end p-4 sm:p-6 md:p-8 lg:pr-16 lg:pb-12'>
					<button className='bg-white backdrop-blur-sm text-primary-100 px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-lg text-xs sm:text-sm font-medium hover:text-white hover:bg-white/30 transition-colors border border-white/30 whitespace-nowrap'>
						Edit Cover Photo
					</button>
				</div>

				<Picture
					src={avatar2Img}
					alt='Mary Alex'
					className='object-cover size-24 sm:size-32 md:size-40 lg:size-48 bg-white/50 absolute left-4 sm:left-6 md:left-10 lg:left-20 -bottom-6 sm:-bottom-8 md:-bottom-10 lg:-bottom-12 rounded-full border-4 border-gray-800'
				/>
			</div>

			{/* Profile Header */}
			<div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 px-4 sm:px-0 mt-12 sm:mt-16 md:mt-20 lg:mt-24'>
				{/* Name and Role */}
				<div className='flex-1 min-w-0'>
					<h1 className='text-xl sm:text-2xl md:text-3xl font-extrabold text-white/60'>
						Mary Alex
					</h1>
					<p className='text-base sm:text-lg text-white/50 mt-1'>Creator</p>
				</div>

				{/* Edit Profile Button */}
				<button className='w-full sm:w-auto border-2 border-white/60 text-white/50 hover:text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2 md:py-3 rounded-lg font-medium hover:bg-primary-100 transition-colors text-sm sm:text-base'>
					Edit Profile
				</button>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-10 gap-6 sm:gap-8 lg:gap-12 px-4 sm:px-0'>
				{/* About Section */}
				<div className='col-span-1 lg:col-span-3 space-y-6 sm:space-y-8'>
					<button className='text-white/80 pb-1 text-lg sm:text-xl font-semibold w-full text-left'>
						About
					</button>
					<div className='space-y-4 sm:space-y-6'>
						{profileInfo.map((item) => {
							const IconComponent = item.icon;
							return (
								<div
									key={item.key}
									className='flex gap-3 sm:gap-4 items-center'
								>
									<IconComponent className='text-white/70 text-lg sm:text-xl flex-shrink-0' />
									<span className='text-white/60 text-sm sm:text-base break-words flex-1'>
										{item.text}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Books Section */}
				<div className='space-y-4 sm:space-y-6 col-span-1 lg:col-span-7'>
					{/* Tab Navigation */}
					<div className='px-2 sm:px-0'>
						<BookTabs
							activeTab={activeBookTab}
							onTabChange={setActiveBookTab}
						/>
					</div>

					{/* Book Grid */}
					<BookGrid books={filteredBooks} onBookClick={handleBookClick} />

					{/* Promotional Text */}
					<p className='text-white/50 font-light text-sm sm:text-base px-2 sm:px-0 text-center sm:text-left'>
						<b>Mary Alex</b> New book out here... $50!!!
					</p>
				</div>
			</div>
		</div>
	);
};

export default RenderProfileContent;
