import React from "react";
import ComicPadlayout from "../_components/ComicPadlayout";
import AppMenu from "@/components/global/AppMenu";
import EarningContainer from "../_components/EarningContainer";

const page = () => {
	return (
		<>
			<div className='px-2 sm:px-8 pt-3 sm:pt-0 pb-20 sm:pb-12'>
				<EarningContainer />
			</div>
		</>
	);
};

export default page;
