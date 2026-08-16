"use client";
import React, { useEffect, useState } from "react";
import { soloLevel } from "../../../../../public/dev_images";
import Picture from "@/components/picture/Index";
import { FaChevronLeft } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { getComicById, deleteComic, clearCurrentComic } from "@/redux/slices/comicSlice";
import { Loader2, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComicViewPageProps {
	id: string;
}

const ComicViewPage = ({ id }: ComicViewPageProps) => {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { currentComic, isLoading, isDeleting } = useAppSelector((state: any) => state.comic);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Fetch comic by ID on component mount
	useEffect(() => {
		if (id) {
			dispatch(getComicById({id} as any));
		}

		// Cleanup on unmount
		return () => {
			dispatch(clearCurrentComic());
		};
	}, [id, dispatch]);

	// Handle delete comic
	const handleDelete = async () => {
		try {
			if(id){
				await dispatch(deleteComic({id} as any)).unwrap();
				// Navigate back after successful deletion
				router.push("/my-comics"); // Adjust route as needed
			}
		} catch (error) {
			console.error("Failed to delete comic:", error);
			// You can add toast notification here
		}
	};

	// Handle edit navigation
	const handleEdit = () => {
		router.push(`/comics/${id}/edit`); // Adjust route as needed
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<div className='text-center'>
					<Loader2 className='w-12 h-12 text-yellow-700 animate-spin mx-auto mb-4' />
					<p className='text-white/60 text-sm font-medium'>Loading comic...</p>
				</div>
			</div>
		);
	}

	// Error state (comic not found)
	if (!currentComic) {
		return (
			<div className='flex justify-center items-center min-h-screen'>
				<div className='text-center'>
					<div className='text-6xl mb-4'>📚</div>
					<h3 className='text-white text-xl font-bold mb-2'>Comic Not Found</h3>
					<p className='text-white/60 text-sm mb-6'>
						The comic you&apos;re looking for doesn&apos;t exist or has been removed.
					</p>
					<button
						onClick={() => router.push("/comic-pad/my-comics")}
						className='bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-6 py-3 rounded-full transition-all'
					>
						Back to Comics	
					</button>
				</div>
			</div>
		);
	}

	// Extract comic data
	const comic = {
		title: currentComic.title || "Untitled Comic",
		visibility: currentComic.visibility || "Public",
		access: currentComic.publishType === "nft"
			? `Pay-Per-Read (${currentComic?.nftId?.price || "N/A"})`
			: "Free",
		nftEdition: currentComic.nftId ? "Yes" : "No",
		editionSize: currentComic.nftId?.curentSupply || 0,
		mintPrice: currentComic.nftId?.price || "N/A",
		launch: currentComic.launchDate
			? new Date(currentComic.launchDate).toLocaleDateString()
			: "Immediately",
		image: currentComic.coverImage || soloLevel,
		description: currentComic.description || "",
	};

	return (
		<div className='relative px-2 py-2 grid place-items-center'>
			{/* Back Button */}
			<button
				onClick={() => window.history.back()}
				className='absolute top-4 left-4 bg-black/50 hover:bg-black/70 hover:text-primary-100 text-white border-transparent border hover:border-primary-100 hover:-translate-x-1 p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10'
				title='Go back'
			>
				<FaChevronLeft />
			</button>

			<div className='w-full max-w-4xl rounded-lg overflow-hidden shadow-lg'>
				{/* Comic Cover Image */}
				<Picture
					src={comic.image}
					alt={comic.title}
					className='w-full h-64 object-cover'
				/>

				{/* Comic Details */}
				<div className='py-6 space-y-3'>
					<h1 className='text-2xl font-semibold text-white'>{comic.title}</h1>
					
					{comic.description && (
						<p className='text-sm text-white/80 mb-4'>{comic.description}</p>
					)}

					<p className='text-sm text-white/70 tracking-wider font-mono'>
						Visibility: {comic.visibility}
					</p>
					<p className='text-sm text-white/70 tracking-wider font-mono'>
						Reading Access: {comic.access}
					</p>
					<p className='text-sm text-white/70 tracking-wider font-mono'>
						NFT Edition: {comic.nftEdition} | Edition Size: {comic.editionSize}{" "}
						| Mint Price: {comic.mintPrice}
					</p>
					<p className='text-sm text-white/70 tracking-wider font-mono'>
						Launch: {comic.launch}
					</p>
				</div>

				{/* Action Buttons */}
				<div className='grid grid-cols-2 gap-6 p-6 w-[80%] mx-auto'>
					<button
						onClick={handleEdit}
						disabled={isDeleting}
						className='bg-yellow-600 hover:bg-yellow-700 text-black font-medium px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						<Edit size={18} />
						Edit
					</button>
					<button
						onClick={() => setShowDeleteConfirm(true)}
						disabled={isDeleting}
						className='border-2 border-gray-500 hover:bg-red-600 hover:border-red-600 text-white font-medium px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isDeleting ? (
							<>
								<Loader2 size={18} className='animate-spin' />
								Deleting...
							</>
						) : (
							<>
								<Trash2 size={18} />
								Delete
							</>
						)}
					</button>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<div className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
					<div className='bg-gray-900 border border-white/20 rounded-xl p-6 max-w-md w-full shadow-2xl'>
						<h3 className='text-white text-xl font-bold mb-3'>Delete Comic?</h3>
						<p className='text-white/70 text-sm mb-6'>
							Are you sure you want to delete &quot;{comic.title}&quot;? This action cannot
							be undone.
						</p>
						<div className='flex gap-4'>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								disabled={isDeleting}
								className='flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium px-4 py-3 rounded-full transition-all disabled:opacity-50'
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={isDeleting}
								className='flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-3 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50'
							>
								{isDeleting ? (
									<>
										<Loader2 size={18} className='animate-spin' />
										Deleting...
									</>
								) : (
									"Delete"
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ComicViewPage;
