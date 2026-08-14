'use client';

import React, { useState } from 'react';
import EpisodeFormController from './steps/EpisodeFormController';
import EpisodeSuccess from './episode-success';
import axios from 'axios';
import { toast } from 'react-toastify';

interface EpisodeFormData {
  title: string;
  episodeNumber: string;
  summary: string;
  maturityRating: string;
  bannerImage: File | null;
  collaborators: string[];
  contentType: 'pdf' | 'images' | 'motion' | null;
  pages: File[];
}

interface EpisodeFormProps {
  readonly onClose?: () => void;
  readonly collectionId?: string;
}

function EpisodeForm({ onClose, collectionId }: EpisodeFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [episodeData, setEpisodeData] = useState<EpisodeFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  
  const handleSuccess = async (data: EpisodeFormData) => {
    setIsLoading(true);
    setEpisodeData(data);
    
    try {      
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to create episode:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = (data: EpisodeFormData) => {
    setEpisodeData(data);    

    // Save to localStorage or make API call
    try {
      localStorage.setItem(`episode_draft_${collectionId}`, JSON.stringify({
        ...data,
        bannerImage: null, // Can't serialize File objects
        pages: [] // Can't serialize File objects
      }));
      
      // Show success message
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    if (onClose) {
      onClose();
    }
  };

  const handleUploadNewEpisode = () => {
    setShowSuccess(false);
    setEpisodeData(null);
    setFormKey(prev => prev + 1);
  };

  const handleBackToCollection = () => {
    // Navigate back to collection view
    console.log('Navigating back to collection');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-full h-full">
      {!showSuccess && (
        <EpisodeFormController
          key={formKey}
          onSubmit={handleSuccess}
          onSaveDraft={handleSaveDraft}
          isLoading={isLoading}
          collectionId={collectionId}
        />  
      )}
      
      {showSuccess && (
        <div className="flex items-center justify-center h-full p-8 bg-black-500">
          <EpisodeSuccess
            isOpen={showSuccess}
            onClose={handleCloseSuccess}
            onUploadNewEpisode={handleUploadNewEpisode}
            onBackToCollection={handleBackToCollection}
            episodeImage={episodeData?.bannerImage ? URL.createObjectURL(episodeData.bannerImage) : undefined}
            collectionCover={null}
          />
        </div>
      )}
    </div>
  );
}

export default EpisodeForm;