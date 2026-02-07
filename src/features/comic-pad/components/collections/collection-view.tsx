'use client';

import React, { useState } from 'react'
import CreateCollectionForm from '../modals/new-collection';
import CollectionSuccess from '../modals/collection-success';
import { useAppDispatch } from "@/redux/hook";
import { createCollection } from '@/redux/slices/collectionSlice';

interface CollectionViewProps {
  onClose?: () => void;
}

interface CreateCollectionPayload {
  title: string;
  description?: string;
  bannerImage?: File;
  genre?: string[];
  collaborators?: any[];
  creatorDetails?: any;
}

function CollectionView({ onClose }: CollectionViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [collectionData, setCollectionData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();

  const handleSuccess = async (formData: any) => {
    console.log('=== handleSuccess called ===');
    console.log('Form Data:', formData);

    const data: CreateCollectionPayload = {
      title: formData.title,
      description: formData.description,
      bannerImage: formData.bannerImage,
      genre: formData.genres,
      collaborators: formData.collaborators,
      creatorDetails: formData.creatorDetails
    };

    console.log('Payload to send:', data);

    try {
      setIsSubmitting(true);
      
      console.log('Dispatching createCollection...');
      const result = await dispatch(createCollection(data as any)).unwrap();
      
      console.log('✅ Create Collection SUCCESS:', result);
      setCollectionData(formData);
      setShowSuccess(true);
      console.log('showSuccess set to true');
      
    } catch (error: any) {
      console.error('❌ Error creating collection:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack
      });
      
      alert(`Failed to create collection: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full">
        {!showSuccess && (
            <CreateCollectionForm 
                onSubmit={handleSuccess}
                onSaveDraft={(data) => {
                    setCollectionData(data);
                }}
                isLoading={isSubmitting}
            />  
        )}
        
        {showSuccess && (
            <CollectionSuccess
                isOpen={showSuccess}
                onClose={handleCloseSuccess}
                onUploadEpisode={() => {
                    console.log('Upload episode clicked');
                    handleCloseSuccess();
                }}
                onSkip={() => {
                    console.log('Skip clicked');
                    handleCloseSuccess();
                }}
                collectionImage={collectionData?.bannerImage}
            />
        )}
    </div>
  );
}

export default CollectionView;