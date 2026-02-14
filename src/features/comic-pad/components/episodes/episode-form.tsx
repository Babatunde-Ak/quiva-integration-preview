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
  onClose?: () => void;
  collectionId?: string;
}

function EpisodeForm({ onClose, collectionId }: EpisodeFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [episodeData, setEpisodeData] = useState<EpisodeFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
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
    console.log('Episode draft saved:', data);
    
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
    // Reset form and go back to episode creation
    setShowSuccess(false);
    setEpisodeData(null);
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
            collectionCover="https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&q=80"
          />
        </div>
      )}
    </div>
  );
}

export default EpisodeForm;