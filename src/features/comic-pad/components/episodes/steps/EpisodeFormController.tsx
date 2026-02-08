'use client';

import React, { useState, useCallback, useEffect } from 'react';
import EpisodeDetailsStepComponent from './EpisodeDetailsStep';
import ContentFilesStepComponent from './ContentFilesStep';
import PreviewPublishStep from './PreviewPublishStep';
import { useMintComic } from '@/hook/useMintComic'; // Adjust path as needed
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { 
  createFullComic, 
  clearError, 
  clearSuccessMessage,
  selectIsCreating,
  selectComicError,
  selectSuccessMessage 
} from '@/redux/slices/comicSlice'; // Adjust path to your comic slice

interface EpisodeFormData {
  // Episode Details
  title: string;
  episodeNumber: string;
  summary: string;
  maturityRating: string;
  bannerImage: File | null;
  collaborators: string[];
  genre: string[];
  contentType: 'pdf' | 'images' | null;
  pages: File[];
}

interface EpisodeFormControllerProps {
  onSubmit: (data: EpisodeFormData) => void;
  onSaveDraft: (data: EpisodeFormData) => void;
  isLoading?: boolean;
  collectionId?: string;
}

const EpisodeFormController: React.FC<EpisodeFormControllerProps> = ({
  onSubmit,
  onSaveDraft,
  isLoading: externalLoading = false,
  collectionId
}) => {

  const dispatch = useAppDispatch();

  // Redux selectors with safe fallbacks
  const isCreating = useAppSelector(selectIsCreating) || false;
  const {currentComic:createdComic} = useAppSelector((state: any) => state.comic) || null;
  const error = useAppSelector(selectComicError) || null;
  const successMessage = useAppSelector(selectSuccessMessage) || null;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EpisodeFormData>({
    title: '',
    episodeNumber: '',
    summary: '',
    maturityRating: '',
    bannerImage: null,
    collaborators: [],
    contentType: null,
    pages: [],
    genre: []
  });

  const { 
      account,
      isConnected, 
      connector,
      signer,
      connectWallet 
    } = useHederaWallet();

  const { user } = useAppSelector((state: any) => state.wallet || {});
  
  const { createComicNFT } = useMintComic({
    accountId: account || user?.walletAddress || '',
    signer: signer,
    network: "testnet"
  });

  // Handle successful comic creation
  useEffect(() => {
    if (createdComic && !isCreating && !error) {
      console.log("🆔 Created comic in DB with ID:", createdComic._id);
      console.log("📝 Created comic with metadata CID:", createdComic.nftMetadataCid);
      console.log("📄 Full created comic data:", createdComic);

      // Call onSubmit to finalize (or show success UI)
      onSubmit(formData);
      
    }
  }, [createdComic, isCreating, error, formData, onSubmit, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Comic creation error:", error);
      // You can show a toast notification here or handle the error as needed
    }
  }, [error]);

  // Clear error and success messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<EpisodeFormData>) => {
    console.log("Updating form data:", updates);
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Step validation
  const isStep1Valid = true;
  const isStep2Valid = formData.contentType && formData.pages.length > 0;
  const isStep3Valid = true; // Preview step is always valid

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  }, [currentStep, formData, onSubmit]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft(formData);
  }, [formData, onSaveDraft]);

  const handlePublish = useCallback(async () => {
    if (!collectionId) {
      console.error("Collection ID is required");
      return;
    }

    console.log("Publishing episode with data:", formData);

    // Clear any previous errors
    dispatch(clearError());
    dispatch(clearSuccessMessage());

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('episodeNumber', formData.episodeNumber);
    formDataToSend.append('summary', formData.summary);
    formDataToSend.append('maturityRating', formData.maturityRating);
    formDataToSend.append('genre', JSON.stringify(formData.genre));
    
    if (formData.bannerImage) {
      formDataToSend.append('bannerImage', formData.bannerImage);
    }
    
    formDataToSend.append('collaborators', JSON.stringify(formData.collaborators));
    formDataToSend.append('contentType', formData.contentType || '');
    
    formData.pages.forEach((file, index) => {
      formDataToSend.append('pages', file);
    });
    
    formDataToSend.append('collectionId', collectionId);

    const nftDetails = {
      "mintStatus": "pending",
      "price": 0,
      "tokenId": "0",
      "contractAddress": "0",
      "maxSupply": 0,
      "currentSupply": 0,
      "royaltyPercentage": 0
    };

    formDataToSend.append('nftDetails', JSON.stringify(nftDetails));

    // Dispatch Redux action instead of direct API call
    try {
      const result = await dispatch(createFullComic({ 
        formData: formDataToSend, 
        collectionId 
      } as any)).unwrap();
      
      console.log("Redux dispatch successful:", result);

      onSubmit(formData);
    } catch (err: any) {
      console.error("Redux dispatch failed:", err);
      // Error is already handled in Redux state and useEffect
    }
  }, [formData, collectionId, dispatch]);

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EpisodeDetailsStepComponent
            data={{
              title: formData.title,
              episodeNumber: formData.episodeNumber,
              summary: formData.summary,
              maturityRating: formData.maturityRating,
              bannerImage: formData.bannerImage,
              collaborators: formData.collaborators,
              genre: formData.genre
            }}
            onUpdate={updateFormData}
            onNext={handleNext}
            onSaveDraft={handleSaveDraft}
            isValid={isStep1Valid}
          />
        );

      case 2:
        return (
          <ContentFilesStepComponent
            data={{
              contentType: formData.contentType,
              files: formData.pages
            }}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
            onSaveDraft={handleSaveDraft}
            isValid={isStep2Valid}
          />
        );

      case 3:
        return (
          <PreviewPublishStep
            data={{
              title: formData.title,
              episodeNumber: formData.episodeNumber,
              previewImage: formData.bannerImage ? URL.createObjectURL(formData.bannerImage) : undefined
            }}
            onPublish={handlePublish}
            onPrev={handlePrev}
            onSaveDraft={handleSaveDraft}
            isLoading={isCreating || externalLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-black-500">
      {error && (
        <div className="bg-red-600 text-white p-2 mb-2 rounded">
          {typeof error === 'string' ? error : 'An error occurred'}
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
};

export default EpisodeFormController;