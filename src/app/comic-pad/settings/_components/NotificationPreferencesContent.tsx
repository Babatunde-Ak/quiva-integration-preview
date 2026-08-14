"use client";
import { Checkbox, Radio, RadioGroup } from "@heroui/react";
import React, { useState } from "react";

const NotificationPreferencesContent = () => {
	const [notifications, setNotifications] = useState({
		newsUpdates: true,
		tipsTutorials: false,
		bookResearch: false,
		bookNotify: "none",
	});

	const handleToggle = (key: string) => {
		setNotifications((prev) => ({
			...prev,
			[key]: !prev[key as keyof typeof prev],
		}));
	};

	const handleBookNotifyChange = (value: string) => {
		setNotifications((prev) => ({ ...prev, bookNotify: value }));
	};

	return (
		<div className='mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 md:pl-0 text-white/70'>
			<h2 className='text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white/60'>
				Notification preferences
			</h2>
			<p className='text-xs sm:text-sm mb-4 sm:mb-6 text-white/40 leading-relaxed'>
				Get emails to find out what is going on when you are not online. You can
				turn them off anytime.
			</p>

			<hr className='border-white/40 mb-4 sm:mb-6' />

			<section className='mb-6 sm:mb-8'>
				<h3 className='text-base sm:text-lg font-semibold mb-3 text-white/60'>
					Notifications from us
				</h3>
				<p className='text-xs sm:text-sm mb-3 sm:mb-4 text-white/40'>
					Receive the latest news and updates from us.
				</p>

				<div className='space-y-3 sm:space-y-4'>
					<label className='flex items-start gap-3 cursor-pointer'>
						<Checkbox
							isSelected={notifications.newsUpdates}
							onValueChange={() => handleToggle("newsUpdates")}
							color='warning'
							classNames={{
								base: "max-w-full",
								wrapper: "bg-gray-700 border-gray-500 mt-0.5",
								label: "text-white flex-1",
							}}
						>
							<div className='flex flex-col'>
								<p className='font-medium text-sm sm:text-base'>
									News and updates
								</p>
								<p className='text-xs text-white/40 mt-1'>
									News about product and feature updates.
								</p>
							</div>
						</Checkbox>
					</label>

					<label className='flex items-start gap-3 cursor-pointer'>
						<Checkbox
							isSelected={notifications.tipsTutorials}
							onValueChange={() => handleToggle("tipsTutorials")}
							color='warning'
							classNames={{
								base: "max-w-full",
								wrapper: "bg-gray-700 border-gray-500 mt-0.5",
								label: "text-white flex-1",
							}}
						>
							<div className='flex flex-col'>
								<p className='font-medium text-sm sm:text-base'>
									Tips and tutorials
								</p>
								<p className='text-xs text-white/40 mt-1'>
									Tips on getting more books.
								</p>
							</div>
						</Checkbox>
					</label>

					<label className='flex items-start gap-3 cursor-pointer'>
						<Checkbox
							isSelected={notifications.bookResearch}
							onValueChange={() => handleToggle("bookResearch")}
							color='warning'
							classNames={{
								base: "max-w-full",
								wrapper: "bg-gray-700 border-gray-500 mt-0.5",
								label: "text-white flex-1",
							}}
						>
							<div className='flex flex-col'>
								<p className='font-medium text-sm sm:text-base'>
									Book research
								</p>
								<p className='text-xs text-white/40 mt-1'>
									Updates on book research and findings.
								</p>
							</div>
						</Checkbox>
					</label>
				</div>
			</section>
			<section>
				<h3 className='text-base sm:text-lg font-semibold mb-3 text-white/60'>
					Books Notifications
				</h3>
				<p className='text-xs sm:text-sm mb-3 sm:mb-4 text-white/40'>
					These are notifications for when a reader reads your books (both free
					or paid).
				</p>

				<div className='space-y-3 sm:space-y-4'>
					<RadioGroup
						value={notifications.bookNotify}
						onValueChange={handleBookNotifyChange}
						classNames={{
							base: "w-full",
							wrapper: "gap-2 sm:gap-3",
						}}
					>
						{[
							{ id: "none", label: "Do not notify me" },
							{
								id: "all",
								label: "All Books",
								desc: "Notify me for all books read.",
							},
							{
								id: "paid",
								label: "Paid Books",
								desc: "Only notify me if readers read my paid books.",
							},
							{
								id: "free",
								label: "Free only",
								desc: "Only notify me if readers read my free books.",
							},
						].map((opt) => (
							<Radio
								key={opt.id}
								value={opt.id}
								color='warning'
								classNames={{
									base: "max-w-full items-start",
									label: "flex-1",
									wrapper: "mt-0.5",
								}}
							>
								<div className='flex flex-col ml-2'>
									<span className='font-medium text-white text-sm sm:text-base'>
										{opt.label}
									</span>
									{opt.desc && (
										<span className='text-xs text-white/40 mt-1 leading-relaxed'>
											{opt.desc}
										</span>
									)}
								</div>
							</Radio>
						))}
					</RadioGroup>
				</div>
			</section>
		</div>
	);
};

export default NotificationPreferencesContent;
