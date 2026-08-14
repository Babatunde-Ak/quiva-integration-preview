import React from "react";
import ComicPadlayout from "../_components/ComicPadlayout";
import AppMenu from "@/components/global/AppMenu";
import MyComicList from "../my-comics/_components/MyComicList";
import SettingsContainer from "./_components/SettingsContainer";

const page = () => {
	return (
		<ComicPadlayout>
			<div className='px-0 sm:px-8 pt-2 sm:pt-0 pb-24 sm:pb-12'>
				<SettingsContainer />
			</div>
			<AppMenu />
		</ComicPadlayout>
	);
};

export default page;
