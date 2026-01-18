'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
  label?: string;
  acceptedFormats?: string;
  className?: string;
  maxFileSizeMB?: number; // Maximum file size in megabytes
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  image,
  onImageChange,
  label = 'Please upload a valid image file (PNG, JPG).',
  acceptedFormats = 'image/png,image/jpeg,image/jpg',
  className = '',
  maxFileSizeMB = 5 // Default to 5MB
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Convert max size from MB to bytes
      const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;
      
      // Check file size
      if (file.size > maxFileSizeBytes) {
        setError(`File size must be less than ${maxFileSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Clear any previous errors
      setError('');
      onImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    setError('');
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border border-black-50 bg-black-100 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
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
            <Upload className="mx-auto mb-4 text-white/50" size={48} />
            <p className="text-white/40 mb-2 font-light max-w-xl">
              {label}
            </p>
            <p className="text-white/30 text-xs mb-4">
              Maximum file size: {maxFileSizeMB}MB
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