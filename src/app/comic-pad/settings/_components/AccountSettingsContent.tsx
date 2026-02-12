"use client";
import Picture from "@/components/picture/Index";
import React, { useState } from "react";
import { GrGallery } from "react-icons/gr";

const AccountSettingsContent = () => {
	const [formData, setFormData] = useState({
		fullName: "",
		gender: "",
		email: "",
		twitter: "",
		instagram: "",
		discord: "",
		profilePic: null as File | null,
		coverImage: null as File | null,
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: string,
	) => {
		const file = e.target.files?.[0] || null;
		setFormData((prev) => ({ ...prev, [field]: file }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
	};

	const handleReset = () => {
		setFormData({
			fullName: "",
			gender: "",
			email: "",
			twitter: "",
			instagram: "",
			discord: "",
			profilePic: null,
			coverImage: null,
		});
	};

	return (
		<div className='mt-4 sm:mt-6 md:mt-8 p-4 sm:p-5 md:p-6 ml:pl-0'>
			<h2 className='text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white/60'>
				Edit Profile
			</h2>
			<form
				onSubmit={handleSubmit}
				className='space-y-4 sm:space-y-6 text-white/60'
			>
				<div className='grid grid-cols-1 gap-4 sm:gap-6'>
					<div className='space-y-2'>
						<label className='block text-sm font-medium text-white/50'>
							Your Profile Picture
						</label>
						<div className='relative w-24 h-24 sm:w-32 sm:h-32 border-2 group border-dashed hover:border-primary-100/30 border-white/60 rounded-lg bg-transparent flex items-center justify-center'>
							<input
								type='file'
								name='profilePic'
								onChange={(e) => handleFileChange(e, "profilePic")}
								className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
								accept='image/*'
							/>
							<div className='text-center flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-6'>
								<GrGallery className='text-white/60 text-xl sm:text-2xl group-hover:text-primary-100 transition-[.3]' />
								<p className='text-[10px] sm:text-xxs text-white/60 group-hover:text-primary-100 transition-[.3]'>
									Upload photo
								</p>
							</div>
							{formData.profilePic && (
								<Picture
									src={URL.createObjectURL(formData.profilePic)}
									alt='Preview'
									className='object-cover rounded-lg'
								/>
							)}
						</div>
					</div>
				</div>

				<hr className='border-white/50' />

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							Full name
						</label>
						<input
							type='text'
							name='fullName'
							value={formData.fullName}
							onChange={handleInputChange}
							placeholder='Please enter your full name'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							Gender
						</label>
						<input
							type='text'
							name='gender'
							value={formData.gender}
							onChange={handleInputChange}
							placeholder='Please gender here'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							Email
						</label>
						<input
							type='email'
							name='email'
							value={formData.email}
							onChange={handleInputChange}
							placeholder='Please enter your email'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							X (Twitter)
						</label>
						<input
							type='text'
							name='twitter'
							value={formData.twitter}
							onChange={handleInputChange}
							placeholder='Please enter your X'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							Instagram
						</label>
						<input
							type='text'
							name='instagram'
							value={formData.instagram}
							onChange={handleInputChange}
							placeholder='Please enter your Instagram username'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>

					<div className='space-y-2'>
						<label className='block text-sm font-medium mb-1 text-white/50'>
							Discord Address
						</label>
						<input
							type='text'
							name='discord'
							value={formData.discord}
							onChange={handleInputChange}
							placeholder='Please enter your Discord address'
							className='w-full px-3 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 focus:outline-none focus:ring-primary-100 focus:border-primary-100 border-white/60 text-white/60 text-sm sm:text-base'
						/>
					</div>
				</div>
				<div className='space-y-2'>
					<label className='block text-sm font-medium text-white/50'>
						Cover Image
					</label>
					<div className='relative group w-full h-32 sm:h-40 md:h-48 border-2 border-dashed hover:border-primary-100/30 border-white/60 text-white/60 rounded-lg flex items-center justify-center bg-transparent'>
						<input
							type='file'
							name='coverImage'
							onChange={(e) => handleFileChange(e, "coverImage")}
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							accept='image/*'
						/>
						<div className='text-center flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-6'>
							<GrGallery className='text-white/60 text-xl sm:text-2xl group-hover:text-primary-100 transition-[.3]' />
							<p className='text-[10px] sm:text-xxs text-white/60 group-hover:text-primary-100 transition-[.3]'>
								Upload cover image
							</p>
						</div>
						{formData.coverImage && (
							<Picture
								src={URL.createObjectURL(formData.coverImage)}
								alt='Cover Preview'
								className='object-cover rounded-lg'
							/>
						)}
					</div>
				</div>

				<div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4'>
					<button
						type='submit'
						className='w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-secondary-1200 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-200 hover:text-black-100 transition-[.4]'
					>
						Update Profile
					</button>
					<button
						type='button'
						onClick={handleReset}
						className='w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 border bg-transparent rounded-md shadow-sm placeholder:text-white/20 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:text-black-100 border-gray-600 bg-gray-700 text-white/60 transition-[.4]'
					>
						Reset
					</button>
				</div>
			</form>
		</div>
	);
};

export default AccountSettingsContent;
