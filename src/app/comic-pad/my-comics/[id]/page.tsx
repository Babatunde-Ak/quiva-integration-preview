import AppLayout from "@/components/global/AppLayout";
import React from "react";
import ComicPadlayout from "../../_components/ComicPadlayout";
import ComicViewPage from "../_components/ComicViewPage";
interface PageProps {
	params: any;
	// searchParams?: any;
}

const page = async (props: PageProps) => {
	const { id } = props.params;

	return (
		<ComicPadlayout>
			{id && <ComicViewPage id={id} />}
		</ComicPadlayout>
	);
};

export default page;
