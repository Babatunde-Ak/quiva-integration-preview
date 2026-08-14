"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Picture from "@/components/picture/Index";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";

interface CarouselStep {
    title: string;
    image: any;
    mobileImage?: any;
    step: number;
}

interface MobileProgressCarouselProps {
  steps: CarouselStep[];
  autoSlideInterval?: number;
}

const MobileProgressCarousel: React.FC<MobileProgressCarouselProps> = ({ 
  steps, 
  autoSlideInterval = 5000 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide functionality
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [currentStep, isPaused, autoSlideInterval, steps.length]);

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="mt-8 w-full">
      {/* Step Counter */}
      <div className="flex justify-center mb-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 mx-auto text-center space-y-3">
            <span className="text-white/80 text-lg">
                Step {currentStep + 1}
            </span>
            <h3 className="text-xl font-bold text-white text-center leading-6">
                {steps[currentStep]?.title}
            </h3>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative w-full max-w-sm mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Main Slide Area */}
        <div className="relative h-80 overflow-hidden rounded-lg bg-gradient-to-br from-black/20 to-black/40 backdrop-blur-sm">
          <AnimatePresence custom={direction} initial={false}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              {/* Image */}
              <div className="w-full h-40 flex items-center justify-center mb-4">
                <Picture
                  src={steps[currentStep]?.mobileImage || steps[currentStep]?.image}
                  alt={steps[currentStep]?.title}
                  className="w-full h-full object-contain min-w-[200px]"
                />
              </div>
            
              {/* Title */}
              {/* <h3 className="text-xl font-bold text-white text-center leading-6">
                {steps[currentStep]?.title}
              </h3> */}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {/* <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all duration-200 z-10"
            aria-label="Previous step"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all duration-200 z-10"
            aria-label="Next step"
          >
            <HiOutlineArrowRight className="w-4 h-4" />
          </button> */}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "bg-primary-100 w-6"
                  : "bg-white/30 hover:bg-white/50 w-2"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Step Details (Optional) */}
      <div className="mt-6 text-center flex items-center justify-center space-x-4">
        <button
            onClick={goToPrevious}
            className="w-16 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all duration-200 z-10"
            aria-label="Previous step"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goToNext}
            className="w-16 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 transition-all duration-200 z-10"
            aria-label="Next step"
          >
            <HiOutlineArrowRight className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
};

export default MobileProgressCarousel;