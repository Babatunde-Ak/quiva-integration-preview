"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Picture from "@/components/picture/Index";
import { BiSolidUser } from "react-icons/bi";
import { avatar2Img, profileImage } from "../../../../../public/dev_images";
import {
	BookType,
	profileInfo,
	SAMPLE_BOOKS,
} from "@/components/utils/constant";
import { BookGrid, BookTabs } from "@/components/utils/function";
import { Checkbox, Radio, RadioGroup } from "@heroui/react";
import AccountSettingsContent from "./AccountSettingsContent";
import NotificationPreferencesContent from "./NotificationPreferencesContent";
import RenderProfileContent from "./RenderProfileContent";
import RenderLogInOutContent from "./RenderLogInOutContent";

const TABS = ["Profile", "Account Settings", "Notifications", "Log In & Out"];

const SettingsContainer = () => {
	const [activeTab, setActiveTab] = useState("Profile");

	const renderContent = () => {
		switch (activeTab) {
			case "Profile":
				return <RenderProfileContent />;
			case "Account Settings":
				return <AccountSettingsContent />;
			case "Notifications":
				return <NotificationPreferencesContent />;
			case "Log In & Out":
				return <RenderLogInOutContent />;
			default:
				return null;
		}
	};

	return (
		<div className='mt-4 sm:mt-6'>
			<div className='block lg:hidden mb-4'>
				<select
					value={activeTab}
					onChange={(e) => setActiveTab(e.target.value)}
					className='w-full px-4 py-3 bg-black-100 border border-gray-600 rounded-lg text-white text-base focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent'
				>
					{TABS.map((tab) => (
						<option key={tab} value={tab} className='bg-black-100'>
							{tab}
						</option>
					))}
				</select>
			</div>

			<div className='hidden lg:flex items-center justify-start gap-4 xl:gap-6 2xl:gap-8 overflow-x-auto pb-2'>
				{TABS.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`relative pb-2 text-base xl:text-lg font-semibold transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
							activeTab === tab
								? "text-primary-100"
								: "text-light-400 hover:text-primary-100/80"
						}`}
					>
						{tab}
						{activeTab === tab && (
							<motion.span
								layoutId='underline'
								className='absolute left-0 bottom-0 h-[2px] w-full bg-primary-100'
								transition={{ type: "spring", stiffness: 400, damping: 30 }}
							/>
						)}
						{activeTab !== tab && (
							<span className='absolute left-0 bottom-0 h-[1.5px] w-full bg-white/70' />
						)}
					</button>
				))}
			</div>

			<motion.div
				key={activeTab}
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className='mt-4 sm:mt-6 lg:mt-8'
			>
				{renderContent()}
			</motion.div>
		</div>
	);
};

export default SettingsContainer;
