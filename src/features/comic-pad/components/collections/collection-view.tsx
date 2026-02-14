'use client';

import React, { useState } from 'react'
import CreateCollectionForm from '../modals/new-collection';
import CollectionSuccess from '../modals/collection-success';
import { useAppDispatch } from "@/redux/hook";
import { createCollection, getUserCollections } from '@/redux/slices/collectionSlice';
import { toast } from 'react-toastify';

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

    const data: CreateCollectionPayload = {
      title: formData.title,
      description: formData.description,
      bannerImage: formData.bannerImage,
      genre: formData.genres,
      collaborators: formData.collaborators,
      creatorDetails: formData.creatorDetails
    };
    setCollectionData(formData);

    try {
      setIsSubmitting(true);
      
      const result = await dispatch(createCollection(data as any)).unwrap();
      if(result){
        toast.success('Collection created successfully!');
        setShowSuccess(true); 
      }

    } catch (error: any) {
      console.error('❌ Error creating collection:', error);
      toast.info(`Failed to create collection: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    dispatch(getUserCollections());
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