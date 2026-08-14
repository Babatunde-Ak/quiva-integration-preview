import React from "react";
import EarningHistory from "./EarningHistory";
import EarningOverview from "./EarningOverview";
import TitleText from "@/components/text/TitleText";

const EarningContainer = () => {
	return (
		<div>
			<TitleText
				title='Earnings'
				className='text-white/70 !text-lg lg:!text-2xl ml-3 lg:ml-0'
			/>
			<EarningOverview />
			<EarningHistory />
		</div>
	);
};

export default EarningContainer;
