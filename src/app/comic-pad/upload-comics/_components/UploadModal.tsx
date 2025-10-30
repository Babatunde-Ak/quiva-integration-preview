"use client";
import React, { useEffect, useState } from "react";
import { X, Pause, Folder, AlertCircle } from "lucide-react";
import JSZip from "jszip";
import { ComicPreviewModal } from "./ComicPreviewModal";
import Picture from "@/components/picture/Index";
import { UploadImage } from "../../../../../public/dev_images";

interface UploadModalProps {
	onClose: () => void;
}

interface ExtractedFile {
	name: string;
	blob: Blob;
	preview: string;
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const UploadModal = ({ onClose }: UploadModalProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [step, setStep] = useState<"upload" | "preview">("upload");
	const [isExtracting, setIsExtracting] = useState(false);
	const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	const validateImageFile = (file: File): boolean => {
		// Check file type
		if (!VALID_IMAGE_TYPES.includes(file.type)) {
			const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
			if (!VALID_EXTENSIONS.includes(ext)) {
				return false;
			}
		}
		
		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			setError(`File "${file.name}" exceeds maximum size of 50MB`);
			return false;
		}
		
		return true;
	};

	const extractZipFile = async (zipFile: File): Promise<ExtractedFile[]> => {
		try {
			setIsExtracting(true);
			setProgress(10);

			const zip = new JSZip();
			const zipContent = await zip.loadAsync(zipFile);
			
			setProgress(30);

			const imageFiles: ExtractedFile[] = [];
			const invalidFiles: string[] = [];

			let processedCount = 0;
			const totalFiles = Object.keys(zipContent.files).length;

			for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
				// Skip directories, hidden files, and system files
				if (
					zipEntry.dir || 
					filename.startsWith('__MACOSX') || 
					filename.startsWith('.') ||
					filename.includes('/.')
				) {
					processedCount++;
					continue;
				}

				const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
				
				if (VALID_EXTENSIONS.includes(ext)) {
					try {
						const blob = await zipEntry.async('blob');
						
						// Verify blob type
						const fileType = blob.type || `image/${ext.substring(1)}`;
						if (!VALID_IMAGE_TYPES.includes(fileType) && !VALID_EXTENSIONS.includes(ext)) {
							invalidFiles.push(filename);
							processedCount++;
							continue;
						}
						
						// Check size
						if (blob.size > MAX_FILE_SIZE) {
							invalidFiles.push(`${filename} (too large)`);
							processedCount++;
							continue;
						}
						
						const previewUrl = URL.createObjectURL(blob);
						
						imageFiles.push({
							name: filename.split('/').pop() || filename,
							blob,
							preview: previewUrl,
						});
					} catch (err) {
						console.error(`Error processing ${filename}:`, err);
						invalidFiles.push(filename);
					}
				}

				processedCount++;
				setProgress(30 + (processedCount / totalFiles) * 60);
			}

			// Sort files by name to maintain order
			imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

			setProgress(100);
			setIsExtracting(false);

			// Show warning if some files were invalid
			if (invalidFiles.length > 0) {
				setError(`${invalidFiles.length} file(s) were skipped (invalid format or too large). ${imageFiles.length} valid images extracted.`);
			}

			return imageFiles;
		} catch (err) {
			console.error("Error extracting ZIP:", err);
			setIsExtracting(false);
			throw new Error("Failed to extract ZIP file. Please ensure it's a valid archive.");
		}
	};

	const processFile = async (selected: File) => {
		setError(null);
		setProgress(0);
		
		if (selected.type.startsWith("image/")) {
			// Validate single image
			if (!validateImageFile(selected)) {
				setError("Invalid image file. Please upload a valid image format (JPEG, PNG, GIF, WebP, SVG) under 50MB.");
				return;
			}
			
			setFile(selected);
			const previewUrl = URL.createObjectURL(selected);
			setPreview(previewUrl);
			setExtractedFiles([{
				name: selected.name,
				blob: selected,
				preview: previewUrl,
			}]);
		} else if (selected.name.toLowerCase().endsWith(".zip")) {
			setFile(selected);
			setPreview(null);
			try {
				const files = await extractZipFile(selected);
				setExtractedFiles(files);
				
				if (files.length === 0) {
					setError("No valid image files found in ZIP archive. Please ensure your ZIP contains image files (JPEG, PNG, GIF, WebP, SVG).");
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to extract ZIP file. Please ensure it's a valid archive.");
				setFile(null);
			}
		} else {
			setError("Invalid file type. Please upload an image or ZIP file.");
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			await processFile(e.target.files[0]);
		}
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (isExtracting) return;

		const droppedFiles = e.dataTransfer.files;
		if (droppedFiles && droppedFiles.length > 0) {
			await processFile(droppedFiles[0]);
		}
	};

	const handleNext = () => {
		if (extractedFiles.length > 0) {
			setStep("preview");
		}
	};

	const handleReset = () => {
		// Cleanup preview URLs
		extractedFiles.forEach(file => {
			URL.revokeObjectURL(file.preview);
		});
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		
		setFile(null);
		setExtractedFiles([]);
		setPreview(null);
		setProgress(0);
		setError(null);
	};

	// Cleanup preview URLs on unmount
	useEffect(() => {
		return () => {
			extractedFiles.forEach(file => {
				URL.revokeObjectURL(file.preview);
			});
			if (preview) {
				URL.revokeObjectURL(preview);
			}
		};
	}, []);

	return (
		<div className='p-6'>
			{step === "upload" && (
				<div>
					<div className='text-white space-y-1 mb-6'>
						<h2 className='text-lg font-semibold'>Comic Upload</h2>
						<p className='tracking-wider text-white/70 text-xs'>
							Upload your comic pages as individual images or a ZIP file
						</p>
					</div>

					<div 
						className={`border-2 border-dashed rounded-xl p-6 flex w-full flex-col items-center justify-center text-center space-y-3 min-h-[200px] transition-colors ${
							isDragging 
								? 'border-secondary-200 bg-secondary-200/10' 
								: 'border-primary-100/40'
						}`}
						onDragEnter={handleDragEnter}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						{!preview && extractedFiles.length === 0 ? (
							<>
								<Picture
									src={UploadImage}
									alt='Upload'
									className='size-10 object-contain'
								/>

								<p className='text-white/80 font-medium tracking-wider'>
									{isDragging ? 'Drop your file here' : 'Drag your file(s) to start uploading'}
								</p>

								<div className='flex items-center my-2 w-48'>
									<div className='flex-[.6] border-t-2 border-white/60'></div>
									<span className='mx-3 text-white/80 text-sm'>OR</span>
									<div className='flex-[.6] border-t-2 border-white/60'></div>
								</div>

								<label className='inline-block border border-secondary-200 text-white/90 hover:bg-secondary-200 hover:text-black-100 rounded-full px-5 py-1.5 cursor-pointer font-semibold transition-[.3]'>
									Browse files
									<input
										type='file'
										accept='.jpg,.jpeg,.png,.svg,.gif,.webp,.zip'
										className='hidden'
										onChange={handleFileChange}
										disabled={isExtracting}
									/>
								</label>
							</>
						) : preview ? (
							<Picture
								src={preview}
								alt='Preview'
								className='rounded-lg max-h-48 mx-auto object-contain'
							/>
						) : extractedFiles.length > 0 ? (
							<div className='w-full space-y-2'>
								<p className='text-white font-medium'>
									{extractedFiles.length} page{extractedFiles.length !== 1 ? 's' : ''} extracted
								</p>
								<div className='grid grid-cols-4 gap-2'>
									{extractedFiles.slice(0, 8).map((file, idx) => (
										<div key={idx} className='aspect-square rounded overflow-hidden'>
											<Picture
												src={file.preview}
												alt={file.name}
												className='w-full h-full object-cover'
											/>
										</div>
									))}
								</div>
								{extractedFiles.length > 8 && (
									<p className='text-white/60 text-sm'>
										+{extractedFiles.length - 8} more page{extractedFiles.length - 8 !== 1 ? 's' : ''}
									</p>
								)}
							</div>
						) : null}
					</div>

					<h4 className='text-white/50 text-xs my-1 tracking-wider'>
						Support: .jpg, .jpeg, .png, .svg, .gif, .webp, and .zip files (max 50MB per file)
					</h4>

					{error && (
						<div className='bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-3 flex items-start gap-2'>
							<AlertCircle className='text-red-400 flex-shrink-0 mt-0.5' size={18} />
							<p className='text-red-400 text-sm'>{error}</p>
						</div>
					)}

					{isExtracting && (
						<div className='bg-black rounded-xl border border-white/20 px-3 py-2 w-full max-w-2xl mt-4'>
							<div className='flex items-center justify-between mb-3'>
								<div>
									<p className='text-white text-sm font-semibold'>
										Extracting ZIP file...
									</p>
									<p className='text-white/80 text-sm'>
										{Math.round(progress)}%
									</p>
								</div>

								<button
									onClick={onClose}
									className='p-1 rounded-full hover:bg-white/10 text-red-500'
								>
									<X size={20} />
								</button>
							</div>

							<div className='h-3 rounded-full bg-white/10 overflow-hidden'>
								<div
									className='h-3 bg-orange-400 transition-all duration-300'
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}

					{!isExtracting && file && extractedFiles.length > 0 && (
						<div className='bg-black rounded-xl border border-white/20 p-5 w-full max-w-2xl flex items-center justify-between mt-4'>
							<div className='flex items-center gap-3'>
								<div className='relative'>
									<div className='bg-yellow-400 rounded p-2'>
										<Folder size={28} className='text-black' />
									</div>
									{file.name.toLowerCase().endsWith('.zip') && (
										<span className='absolute -bottom-1 -right-1 bg-blue-500 text-[10px] text-white px-1 py-[1px] rounded'>
											ZIP
										</span>
									)}
								</div>

								<div>
									<p className='text-white font-medium'>{file.name}</p>
									<p className='text-white/60 text-sm'>
										{(file.size / (1024 * 1024)).toFixed(2)} MB • {extractedFiles.length} page{extractedFiles.length !== 1 ? 's' : ''}
									</p>
								</div>
							</div>

							<button
								onClick={handleReset}
								className='p-1 rounded-full hover:bg-white/10 text-white'
							>
								<X size={20} />
							</button>
						</div>
					)}

					<div className='mt-3 flex flex-col gap-3'>
						<button
							disabled={extractedFiles.length === 0 || isExtracting}
							onClick={handleNext}
							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
						>
							{extractedFiles.length > 0 ? `Continue with ${extractedFiles.length} page${extractedFiles.length !== 1 ? 's' : ''}` : 'Next'}
						</button>
						<button
							onClick={onClose}
							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition'
						>
							Cancel
						</button>
					</div>
				</div>
			)}

			{step === "preview" && (
				<ComicPreviewModal
					isOpen={true}
					onClose={onClose}
					onBackToEditor={() => setStep("upload")}
					extractedFiles={extractedFiles}
				/>
			)}
		</div>
	);
};

export default UploadModal;