"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MainButton } from "@/components/button";
import TextInput from "@/components/TextAreaInput/TextInput";
import { Form, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Upload, Camera, X } from "lucide-react";

const CreatorOnboardingSchema = Yup.object().shape({
	creatorName: Yup.string()
		.min(2, "Creator name must be at least 2 characters")
		.required("Creator name is required"),
	bio: Yup.string()
		.max(200, "Bio must be less than 200 characters")
		.required("Bio is required"),
	socialLinks: Yup.object().shape({
		twitter: Yup.string().url("Invalid URL"),
		instagram: Yup.string().url("Invalid URL"),
		website: Yup.string().url("Invalid URL"),
	}),
	experience: Yup.string().required("Please select your experience level"),
	genres: Yup.array().min(1, "Please select at least one genre"),
});

interface CreatorOnboardingFormValues {
	creatorName: string;
	bio: string;
	socialLinks: {
		twitter: string;
		instagram: string;
		website: string;
	};
	experience: string;
	genres: string[];
	profileImage?: File;
	portfolioImages: File[];
}

interface CreatorOnboardingModalProps {
	onClose: () => void;
	onComplete: () => void;
}

const EXPERIENCE_LEVELS = [
	"Beginner - Just starting out",
	"Intermediate - Some published work",
	"Professional - Established creator",
	"Expert - Industry veteran"
];

const GENRE_OPTIONS = [
	"Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
	"Romance", "Sci-Fi", "Thriller", "Mystery", "Slice of Life", "Sports",
	"Supernatural", "Historical", "Mecha", "Shounen", "Shoujo", "Seinen"
];

const CreatorOnboardingModal = ({ onClose, onComplete }: CreatorOnboardingModalProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [profilePreview, setProfilePreview] = useState<string | null>(null);
	const [portfolioPreview, setPortfolioPreview] = useState<string[]>([]);
	const router = useRouter();

	const creatorFormik = useFormik({
		initialValues: {
			creatorName: "",
			bio: "",
			socialLinks: {
				twitter: "",
				instagram: "",
				website: "",
			},
			experience: "",
			genres: [],
			profileImage: undefined,
			portfolioImages: [],
		} as CreatorOnboardingFormValues,
		validationSchema: CreatorOnboardingSchema,
		onSubmit: async (values) => {
			setIsLoading(true);
			try {
				// TODO: Replace with actual creator onboarding API call
				console.log("Creator onboarding values:", values);
				
				// Simulate API call
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				toast.success("Welcome to the Quiva creator community!");
				onComplete();
				router.push("/comic-pad");
			} catch (error) {
				toast.error("Onboarding failed. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
	});

	const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			creatorFormik.setFieldValue("profileImage", file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handlePortfolioImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 0) {
			creatorFormik.setFieldValue("portfolioImages", [...creatorFormik.values.portfolioImages, ...files]);
			
			files.forEach(file => {
				const reader = new FileReader();
				reader.onloadend = () => {
					setPortfolioPreview(prev => [...prev, reader.result as string]);
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const handleGenreToggle = (genre: string) => {
		const currentGenres = creatorFormik.values.genres;
		const newGenres = currentGenres.includes(genre)
			? currentGenres.filter(g => g !== genre)
			: [...currentGenres, genre];
		creatorFormik.setFieldValue("genres", newGenres);
	};

	return (
		<div className="mx-auto px-6 pt-6 pb-8 text-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-bold">Become a Quiva Creator</h2>
					<p className="text-white/70 text-sm mt-1">
						Set up your creator profile and start sharing your amazing stories
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
					<span>Creator Setup</span>
					<span>Step 1 of 1</span>
				</div>
				<div className="w-full bg-white/20 rounded-full h-2">
					<div className="w-full bg-yellow-500 h-2 rounded-full"></div>
				</div>
			</div>

			{/* Onboarding Form */}
			<FormikProvider value={creatorFormik}>
				<Form className="space-y-6">
					{/* Profile Section */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Creator Profile</h3>

						{/* Profile Image */}
						<div className="flex items-start gap-4 mb-4">
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

							<div className="flex-1">
								{/* Creator Name */}
								<TextInput
									id="creatorName"
									label="Creator Name"
									type="text"
									placeholder="Your creator display name"
									className={`w-full px-4 py-3 text-white bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
										creatorFormik.touched.creatorName && creatorFormik.errors.creatorName
											? "border-red-500"
											: "border-white/20"
									}`}
									{...creatorFormik.getFieldProps("creatorName")}
								/>
								{creatorFormik.touched.creatorName && creatorFormik.errors.creatorName && (
									<p className="text-red-400 text-sm mt-1">{creatorFormik.errors.creatorName}</p>
								)}
							</div>
						</div>

						{/* Bio */}
						<div>
							<label className="block text-white text-sm font-medium mb-2">
								Bio
							</label>
							<textarea
								id="bio"
								placeholder="Tell readers about yourself and your creative journey..."
								rows={3}
								className={`w-full px-4 py-3 text-white bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
									creatorFormik.touched.bio && creatorFormik.errors.bio
										? "border-red-500"
										: "border-white/20"
								}`}
								{...creatorFormik.getFieldProps("bio")}
							/>
							<div className="flex justify-between items-center mt-1">
								{creatorFormik.touched.bio && creatorFormik.errors.bio && (
									<p className="text-red-400 text-sm">{creatorFormik.errors.bio}</p>
								)}
								<p className="text-white/60 text-sm ml-auto">
									{creatorFormik.values.bio.length}/200
								</p>
							</div>
						</div>
					</div>

					{/* Experience & Genres */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Creative Background</h3>

						{/* Experience Level */}
						<div className="mb-4">
							<label className="block text-white text-sm font-medium mb-3">
								Experience Level
							</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{EXPERIENCE_LEVELS.map((level) => (
									<label
										key={level}
										className={`flex items-center p-3 border rounded-lg cursor-pointer transition text-sm ${
											creatorFormik.values.experience === level
												? "border-yellow-500 bg-yellow-500/10"
												: "border-white/20 hover:border-yellow-500/50"
										}`}
									>
										<input
											type="radio"
											name="experience"
											value={level}
											checked={creatorFormik.values.experience === level}
											onChange={creatorFormik.handleChange}
											className="hidden"
										/>
										<span className="text-sm">{level}</span>
									</label>
								))}
							</div>
							{creatorFormik.touched.experience && creatorFormik.errors.experience && (
								<p className="text-red-400 text-sm mt-2">{creatorFormik.errors.experience}</p>
							)}
						</div>

						{/* Genres */}
						<div>
							<label className="block text-white text-sm font-medium mb-3">
								Genres You Create (Select all that apply)
							</label>
							<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
								{GENRE_OPTIONS.map((genre) => (
									<button
										key={genre}
										type="button"
										onClick={() => handleGenreToggle(genre)}
										className={`px-3 py-2 text-sm rounded-full border transition ${
											creatorFormik.values.genres.includes(genre)
												? "bg-yellow-500 text-black border-yellow-500"
												: "text-white border-white/20 hover:border-yellow-500"
										}`}
									>
										{genre}
									</button>
								))}
							</div>
							{creatorFormik.touched.genres && creatorFormik.errors.genres && (
								<p className="text-red-400 text-sm mt-2">{creatorFormik.errors.genres}</p>
							)}
						</div>
					</div>

					{/* Social Links - Compact */}
					<div className="bg-white/5 border border-white/10 rounded-lg p-4">
						<h3 className="text-lg font-semibold mb-4">Social Links (Optional)</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<TextInput
								id="socialLinks.twitter"
								label="Twitter"
								type="url"
								placeholder="https://twitter.com/username"
								className="w-full px-4 py-3 text-white bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
								{...creatorFormik.getFieldProps("socialLinks.twitter")}
							/>
							<TextInput
								id="socialLinks.instagram"
								label="Instagram"
								type="url"
								placeholder="https://instagram.com/username"
								className="w-full px-4 py-3 text-white bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
								{...creatorFormik.getFieldProps("socialLinks.instagram")}
							/>
							<TextInput
								id="socialLinks.website"
								label="Website"
								type="url"
								placeholder="https://yourwebsite.com"
								className="w-full px-4 py-3 text-white bg-transparent border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
								{...creatorFormik.getFieldProps("socialLinks.website")}
							/>
						</div>
					</div>

					{/* Submit */}
					<div className="flex justify-between pt-4">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 text-white/70 hover:text-white transition"
						>
							Cancel
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
									Setting up your profile...
								</span>
							) : (
								"Complete Creator Setup"
							)}
						</MainButton>
					</div>
				</Form>
			</FormikProvider>
		</div>
	);
};

export default CreatorOnboardingModal;