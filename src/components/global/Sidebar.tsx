"use client";
import Link from "next/link";
import { useEffect } from "react";
import Hamburger from "hamburger-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "../utils/constant";
import { QuivaLogo } from "../utils/function";
import { useAppSelector } from "@/redux/hook";
import ComicConnect from "./comic-library/ComicConnect";

interface SidebarProps {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
	onOpenWhitePaper: () => void;
}
const Sidebar = ({
	isSidebarOpen,
	toggleSidebar,
	onOpenWhitePaper,
}: SidebarProps) => {
	const pathName = usePathname();
	const isAuthenticated = useAppSelector((s: any) => s.wallet?.isAuthenticated);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 0) {
				if (isSidebarOpen) toggleSidebar();
			}
		};

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [toggleSidebar, isSidebarOpen]);

	return (
		<aside
			className={`block xl:hidden ${
				isSidebarOpen
					? "backdrop-sm fixed top-0 unset left-0 w-full h-full ease-in-out duration-1000 bg-[rgba(18,27,25,0.63)] z-50"
					: ""
			}`}
		>
			<div
				className={`-translate-x-full duration-500 ease-in-out flex flex-col h-lvh pl-6 pr-2 pt-2 pb-10 fixed bottom-0 top-0 left-0 z-40 backdrop-blur-lg bg-white/40 w-[80%] sm:w-[50%] ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className='flex w-full items-center justify-between mt-4'>
					<QuivaLogo showText className='invert' />
					<button
						className={`relative grid place-items-center ${
							isSidebarOpen && "!z-50"
						}`}
						onClick={toggleSidebar}
					>
						<Hamburger
							color='white'
							size={20}
							toggled={isSidebarOpen}
							rounded
							hideOutline
						/>
					</button>
				</div>
				<ul className='flex gap-y-6 flex-col mt-6'>
					{NAV_LINKS.map((links, index) => {
						const isSectionLink =
							links.href === "/products" || links.href === "/community" || links.href === "/roadmap";
						const isExternalLink = !links.href.startsWith("/"); // Check for external URLs
						const sectionId = links.href.substring(1);

						// Check if active (either exact path match or section match on homepage)
						const isActive =
							pathName === links.href ||
							(isSectionLink &&
								typeof window !== "undefined" &&
								window.location.hash === `#${sectionId}` &&
								pathName === "/");

						return (
							<li key={index} className='relative'>
								{isSectionLink ? (
									<a
										href={`/#${sectionId}`}
										onClick={(e) => {
											if (pathName === "/") {
												e.preventDefault();
												document.getElementById(sectionId)?.scrollIntoView({
													behavior: "smooth",
												});
												typeof window !== "undefined" &&
													window.history.pushState({}, "", `/#${sectionId}`);
											}
										}}
										className={`capitalize relative text-lg w-fit font-medium font-sans group ${
											isActive ? "text-primary-100 border-b" : "text-white"
										}`}
									>
										<div className='flex items-center w-fit gap-1.5'>
											{links.label}
										</div>
									</a>
								) : isExternalLink ? (
									<a
										href={links.href}
										target='_blank'
										rel='noopener noreferrer'
										className={`capitalize relative text-lg w-fit font-medium font-sans group ${
											isActive ? "text-primary-100" : "text-white"
										}`}
									>
										<div className='flex items-center gap-1.5'>
											{links.label}
										</div>
									</a>
								) : (
									<Link
										href={links.href}
										className={`capitalize relative text-lg w-fit font-medium font-sans group ${
											isActive ? "text-primary-100" : "text-white"
										}`}
									>
										<div className='flex items-center gap-1.5'>
											{links.label}
										</div>
									</Link>
								)}
							</li>
						);
					})}

					<div className="flex flex-col gap-3 mt-6">
						{isAuthenticated ? (
							<ComicConnect />
						) : (
							<Link
								href="/marketplace"
								onClick={toggleSidebar}
								className="bg-secondary-200 text-black-200 font-recursive text-sm rounded-full px-7 py-3 border-[3px] border-black-200 shadow-[2px_2px_0_0_black] transition-all duration-200 font-medium hover:scale-105"
							>
								Getting Started
							</Link>
						)}
					</div>
				</ul>
			</div>
		</aside>
	);
};

export default Sidebar;
