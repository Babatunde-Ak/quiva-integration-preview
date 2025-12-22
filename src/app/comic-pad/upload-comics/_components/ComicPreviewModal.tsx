// "use client";

// import React, { useState } from "react";
// import { GripVertical, FileText, Eye, Folder } from "lucide-react";
// import { ComicCreationForm } from "./ComicCreationForm";
// import Picture from "@/components/picture/Index";

// interface ExtractedFile {
// 	name: string;
// 	blob: Blob;
// 	preview: string;
// 	type: 'image' | 'pdf-file' | 'zip-images';
// 	originalFileName?: string;
// 	fileSize?: number;
// 	pageCount?: number;
// }

// interface ComicPreviewModalProps {
// 	isOpen: boolean;
// 	onClose: () => void;
// 	onBackToEditor: () => void;
// 	extractedFiles: ExtractedFile[];
// }

// export function ComicPreviewModal({
// 	isOpen,
// 	onClose,
// 	onBackToEditor,
// 	extractedFiles: initialFiles,
// }: ComicPreviewModalProps) {
// 	const [showForm, setShowForm] = useState(false);
// 	const [currentPage, setCurrentPage] = useState(0);
// 	const [files, setFiles] = useState<ExtractedFile[]>(initialFiles);
// 	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	
// 	// PDF iframe URL state
// 	const [pdfUrl, setPdfUrl] = useState<string | null>(null);

// 	// Create object URL for PDF blob if needed
// 	React.useEffect(() => {
// 		if (files[currentPage]?.type === 'pdf-file') {
// 			const file = files[currentPage];
// 			let url: string;
			
// 			if (file.preview.startsWith('http')) {
// 				// Use the URL directly
// 				url = file.preview;
// 			} else {
// 				// Create object URL from blob
// 				url = URL.createObjectURL(file.blob);
// 			}
			
// 			setPdfUrl(url);
			
// 			// Cleanup object URL on unmount or when file changes
// 			return () => {
// 				if (!file.preview.startsWith('http')) {
// 					URL.revokeObjectURL(url);
// 				}
// 			};
// 		}
// 	}, [currentPage, files]);

// 	if (!isOpen) return null;

// 	const currentFile = files[currentPage];
// 	const isPdfFile = files.some(file => file.type === 'pdf-file');
// 	const isMultipleImages = files.length > 1 && files[0].type === 'image';

// 	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
// 		// Only allow dragging for multiple image files
// 		if (isPdfFile || files.length === 1) {
// 			e.preventDefault();
// 			return;
// 		}
// 		setDraggedIndex(index);
// 		e.dataTransfer.effectAllowed = "move";
// 	};

// 	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
// 		e.preventDefault();
// 		e.dataTransfer.dropEffect = "move";
// 	};

// 	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
// 		e.preventDefault();
// 		if (draggedIndex === null || draggedIndex === index || isPdfFile) return;

// 		const newFiles = [...files];
// 		const draggedFile = newFiles[draggedIndex];
		
// 		// Remove from old position
// 		newFiles.splice(draggedIndex, 1);
		
// 		// Insert at new position
// 		newFiles.splice(index, 0, draggedFile);
		
// 		setFiles(newFiles);
// 		setDraggedIndex(index);
		
// 		// Update current page if needed
// 		if (currentPage === draggedIndex) {
// 			setCurrentPage(index);
// 		} else if (currentPage > draggedIndex && currentPage <= index) {
// 			setCurrentPage(currentPage - 1);
// 		} else if (currentPage < draggedIndex && currentPage >= index) {
// 			setCurrentPage(currentPage + 1);
// 		}
// 	};

// 	const handleDragEnd = () => {
// 		setDraggedIndex(null);
// 	};

// 	const getContentTypeInfo = () => {
// 		if (files.length === 0) return null;
		
// 		const firstFile = files[0];
		
// 		switch (firstFile.type) {
// 			case 'pdf-file':
// 				return {
// 					icon: <Eye className="text-green-400" size={20} />,
// 					label: 'Comic Book',
// 					description: `Complete comic with ~${firstFile.pageCount || '?'} pages`,
// 					subtitle: null,
// 					actionText: 'Upload Comic'
// 				};
// 			case 'image':
// 				if (files.length === 1) {
// 					return {
// 						icon: <Eye className="text-green-400" size={20} />,
// 						label: 'Single Comic Page',
// 						description: null,
// 						subtitle: 'Ready for upload',
// 						actionText: 'Upload Comic Page'
// 					};
// 				} else {
// 					return {
// 						icon: <Folder className="text-blue-400" size={20} />,
// 						label: '',
// 						description: `${files.length} comic pages`,
// 						subtitle: 'You can reorder these pages',
// 						actionText: `Upload Comic`
// 					};
// 				}
// 			default:
// 				return {
// 					icon: <Folder className="text-blue-400" size={20} />,
// 					label: 'Comic Files',
// 					description: `${files.length} files ready`,
// 					subtitle: 'Mixed content upload',
// 					actionText: 'Upload Files'
// 				};
// 		}
// 	};

// 	const contentInfo = getContentTypeInfo();

// 	return (
// 		<>
// 			{!showForm && (
// 				<div className="max-h-[85vh] overflow-y-auto">
// 					{/* Content Preview */}
// 					<div className="relative bg-gray-900 rounded-lg overflow-hidden">
// 						{currentFile && currentFile.type === 'pdf-file' ? (
// 							<div className="min-h-[500px] h-[500px]">
// 								{/* PDF iframe */}
// 								{pdfUrl ? (
// 									<iframe
// 										src={pdfUrl}
// 										className="w-full h-full border-0"
// 										title="PDF Preview"
// 									/>
// 								) : (
// 									<div className="flex items-center justify-center h-full text-white/60">
// 										Loading PDF...
// 									</div>
// 								)}
// 							</div>
// 						) : (
// 							currentFile && (
// 								<Picture
// 									src={currentFile.preview}
// 									alt={currentFile.name}
// 									className='w-full h-60 object-contain'
// 								/>
// 							)
// 						)}
// 					</div>

// 					{/* File Information */}
// 					<div className="mt-3 text-center">
// 						<p className="text-white/60 text-sm">{contentInfo?.description}</p>
// 						<p className="text-white/40 text-xs mt-1">{contentInfo?.subtitle}</p>
						
// 						{currentFile && (
// 							<div className="mt-2 text-white/50 text-xs">
// 								<p>File: {currentFile.name}</p>
// 								{currentFile.fileSize && (
// 									<p>Size: {(currentFile.fileSize / (1024 * 1024)).toFixed(1)} MB</p>
// 								)}
// 							</div>
// 						)}
// 					</div>

// 					{/* Navigation for multiple images */}
// 					{isMultipleImages && (
// 						<div className="flex gap-2 mt-3 justify-center">
// 							<button
// 								onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
// 								disabled={currentPage === 0}
// 								className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm transition"
// 							>
// 								Previous
// 							</button>
// 							<span className="px-4 py-2 bg-white/5 rounded text-white text-sm flex items-center">
// 								{currentPage + 1} / {files.length}
// 							</span>
// 							<button
// 								onClick={() => setCurrentPage(Math.min(files.length - 1, currentPage + 1))}
// 								disabled={currentPage === files.length - 1}
// 								className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm transition"
// 							>
// 								Next
// 							</button>
// 						</div>
// 					)}

// 					{/* Reorderable Thumbnails (only for multiple images) */}
// 					{isMultipleImages && (
// 						<div className="mt-3 space-y-2">
// 							<div className="flex items-center justify-between">
// 								<h3 className="text-white text-sm font-medium">
// 									Reorder Pages (Drag to rearrange)
// 								</h3>
// 								<span className="text-white/60 text-xs">
// 									{files.length} image{files.length !== 1 ? 's' : ''}
// 								</span>
// 							</div>
							
// 							<div className="flex gap-2 overflow-x-auto pb-2">
// 								{files.map((file, idx) => (
// 									<div
// 										key={`${file.name}-${idx}`}
// 										draggable
// 										onDragStart={(e) => handleDragStart(e, idx)}
// 										onDragOver={handleDragOver}
// 										onDragEnter={(e) => handleDragEnter(e, idx)}
// 										onDragEnd={handleDragEnd}
// 										className={`flex-shrink-0 relative group cursor-move transition-all ${
// 											draggedIndex === idx ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
// 										}`}
// 									>
// 										<button
// 											onClick={() => setCurrentPage(idx)}
// 											className={`w-20 h-20 rounded border-2 overflow-hidden transition relative ${
// 												currentPage === idx 
// 													? 'border-primary-500 ring-2 ring-primary-500/50' 
// 													: 'border-white/20 hover:border-white/40'
// 											}`}
// 										>
// 											<Picture
// 												src={file.preview}
// 												alt={`Page ${idx + 1}`}
// 												className='w-full h-full object-cover'
// 											/>
// 										</button>
										
// 										{/* Page number badge */}
// 										<div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
// 											{idx + 1}
// 										</div>
										
// 										{/* Drag handle indicator */}
// 										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
// 											<GripVertical className="text-white drop-shadow-lg" size={24} />
// 										</div>
// 									</div>
// 								))}
// 							</div>
							
// 							<p className="text-white/50 text-xs">
// 								Drag and drop thumbnails to change page order
// 							</p>
// 						</div>
// 					)}

// 					{/* Content Description */}
// 					<div className='text-center mt-3 mb-5'>
// 						<p className='text-white/80 text-sm font-medium tracking-widest uppercase mb-2'>
// 							PUBLISH YOUR COMIC: Step 1 of 4
// 						</p>
// 						<h2 className='text-white text-2xl tracking-wider font-semibold mb-3'>
// 							Review your upload
// 						</h2>
// 						<div className='text-white/60 text-sm leading-relaxed space-y-1'>
// 							<p>Ready to add comic details? Continue to the next step!</p>
// 						</div>
// 					</div>

// 					{/* Action Buttons */}
// 					<div className='space-y-3'>
// 						<button
// 							onClick={() => setShowForm(true)}
// 							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition'
// 							disabled={files.length === 0}
// 						>
// 							{contentInfo?.actionText || 'Continue'}
// 						</button>
// 						<button
// 							onClick={onBackToEditor}
// 							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition'
// 						>
// 							Back to Upload
// 						</button>
// 					</div>
// 				</div>
// 			)}

// 			{showForm && <ComicCreationForm extractedFiles={files} />}
// 		</>
// 	);
// }


"use client";

import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { ComicCreationForm } from "./ComicCreationForm";
import Picture from "@/components/picture/Index";

interface ExtractedFile {
	name: string;
	blob: Blob;
	preview: string;
	type: 'image' | 'pdf-file' | 'zip-images';
}

interface ComicPreviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	onBackToEditor: () => void;
	extractedFiles: ExtractedFile[];
}

export function ComicPreviewModal({
	isOpen,
	onClose,
	onBackToEditor,
	extractedFiles: initialFiles,
}: ComicPreviewModalProps) {
	const [showForm, setShowForm] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const [files, setFiles] = useState<ExtractedFile[]>(initialFiles);
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	if (!isOpen) return null;

	const previewImage = files.length > 0 
		? files[currentPage].preview
		: 'https://images.unsplash.com/photo-1620336655052-b57986f5a26a?w=500&auto=format&fit=crop&q=60';

	const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === index) return;

		const newFiles = [...files];
		const draggedFile = newFiles[draggedIndex];
		
		// Remove from old position
		newFiles.splice(draggedIndex, 1);
		
		// Insert at new position
		newFiles.splice(index, 0, draggedFile);
		
		setFiles(newFiles);
		setDraggedIndex(index);
		
		// Update current page if needed
		if (currentPage === draggedIndex) {
			setCurrentPage(index);
		} else if (currentPage > draggedIndex && currentPage <= index) {
			setCurrentPage(currentPage - 1);
		} else if (currentPage < draggedIndex && currentPage >= index) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	const handleTouchStart = (index: number) => {
		setDraggedIndex(index);
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const handleTouchEnd = () => {
		setDraggedIndex(null);
	};

	return (
		<>
			{!showForm && (
				<div className="max-h-[85vh] overflow-y-auto">
					{/* Comic Preview Image */}
					<div className="relative bg-gray-900 rounded-lg overflow-hidden">
						<Picture
							src={previewImage}
							alt={`Comic page ${currentPage + 1}`}
							className='w-full h-60 object-contain'
						/>
						
						{files.length > 1 && (
							<div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
								Page {currentPage + 1} of {files.length}
							</div>
						)}
					</div>

					{/* Page Navigation */}
					{files.length > 1 && (
						<div className="flex gap-2 mt-3 justify-center">
							<button
								onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
								disabled={currentPage === 0}
								className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm transition"
							>
								Previous
							</button>
							<button
								onClick={() => setCurrentPage(Math.min(files.length - 1, currentPage + 1))}
								disabled={currentPage === files.length - 1}
								className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm transition"
							>
								Next
							</button>
						</div>
					)}

					{/* Reorderable Page Thumbnails */}
					{files.length > 1 && (
						<div className="mt-3 space-y-2">
							<div className="flex items-center justify-between">
								<h3 className="text-white text-sm font-medium">
									Reorder Pages (Drag to rearrange)
								</h3>
								<span className="text-white/60 text-xs">
									{files.length} page{files.length !== 1 ? 's' : ''}
								</span>
							</div>
							
							<div className="flex gap-2 overflow-x-auto pb-2">
								{files.map((file, idx) => (
									<div
										key={`${file.name}-${idx}`}
										draggable
										onDragStart={(e) => handleDragStart(e, idx)}
										onDragOver={handleDragOver}
										onDragEnter={(e) => handleDragEnter(e, idx)}
										onDragEnd={handleDragEnd}
										onTouchStart={() => handleTouchStart(idx)}
										onTouchMove={handleTouchMove}
										onTouchEnd={handleTouchEnd}
										className={`flex-shrink-0 relative group cursor-move transition-all ${
											draggedIndex === idx ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
										}`}
									>
										<button
											onClick={() => setCurrentPage(idx)}
											className={`w-20 h-20 rounded border-2 overflow-hidden transition ${
												currentPage === idx 
													? 'border-orange-500 ring-2 ring-orange-500/50' 
													: 'border-white/20 hover:border-white/40'
											}`}
										>
											<Picture
												src={file.preview}
												alt={`Page ${idx + 1}`}
												className='w-full h-full object-cover'
											/>
										</button>
										
										{/* Page number badge */}
										<div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
											{idx + 1}
										</div>
										
										{/* Drag handle indicator */}
										<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
											<GripVertical className="text-white drop-shadow-lg" size={24} />
										</div>
									</div>
								))}
							</div>
							
							<p className="text-white/50 text-xs">
								Drag and drop thumbnails to change page order
							</p>
						</div>
					)}

					{/* Content */}
					<div className='text-center mt-3 mb-5'>
						<p className='text-white/80 text-sm font-medium tracking-widest uppercase mb-2'>
							PUBLISH YOUR COMIC: Step 1 of 4
						</p>
						<h2 className='text-white text-2xl tracking-wider font-semibold mb-3'>
							Give your masterpiece one last look
						</h2>
						<p className='text-white/60 text-sm leading-relaxed'>
							Scroll through your comic page by page. Drag thumbnails to reorder pages.
							Spot any last-minute tweaks? Head back to the editor!
						</p>
					</div>

					{/* Buttons */}
					<div className='space-y-3'>
						<button
							onClick={() => setShowForm(true)}
							className='w-full bg-secondary-200/80 hover:bg-secondary-200 text-black font-semibold py-3 rounded-full transition'
						>
							Next
						</button>
						<button
							onClick={onBackToEditor}
							className='w-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-3 rounded-full transition'
						>
							Back to Editor
						</button>
					</div>
				</div>
			)}

			{showForm && <ComicCreationForm extractedFiles={files} />}
		</>
	);
}