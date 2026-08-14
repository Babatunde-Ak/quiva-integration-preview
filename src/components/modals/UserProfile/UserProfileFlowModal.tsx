"use client";
import React, { useState } from "react";
import Step1WelcomeModal from "./Step1WelcomeModal";
import Step4ManageAudienceModal from './Step4ManageAudience';
import Step3UnlockRevenueModal from './Step3UnlockRevenue';
import Step2CraftAndPublishModal from './Step2CraftAndPublish';
import Step5CompletionModal from "./Step5CompletionModal";

import { Router } from "lucide-react";
// import { useRouter } from "next/router";

// const router = useRouter();

interface UserProfileData {
  displayName?: string;
  username?: string;
  bio?: string;
  interests?: string[];
  profileImage?: File;
  profilePreview?: string;
  bannerImage?: File;
  bannerPreview?: string;
}

interface UserProfileFlowModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const UserProfileFlowModal = ({ onClose, onComplete }: UserProfileFlowModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<UserProfileData>({});
  const totalSteps = 5;

  const handleSkip = () => {
    // User chooses to skip profile setup
    onComplete();
  };

  // const handleStep2Next = (data: { displayName: string; username: string }) => {
  //   setUserData(prev => ({ ...prev, ...data }));
  //   setCurrentStep(3);
  // };

  // const handleStep3Next = (data: { 
  //   username?: string; 
  //   profileImage?: File; 
  //   profilePreview?: string; 
  //   bannerImage?: File; 
  //   bannerPreview?: string; 
  //   bio?: string; 
  // }) => {
  //   setUserData(prev => ({ ...prev, ...data }));
  //   setCurrentStep(4);
  // };

  // const handleStep4Next = (data: { interests: string[] }) => {
  //   setUserData(prev => ({ ...prev, ...data }));
  //   setCurrentStep(5);
  // };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalComplete = async () => {
    // Complete the flow
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1WelcomeModal
            onNext={() => setCurrentStep(2)}
            totalSteps={totalSteps}
            currentStep={currentStep}
            onSkip={handleSkip}
          />
        );
      case 2:
        return (
          <Step2CraftAndPublishModal
            onNext={() => setCurrentStep(3)}
            onBack={handleStepBack}
            totalSteps={totalSteps}
            currentStep={currentStep}
            onSkip={handleSkip}
            // initialData={{
            //   displayName: userData.displayName,
            //   username: userData.username,
            // }}
          />
        );
      case 3:
        return (
          <Step3UnlockRevenueModal
            onNext={() => setCurrentStep(4)}
            onBack={handleStepBack}
            totalSteps={totalSteps}
            currentStep={currentStep}
            onSkip={handleSkip}
            // initialData={{
            //   username: userData.username,
            //   profileImage: userData.profileImage,
            //   profilePreview: userData.profilePreview,
            //   bannerImage: userData.bannerImage,
            //   bannerPreview: userData.bannerPreview,
            //   bio: userData.bio,
            // }}
          />
        );
      case 4:
        return (
          <Step5CompletionModal
            onNext={() => setCurrentStep(5)}
            onBack={handleStepBack}
            totalSteps={totalSteps}
            currentStep={currentStep}
            initialData={userData}
          />
          
        );
      case 5:
        return (
          <Step4ManageAudienceModal
            onComplete={handleFinalComplete}
            totalSteps={totalSteps}
            currentStep={currentStep}
            // initialData={{
            //   interests: userData.interests,
            // }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Close button (only show on first step) */}
      {currentStep === 1 && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition"
        >
          <span className="text-white text-lg">×</span>
        </button>
      )}

      {/* Render current step */}
      {renderCurrentStep()}
    </div>
  );
};

export default UserProfileFlowModal;