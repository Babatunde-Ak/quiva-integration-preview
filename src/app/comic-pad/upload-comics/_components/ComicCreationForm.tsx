import { useState } from "react";
import { X } from "lucide-react";
import OnboardingPage from "./OnboardingPage";
import Picture from "@/components/picture/Index";

interface ExtractedFile {
	name: string;
	blob: Blob;
	preview: string;
	type: 'image' | 'pdf-file' | 'zip-images';
	originalFileName?: string;
	fileSize?: number;
	pageCount?: number;
}

interface ComicCreationFormProps {
	extractedFiles: ExtractedFile[];
}

const genres = [
	"Science Fiction",
	"Fantasy",
	"Romance",
	"Horror",
	"Action & Adventure",
	"Slice of Life",
	"Comedy",
	"Drama",
	"Mystery & Thriller",
	"Historical",
	"Superhero",
	"Sports",
];

export function ComicCreationForm({ extractedFiles }: ComicCreationFormProps) {
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [tagInput, setTagInput] = useState("");
	const [formData, setFormData] = useState({
		title: "",
		description: "",
	});
	const [coverImage, setCoverImage] = useState<File | null>(null);
	const [coverPreview, setCoverPreview] = useState<string | null>(null);
	const [ageRating, setAgeRating] = useState<string>("all-ages");
	const [showOnboarding, setShowOnboarding] = useState(false);

	// Check if we have a PDF file
	const hasPdfFile = extractedFiles.some(file => file.type === 'pdf-file');
	const pdfFile = extractedFiles.find(file => file.type === 'pdf-file');

	const toggleGenre = (genre: string) => {
		if (selectedGenres.includes(genre)) {
			setSelectedGenres(selectedGenres.filter((g) => g !== genre));
		} else if (selectedGenres.length < 3) {
			setSelectedGenres([...selectedGenres, genre]);
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && tagInput.trim()) {
			e.preventDefault();
			if (!tags.includes(tagInput.trim())) {
				setTags([...tags, tagInput.trim()]);
			}
			setTagInput("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter(tag => tag !== tagToRemove));
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setCoverImage(file);
			setCoverPreview(URL.createObjectURL(file));
		}
	};

	const removeCoverImage = () => {
		if (coverPreview) {
			URL.revokeObjectURL(coverPreview);
		}
		setCoverImage(null);
		setCoverPreview(null);
	};

	const handleContinue = () => {
		// Validate required fields
		if (!formData.title.trim()) {
			alert("Please enter a comic title");
			return;
		}
		if (!formData.description.trim()) {
			alert("Please enter a description");
			return;
		}
		if (selectedGenres.length === 0) {
			alert("Please select at least one genre");
			return;
		}

		setShowOnboarding(true);
	};

	// Prepare the form data object to pass to next step
	const getComicData = () => ({
		title: formData.title,
		description: formData.description,
		genre: selectedGenres,
		tags: tags,
		ageRating: ageRating,
		coverImage: coverImage,
		pages: extractedFiles,
		// Add PDF-specific metadata
		sourceType: hasPdfFile ? 'pdf-file' : 'images',
		pdfMetadata: pdfFile ? {
			originalFileName: pdfFile.originalFileName,
			fileSize: pdfFile.fileSize,
			estimatedPageCount: pdfFile.pageCount
		} : undefined
	});

	return (
		<>
			{!showOnboarding && (
				<div className='px-2 py-3 text-white space-y-4 overflow-y-auto max-h-[80vh]'>
					{/* Header */}
					<div className='text-center space-y-1'>
						<p className='text-white/80 text-xs font-medium tracking-widest uppercase mb-2'>
							PUBLISH YOUR COMIC: Step 2 of 4
						</p>
						<h1 className='text-2xl tracking-wider font-bold'>
							Tell the world about your story
						</h1>
						<p className='text-white/50 text-xs leading-relaxed'>
							Help readers discover your comic. The more details, the better!
						</p>
					</div>

					{/* Form Fields */}
					<div className='space-y-4'>
						<input
							type='text'
							placeholder='Comic Title *'
							value={formData.title}
							onChange={(e) => handleInputChange("title", e.target.value)}
							className='w-full rounded-full border border-white/80 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500'
							required
						/>

						<textarea
							placeholder={hasPdfFile ? 'Description * (Describe your comic story - the file will be processed automatically)' : 'Description *'}
							value={formData.description}
							onChange={(e) => handleInputChange("description", e.target.value)}
							className='w-full min-h-[100px] resize-none rounded-md border border-white/80 bg-transparent px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500'
							required
						/>
					</div>

					{/* Genre Selection */}
					<div className='space-y-3'>
						<h3 className='text-base tracking-wider text-white/80 font-bold'>
							Select up to 3 genres *
						</h3>
						<div className='flex items-center flex-wrap gap-2'>
							{genres.map((genre) => (
								<button
									key={genre}
									type='button'
									onClick={() => toggleGenre(genre)}
									className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm transition border ${
										selectedGenres.includes(genre)
											? "bg-primary-500 text-black hover:bg-primary-400"
											: "bg-gray-400 text-white/50 hover:bg-gray-600 border-light-200"
									}`}
								>
									{genre}
									{selectedGenres.includes(genre) && <X className='h-3 w-3' />}
								</button>
							))}
						</div>
					</div>

					{/* Age Rating */}
					<div className='space-y-3'>
						<h3 className='text-base tracking-wider text-white/80 font-bold'>
							Who is this comic for? *
						</h3>
						<div className='flex flex-wrap gap-6'>
							{[
								{ value: "all-ages", label: "All Ages" },
								{ value: "teen", label: "Teen (13+)" },
								{ value: "mature", label: "Mature (18+)" },
							].map(({ value, label }) => (
								<label
									key={value}
									className='flex items-center gap-2 cursor-pointer'
								>
									<input
										type='radio'
										value={value}
										checked={ageRating === value}
										onChange={() => setAgeRating(value)}
										className='accent-primary-500 w-4 h-4'
									/>
									<span className='text-sm tracking-wider text-white'>{label}</span>
								</label>
							))}
						</div>
					</div>

					{/* Tags Input */}
					<div className='space-y-3'>
						<h3 className='text-base tracking-wider text-white/80 font-bold'>
							Tags (optional)
						</h3>
						<div className='space-y-2'>
							<input
								type='text'
								placeholder='Add tags (press Enter)'
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleAddTag}
								className='w-full rounded-full border border-white/80 bg-transparent px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500'
							/>
							{tags.length > 0 && (
								<div className='flex flex-wrap gap-2'>
									{tags.map((tag) => (
										<span
											key={tag}
											className='inline-flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-full text-sm'
										>
											{tag}
											<button
												onClick={() => removeTag(tag)}
												className='hover:text-red-400'
											>
												<X className='h-3 w-3' />
											</button>
										</span>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Cover Art */}
					<div className='space-y-3'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-medium'>Cover Art (optional)</h3>
							<span className='text-xs text-gray-400'>
								{coverImage 
									? 'Custom cover' 
									: hasPdfFile 
										? 'First page will be used' 
										: 'First page will be used'
								}
							</span>
						</div>

						{!coverPreview ? (
							<label className='block border-2 border-dashed border-light-200 bg-gray-400 p-10 rounded-lg text-center cursor-pointer hover:border-primary-500 transition'>
								<input
									type='file'
									accept='image/*'
									onChange={handleFileUpload}
									className='hidden'
								/>
								<div className='text-sm text-white/80 font-medium hover:bg-secondary-200/60 transition-[.3] py-2 px-4 rounded-full border border-light-200 inline-block'>
									Choose cover image
								</div>
							</label>
						) : (
							<div className='relative'>
								<img
									src={coverPreview}
									alt='Cover preview'
									className='w-full max-h-64 rounded-lg object-cover border border-gray-700'
								/>
								<button
									type='button'
									onClick={removeCoverImage}
									className='absolute top-2 right-2 bg-black/70 p-2 rounded-full hover:bg-black/90 transition'
								>
									<X className='h-4 w-4 text-white' />
								</button>
							</div>
						)}
					</div>

					{/* Page Count Info */}
					<div className='bg-white/5 rounded-lg p-3 border border-white/10'>
						{hasPdfFile ? (
							<div className='space-y-1'>
								<p className='text-white/70 text-sm'>
									<span className='font-semibold text-primary-400'>Comic Book</span> will be uploaded as Chapter 1
								</p>
							</div>
						) : (
							<p className='text-white/70 text-sm'>
								<span className='font-semibold text-primary-400'>{extractedFiles.length}</span> page{extractedFiles.length !== 1 ? 's' : ''} will be uploaded as Chapter 1
							</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className='flex gap-3 pt-2'>
						<button 
							type='button'
							className='flex-1 rounded-full border border-light-200 bg-gray-400 py-3 text-white font-medium hover:bg-gray-700 transition'
						>
							Save Draft
						</button>
						<button
							type='button'
							onClick={handleContinue}
							className='flex-1 rounded-full border border-gray-700 bg-secondary-200 py-3 text-gray-300 font-medium hover:bg-secondary-200/80 transition'
						>
							Continue
						</button>
					</div>
				</div>
			)}

			{showOnboarding && (
				<OnboardingPage 
					onclose={() => setShowOnboarding(false)} 
					comicData={getComicData()}
				/>
			)}
		</>
	);
}