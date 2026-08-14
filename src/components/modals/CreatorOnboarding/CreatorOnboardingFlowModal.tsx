"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardaModal from "../DashboardaModal";
import DashboardbModal from "../DashboardbModal";
import DashboardcModal from "../DashboardcModal";
import DashboarddModal from "../DashboarddModal";

/**
 * Creator Onboarding Flow Modal
 * 
 * This modal manages the creator onboarding process using a sequence of 4 Dashboard modals:
 * 1. DashboardaModal - Welcome to Quiva ComicPad
 * 2. DashboardbModal - Craft and Publish Comics
 * 3. DashboardcModal - Monetize Your Work
 * 4. DashboarddModal - Join the Community
 * 
 * After completion, users are redirected to the Comic Pad (/comic-pad) to start creating.
 * Users can skip the tour at any step and go directly to Comic Pad.
 */

interface CreatorOnboardingFlowModalProps {
  onClose: () => void;
  onComplete: () => void;
}

const CreatorOnboardingFlowModal = ({ onClose, onComplete }: CreatorOnboardingFlowModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const totalSteps = 4; // 4 Dashboard modals for creator onboarding

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to Comic Pad
      handleComplete();
    }
  };

  const handleSkip = () => {
    // Skip to Comic Pad immediately
    handleComplete();
  };

  const handleComplete = () => {
    onComplete();
    // Navigate to Comic Pad after creator onboarding
    router.push("/comic-pad");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DashboardaModal
            onNext={handleNext}
            onSkip={handleSkip}
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        );
      case 2:
        return (
          <DashboardbModal
            onNext={handleNext}
            onSkip={handleSkip}
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        );
      case 3:
        return (
          <DashboardcModal
            onNext={handleNext}
            onSkip={handleSkip}
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        );
      case 4:
        return (
          <DashboarddModal
            onNext={handleNext}
            onSkip={handleSkip}
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        );
      default:
        return (
          <DashboardaModal
            onNext={handleNext}
            onSkip={handleSkip}
            totalSteps={totalSteps}
            currentStep={currentStep}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderCurrentStep()}
    </div>
  );
};

export default CreatorOnboardingFlowModal;