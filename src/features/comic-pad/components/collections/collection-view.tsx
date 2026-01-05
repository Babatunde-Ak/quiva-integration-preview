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

  const dispatch = useAppDispatch();

  const handleSuccess = async (formData: any) => {
    console.log('Collection created successfully');
    console.log('Collection Data:', formData);

    const data: CreateCollectionPayload = {
      title: formData.title,
      description: formData.description,
      bannerImage: formData.bannerImage,
      genre: formData.genres,
      collaborators: formData.collaborators,
      creatorDetails: formData.creatorDetails
    };

    try {
      // Cast to any to bypass TypeScript checking for JS slice
      const result = await dispatch(createCollection(data as any)).unwrap();
      console.log('Create Collection Result:', result);
      setCollectionData(formData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating collection:', error);
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