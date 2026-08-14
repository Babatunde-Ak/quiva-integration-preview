"use client";
import React from "react";
import Image from "next/image";
import { oneClick } from "../../../../public/dev_images";
import { OrangeButton } from "@/components/button";

interface BasicInfoFormValues {
  displayName: string;
  username: string;
}

type Props = {
  onNext: (data: BasicInfoFormValues) => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
  initialData?: Partial<BasicInfoFormValues>;
};

const Step2BasicInfoModal = ({ 
  onNext, 
  onBack, 
  totalSteps = 5, 
  currentStep = 2,
  initialData = {}
}: Props) => {

  const handleNext = () => {
    // Provide default values for the 1-click buying step
    onNext({ displayName: "User", username: "user" });
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white text-center">
      {/* Step Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              i + 1 === currentStep ? "bg-yellow-500" : i + 1 < currentStep ? "bg-yellow-500/60" : "bg-white/40"
            }`}
          ></div>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-4">
        Introducing 1-click Buying
      </h3>

      {/* Progress Image */}
      <div className="flex justify-center mb-6">
        <Image
          src={oneClick}
          alt="1-click Buying"
          width={300}
          height={300}
          className="rounded-2xl w-full max-w-md h-auto"
        />
      </div>

      {/* Description */}
      <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
        Account Wallets make everything faster. All your transactions can be done in a single click on Quiva when using your Account Wallet.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium py-4 px-8 rounded-2xl border border-white/20 transition min-w-[150px]"
        >
          Back
        </button>
        <OrangeButton
          onClick={handleNext}
          className="py-4 px-8 text-lg min-w-[150px]"
        >
          Next
        </OrangeButton>
      </div>
    </div>
  );
};

export default Step2BasicInfoModal;