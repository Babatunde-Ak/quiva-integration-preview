// "use client";
// import React, { useEffect, useState } from "react";
// import { X, Folder, AlertCircle, FileText, Eye } from "lucide-react";
//  import JSZip from "jszip";
// import { ComicPreviewModal } from "./ComicPreviewModal";
// import Picture from "@/components/picture/Index";
// import { UploadImage } from "../../../../../public/dev_images";

// interface UploadModalProps {
// 	onClose: () => void;
// }

// interface ExtractedFile {
// 	name: string;
// 	blob: Blob;
// 	preview: string;
// 	type: 'image' | 'pdf-file' | 'zip-images';
// 	originalFileName?: string;
// 	fileSize?: number;
// 	pageCount?: number; // For PDFs, we can estimate or get from metadata
// }

// const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];
// const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp', '.zip'];
// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
// const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB for PDFs

// const UploadModal = ({ onClose }: UploadModalProps) => {
// 	const [file, setFile] = useState<File | null>(null);
// 	const [preview, setPreview] = useState<string | null>(null);
// 	const [step, setStep] = useState<"upload" | "preview">("upload");
// 	const [isExtracting, setIsExtracting] = useState(false);
// 	const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
// 	const [error, setError] = useState<string | null>(null);
// 	const [progress, setProgress] = useState(0);
// 	const [isDragging, setIsDragging] = useState(false);
// 	const [processingStatus, setProcessingStatus] = useState<string>("");

// 	const validateImageFile = (file: File): boolean => {
// 		// Check file type
// 		if (!VALID_IMAGE_TYPES.includes(file.type)) {
// 			const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
// 			if (!VALID_EXTENSIONS.includes(ext) || ext === '.zip') {
// 				return false;
// 			}
// 		}
		
// 		// Check file size
// 		if (file.size > MAX_FILE_SIZE) {
// 			setError(`File "${file.name}" exceeds maximum size of 50MB`);
// 			return false;
// 		}
		
// 		return true;
// 	};

// 	const validateZipFile = (file: File): boolean => {
// 		if (file.size > MAX_PDF_SIZE) {
// 			setError(`ZIP file "${file.name}" exceeds maximum size of 100MB`);
// 			return false;
// 		}
// 		if (file.size < 1024) {
// 			setError("ZIP file appears to be corrupted or empty");
// 			return false;
// 		}
// 		return true;
// 	};

// 	const validatePdfFile = (file: File): boolean => {
// 		if (file.size > MAX_PDF_SIZE) {
// 			setError(`PDF file "${file.name}" exceeds maximum size of 100MB`);
// 			return false;
// 		}
// 		if (file.size < 1024) {
// 			setError("Comic file appears to be corrupted or empty");
// 			return false;
// 		}
// 		return true;
// 	};

// 	// Estimate PDF page count from file size (rough approximation)
// 	const estimatePdfPageCount = (fileSize: number): number => {
// 		// Average PDF page is roughly 100KB-500KB
// 		// This is just an estimate for UI display
// 		const avgPageSize = 200 * 1024; // 200KB average
// 		return Math.max(1, Math.round(fileSize / avgPageSize));
// 	};

// 	// Handle PDF file as a single file (no conversion)
// 	const processPdfFile = async (pdfFile: File): Promise<ExtractedFile[]> => {
// 		setProcessingStatus("Processing comic file...");
// 		setProgress(50);

// 		// Create a preview placeholder for PDF
// 		const canvas = document.createElement('canvas');
// 		canvas.width = 400;
// 		canvas.height = 300;
// 		const ctx = canvas.getContext('2d')!;
		
// 		// Create comic preview placeholder
// 		ctx.fillStyle = '#f8f9fa';
// 		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
// 		// Add comic icon and info
// 		ctx.fillStyle = '#28a745';
// 		ctx.font = 'bold 24px Arial';
// 		ctx.textAlign = 'center';
// 		ctx.fillText('📚 COMIC BOOK', canvas.width / 2, canvas.height / 2 - 40);
		
// 		ctx.fillStyle = '#6c757d';
// 		ctx.font = '16px Arial';
// 		ctx.fillText(pdfFile.name, canvas.width / 2, canvas.height / 2);
// 		ctx.fillText(`${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`, canvas.width / 2, canvas.height / 2 + 25);
		
// 		const estimatedPages = estimatePdfPageCount(pdfFile.size);
// 		ctx.fillText(`~${estimatedPages} pages`, canvas.width / 2, canvas.height / 2 + 50);

// 		const previewBlob = await new Promise<Blob>(resolve => {
// 			canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8);
// 		});

// 		const previewUrl = URL.createObjectURL(previewBlob);

// 		setProgress(100);
// 		setProcessingStatus("Comic ready for upload!");

// 		return [{
// 			name: pdfFile.name,
// 			blob: pdfFile, // Keep original PDF file
// 			preview: previewUrl,
// 			type: 'pdf-file',
// 			originalFileName: pdfFile.name,
// 			fileSize: pdfFile.size,
// 			pageCount: estimatedPages
// 		}];
// 	};

// 	const extractZipFile = async (zipFile: File): Promise<ExtractedFile[]> => {
// 		try {
// 			setIsExtracting(true);
// 			setProcessingStatus("Extracting ZIP file...");
// 			setProgress(10);

// 			const zip = new JSZip();
// 			const zipContent = await zip.loadAsync(zipFile);
			
// 			setProgress(30);

// 			const extractedFiles: ExtractedFile[] = [];
// 			const invalidFiles: string[] = [];

// 			let processedCount = 0;
// 			const totalFiles = Object.keys(zipContent.files).length;

// 			for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
// 				// Skip directories, hidden files, and system files
// 				if (
// 					zipEntry.dir || 
// 					filename.startsWith('__MACOSX') || 
// 					filename.startsWith('.') ||
// 					filename.includes('/.')
// 				) {
// 					processedCount++;
// 					continue;
// 				}

// 				const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
				
// 				// Handle image files
// 				if (VALID_EXTENSIONS.includes(ext) && ext !== '.zip') {
// 					try {
// 						const blob = await zipEntry.async('blob');
						
// 						// Verify blob type
// 						const fileType = blob.type || `image/${ext.substring(1)}`;
// 						if (!VALID_IMAGE_TYPES.includes(fileType) && !VALID_EXTENSIONS.includes(ext)) {
// 							invalidFiles.push(filename);
// 							processedCount++;
// 							continue;
// 						}
						
// 						// Check size
// 						if (blob.size > MAX_FILE_SIZE) {
// 							invalidFiles.push(`${filename} (too large)`);
// 							processedCount++;
// 							continue;
// 						}
						
// 						const previewUrl = URL.createObjectURL(blob);
						
// 						extractedFiles.push({
// 							name: filename.split('/').pop() || filename,
// 							blob,
// 							preview: previewUrl,
// 							type: 'image',
// 							fileSize: blob.size
// 						});
// 						console.log(`📷 Extracted image: ${filename}`);
// 					} catch (err) {
// 						console.error(`Error processing image ${filename}:`, err);
// 						invalidFiles.push(filename);
// 					}
// 				}
// 				// Handle PDF files inside ZIP
// 				else if (ext === '.pdf') {
// 					try {
// 						const blob = await zipEntry.async('blob');
						
// 						// Check size for PDF
// 						if (blob.size > MAX_PDF_SIZE) {
// 							invalidFiles.push(`${filename} (PDF too large)`);
// 							processedCount++;
// 							continue;
// 						}
						
// 						// Create a preview placeholder for PDF
// 						const canvas = document.createElement('canvas');
// 						canvas.width = 400;
// 						canvas.height = 300;
// 						const ctx = canvas.getContext('2d')!;
						
// 						ctx.fillStyle = '#f8f9fa';
// 						ctx.fillRect(0, 0, canvas.width, canvas.height);
// 						ctx.fillStyle = '#28a745';
// 						ctx.font = 'bold 24px Arial';
// 						ctx.textAlign = 'center';
// 						ctx.fillText('📚 PDF FILE', canvas.width / 2, canvas.height / 2 - 20);
// 						ctx.fillStyle = '#6c757d';
// 						ctx.font = '14px Arial';
// 						const displayName = filename.split('/').pop() || filename;
// 						ctx.fillText(displayName, canvas.width / 2, canvas.height / 2 + 10);
// 						ctx.fillText(`${(blob.size / (1024 * 1024)).toFixed(1)} MB`, canvas.width / 2, canvas.height / 2 + 35);

// 						const previewBlob = await new Promise<Blob>(resolve => {
// 							canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.8);
// 						});
// 						const previewUrl = URL.createObjectURL(previewBlob);
						
// 						// Create a File from the blob
// 						const pdfFile = new File([blob], displayName, { type: 'application/pdf' });
						
// 						extractedFiles.push({
// 							name: displayName,
// 							blob: pdfFile,
// 							preview: previewUrl,
// 							type: 'pdf-file',
// 							originalFileName: displayName,
// 							fileSize: blob.size,
// 							pageCount: estimatePdfPageCount(blob.size)
// 						});
// 						console.log(`📄 Extracted PDF: ${filename}`);
// 					} catch (err) {
// 						console.error(`Error processing PDF ${filename}:`, err);
// 						invalidFiles.push(filename);
// 					}
// 				}

// 				processedCount++;
// 				setProgress(30 + (processedCount / totalFiles) * 60);
// 				setProcessingStatus(`Processing file ${processedCount} of ${totalFiles}...`);
// 			}

// 			// Sort image files by name to maintain order (keep PDFs at their original position)
// 			const imageFiles = extractedFiles.filter(f => f.type === 'image');
// 			const pdfFiles = extractedFiles.filter(f => f.type === 'pdf-file');
			
// 			imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
			
// 			// Combine: images first (sorted), then PDFs
// 			const sortedFiles = [...imageFiles, ...pdfFiles];

// 			setProgress(100);
// 			setProcessingStatus("Extraction completed!");
// 			setIsExtracting(false);

// 			// Show info about extracted files
// 			const imageCount = imageFiles.length;
// 			const pdfCount = pdfFiles.length;
// 			if (invalidFiles.length > 0) {
// 				setError(`${invalidFiles.length} file(s) were skipped. Extracted: ${imageCount} image(s), ${pdfCount} PDF(s).`);
// 			} else if (pdfCount > 0) {
// 				console.log(`✅ Extracted ${imageCount} image(s) and ${pdfCount} PDF(s) from ZIP`);
// 			}

// 			return sortedFiles;
// 		} catch (err) {
// 			console.error("Error extracting ZIP:", err);
// 			setIsExtracting(false);
// 			throw new Error("Failed to extract ZIP file. Please ensure it's a valid archive.");
// 		}
// 	};

// 	const processFile = async (selected: File) => {
// 		setError(null);
// 		setProgress(0);
// 		setProcessingStatus("");
		
// 		if (selected.type.startsWith("image/")) {
// 			// Validate single image
// 			if (!validateImageFile(selected)) {
// 				setError("Invalid image file. Please upload a valid image format (JPEG, PNG, GIF, WebP, SVG) under 50MB.");
// 				return;
// 			}
			
// 			setFile(selected);
// 			const previewUrl = URL.createObjectURL(selected);
// 			setPreview(previewUrl);
// 			setExtractedFiles([{
// 				name: selected.name,
// 				blob: selected,
// 				preview: previewUrl,
// 				type: 'image',
// 				fileSize: selected.size
// 			}]);
// 		} else if (selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf")) {
// 			// Validate PDF
// 			if (!validatePdfFile(selected)) {
// 				return;
// 			}
			
// 			setFile(selected);
// 			setPreview(null);
// 			setIsExtracting(true);
			
// 			try {
// 				const pdfFile = await processPdfFile(selected);
// 				setExtractedFiles(pdfFile);
// 				setIsExtracting(false);
// 			} catch (err) {
// 				setError(err instanceof Error ? err.message : "Failed to process PDF file.");
// 				setFile(null);
// 				setIsExtracting(false);
// 			}
// 		} else if (selected.name.toLowerCase().endsWith(".zip")) {
// 			// Validate ZIP file
// 			if (!validateZipFile(selected)) {
// 				return;
// 			}
			
// 			// Extract images from ZIP file
// 			setFile(selected);
// 			setPreview(null);
// 			setIsExtracting(true);
			
// 			try {
// 				const files = await extractZipFile(selected);
// 				setExtractedFiles(files);
				
// 				if (files.length === 0) {
// 					setError("No valid image files found in ZIP archive. Please ensure your ZIP contains image files (JPEG, PNG, GIF, WebP, SVG).");
// 				} else {
// 					console.log(`✅ Successfully extracted ${files.length} image(s) from ZIP`);
// 				}
// 			} catch (err) {
// 				setError(err instanceof Error ? err.message : "Failed to extract ZIP file. Please ensure it's a valid archive.");
// 				setFile(null);
// 				setIsExtracting(false);
// 			}
// 		} else {
// 			setError("Invalid file type. Please upload an image, PDF, or ZIP file.");
// 		}
// 	};

// 	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
// 		if (e.target.files && e.target.files[0]) {
// 			await processFile(e.target.files[0]);
// 		}
// 	};

// 	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.stopPropagation();
// 		setIsDragging(true);
// 	};

// 	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.stopPropagation();
// 		setIsDragging(false);
// 	};

// 	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.stopPropagation();
// 	};

// 	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.stopPropagation();
// 		setIsDragging(false);

// 		if (isExtracting) return;

// 		const droppedFiles = e.dataTransfer.files;
// 		if (droppedFiles && droppedFiles.length > 0) {
// 			await processFile(droppedFiles[0]);
// 		}
// 	};

// 	const handleNext = () => {
// 		if (extractedFiles.length > 0) {
// 			setStep("preview");
// 		}
// 	};

// 	const handleReset = () => {
// 		// Cleanup preview URLs
// 		extractedFiles.forEach(file => {
// 			if (file.preview.startsWith('blob:')) {
// 				URL.revokeObjectURL(file.preview);
// 			}
// 		});
// 		if (preview) {
// 			URL.revokeObjectURL(preview);
// 		}
		
// 		setFile(null);
// 		setExtractedFiles([]);
// 		setPreview(null);
// 		setProgress(0);
// 		setError(null);
// 		setProcessingStatus("");
// 	};

// 	// Cleanup preview URLs on unmount
// 	useEffect(() => {
// 		return () => {
// 			extractedFiles.forEach(file => {
// 				if (file.preview.startsWith('blob:')) {
// 					URL.revokeObjectURL(file.preview);
// 				}
// 			});
// 			if (preview) {
// 				URL.revokeObjectURL(preview);
// 			}
// 		};
// 	}, []);

// 	const getContentTypeInfo = () => {
// 		if (extractedFiles.length === 0) return null;
		
// 		const firstFile = extractedFiles[0];
		
// 		switch (firstFile.type) {
// 			case 'pdf-file':
// 				return {
// 					icon: <Eye className="text-green-500" size={16} />,
// 					label: 'Comic File',
// 					description: `${firstFile.pageCount} estimated pages`,
// 					count: '1 file'
// 				};
// 			case 'image':
// 				return {
// 					icon: <Eye className="text-green-500" size={16} />,
// 					label: 'Image File',
// 					description: 'Ready for upload',
// 					count: '1 image'
// 				};
// 			case 'zip-images':
// 				return {
// 					icon: <Folder className="text-blue-500" size={16} />,
// 					label: 'ZIP Archive',
// 					description: 'Ready for upload',
// 					count: '1 ZIP file'
// 				};
// 			default:
// 				return {
// 					icon: <Folder className="text-blue-500" size={16} />,
// 					label: 'Image Files',
// 					description: 'From ZIP archive',
// 					count: `${extractedFiles.length} images`
// 				};
// 		}
// 	};

// 	const contentInfo = getContentTypeInfo();

// 	return (
// 		<div className='p-6'>
// 			{step === "upload" && (
// 				<div>
// 					<div className='text-white space-y-1 mb-6'>
// 						<h2 className='text-lg font-semibold'>Comic Upload</h2>
// 						<p className='tracking-wider text-white/70 text-xs'>
// 							Upload your comic as images, a complete PDF file, or a ZIP archive
// 						</p>
// 					</div>

// 					<div 
// 						className={`border-2 border-dashed rounded-xl p-6 flex w-full flex-col items-center justify-center text-center space-y-3 min-h-[200px] transition-colors ${
// 							isDragging 
// 								? 'border-secondary-200 bg-secondary-200/10' 
// 								: 'border-primary-100/40'
// 						}`}
// 						onDragEnter={handleDragEnter}
// 						onDragOver={handleDragOver}
// 						onDragLeave={handleDragLeave}
// 						onDrop={handleDrop}
// 					>
// 						{!preview && extractedFiles.length === 0 ? (
// 							<>
// 								<Picture
// 									src={UploadImage}
// 									alt='Upload'
// 									className='size-10 object-contain'
// 								/>

// 								<p className='text-white/80 font-medium tracking-wider'>
// 									{isDragging ? 'Drop your file here' : 'Drag your file(s) to start uploading'}
// 								</p>

// 								<div className='flex items-center my-2 w-48'>
// 									<div className='flex-[.6] border-t-2 border-white/60'></div>
// 									<span className='mx-3 text-white/80 text-sm'>OR</span>
// 									<div className='flex-[.6] border-t-2 border-white/60'></div>
// 								</div>

// 								<label className='inline-block border border-secondary-200 text-white/90 hover:bg-secondary-200 hover:text-black-100 rounded-full px-5 py-1.5 cursor-pointer font-semibold transition-[.3]'>
// 									Browse files
// 									<input
// 										type='file'
// 										accept='.jpg,.jpeg,.png,.svg,.gif,.webp,.pdf,.zip'
// 										className='hidden'
// 										onChange={handleFileChange}
// 										disabled={isExtracting}
// 									/>
// 								</label>
// 							</>
// 						) : preview ? (
// 							<Picture
// 								src={preview}
// 								alt='Preview'
// 								className='rounded-lg max-h-48 mx-auto object-contain'
// 							/>
// 						) : extractedFiles.length > 0 ? (
// 							<div className='w-full space-y-3'>
								
// 								{extractedFiles[0].type === 'pdf-file' ? (
// 									// PDF Preview
// 									<div className="flex flex-col items-center space-y-2">
// 										<Picture
// 											src={extractedFiles[0].preview}
// 											alt="PDF Preview"
// 											className="rounded-lg max-h-32 object-contain"
// 										/>
// 										<p className="text-white/80 text-sm">
// 											{extractedFiles[0].name}
// 										</p>
// 										<p className="text-white/60 text-xs">
// 											{(extractedFiles[0].fileSize! / (1024 * 1024)).toFixed(1)} MB • 
// 											~{extractedFiles[0].pageCount} pages
// 										</p>
// 									</div>
// 								) : extractedFiles[0].type === 'zip-images' ? (
// 									// ZIP Preview (without extraction)
// 									<div className="flex flex-col items-center space-y-2">
// 										<div className="bg-blue-500 rounded-lg p-4">
// 											<Folder size={48} className="text-white" />
// 										</div>
// 										<p className="text-white/80 text-sm">
// 											{extractedFiles[0].name}
// 										</p>
// 										<p className="text-white/60 text-xs">
// 											{(extractedFiles[0].fileSize! / (1024 * 1024)).toFixed(1)} MB ZIP Archive
// 										</p>
// 									</div>
// 								) : (
// 									<>
// 										<div className='grid grid-cols-4 gap-2'>
// 											{extractedFiles.slice(0, 8).map((file, idx) => (
// 												<div key={idx} className='aspect-square rounded overflow-hidden'>
// 													<Picture
// 														src={file.preview}
// 														alt={file.name}
// 														className='w-full h-full object-cover'
// 													/>
// 												</div>
// 											))}
// 										</div>
// 										{extractedFiles.length > 8 && (
// 											<p className='text-white/60 text-sm'>
// 												+{extractedFiles.length - 8} more image{extractedFiles.length - 8 !== 1 ? 's' : ''}
// 											</p>
// 										)}
// 									</>
// 								)}
// 							</div>
// 						) : null}
// 					</div>

// 					<h4 className='text-white/50 text-xs my-1 tracking-wider'>
// 						Support: .jpg, .jpeg, .png, .svg, .gif, .webp (max 50MB), .pdf (max 100MB), and .zip files
// 					</h4>

// 					{error && (
// 						<div className='bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-3 flex items-start gap-2'>
// 							<AlertCircle className='text-red-400 flex-shrink-0 mt-0.5' size={18} />
// 							<p className='text-red-400 text-sm'>{error}</p>
// 						</div>
// 					)}

// 					{isExtracting && (
// 						<div className='bg-black rounded-xl border border-white/20 px-3 py-2 w-full max-w-2xl mt-4'>
// 							<div className='flex items-center justify-between mb-3'>
// 								<div>
// 									<p className='text-white text-sm font-semibold'>
// 										{processingStatus || "Processing file..."}
// 									</p>
// 									<p className='text-white/80 text-sm'>
// 										{Math.round(progress)}%
// 									</p>
// 								</div>

// 								<button
// 									onClick={onClose}
// 									className='p-1 rounded-full hover:bg-white/10 text-red-500'
// 								>
// 									<X size={20} />
// 								</button>
// 							</div>

// 							<div className='h-3 rounded-full bg-white/10 overflow-hidden'>
// 								<div
// 									className='h-3 bg-orange-400 transition-all duration-300'
// 									style={{ width: `${progress}%` }}
// 								/>
// 							</div>
// 						</div>
// 					)}

// 					{!isExtracting && file && extractedFiles.length > 0 && (
// 						<div className='bg-black rounded-xl border border-white/20 p-5 w-full max-w-2xl flex items-center justify-between mt-4'>
// 							<div className='flex items-center gap-3'>
// 								<div className='relative'>
// 									<div className='bg-yellow-400 rounded p-2'>
// 										{file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') ? (
// 											<FileText size={28} className='text-black' />
// 										) : (
// 											<Folder size={28} className='text-black' />
// 										)}
// 									</div>
// 									{file.name.toLowerCase().endsWith('.zip') && (
// 										<span className='absolute -bottom-1 -right-1 bg-blue-500 text-[10px] text-white px-1 py-[1px] rounded'>
// 											ZIP
// 										</span>
// 									)}
// 									{(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) && (
// 										<span className='absolute -bottom-1 -right-1 bg-red-500 text-[10px] text-white px-1 py-[1px] rounded'>
// 											PDF
// 										</span>
// 									)}
// 								</div>

// 								<div>
// 									<p className='text-white font-medium'>{file.name}</p>
// 									<p className='text-white/60 text-sm'>
// 										{(file.size / (1024 * 1024)).toFixed(2)} MB • {contentInfo?.count}
// 									</p>
// 								</div>
// 							</div>

// 							<button
// 								onClick={handleReset}
// 								className='p-1 rounded-full hover:bg-white/10 text-white'
// 							>
// 								<X size={20} />
// 							</button>
// 						</div>
// 					)}

// 					<div className='mt-3 flex flex-col gap-3'>
// 						<button
// 							disabled={extractedFiles.length === 0 || isExtracting}
// 							onClick={handleNext}
// 							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50'
// 						>
// 							{extractedFiles.length > 0 ? 
// 								extractedFiles[0].type === 'pdf-file' ? 
// 									'Continue with PDF' : 
// 								extractedFiles[0].type === 'zip-images' ?
// 									'Continue with ZIP' :
// 									`Continue with ${extractedFiles.length} file${extractedFiles.length !== 1 ? 's' : ''}` 
// 								: 'Next'
// 							}
// 						</button>
// 						<button
// 							onClick={onClose}
// 							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition'
// 						>
// 							Cancel
// 						</button>
// 					</div>
// 				</div>
// 			)}

// 			{step === "preview" && (
// 				<ComicPreviewModal
// 					isOpen={true}
// 					onClose={onClose}
// 					onBackToEditor={() => setStep("upload")}
// 					extractedFiles={extractedFiles}
// 				/>
// 			)}
// 		</div>
// 	);
// };

// export default UploadModal;


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
	type: 'image' | 'pdf-file' | 'zip-images';
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'];
const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.gif', '.webp'];
const VALID_PDF_EXTENSION = '.pdf';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const UploadModal = ({ onClose }: UploadModalProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [step, setStep] = useState<"upload" | "preview">("upload");
	const [isExtracting, setIsExtracting] = useState(false);
	const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);

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
				
				// Handle image files
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
							type: 'image',
						});
					} catch (err) {
						console.error(`Error processing ${filename}:`, err);
						invalidFiles.push(filename);
					}
				}
				// Handle PDF files inside ZIP
				else if (ext === VALID_PDF_EXTENSION) {
					try {
						const blob = await zipEntry.async('blob');
						
						// Check size
						if (blob.size > MAX_FILE_SIZE) {
							invalidFiles.push(`${filename} (too large)`);
							processedCount++;
							continue;
						}
						
						// Create a proper PDF blob with correct mime type
						const pdfBlob = new Blob([blob], { type: 'application/pdf' });
						const previewUrl = URL.createObjectURL(pdfBlob);
						
						imageFiles.push({
							name: filename.split('/').pop() || filename,
							blob: pdfBlob,
							preview: previewUrl,
							type: 'pdf-file',
						});
						console.log(`📄 Extracted PDF from ZIP: ${filename}`);
					} catch (err) {
						console.error(`Error processing PDF ${filename}:`, err);
						invalidFiles.push(filename);
					}
				}

				processedCount++;
				setProgress(30 + (processedCount / totalFiles) * 60);
			}

			// Sort image files by name to maintain order (PDFs stay in their extracted order)
			const sortedFiles = imageFiles.sort((a, b) => {
				// Keep PDFs at their position, sort images
				if (a.type === 'pdf-file' || b.type === 'pdf-file') return 0;
				return a.name.localeCompare(b.name, undefined, { numeric: true });
			});

			setProgress(100);
			setIsExtracting(false);

			// Count file types for better messaging
			const imageCount = sortedFiles.filter(f => f.type === 'image').length;
			const pdfCount = sortedFiles.filter(f => f.type === 'pdf-file').length;

			// Show warning if some files were invalid
			if (invalidFiles.length > 0) {
				const extractedMsg = pdfCount > 0 
					? `${imageCount} image(s) and ${pdfCount} PDF(s) extracted`
					: `${imageCount} valid images extracted`;
				setError(`${invalidFiles.length} file(s) were skipped (invalid format or too large). ${extractedMsg}.`);
			}

			return sortedFiles;
		} catch (err) {
			console.error("Error extracting ZIP:", err);
			setIsExtracting(false);
			throw new Error("Failed to extract ZIP file. Please ensure it's a valid archive.");
		}
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selected = e.target.files[0];
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
					type: 'image',
				}]);
			} else if (selected.name.toLowerCase().endsWith(".zip")) {
				setFile(selected);
				setPreview(null);
				try {
					const files = await extractZipFile(selected);
					setExtractedFiles(files);
					
					if (files.length === 0) {
						setError("No valid files found in ZIP archive. Please ensure your ZIP contains image files (JPEG, PNG, GIF, WebP, SVG) or PDF files.");
					}
				} catch (err) {
					setError(err instanceof Error ? err.message : "Failed to extract ZIP file. Please ensure it's a valid archive.");
					setFile(null);
				}
			} else {
				setError("Invalid file type. Please upload an image or ZIP file.");
			}
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

					<div className='border-2 border-dashed border-primary-100/40 rounded-xl p-6 flex w-full flex-col items-center justify-center text-center space-y-3 min-h-[200px]'>
						{!preview && extractedFiles.length === 0 ? (
							<>
								<Picture
									src={UploadImage}
									alt='Upload'
									className='size-10 object-contain'
								/>

								<p className='text-white/80 font-medium tracking-wider'>
									Drag your file(s) to start uploading
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