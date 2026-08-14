"use client";
import React from "react";
import Image from "next/image";
import { OrangeButton } from "@/components/button";
import { comicpadImgCreator } from "../../../public/dev_images";

type Props = {
  onNext?: () => void;
  onSkip?: () => void;
  totalSteps?: number;
  currentStep?: number;
};

const DashboarddModal = ({ onNext, onSkip, totalSteps = 6, currentStep = 1 }: Props) => {

  const handleNext = () => {
    if (onNext) onNext();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white text-center">
      {/* Image */}
      <div className="flex justify-center mb-6">
        <Image
          src={comicpadImgCreator}
          alt="Mobile Progress"
          width={300}
          height={300}
          className="rounded-2xl w-full max-w-md h-auto"
        />
      </div>

      {/* Step Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition ${
              i + 1 === currentStep ? "bg-white" : "bg-white/40"
            }`}
          ></div>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-4">
        Manage, Track & Grow your Audience.
      </h3>

      {/* Description */}
      <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8">
        Your creator Dashboard gives you real-time insights into engagement, earning, and fan activity.
      </p>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-4">
        <OrangeButton
          onClick={handleNext}
          className="w-full sm:w-auto py-4 px-8 text-lg min-w-[200px]"
        >
          Got it!
        </OrangeButton>
      </div>
    </div>
  );
};

export default DashboarddModal;
