"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { QuivaLogo } from "../utils/function";
import { MainButton } from "../button";
import Hamburger from "hamburger-react";
import Link from "next/link";
import { NAV_LINKS } from "../utils/constant";
import Sidebar from "./Sidebar";
import { useDisclosure } from "@heroui/react";
import WhitePaperModal from "../modals/WhitePaperModal";
import GeneralModal from "../modals/GeneralModal";
import UserProfileFlowModal from "../modals/UserProfile/UserProfileFlowModal";
import ComicConnect from "./comic-library/ComicConnect";
import { useAppSelector } from "@/redux/hook";

const Header = () => {
	const [search, setSearch] = useState("");
	const [isScrolled, setIsScrolled] = useState(false);
	const [modalPage, setModalPage] = useState<string | null>(null);
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const isAuthenticated = useAppSelector((s: any) => s.wallet?.isAuthenticated);

	const router = useRouter();

	const {
		isOpen: isOpenWhitePaper,
		onOpen: onOpenWhitePaper,
		onOpenChange: onOpenChangeWhitePaper,
		onClose: onCloseWhitePaper,
	} = useDisclosure();

	const {
		isOpen: isUserProfileOpen,
		onOpen: onOpenUserProfile,
		onOpenChange: onOpenChangeUserProfile,
		onClose: onCloseUserProfile,
	} = useDisclosure();

	const handleLoginSuccess = () => {
		onCloseWhitePaper();
		onOpenUserProfile();
	};

	const handleProfileComplete = () => {
		onCloseUserProfile();
		// Navigate to marketplace after profile completion
		router.push("/marketplace");
	};

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 50) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (searchParams.get("modal")) {
			if (searchParams.get("modal") === "whitepaper") {
				setModalPage("whitepaper");
			}
			if (searchParams.get("modal") === "otp") {
				setModalPage("otp");
			}
			onOpenWhitePaper();
		}
	}, [searchParams]);

	const handleSearch = () => {
		if (pathname === "/search") {
			router.push(`/search?${search}`);
		} else {
			router.push(`/search?${search}`);
		}
	};
	return (
		<>
			{/* Desktop Navigation */}
			<header
				className={`fixed w-full flex items-center z-20 h-16 lg:h-fit lg:py-3 top-0 ${
					isScrolled
						? "backdrop-blur-lg bg-white/40"
						: "lg:border-b dashed-border-strong"
				} drop-shadow-sm z-50`}
			>
				<nav className='hidden lg:grid w-full grid-cols-6 lg:px-3 xl:px-0 items-center xl:max-w-screen-xl mx-auto'>
					<div className='col-span-1'>
						<QuivaLogo showText className='invert' />
					</div>

					<ul className='flex gap-6 xl:gap-8 mx-auto text-white py-3 font-spaceGrotesk col-span-4'>
						{NAV_LINKS.map((link) => {
							const isSectionLink =
								link.href === "/products" ||
								link.href === "/community" ||
								link.href === "/roadmap";
							const isExternalLink = !link.href.startsWith("/"); // Check for external URLs
							const sectionId = link.href.substring(1);
							const currentPath =
								typeof window !== "undefined" && window.location.pathname;
							const currentHash =
								typeof window !== "undefined" &&
								window.location.hash.substring(1);

							// Check if active (either exact path match or section match)
							const isActive =
								currentPath === link.href ||
								(isSectionLink &&
									currentHash === sectionId &&
									currentPath === "/");

							return (
								<li key={link.href}>
									{isSectionLink ? (
										<a
											href={`/#${sectionId}`}
											onClick={(e) => {
												if (currentPath === "/") {
													e.preventDefault();
													document.getElementById(sectionId)?.scrollIntoView({
														behavior: "smooth",
													});
												}
											}}
											className={`text-sm font-light hover:text-primary-100 transition-colors ${
												isActive
													? "text-primary-100 font-semibold"
													: "text-white"
											}`}
										>
											{link.label}
										</a>
									) : isExternalLink ? (
										<a
											href={link.href}
											target='_blank'
											rel='noopener noreferrer'
											className={`text-sm font-light hover:text-primary-100 transition-colors ${
												isActive
													? "text-primary-100 font-semibold"
													: "text-white"
											}`}
										>
											{link.label}
										</a>
									) : (
										<Link
											href={link.href}
											className={`text-sm font-light hover:text-primary-100 transition-colors ${
												isActive
													? "text-primary-100 font-semibold"
													: "text-white"
											}`}
										>
											{link.label}
										</Link>
									)}
								</li>
							);
						})}
					</ul>

					<div className='flex justify-end col-span-1'>
						{isAuthenticated ? (
							<ComicConnect />
						) : (
							<MainButton onClick={() => {
								// router.push("?modal=whitepaper");
								// onOpenWhitePaper()
								router.push("/marketplace");
							}}>Getting Started</MainButton>
						)}
					</div>
				</nav>

				{/* Mobile Navigation */}
				<nav className='w-full relative flex justify-between items-center lg:hidden px-4'>
					<QuivaLogo
						showText
						className={`${
							isScrolled ? "" : "invert lg:invert"
						} transition-[.4]`}
					/>
					<button
						className={`relative grid place-items-center transition-[.20] ${
							isSidebarOpen ? "hidden" : ""
						} ${isScrolled ? "text-black-100" : "text-white"}`}
						onClick={toggleSidebar}
						aria-label='Toggle Sidebar'
					>
						<Hamburger size={20} toggled={isSidebarOpen} rounded hideOutline />
					</button>
				</nav>
			</header>

			<Sidebar
				isSidebarOpen={isSidebarOpen}
				toggleSidebar={toggleSidebar}
				onOpenWhitePaper={onOpenWhitePaper}
			/>

			{/* White paper */}
			<GeneralModal
				isOpen={isOpenWhitePaper}
				onOpenChange={onOpenChangeWhitePaper}
				onClose={onCloseWhitePaper}
				backdrop='blur'
				size='xl'
			>
				<WhitePaperModal
					onClose={onCloseWhitePaper}
					onLoginSuccess={handleLoginSuccess}
					modalPage={modalPage}
					setModalPage={setModalPage}
				/>
			</GeneralModal>

			{/* User Profile Flow Modal */}
			<GeneralModal
				isOpen={isUserProfileOpen}
				onOpenChange={onOpenChangeUserProfile}
				onClose={onCloseUserProfile}
				backdrop='blur'
				size='xl'
			>
				<UserProfileFlowModal
					onClose={onCloseUserProfile}
					onComplete={handleProfileComplete}
				/>
			</GeneralModal>
		</>
	);
};

export default Header;
