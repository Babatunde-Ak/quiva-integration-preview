'use client';

import React, { useState } from 'react'
import CreateCollectionForm from '../modals/new-collection';
import CollectionSuccess from '../modals/collection-success';

interface CollectionViewProps {
  onClose?: () => void; // Add this to handle closing the main modal
}

function CollectionView({ onClose }: CollectionViewProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [collectionData, setCollectionData] = useState<any>(null);
  
  const handleSuccess = (formData: any) => {
    console.log('Collection created successfully');
    console.log('Collection Data:', formData);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    // Optionally close the entire modal when success is completed
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
                    // Handle upload episode
                    console.log('Upload episode clicked');
                    handleCloseSuccess(); // Close modal after action
                }}
                onSkip={() => {
                    // Handle skip
                    console.log('Skip clicked');
                    handleCloseSuccess(); // Close modal after action
                }}
                collectionImage={collectionData?.bannerImage}
            />
        )}
    </div>
  );
}

export default CollectionView;