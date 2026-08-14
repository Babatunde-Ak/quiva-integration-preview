"use client";
import React, { useState } from "react";
import Image from "next/image";
import { MainButton } from "@/components/button";
import TextInput from "@/components/TextAreaInput/TextInput";
import { Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Camera, X } from "lucide-react";

const UserProfileSchema = Yup.object().shape({
	displayName: Yup.string()
		.min(2, "Display name must be at least 2 characters")
		.required("Display name is required"),
	username: Yup.string()
		.min(3, "Username must be at least 3 characters")
		.matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
		.required("Username is required"),
	bio: Yup.string()
		.max(150, "Bio must be less than 150 characters"),
	interests: Yup.array().min(1, "Please select at least one interest"),
});

interface UserProfileFormValues {
	displayName: string;
	username: string;
	bio: string;
	interests: string[];
	profileImage?: File;
}

interface UserProfileModalProps {
	onClose: () => void;
	onComplete: () => void;
}

const INTEREST_OPTIONS = [
	"Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
	"Romance", "Sci-Fi", "Thriller", "Mystery", "Slice of Life", "Sports",
	"Supernatural", "Historical", "Mecha", "Shounen", "Shoujo", "Seinen"
];

const UserProfileModal = ({ onClose, onComplete }: UserProfileModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [profilePreview, setProfilePreview] = useState<string | null>(null);

	const profileFormik = useFormik({
		initialValues: {
			displayName: "",
			username: "",
			bio: "",
			interests: [],
			profileImage: undefined,
		} as UserProfileFormValues,
		validationSchema: UserProfileSchema,
		onSubmit: async (values) => {
			setIsLoading(true);
			try {
				
				// Simulate API call
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				toast.success("Profile created successfully!");
				onComplete();
			} catch (error) {
				toast.error("Profile creation failed. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
	});

	const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			profileFormik.setFieldValue("profileImage", file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleInterestToggle = (interest: string) => {
		const currentInterests = profileFormik.values.interests;
		const newInterests = currentInterests.includes(interest)
			? currentInterests.filter(i => i !== interest)
			: [...currentInterests, interest];
		profileFormik.setFieldValue("interests", newInterests);
	};

	return (
		<div className="mx-auto px-6 pt-6 pb-8 text-white w-full max-w-2xl max-h-[80vh] overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-bold">Complete Your Profile</h2>
					<p className="text-white/70 text-sm mt-1">
						Tell us about yourself to personalize your Quiva experience
					</p>
				</div>
				<button
					onClick={onClose}
					className="p-2 hover:bg-white/10 rounded-lg transition"
				>
					<X size={20} />
				</button>
			</div>

			{/* Progress Bar */}
			<div className="mb-8">
				<div className="flex items-center justify-between text-sm text-white/70 mb-2">
					<span>Profile Setup</span>
					<span>Step 1 of 1</span>
				</div>
				<div className="w-full bg-white/20 rounded-full h-2">
					<div className="w-full bg-yellow-500 h-2 rounded-full"></div>
				</div>
			</div>

			{/* Form */}
			<FormikProvider value={profileFormik}>
				<Form className="space-y-6">
					{/* Profile Image */}
					<div className="flex items-center gap-6">
						<div className="flex flex-col items-center">
							<div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 border-2 border-white/20 mb-2">
								{profilePreview ? (
									<Image
										src={profilePreview}
										alt="Profile preview"
										width={80}
										height={80}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-white/50">
										<Camera size={20} />
									</div>
								)}
							</div>
							<label className="text-yellow-500 text-sm cursor-pointer hover:text-yellow-400">
								Upload Photo
								<input
									type="file"
									accept="image/*"
									onChange={handleProfileImageChange}
									className="hidden"
								/>
							</label>
						</div>

						<div className="flex-1 space-y-4">
							{/* Display Name */}
							<div>
								<TextInput
									id="displayName"
									label="Display Name"
									type="text"
									placeholder="Your display name"
									className={`w-full px-4 py-3 text-white bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
										profileFormik.touched.displayName && profileFormik.errors.displayName
											? "border-red-500"
											: "border-white/20"
									}`}
									{...profileFormik.getFieldProps("displayName")}
								/>
								{profileFormik.touched.displayName && profileFormik.errors.displayName && (
									<p className="text-red-400 text-sm mt-1">{profileFormik.errors.displayName}</p>
								)}
							</div>

							{/* Username */}
							<div>
								<TextInput
									id="username"
									label="Username"
									type="text"
									placeholder="@username"
									className={`w-full px-4 py-3 text-white bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
										profileFormik.touched.username && profileFormik.errors.username
											? "border-red-500"
											: "border-white/20"
									}`}
									{...profileFormik.getFieldProps("username")}
								/>
								{profileFormik.touched.username && profileFormik.errors.username && (
									<p className="text-red-400 text-sm mt-1">{profileFormik.errors.username}</p>
								)}
							</div>
						</div>
					</div>

					{/* Bio */}
					<div>
						<label className="block text-white text-sm font-medium mb-2">
							Bio (Optional)
						</label>
						<textarea
							id="bio"
							placeholder="Tell others about yourself..."
							rows={3}
							className={`w-full px-4 py-3 text-white bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
								profileFormik.touched.bio && profileFormik.errors.bio
									? "border-red-500"
									: "border-white/20"
							}`}
							{...profileFormik.getFieldProps("bio")}
						/>
						<div className="flex justify-between items-center mt-1">
							{profileFormik.touched.bio && profileFormik.errors.bio && (
								<p className="text-red-400 text-sm">{profileFormik.errors.bio}</p>
							)}
							<p className="text-white/60 text-sm ml-auto">
								{profileFormik.values.bio.length}/150
							</p>
						</div>
					</div>

					{/* Interests */}
					<div>
						<label className="block text-white text-sm font-medium mb-3">
							What genres interest you? (Select all that apply)
						</label>
						<div className="grid grid-cols-3 md:grid-cols-4 gap-2">
							{INTEREST_OPTIONS.map((interest) => (
								<button
									key={interest}
									type="button"
									onClick={() => handleInterestToggle(interest)}
									className={`px-3 py-2 text-sm rounded-full border transition ${
										profileFormik.values.interests.includes(interest)
											? "bg-yellow-500 text-black border-yellow-500"
											: "text-white border-white/20 hover:border-yellow-500"
									}`}
								>
									{interest}
								</button>
							))}
						</div>
						{profileFormik.touched.interests && profileFormik.errors.interests && (
							<p className="text-red-400 text-sm mt-2">{profileFormik.errors.interests}</p>
						)}
					</div>

					{/* Submit */}
					<div className="flex justify-between pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 text-white/70 hover:text-white transition"
						>
							Skip for now
						</button>
						<MainButton
							type="submit"
							className={`px-8 py-3 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Creating profile...
								</span>
							) : (
								"Complete Profile"
							)}
						</MainButton>
					</div>
				</Form>
			</FormikProvider>
		</div>
	);
};

export default UserProfileModal;