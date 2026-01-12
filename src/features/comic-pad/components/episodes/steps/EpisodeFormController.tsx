'use client';

import React, { useState, useCallback } from 'react';
import EpisodeDetailsStepComponent from './EpisodeDetailsStep';
import ContentFilesStepComponent from './ContentFilesStep';
import PreviewPublishStep from './PreviewPublishStep';
import { useMintComic } from '@/hook/useMintComic'; // Adjust path as needed
import { useHederaWallet } from '@/providers/HashPackProvider';
import { useAppSelector } from '@/redux/hook';
import axios from 'axios';
// import { file } from 'jszip';
interface EpisodeFormData {
  // Episode Details
  title: string;
  episodeNumber: string;
  summary: string;
  maturityRating: string;
  bannerImage: File | null;
  collaborators: string[];
  
  // Content Files
  contentType: 'pdf' | 'images' | null;
  pages: File[];
}

interface EpisodeFormControllerProps {
  onSubmit: (data: EpisodeFormData) => void;
  onSaveDraft: (data: EpisodeFormData) => void;
  isLoading?: boolean;
  collectionId?: string;
}

// Example async function to get metadacid from your backend

const EpisodeFormController: React.FC<EpisodeFormControllerProps> = ({
  onSubmit,
  onSaveDraft,
  isLoading: externalLoading = false,
  collectionId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EpisodeFormData>({
    title: '',
    episodeNumber: '',
    summary: '',
    maturityRating: '',
    bannerImage: null,
    collaborators: [],
    contentType: null,
    pages: []
  });

  const { 
      account,
      isConnected, 
      connector,
      signer,
      connectWallet 
    } = useHederaWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {user} = useAppSelector((state:any) => state.wallet);
  // const {  account } = useAccount();
  

  // const { createComicNFT } = useMintComic({
  //   accountId:  account || user?.walletAddress || '',
  //   signer: signer,
  //   network: "testnet"
  // }
  // ); // Adjust to your hook's API

  // Update form data
  const updateFormData = useCallback((updates: Partial<EpisodeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Step validation
//   const isStep1Valid = formData.title.trim() && formData.episodeNumber.trim() && formData.maturityRating.trim() && formData.bannerImage;
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
    setIsLoading(true);
    setError(null);
    try {
      if (!collectionId) {
        throw new Error('Collection ID is required to create an episode.');
      }
      console.log("Publishing episode with data:", formData);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/comics/full/${collectionId}`,
        {
          title: formData.title,
          summary: formData.summary,
          episodeNumber: formData.episodeNumber,
          maturityRating: formData.maturityRating,
          bannerImage: formData.bannerImage,
          collaborators: formData.collaborators,
          pages: formData.pages

        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const createdComic = response.data.data.comic;
      const metadataCid = createdComic.nftMetadataCid;
      const dbComicId = createdComic._id;
      console.log('🆔 Created comic in DB with ID:', dbComicId);
      console.log('📝 Created comic with metadata CID:', metadataCid);
      console.log('📄 Full response data:', response.data);
      console.log('📄 Full created comic data:', createdComic);

      // 2. Mint the episode NFT using the hook
      // await createComicNFT({ ...formData, episodeNumber: Number(formData.episodeNumber) }, collectionId);

      // 3. Call onSubmit to finalize (or show success UI)
      onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to publish episode');
    } finally {
      setIsLoading(false);
    }
  }, [formData, onSubmit]);

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
              collaborators: formData.collaborators
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
              pages: formData.pages
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
            isLoading={isLoading || externalLoading}
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
          {error}
        </div>
      )}
      {renderCurrentStep()}
    </div>
  );
};

export default EpisodeFormController;