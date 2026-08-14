"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload } from "lucide-react";
import { OrangeButton } from "@/components/button";

interface ProfilePictureData {
	username?: string;
	profileImage?: File;
	profilePreview?: string;
	bannerImage?: File;
	bannerPreview?: string;
	bio?: string;
}

type Props = {
	onNext: (data: ProfilePictureData) => void;
	onBack: () => void;
	totalSteps?: number;
	currentStep?: number;
	initialData?: ProfilePictureData;
};

const Step3ProfilePictureModal = ({
	onNext,
	onBack,
	totalSteps = 5,
	currentStep = 3,
	initialData = {},
}: Props) => {
	const [username, setUsername] = useState(initialData.username || "");
	const [profilePreview, setProfilePreview] = useState<string | null>(
		initialData.profilePreview || null,
	);
	const [bannerPreview, setBannerPreview] = useState<string | null>(
		initialData.bannerPreview || null,
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		initialData.profileImage || null,
	);
	const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
		initialData.bannerImage || null,
	);
	const [bio, setBio] = useState(initialData.bio || "");

	const profileFileInputRef = useRef<HTMLInputElement>(null);
	const bannerFileInputRef = useRef<HTMLInputElement>(null);

	const handleProfileFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				alert("File size must be less than 5MB");
				return;
			}
			setSelectedProfileFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setProfilePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleBannerFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				alert("File size must be less than 5MB");
				return;
			}
			setSelectedBannerFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setBannerPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSaveProfile = () => {
		// Save current progress
		console.log("Saving profile data:", {
			username,
			profileImage: selectedProfileFile,
			bannerImage: selectedBannerFile,
			bio,
		});
	};

	const handleNext = () => {
		onNext({
			username,
			profileImage: selectedProfileFile || undefined,
			profilePreview: profilePreview || undefined,
			bannerImage: selectedBannerFile || undefined,
			bannerPreview: bannerPreview || undefined,
			bio,
		});
	};

	return (
		<div className='max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white'>
			{/* Step Dots */}
			<div className='flex justify-center gap-2 mb-8'>
				{Array.from({ length: totalSteps }).map((_, i) => (
					<div
						key={i}
						className={`w-3 h-3 rounded-full transition ${
							i + 1 === currentStep
								? "bg-secondary-300"
								: i + 1 < currentStep
								? "bg-secondary-300/60"
								: "bg-white/40"
						}`}
					></div>
				))}
			</div>

			{/* Title */}
			<h3 className='text-2xl sm:text-3xl font-bold mb-4 text-center'>
				Let&apos;s Personalize Your Profile
			</h3>

			{/* Progress Image */}
			<div className='flex justify-center mb-6'>
				<Image
					src='/dev_images/mobile-progress-3.png'
					alt='Personalize Profile'
					width={300}
					height={300}
					className='rounded-2xl w-full max-w-md h-auto'
				/>
			</div>

			{/* Description */}
			<p className='text-white/70 text-base sm:text-lg leading-relaxed mb-8 text-center max-w-2xl mx-auto'>
				Fill out the profile info below to make it yours. You can always edit
				this later in Account Settingss or by clicking the &quot;Edit
				Profile&quot; button on your profile page.
			</p>

			<div className='space-y-8'>
				{/* 1. Username Input with Back and Save buttons */}
				<div className='flex flex-col sm:flex-row items-center gap-4'>
					<div className='flex-1'>
						<label className='block text-sm font-medium mb-2'>Username</label>
						<input
							id='username'
							type='text'
							placeholder='Enter your username'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 focus:bg-white/10 transition text-white placeholder:text-white/50'
						/>
					</div>
					<div className='flex gap-3 mt-6 sm:mt-0'>
						<button
							onClick={onBack}
							className='px-8 py-3 bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-lg border border-white/20 transition'
						>
							Back
						</button>
						<OrangeButton onClick={handleSaveProfile} className='px-8 py-3'>
							Save
						</OrangeButton>
					</div>
				</div>

				{/* 4. Profile Picture and Banner Image */}
				<div className='flex flex-col sm:flex-row gap-6'>
					{/* Profile Picture */}
					<div className='flex-1'>
						<label className='block text-sm font-medium mb-2'>
							Profile Picture
						</label>
						<div
							onClick={() => profileFileInputRef.current?.click()}
							className='relative w-32 h-32 mx-auto bg-white/5 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition group'
						>
							{profilePreview ? (
								<Image
									src={profilePreview}
									alt='Profile Preview'
									width={128}
									height={128}
									className='w-full h-full object-cover rounded-full'
								/>
							) : (
								<div className='text-center text-white/50 group-hover:text-orange-500'>
									<Camera size={24} className='mx-auto mb-1' />
									<span className='text-xs'>Upload</span>
								</div>
							)}
						</div>
						<input
							ref={profileFileInputRef}
							type='file'
							accept='image/*'
							onChange={handleProfileFileSelect}
							className='hidden'
						/>
					</div>

					{/* Banner Image */}
					<div className='flex-1'>
						<label className='block text-sm font-medium mb-2'>
							Banner Image
						</label>
						<div
							onClick={() => bannerFileInputRef.current?.click()}
							className='relative w-full h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition group'
						>
							{bannerPreview ? (
								<Image
									src={bannerPreview}
									alt='Banner Preview'
									width={300}
									height={128}
									className='w-full h-full object-cover rounded-lg'
								/>
							) : (
								<div className='text-center text-white/50 group-hover:text-orange-500'>
									<Upload size={24} className='mx-auto mb-1' />
									<span className='text-xs'>Banner Image</span>
								</div>
							)}
						</div>
						<input
							ref={bannerFileInputRef}
							type='file'
							accept='image/*'
							onChange={handleBannerFileSelect}
							className='hidden'
						/>
					</div>
				</div>

				{/* 5. Bio Input Box */}
				<div>
					<label className='block text-sm font-medium mb-2'>Bio</label>
					<textarea
						value={bio}
						onChange={(e) => setBio(e.target.value)}
						placeholder='Tell us about yourself...'
						rows={4}
						className='w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition resize-none'
						maxLength={150}
					/>
					<p className='text-white/50 text-xs mt-1'>
						{bio.length}/150 characters
					</p>
				</div>

				{/* 6. Save and Back buttons */}
				<div className='flex justify-center gap-4'>
					<button
						onClick={onBack}
						className='px-8 py-3 bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-lg border border-white/20 transition'
					>
						Back
					</button>
					<OrangeButton onClick={handleSaveProfile} className='px-8 py-3'>
						Save
					</OrangeButton>
				</div>

				{/* 7. Final Navigation Buttons */}
				<div className='flex justify-center gap-4 pt-6 border-t border-white/10'>
					<button
						onClick={onBack}
						className='px-8 py-3 bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-lg border border-white/20 transition'
					>
						Back
					</button>
					<OrangeButton onClick={handleNext} className='px-8 py-3'>
						Next
					</OrangeButton>
				</div>
			</div>
		</div>
	);
};

export default Step3ProfilePictureModal;
