'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {
    Upload,
    FileText,
    Image as ImageIcon,
    X,
    ChevronLeft,
    CloudUploadIcon,
    File as FileIcon,
    Archive,
    AlertCircle
} from 'lucide-react';
import { envelopeImg } from '../../../../../../public/dev_images';
import { MainButton } from '@/components/button';
import JSZip from 'jszip';

interface ExtractedFile {
    name: string;
    blob: Blob;
    preview: string;
    type: 'image' | 'pdf-file';
    fileSize?: number;
    pageCount?: number;
}

interface ContentFilesData {
    contentType : 'pdf' | 'images' | null;
    files : File[];
}

interface ContentPagesData {
    contentType : 'pdf' | 'images' | null;
    pages : File[];
}

interface ContentFilesStepProps {
    data : ContentFilesData;
    onUpdate : (data : Partial < ContentPagesData >) => void;
    onNext : () => void;
    onPrev : () => void;
    onSaveDraft : () => void;
    isValid : boolean;
}

const ContentFilesStepComponent : React.FC < ContentFilesStepProps > = ({
    data,
    onUpdate,
    onNext,
    onPrev,
    onSaveDraft,
    isValid
}) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const [processingStatus, setProcessingStatus] = useState('');
    const fileInputRef = useRef < HTMLInputElement > (null);

    // Constants based on content type
    const getFileConstants = (contentType: 'pdf' | 'images') => {
        switch (contentType) {
            case 'images':
                return {
                    VALID_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
                    VALID_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
                    VALID_PDF_EXTENSION: null,
                    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
                    MAX_ZIP_SIZE: 50 * 1024 * 1024 // 50MB
                };
            case 'pdf':
                return {
                    VALID_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
                    VALID_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'],
                    VALID_PDF_EXTENSION: '.pdf',
                    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
                    MAX_ZIP_SIZE: 100 * 1024 * 1024 // 100MB for PDF zips
                };
            default:
                return {
                    VALID_EXTENSIONS: [],
                    VALID_IMAGE_TYPES: [],
                    VALID_PDF_EXTENSION: null,
                    MAX_FILE_SIZE: 10 * 1024 * 1024,
                    MAX_ZIP_SIZE: 50 * 1024 * 1024
                };
        }
    };

    // Estimate PDF page count from file size (rough approximation)
    const estimatePdfPageCount = (fileSize: number): number => {
        const avgPageSize = 200 * 1024; // 200KB average
        return Math.max(1, Math.round(fileSize / avgPageSize));
    };

    // Validate individual files based on content type
    const validateFile = (file: File): boolean => {
        const constants = getFileConstants(data.contentType!);
        const { MAX_FILE_SIZE, MAX_ZIP_SIZE, VALID_IMAGE_TYPES, VALID_EXTENSIONS, VALID_PDF_EXTENSION } = constants;

        // Check ZIP file size
        if (file.name.toLowerCase().endsWith('.zip')) {
            if (file.size > MAX_ZIP_SIZE) {
                setError(`ZIP file "${file.name}" exceeds maximum size of ${(MAX_ZIP_SIZE / (1024 * 1024)).toFixed(0)}MB`);
                return false;
            }
            if (file.size < 1024) {
                setError("ZIP file appears to be corrupted or empty");
                return false;
            }
            return true;
        }

        // Check PDF files
        if (VALID_PDF_EXTENSION && file.name.toLowerCase().endsWith('.pdf')) {
            if (file.size > MAX_ZIP_SIZE) { // Use ZIP size limit for PDFs
                setError(`PDF file "${file.name}" exceeds maximum size of ${(MAX_ZIP_SIZE / (1024 * 1024)).toFixed(0)}MB`);
                return false;
            }
            return true;
        }

        // Check regular files
        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!VALID_EXTENSIONS.includes(ext)) {
                setError(`File type "${ext}" is not supported for ${data.contentType} upload`);
                return false;
            }
        }
        
        if (file.size > MAX_FILE_SIZE) {
            setError(`File "${file.name}" exceeds maximum size of ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB`);
            return false;
        }
        
        return true;
    };

    // Create preview placeholder for PDF
    const createPdfPreview = async (fileName: string, fileSize: number): Promise<string> => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d')!;
        
        // Create comic preview placeholder
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add comic icon and info
        ctx.fillStyle = '#28a745';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📚 PDF FILE', canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.fillText(fileName, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`${(fileSize / (1024 * 1024)).toFixed(1)} MB`, canvas.width / 2, canvas.height / 2 + 25);
        
        const estimatedPages = estimatePdfPageCount(fileSize);
        ctx.fillText(`~${estimatedPages} pages`, canvas.width / 2, canvas.height / 2 + 50);

        const previewBlob = await new Promise<Blob>(resolve => {
            canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.8);
        });

        return URL.createObjectURL(previewBlob);
    };

    const extractZipFile = async (zipFile: File): Promise<ExtractedFile[]> => {
        try {
            setIsExtracting(true);
            setProgress(10);
            setError('');
            setProcessingStatus("Extracting ZIP file...");

            const constants = getFileConstants(data.contentType!);
            const { VALID_EXTENSIONS, VALID_IMAGE_TYPES, VALID_PDF_EXTENSION, MAX_FILE_SIZE } = constants;

            // Create JSZip instance with proper TypeScript handling
            let zip: JSZip;
            try {
                zip = JSZip();
            } catch (e) {
                try {
                    zip = new (JSZip as any)();
                } catch (e2) {
                    throw new Error('Failed to create JSZip instance. Please ensure JSZip is properly installed.');
                }
            }

            const zipContent = await zip.loadAsync(zipFile);
            
            setProgress(30);

            const extractedFiles: ExtractedFile[] = [];
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
                setProcessingStatus(`Processing file ${processedCount + 1} of ${totalFiles}...`);
                
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
                        
                        extractedFiles.push({
                            name: filename.split('/').pop() || filename,
                            blob,
                            preview: previewUrl,
                            type: 'image',
                            fileSize: blob.size
                        });
                    } catch (err) {
                        console.error(`Error processing ${filename}:`, err);
                        invalidFiles.push(filename);
                    }
                }
                // Handle PDF files inside ZIP
                else if (ext === VALID_PDF_EXTENSION && data.contentType === 'pdf') {
                    try {
                        const blob = await zipEntry.async('blob');
                        
                        // Check size
                        if (blob.size > MAX_FILE_SIZE) {
                            invalidFiles.push(`${filename} (PDF too large)`);
                            processedCount++;
                            continue;
                        }
                        
                        // Create PDF preview
                        const displayName = filename.split('/').pop() || filename;
                        const previewUrl = await createPdfPreview(displayName, blob.size);
                        
                        // Create a proper PDF blob with correct mime type
                        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                        
                        extractedFiles.push({
                            name: displayName,
                            blob: pdfBlob,
                            preview: previewUrl,
                            type: 'pdf-file',
                            fileSize: blob.size,
                            pageCount: estimatePdfPageCount(blob.size)
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

            // Sort files by name to maintain order
            const sortedFiles = extractedFiles.sort((a, b) => {
                // Keep PDFs at their position, sort images
                if (a.type === 'pdf-file' || b.type === 'pdf-file') return 0;
                return a.name.localeCompare(b.name, undefined, { numeric: true });
            });

            setProgress(100);
            setProcessingStatus("Extraction completed!");
            setIsExtracting(false);

            // Show detailed feedback
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
            setProcessingStatus("");
            throw new Error("Failed to extract ZIP file. Please ensure it's a valid archive.");
        }
    };

    const convertExtractedToFiles = (extractedFiles: ExtractedFile[]): File[] => {
        return extractedFiles.map(extracted => {
            // Determine MIME type based on file type and extension
            let mimeType = '';
            if (extracted.type === 'image') {
                const ext = extracted.name.split('.').pop()?.toLowerCase();
                mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            } else if (extracted.type === 'pdf-file') {
                mimeType = 'application/pdf';
            }

            return new File([extracted.blob], extracted.name, {
                type: mimeType,
                lastModified: Date.now()
            });
        });
    };

    const handleFileUpload = async(files : FileList | null, type : 'pdf' | 'images') => {
        if (!files) return;
        
        setIsUploading(true);
        setUploadProgress(0);
        setError('');
        setProcessingStatus('');

        const fileArray = Array.from(files);
        let processedFiles: File[] = [];

        // Process each file
        for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();

            // Validate file first
            if (!validateFile(file)) {
                setIsUploading(false);
                return;
            }

            // Update progress
            setUploadProgress(((i + 1) / fileArray.length) * 50); // First 50% for processing

            if (extension === '.zip') {
                // Extract zip file
                try {
                    const extractedFiles = await extractZipFile(file);
                    const convertedFiles = convertExtractedToFiles(extractedFiles);
                    processedFiles.push(...convertedFiles);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to extract zip file');
                    setIsUploading(false);
                    return;
                }
            } else {
                // Regular file
                processedFiles.push(file);
            }
        }

        // Simulate upload progress for processed files
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsUploading(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        // Update with all processed files
        onUpdate({contentType: type, pages: [...data.files, ...processedFiles]});
    };

    const handleContentTypeSelect = (type : 'pdf' | 'images') => {
        onUpdate({contentType: type});
        setTimeout(() => fileInputRef.current?.click(), 100);
    };

    const handleCancel = () => {
        setIsUploading(false);
        setIsExtracting(false);
        setUploadProgress(0);
        setProgress(0);
        setError('');
        setProcessingStatus('');
    };

    const handleRemoveFile = (indexToRemove: number) => {
        const updatedFiles = data.files.filter((_, index) => index !== indexToRemove);
        onUpdate({ pages: updatedFiles });
        
        // If no files left, reset content type
        if (updatedFiles.length === 0) {
            onUpdate({ contentType: null });
        }
    };

    // Get file extension
    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    // Get icon for file extension
    const getFileIcon = (extension: string) => {
        switch (extension) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-red-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
            case 'svg':
                return <ImageIcon className="w-6 h-6 text-blue-500" />;
            case 'zip':
                return <Archive className="w-6 h-6 text-purple-500" />;
            default:
                return <FileIcon className="w-6 h-6 text-gray-500" />;
        }
    };

    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (!data.contentType || isExtracting || isUploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files, data.contentType);
        }
    };

    // File validation
    const getAcceptedFileTypes = () => {
        const constants = getFileConstants(data.contentType || 'images');
        const extensions = [...constants.VALID_EXTENSIONS];
        if (constants.VALID_PDF_EXTENSION) {
            extensions.push(constants.VALID_PDF_EXTENSION);
        }
        extensions.push('.zip'); // Always allow zip
        return extensions.join(',');
    };

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            data.files.forEach(file => {
                if (file instanceof File && file.name.includes('blob:')) {
                    URL.revokeObjectURL(file.name);
                }
            });
        };
    }, [data.files]);

    return (
        <div className="w-full h-full p-6 overflow-y-auto font-recursive">
            <div className="max-w-4xl mx-auto">
                {/* Error Message */}
                {error && (
                    <div className='bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2'>
                        <AlertCircle className='text-red-400 flex-shrink-0 mt-0.5' size={18} />
                        <p className='text-red-400 text-sm'>{error}</p>
                        <button 
                            onClick={() => setError('')}
                            className="ml-auto text-red-400 hover:text-red-300"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Back Button */}
                <button
                    onClick={onPrev}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6">
                    <ChevronLeft size={20}/>
                    <span>Back</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-white mb-2">Content Files</h1>
                    <p className="text-white/40 mb-6 font-light">Upload your chapter files and set up episode details.</p>

                    {/* Progress Bar */}
                    <div className="flex justify-center mb-6">
                        <div className="flex space-x-2">
                            <div className="w-32 h-3 bg-primary-500 rounded-full"></div>
                            <div className="w-32 h-3 bg-primary-500 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Content Type Selection */}
                {!data.contentType && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
                        {/* PDF Upload */}
                        <div
                            className="bg-black-500 border border-black-50 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                            onClick={() => handleContentTypeSelect('pdf')}>
                            <div className='mb-4 p-3 bg-black-200 rounded-full flex items-center justify-center mx-auto w-fit'>
                                <img src={envelopeImg.src} alt="Folder" className="w-6 h-6 text-primary-500 mx-auto "/>
                            </div>
                            <h4 className="text-white mb-2 text-lg font-semibold">PDF Upload</h4>
                            <p className="text-white/60 font-light mb-4">For full-chapter uploads</p>
                            <Button
                                variant="outline"
                                className="font-light border-primary-500 bg-transparent hover:text-primary-500 text-primary-500 hover:bg-primary-500/10 rounded-full">
                                Upload PDF
                            </Button>
                        </div>

                        {/* JPG/PNG Upload */}
                        <div
                            className="bg-black-500 border border-black-50 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                            onClick={() => handleContentTypeSelect('images')}>
                            <div className='mb-4 p-3 bg-black-200 rounded-full flex items-center justify-center mx-auto w-fit'>
                                <img src={envelopeImg.src} alt="Folder" className="w-6 h-6 text-primary-500 mx-auto "/>
                            </div>
                            <h4 className="text-white mb-2 text-lg font-semibold">JPG/PNG Upload</h4>
                            <p className="text-white/60 font-light mb-4">Upload all pages at once</p>
                            <Button
                                variant="outline"
                                className="font-light border-primary-500 bg-transparent hover:text-primary-500 text-primary-500 hover:bg-primary-500/10 rounded-full">
                                Upload Images
                            </Button>
                        </div>
                    </div>
                )}

                {/* Uploaded Files Display */}
                {data.files.length > 0 && !isUploading && !isExtracting && (
                    <div className="mb-8 flex justify-center flex-col items-center">
                        <h3 className="text-white font-semibold mb-4">
                            {data.files.length} file{data.files.length !== 1 ? 's' : ''} uploaded
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full max-w-4xl">
                            {data.files.slice(0, 8).map((file, index) => {
                                const extension = getFileExtension(file.name);
                                return (
                                    <div key={index} className="relative bg-black-400 border border-black-50 rounded-lg p-4 hover:border-primary-500/50 transition-colors">
                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveFile(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                                        >
                                            <X size={14} />
                                        </button>
                                        
                                        <div className="flex items-center gap-3">
                                            {/* File Icon */}
                                            <div className="flex-shrink-0">
                                                {getFileIcon(extension)}
                                            </div>
                                            
                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium text-sm truncate" title={file.name}>
                                                    {file.name}
                                                </p>
                                                <p className="text-white/60 text-xs">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <span className="inline-block bg-primary-500/20 text-primary-500 text-xs px-2 py-1 rounded mt-1">
                                                    .{extension}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {data.files.length > 8 && (
                            <p className='text-white/60 text-sm mb-4'>
                                +{data.files.length - 8} more file{data.files.length - 8 !== 1 ? 's' : ''}
                            </p>
                        )}
                        
                        {/* Add More Files Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors"
                        >
                            <Upload size={16} />
                            <span>Add more files</span>
                        </button>
                    </div>
                )}

                {/* File Upload Area with Drag and Drop */}
                {data.contentType && data.files.length === 0 && !isUploading && !isExtracting && (
                    <div className="mb-8 flex flex-col items-center justify-center">
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center mb-4 w-full transition-all duration-200 ${
                                isDragOver 
                                    ? 'border-primary-500 bg-primary-500/10' 
                                    : 'border-orange-200 bg-black-100'
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <CloudUploadIcon className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                                isDragOver ? 'text-primary-400' : 'text-primary-500'
                            }`}/>
                            <p className="text-white mb-2">
                                {isDragOver ? 'Drop your files here' : 'Drag your file(s) or'}{" "}
                                {!isDragOver && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-primary-500 hover:underline">
                                        browse
                                    </button>
                                )}
                            </p>
                            <p className="text-white/60 text-sm font-light">
                                Max 10 MB per file, 50-100 MB for zip files
                            </p>
                        </div>
                        <p className="text-white/60 text-sm text-center">
                            {data.contentType === 'pdf' && 'Support .pdf, .jpg, .png, .gif, .webp, .svg files and .zip archives'}
                            {data.contentType === 'images' && 'Support .jpg, .png, .gif, .webp, .svg files and .zip archives containing images'}
                        </p>
                    </div>
                )}

                {/* Upload Progress */}
                {(isUploading || isExtracting) && (
                    <div className="border-2 border-dashed border-orange-200 bg-black-100 rounded-lg p-12 text-center mb-8">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <svg className="transform -rotate-90 w-32 h-32">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-[#FAFAFA]"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={2 * Math.PI * 56}
                                    strokeDashoffset={2 * Math.PI * 56 * (1 - (isExtracting ? progress : uploadProgress) / 100)}
                                    className="text-primary-500 transition-all duration-300"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white text-2xl font-semibold">
                                    {Math.round(isExtracting ? progress : uploadProgress)}%
                                </span>
                            </div>
                        </div>
                        <p className="text-white mb-4">
                            {processingStatus || (isExtracting ? 'Extracting zip file...' : 'Uploading...')}
                        </p>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 border bg-white border-black-50 text-black-100 rounded-lg hover:bg-white/80 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple={true}
                    accept={getAcceptedFileTypes()}
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            handleFileUpload(files, data.contentType!);
                        }
                    }}
                    className="hidden"
                />

                {/* Action Buttons */}
                <div className="space-y-4 max-w-2xl mx-auto">
                    <MainButton
                        onClick={onNext}
                        disabled={!isValid || isUploading || isExtracting}
                        className="w-full">
                        Next step
                    </MainButton>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSaveDraft}
                        disabled={isUploading || isExtracting}
                        className="w-full font-recursive border-white text-white bg-transparent hover:bg-white hover:text-black font-light py-3 rounded-full transition-colors">
                        Save as Draft
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ContentFilesStepComponent;