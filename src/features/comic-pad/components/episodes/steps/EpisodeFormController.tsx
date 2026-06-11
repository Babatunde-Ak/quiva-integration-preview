'use client';

import React, { useState, useCallback, useEffect } from 'react';
import EpisodeDetailsStepComponent from './EpisodeDetailsStep';
import ContentFilesStepComponent from './ContentFilesStep';
import PreviewPublishStep from './PreviewPublishStep';
//import { useMintComic } from '@/hook/useMintComic'; // Adjust path as needed
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import {
  createFullComic,
  clearError,
  clearSuccessMessage,
  clearCurrentComic,
  selectIsCreating,
  selectComicError,
  selectSuccessMessage
} from '@/redux/slices/comicSlice';
import { toast } from 'react-toastify';

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

interface ValidationState {
  title: boolean;
  episodeNumber: boolean;
  maturityRating: boolean;
  genre: boolean;
  bannerImage: boolean;
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

  const [validationErrors, setValidationErrors] = useState<ValidationState>({
    title: false,
    episodeNumber: false,
    maturityRating: false,
    genre: false,
    bannerImage: false
  });

  const [showValidation, setShowValidation] = useState(false);

  const { 
      account,
      isConnected, 
      connector,
      signer,
      connectWallet 
    } = useHederaWallet();

  const { user } = useAppSelector((state: any) => state.wallet || {});
  
  // const { createComicNFT } = useMintComic({
  //   accountId: account || user?.walletAddress || '',
  //   signer: signer,
  //   network: "testnet"
  // });

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Comic creation error:", error);
      toast.error("Failed to create episode. Please try again.");
    }
  }, [error]);

  // Clear stale Redux state on mount and on unmount
  useEffect(() => {
    dispatch(clearCurrentComic());
    dispatch(clearError());
    dispatch(clearSuccessMessage());
    return () => {
      dispatch(clearCurrentComic());
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  // Validation function
  const validateStep1 = useCallback(() => {
    const errors = {
      title: formData.title.trim() === '',
      episodeNumber: formData.episodeNumber.trim() === '',
      maturityRating: formData.maturityRating === '',
      genre: (formData.genre || []).length === 0,
      bannerImage: formData.bannerImage === null
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(Boolean);
  }, [formData]);

  // Update form data
  const updateFormData = useCallback((updates: Partial<EpisodeFormData>) => {
    console.log("Updating form data:", updates);
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear validation errors for updated fields
    if (showValidation) {
      const newErrors = { ...validationErrors };
      Object.keys(updates).forEach(key => {
        if (key in newErrors) {
          const fieldKey = key as keyof ValidationState;
          if (fieldKey === 'title' || fieldKey === 'episodeNumber') {
            newErrors[fieldKey] = (updates[key] as string)?.trim() === '';
          } else if (fieldKey === 'maturityRating') {
            newErrors[fieldKey] = (updates[key] as string) === '';
          } else if (fieldKey === 'genre') {
            newErrors[fieldKey] = ((updates[key] as string[]) || []).length === 0;
          }
          else if (fieldKey === 'bannerImage') {
            newErrors[fieldKey] = updates[key] === null;
          }
        }
      });
      setValidationErrors(newErrors);
    }
  }, [showValidation, validationErrors]);

  // Step validation
  const isStep1Valid = formData.title.trim() !== '' && 
                      formData.episodeNumber.trim() !== '' && 
                      formData.maturityRating !== '' && 
                      (formData.genre || []).length > 0 &&
                      formData.bannerImage !== null;
  const isStep2Valid = formData.contentType && formData.pages.length > 0;
  const isStep3Valid = true; // Preview step is always valid

  // Get missing fields for toast message
  const getMissingFields = () => {
    const missing = [];
    if (formData.title.trim() === '') missing.push('Title');
    if (formData.episodeNumber.trim() === '') missing.push('Episode Number');
    if (formData.maturityRating === '') missing.push('Maturity Rating');
    if ((formData.genre || []).length === 0) missing.push('At least one Genre');
    if (formData.bannerImage === null) missing.push('Banner Image');
    return missing;
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      const isValid = validateStep1();
      setShowValidation(true);
      
      if (!isValid) {
        const missingFields = getMissingFields();
        toast.error(`Please complete the following required fields: ${missingFields.join(', ')}`);
        return;
      }
      
      toast.success("Episode details completed!");
    }
    
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  }, [currentStep, formData, onSubmit, validateStep1]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft(formData);
    toast.success("Draft saved successfully!");
  }, [formData, onSaveDraft]);

  const handlePublish = useCallback(async () => {
    if (!collectionId) {
      console.error("Collection ID is required");
      toast.error("Collection ID is required to publish episode");
      return;
    }

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

    // Show loading toast
    const loadingToast = toast.loading("Publishing episode...");

    // Dispatch Redux action instead of direct API call
    try {
      const result = await dispatch(createFullComic({ 
        formData: formDataToSend, 
        collectionId 
      } as any)).unwrap();
      
      toast.dismiss(loadingToast);
      toast.success("Episode published successfully!");
      
      onSubmit(formData);
    } catch (err: any) {
      console.error("Redux dispatch failed:", err);
      toast.dismiss(loadingToast);
      toast.error("Failed to publish episode. Please try again.");
    }
  }, [formData, collectionId, dispatch, onSubmit]);

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
            validationErrors={validationErrors}
            showValidation={showValidation}
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