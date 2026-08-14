"use client";
import React, { useState } from "react";
import { OrangeButton } from "@/components/button";

const INTEREST_OPTIONS = [
  "Action & Adventure",
  "Fantasy", 
  "Science Fiction",
  "Romance",
  "Horror",
  "Mystery & Thriller",
  "Slice of Life",
  "Comedy",
  "Historical & Biographical",
  "Superhero",
  "Supernatural",
  "Drama"
];

interface InterestsFormValues {
  interests: string[];
}

type Props = {
  onNext: (data: InterestsFormValues) => void;
  onBack: () => void;
  totalSteps?: number;
  currentStep?: number;
  initialData?: Partial<InterestsFormValues>;
};

const Step4BioInterestsModal = ({ 
  onNext, 
  onBack, 
  totalSteps = 5, 
  currentStep = 4,
  initialData = {}
}: Props) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData.interests || []);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = async () => {
    if (selectedInterests.length === 0) {
      return; // Don't proceed if no interests selected
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setIsLoading(false);
    onNext({ interests: selectedInterests });
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 pt-6 pb-10 text-white">
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

      {/* 1. Title Heading */}
      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        What do you love Reading
      </h3>

      {/* 2. Description Text */}
      <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 text-center max-w-2xl mx-auto">
        Tell us what you love so that we can recommend the right comics to you.
      </p>

      {/* 3. Interest Selection Buttons */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                selectedInterests.includes(interest)
                  ? "bg-orange-500 text-black border-orange-500 shadow-lg"
                  : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10 hover:border-white/40 hover:text-white"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        
        {selectedInterests.length > 0 && (
          <p className="text-orange-500 text-sm mt-4 text-center">
            {selectedInterests.length} interest{selectedInterests.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* 4. Back and Next Buttons */}
      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <OrangeButton
          onClick={handleNext}
          disabled={isLoading || selectedInterests.length === 0}
          className="w-full py-4 px-8 text-lg"
        >
          {isLoading ? "Processing..." : "Next"}
        </OrangeButton>
        
        <button
          onClick={onBack}
          className="w-full bg-transparent hover:bg-white/10 text-white/70 hover:text-white font-medium py-4 px-8 rounded-2xl border border-white/20 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default Step4BioInterestsModal;