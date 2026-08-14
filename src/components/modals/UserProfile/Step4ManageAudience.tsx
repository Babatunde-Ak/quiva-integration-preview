"use client";
import React from "react";
import { audience } from "../../../../public/dev_images";
import Image from "next/image";
import { MainButton } from "@/components/button";

type Props = {
  onComplete?: () => void;
  totalSteps?: number;
  currentStep?: number;
};

const Step4ManageAudienceModal = ({ 
  onComplete,
  totalSteps = 5, 
  currentStep = 4 
}: Props) => {
  return (
    <> 
      
      <div className="w-full max-w-2xl mx-auto px-8 py-12 bg-gradient-to-b from-zinc-900 to-black rounded-3xl text-white text-center">
        {/* Progress Image */}
        <div className="flex justify-center mb-6">
          <Image
            src={audience}
            alt="Welcome to Profile Creation"
            width={300}
            height={300}
            className="rounded-2xl w-full max-w-md h-auto"
          />
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center gap-2 mb-12">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 === currentStep 
                  ? "w-8 bg-amber-500" 
                  : "w-1 bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 tracking-tight text-white">
          Manage, Track & Grow your Audience
        </h1>

        {/* Description */}
        <p className="text-white/30 text-sm sm:text-base leading-relaxed mb-12 max-w-xl mx-auto font-light">
         Your Creator Dashboard gives you real-time insights into engagement, earning, and fan activity.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4">
          <MainButton
            onClick={onComplete}
            className="w-full max-w-lg py-4 px-8 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-base rounded-full transition-all duration-200 shadow-lg shadow-amber-500/20"
          >
            Go it!
          </MainButton>

        </div>
      </div>
    </>
  );
};

export default Step4ManageAudienceModal;