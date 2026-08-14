"use client";
import React, { useState } from "react";
import Image from "next/image";

type Props = {
  onNext?: () => void;
  onSkip?: () => void;
  totalSteps?: number;
};

const Dashbord_FilledModal = ({ onNext, onSkip, totalSteps = 6 }: Props) => {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    if (onNext) onNext();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white text-center">
      {/* Image */}
      <div className="flex justify-center mb-6">
        <Image
          src="/mobile-progress-2.png"
          alt="Mobile Progress"
          width={300}
          height={300}
          className="rounded-2xl w-full max-w-md h-auto"
        />
      </div>

    </div>
  );
};

export default Dashbord_FilledModal;
