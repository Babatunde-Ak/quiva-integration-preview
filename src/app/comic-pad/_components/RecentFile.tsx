"use client";
import React, { useState, useEffect, useMemo } from "react";
import RecentCard from "./RecentCard";
import { theNorthFace } from "../../../../public/dev_images";
import { Listbox } from "@headlessui/react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getUserComics } from "@/redux/slices/comicSlice";
import { Loader2 } from "lucide-react";

const RecentFile = () => {
	const [sortBy, setSortBy] = useState("");
	const dispatch = useAppDispatch();
	const { userComics, isLoading } = useAppSelector((state: any) => state.comic);

	const options = [
		{ key: "size", label: "Size" },
		{ key: "name", label: "Name" },
		{ key: "date", label: "Date" },
		{ key: "type", label: "Type" },
	];

	const selectedOption = options.find((option) => option.key === sortBy) || {
		label: "Sort by",
	};

	// Fetch user comics on component mount
	useEffect(() => {
		dispatch(getUserComics());
	}, [dispatch]);

	// Transform API comics to match your UI format
	const transformedComics = useMemo(() => {
		if (!userComics?.data?.comics.data) return [];
		
		return userComics.data.comics.data.map((comic: any) => ({
			id: comic.id,
			title: comic.title,
			imageSrc: comic.coverImage || theNorthFace,
			description: comic.description,
			createdAt: comic.createdAt,
			size: comic.size || 0, // Add if available from API
			type: comic.type || "comic",
		}));
	}, [userComics]);

	// Sort comics based on selected option
	const sortedComics = useMemo(() => {
		if (!sortBy || transformedComics.length === 0) return transformedComics;

		const sorted = [...transformedComics];

		switch (sortBy) {
			case "name":
				return sorted.sort((a, b) => a.title.localeCompare(b.title));
			case "date":
				return sorted.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			case "size":
				return sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
			case "type":
				return sorted.sort((a, b) => a.type.localeCompare(b.type));
			default:
				return sorted;
		}
	}, [transformedComics, sortBy]);

	// Fallback data for development/empty state
	// const FALLBACK_ITEMS = [
	// 	{ id: "1", title: "The North Face", imageSrc: theNorthFace },
	// 	{ id: "2", title: "Patagonia", imageSrc: theNorthFace },
	// 	{ id: "3", title: "Columbia Sportswear", imageSrc: theNorthFace },
	// 	{ id: "4", title: "Arc'teryx", imageSrc: theNorthFace },
	// 	{ id: "5", title: "Marmot", imageSrc: theNorthFace },
	// 	{ id: "6", title: "Mountain Hardwear", imageSrc: theNorthFace },
	// ];

	const displayComics =
		sortedComics.length > 0 ? sortedComics : [];

	return (
		<div className='mt-8'>
			<h5 className='text-white text-base lg:text-xl font-medium'>Recent</h5>
			<div className='mt-2 flex items-center gap-4'>
				<h6 className='text-sm text-white'>Sort By:</h6>

				<Listbox
					value={sortBy}
					onChange={(value) => {
						setSortBy(value);
					}}
					disabled={isLoading}
				>
					<div className='relative w-24'>
						<Listbox.Button
							className={`w-full rounded-full border-2 border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-white dark:text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
								isLoading ? "opacity-50 cursor-not-allowed" : ""
							}`}
							aria-label='Sort By'
						>
							{selectedOption.label}
						</Listbox.Button>

						<Listbox.Options
							className='absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none'
						>
							{options.map((option) => (
								<Listbox.Option
									key={option.key}
									value={option.key}
									className={({ active, selected }) =>
										`cursor-pointer select-none px-4 py-2 text-sm ${
											active
												? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
												: ""
										} ${
											selected
												? "bg-blue-500 text-white"
												: "text-gray-900 dark:text-gray-100"
										}`
									}
								>
									{option.label}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</div>
				</Listbox>
			</div>

			{/* Loading State */}
			{isLoading ? (
				<div className='mt-8 flex justify-center items-center'>
					<Loader2 className='w-8 h-8 text-white animate-spin' />
				</div>
			) : (
				<>
					{/* Empty State */}
					{sortedComics.length === 0 && (
						<div className='flex justify-center items-center my-8'>
								<div className='text-center'>
									<div className='text-6xl mb-4'>📚</div>
									<h3 className='text-white text-xl font-bold mb-2'>Start A Comic Project!</h3>
									<p className='text-white/60 text-sm mb-6'>
										No recent comics found. Create your first comic to get started!
									</p>
								</div>
							</div>
					)}

					{/* Comics Grid */}
					<div className='mt-4 grid grid-cols-2 sm:flex gap-3 flex-wrap justify-center sm:justify-start'>
						{displayComics.map((item) => (
							<RecentCard
								key={item.id}
								title={item.title}
								imageSrc={item.imageSrc}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default RecentFile;