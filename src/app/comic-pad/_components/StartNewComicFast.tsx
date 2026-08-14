"use client";
import React from "react";
import { useRouter } from "next/navigation";
import CreateComicCard from "./CreateComicCard";
import { bookIcon, paintIcon, robotIcon, rocketIcon } from "../../../../public/dev_images";
import { useDisclosure } from "@heroui/react";
import GeneralModal from "@/components/modals/GeneralModal";
import CollectionView from "@/features/comic-pad/components/collections/collection-view";

const StartNewComicFast = () => {
	const router = useRouter();
	const {
		isOpen: isOpenUploadModal,
		onOpen: onOpenUploadModal,
		onOpenChange: onOpenChangeUploadModal,
		onClose: onCloseUploadModal,
	} = useDisclosure();

	const handleStartNewProject = () => {
		// router.push("/comic-pad/script-builder");
	};

	return (
		<div className='bg-black-200 flex flex-col h-screen justify-center gap-8 w-full items-center py-8 lg:py-12'>
			<div className="flex flex-col gap-2 justify-center items-center text-center px-2 lg:px-0 max-w-2xl">
				<h4 className='text-white text-base lg:text-2xl tracking-wider'>
					Create. Publish. Launch. Earn without blockchain complexity.
				</h4>
				<p className='text-white/30 text-sm font-light mt-2'>
					Your all-in-one studio for comic creation, collections, and drops on Quiva.
				</p>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 lg:gap-8 px-2 lg:px-0'>
				<CreateComicCard
					imageSrc={paintIcon}
					title='Create Amazing Art'
					description='Draw, drag, drop, customize, and export all inside ComicPad.'
					className='!cursor-not-allowed'
					onClick={handleStartNewProject}
					buttonText="Coming Soon"
				/>
				{/* <CreateComicCard
					imageSrc={robotIcon}
					title='Q Art Maker'
					description='Turn ideas into comic art with AI assistance.'
					className='!cursor-not-allowed'
					onClick={onOpenUploadModal}
					buttonText="Coming Soon"
				/> */}

				<CreateComicCard
					imageSrc={bookIcon}
					title='Create / Upload'
					description='Organize your story into a collectible universe.'
					onClick={onOpenUploadModal}
					buttonText="Create Collection"
				/>

				{/* <CreateComicCard
					imageSrc={rocketIcon}
					title='Launch Drops'
					description='Supply-based mint events designed for hype, scarcity, and momentum.'
					className='!cursor-not-allowed'
					onClick={onOpenUploadModal}
					buttonText="Coming Soon"
				/> */}
			</div>

			{/* Upload Modal */}
			<GeneralModal
				isOpen={isOpenUploadModal}
				onOpenChange={onOpenChangeUploadModal}
				onClose={onCloseUploadModal}
				backdrop='blur'
				size='full'
				modalContentClass='bg-black-500 max-h-screen lg:!m-16'
			>
				<div className="w-full h-screen !p-4 lg:!p-8 overflow-y-auto">
					<CollectionView onClose={onCloseUploadModal} />
				</div>
			</GeneralModal>
		</div>
	);
};

export default StartNewComicFast;