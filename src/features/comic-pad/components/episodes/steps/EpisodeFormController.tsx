'use client';

import React, { useState, useCallback } from 'react';
import EpisodeDetailsStepComponent from './EpisodeDetailsStep';
import ContentFilesStepComponent from './ContentFilesStep';
import PreviewPublishStep from './PreviewPublishStep';

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
  files: File[];
}

interface EpisodeFormControllerProps {
  onSubmit: (data: EpisodeFormData) => void;
  onSaveDraft: (data: EpisodeFormData) => void;
  isLoading?: boolean;
}

const EpisodeFormController: React.FC<EpisodeFormControllerProps> = ({
  onSubmit,
  onSaveDraft,
  isLoading = false
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
    files: []
  });

  // Update form data
  const updateFormData = useCallback((updates: Partial<EpisodeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Step validation
//   const isStep1Valid = formData.title.trim() && formData.episodeNumber.trim() && formData.maturityRating.trim() && formData.bannerImage;
    const isStep1Valid = true;
  const isStep2Valid = formData.contentType && formData.files.length > 0;
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

  const handlePublish = useCallback(() => {
    onSubmit(formData);
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
              files: formData.files
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
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-black-500">
      {renderCurrentStep()}
    </div>
  );
};

export default EpisodeFormController;