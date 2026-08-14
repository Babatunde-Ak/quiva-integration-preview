"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { MainButton } from "@/components/button";

import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { updateUserProfile } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

interface ProfilePictureData {
	username?: string;
	profileImage?: File;
	profilePreview?: string;
	bannerImage?: File;
	bannerPreview?: string;
	bio?: string;
}

type Props = {
	onNext: () => void;
	userData?: ProfilePictureData;
	onBack: () => void;
	onClose?: () => void;
	totalSteps?: number;
	currentStep?: number;
	initialData?: any | null;
};

const Step5CompletionModal = ({
	onNext,
	onBack,
	onClose,
	totalSteps = 5,
	currentStep = 5,
	initialData = {},
}: Props) => {
	const { profile } = useAppSelector((state: any) => state.auth);
	const [username, setUsername] = useState(profile?.data?.displayName || "");
	const [profilePreview, setProfilePreview] = useState<string | null>(
		profile?.data?.avatar || null,
	);
	const [bannerPreview, setBannerPreview] = useState<string | null>(
		profile?.data?.banner || null,
	);
	const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
		initialData?.profileImage || null,
	);
	const [selectedBannerFile, setSelectedBannerFile] = useState<File | null>(
		initialData?.bannerImage || null,
	);
	const [bio, setBio] = useState(profile?.data?.bio || "");
	const [showSuccess, setShowSuccess] = useState(false);

	const profileFileInputRef = useRef<HTMLInputElement>(null);
	const bannerFileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const { user } = useAppSelector((state: any) => state.wallet);
	const { updateProfile } = useAppSelector((state: any) => state.auth);
	const isLoading = updateProfile?.isLoading || false;
	const error = updateProfile?.error || null;
	const success = updateProfile?.success || false;
	const dispatch = useAppDispatch();

	// Show success message when profile updates successfully
	useEffect(() => {
		if (success && !isLoading) {
			setShowSuccess(true);
			// Auto-hide success message after 3 seconds
			const timer = setTimeout(() => {
				setShowSuccess(false);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [success, isLoading]);

	// Clear success message when user starts editing
	const handleInputChange = () => {
		if (showSuccess) {
			setShowSuccess(false);
		}
	};

	const handleProfileFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		handleInputChange();
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
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
		handleInputChange();
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
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

	const handleSave = async () => {
		if (!user?._id) {
			alert("User ID not found. Please log in again.");
			router.push("/marketplace");
			return;
		}

		const formData = new FormData();
		formData.append("id", user._id);

		if (username) {
			formData.append("displayName", username);
		}

		if (selectedProfileFile) {
			formData.append("avatar", selectedProfileFile);
		}

		if (selectedBannerFile) {
			formData.append("banner", selectedBannerFile);
		}

		if (bio) {
			formData.append("bio", bio);
		}

		try {
			await dispatch(updateUserProfile(formData as any)).unwrap();
		} catch (err) {
			console.error("Failed to update profile:", err);
		}
	};

	const handleNext = async () => {
		// await handleSave();
		onNext();
	};

	return (
		<div className='w-full max-w-2xl mx-auto px-8 py-10 bg-gradient-to-b from-zinc-900 to-black rounded-3xl text-white relative'>
			{/* Close Button */}
			{onClose && (
				<button
					onClick={onClose}
					className='absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors'
				>
					<X size={24} />
				</button>
			)}

			{/* Title */}
			<h1 className='text-xl sm:text-2xl font-semibold mb-2 tracking-tight text-white text-center'>
				Let&apos;s personalize your profile
			</h1>

			{/* Description */}
			<p className='text-white/30 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto font-light text-center'>
				Fill out the profile info below to make it yours. You can always edit
				this later in Account Settingss or by clicking the &quot;Edit Profile&quot; button
				on your profile page.
			</p>

			{/* Success Message */}
			{showSuccess && !error && (
				<div className='mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center animate-in fade-in duration-300'>
					Profile saved successfully!
				</div>
			)}

			{/* Error Message */}
			{error && (
				<div className='mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center'>
					{error}
				</div>
			)}

			{/* Username Input */}
			<div className='mb-6'>
				<label className='block text-sm font-medium mb-2 text-white'>
					Username
				</label>
				<div className='flex flex-col sm:flex-row gap-3'>
					<input
						type='text'
						placeholder='Enter your username'
						value={username}
						onChange={(e) => {
							setUsername(e.target.value);
							handleInputChange();
						}}
						disabled={isLoading}
						className='flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500 focus:bg-zinc-800 transition text-white placeholder:text-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed'
					/>
				</div>
			</div>

			{/* Profile Picture and Banner Image */}
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6'>
				{/* Profile Picture */}
				<div>
					<label className='block text-sm font-medium mb-2 text-white text-center'>
						Profile Picture
					</label>
					<div
						onClick={() => !isLoading && profileFileInputRef.current?.click()}
						className={`relative w-32 h-32 mx-auto bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-full flex items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800 transition group ${
							isLoading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{profilePreview ? (
							<img
								src={profilePreview}
								alt='Profile Preview'
								className='w-full h-full object-cover rounded-full'
							/>
						) : (
							<div className='text-center text-zinc-500 group-hover:text-amber-500'>
								<Camera size={24} className='mx-auto mb-1' />
							</div>
						)}
					</div>
					<input
						ref={profileFileInputRef}
						type='file'
						accept='image/*'
						onChange={handleProfileFileSelect}
						disabled={isLoading}
						className='hidden'
					/>
				</div>

				{/* Banner Image */}
				<div>
					<label className='block text-sm font-medium mb-2 text-white text-center'>
						Banner Image
					</label>
					<div
						onClick={() => !isLoading && bannerFileInputRef.current?.click()}
						className={`relative w-full h-32 bg-zinc-800/50 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800 transition group ${
							isLoading ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{bannerPreview ? (
							<img
								src={bannerPreview}
								alt='Banner Preview'
								className='w-full h-full object-cover rounded-lg'
							/>
						) : (
							<div className='text-center text-zinc-500 group-hover:text-amber-500'>
								<Upload size={24} className='mx-auto mb-1' />
							</div>
						)}
					</div>
					<input
						ref={bannerFileInputRef}
						type='file'
						accept='image/*'
						onChange={handleBannerFileSelect}
						disabled={isLoading}
						className='hidden'
					/>
				</div>
			</div>

			{/* Bio Input */}
			<div className='mb-8'>
				<label className='block text-sm font-medium mb-2 text-white'>Bio</label>
				<textarea
					value={bio}
					onChange={(e) => {
						setBio(e.target.value);
						handleInputChange();
					}}
					placeholder='Say something.....'
					rows={4}
					disabled={isLoading}
					className='w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:bg-zinc-800 transition resize-none disabled:opacity-50 disabled:cursor-not-allowed'
					maxLength={150}
				/>
				<p className='text-zinc-500 text-xs mt-1'>
					{bio.length}/150 characters
				</p>
			</div>

			{/* Bottom Action Buttons */}
			<div className='flex gap-3 mb-8'>
				<button
					onClick={onBack}
					disabled={isLoading}
					className='flex-1 py-3 px-6 bg-transparent hover:bg-zinc-800 text-white font-medium rounded-lg border-2 border-white hover:border-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Cancel
				</button>
				<MainButton
					onClick={handleSave}
					disabled={isLoading}
					className='flex-1 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isLoading ? "Saving..." : "Save"}
				</MainButton>
			</div>

			{/* Step Indicator Dots */}
			<div className='flex justify-center gap-2 mb-6'>
				{Array.from({ length: totalSteps }).map((_, i) => (
					<div
						key={i}
						className={`h-1 rounded-full transition-all duration-300 ${
							i + 1 === currentStep ? "w-8 bg-amber-500" : "w-1 bg-zinc-700"
						}`}
					/>
				))}
			</div>

			{/* Navigation Buttons */}
			<div className='flex flex-col items-center gap-4'>
				<button
					onClick={onBack}
					disabled={isLoading}
					className='w-full max-w-lg py-4 px-8 bg-transparent hover:bg-zinc-800 text-white font-semibold text-base rounded-full border-2 border-white hover:border-white/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					Skip for now
				</button>

				<MainButton
					onClick={handleNext}
					disabled={isLoading}
					className='w-full max-w-lg py-4 px-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base rounded-full transition-all duration-200 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isLoading ? "Saving..." : "Next"}
				</MainButton>
			</div>
		</div>
	);
};

export default Step5CompletionModal;
