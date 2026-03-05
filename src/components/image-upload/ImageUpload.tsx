'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
  label?: string;
  acceptedFormats?: string;
  className?: string;
  maxFileSizeMB?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  image,
  onImageChange,
  label = 'Please upload a valid image file (PNG, JPG).',
  acceptedFormats = 'image/png,image/jpeg,image/jpg',
  className = '',
  maxFileSizeMB = 5
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const acceptedTypes = acceptedFormats.split(',').map(t => t.trim());

  const validateAndSetFile = useCallback((file: File) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PNG or JPG image.');
      return;
    }

    // Check file size
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      setError(`File size must be less than ${maxFileSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return;
    }

    setError('');
    onImageChange(file);
  }, [acceptedTypes, maxFileSizeMB, onImageChange]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleRemoveImage = () => {
    setError('');
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if leaving the drop zone (not entering a child)
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center h-full flex flex-col items-center justify-center transition-colors duration-200 ${
          isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : image
            ? 'border-black-50 bg-black-100'
            : 'border-black-50 bg-black-100 hover:border-white/30'
        }`}
      >
        {image ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={URL.createObjectURL(image)}
                alt="Banner preview"
                className="object-cover w-full max-h-96 rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="text-sm">
              <p className="text-white/40">{image.name}</p>
              <p className="text-white/50 text-xs mt-1">
                {(image.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        ) : (
          <>
            <Upload className={`mx-auto mb-4 transition-colors ${isDragging ? 'text-primary-500' : 'text-white/50'}`} size={48} />
            <p className="text-white/40 mb-2 font-light max-w-xl">
              {isDragging ? 'Drop your image here' : label}
            </p>
            <p className="text-white/30 text-xs mb-4">
              Drag & drop or click to upload · Max {maxFileSizeMB}MB
            </p>
            <Button
              type="button"
              variant="outline"
              className="bg-transparent border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Banner
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats}
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
