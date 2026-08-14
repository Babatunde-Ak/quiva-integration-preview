'use client';

import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTopBottom from "../button/ScrollToTopBottom";
import { redirect } from 'next/navigation';


interface AppLayoutProps {
	children: ReactNode;
	bgClassName?: string;
	className?: string;
}

const AppLayout = ({ children, bgClassName, className }: AppLayoutProps) => {
	redirect('/marketplace');

	return (
		<>
		
			<Header />
			<main
				className={`relative w-full min-h-screen ${className} ${bgClassName}`}
			>
				{children}
				<ScrollToTopBottom />
			</main>
			<Footer />
		</>
	);
};

export default AppLayout;
