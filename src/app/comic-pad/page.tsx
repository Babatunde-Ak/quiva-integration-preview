"use client";
import React from "react";
import StartNewComicFast from "./_components/StartNewComicFast";
import RecentFile from "./_components/RecentFile";

const page = () => {
	return (
		<>
			<div className='default-comicpad-padding'>
				<StartNewComicFast />
				{/* <RecentFile /> */}
			</div>
		</>
	);
};

export default page;
