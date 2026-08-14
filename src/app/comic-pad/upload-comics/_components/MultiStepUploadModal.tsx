"use client";
import React, { useState } from "react";
import UploadModal from "./UploadModal"; // Step1
import { ComicUploadModal } from "./ComicUploadModal"; // Step2

interface MultiStepUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MultiStepUploadModal = ({ isOpen, onClose }: MultiStepUploadModalProps) => {
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  if (!isOpen) return null;

  return (
    <>
      {step === 1 && <UploadModal onClose={onClose}  />}
      {step === 2 && <ComicUploadModal onNext={handleNext}  isOpen={true} onClose={onClose} />}
    </>
  );
};

export default MultiStepUploadModal;
