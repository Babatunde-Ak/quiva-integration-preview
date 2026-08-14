"use client";
import React from "react";
import Image from "next/image";

interface FormData {
  title: string;
  episodeTitle: string;
  description: string;
  coverUrl: string;
  accessType: "Free" | "PayPerRead";
  price: number;
  nftEnabled: boolean;
  nftEditionSize: number;
  nftPrice: number;
}

interface PublishingStep3Props {
  onNext: () => void;
  onBack: () => void;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  formData: FormData;
}

const PublishingStep3 = ({ onNext, onBack, setFormData, formData }: PublishingStep3Props) => {
  const handleNext = () => {
    onNext();
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-6 pt-8 pb-12 text-white animate-fadeIn">
      {/* Step Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-none ${
              i + 1 === 3
                ? "bg-secondary-300 scale-110"
                : i + 1 < 3
                ? "bg-secondary-300/60"
                : "bg-white/30"
            }`}
          ></div>
        ))}
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Pricing & Access
      </h3>

      <div className="flex justify-center mb-8">
        <Image
          src="/dev_images/mobile-progress-3.png"
          alt="Pricing & Access"
          width={400}
          height={300}
          className="rounded-2xl w-full max-w-lg h-auto border border-white/20 shadow-lg"
        />
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-4 text-white">Access Type</label>
          <div className="flex gap-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, accessType: "Free" }))}
              className={`flex-1 py-3 px-4 rounded-lg border transition-none ${
                formData.accessType === "Free"
                  ? "bg-secondary-300 text-black border-secondary-300"
                  : "bg-white/5 text-white border-white/20"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, accessType: "PayPerRead" }))}
              className={`flex-1 py-3 px-4 rounded-lg border transition-none ${
                formData.accessType === "PayPerRead"
                  ? "bg-secondary-300 text-black border-secondary-300"
                  : "bg-white/5 text-white border-white/20"
              }`}
            >
              Pay Per Read
            </button>
          </div>
        </div>

        {formData.accessType === "PayPerRead" && (
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Price (QUIV)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              placeholder="Enter price"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-secondary-300 text-white placeholder:text-white/50"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-4 text-white">NFT Edition (Optional)</label>
          <div className="flex gap-4">
            <button
              onClick={() => setFormData(prev => ({ ...prev, nftEnabled: false }))}
              className={`flex-1 py-3 px-4 rounded-lg border transition-none ${
                !formData.nftEnabled
                  ? "bg-secondary-300 text-black border-secondary-300"
                  : "bg-white/5 text-white border-white/20"
              }`}
            >
              No NFT
            </button>
            <button
              onClick={() => setFormData(prev => ({ ...prev, nftEnabled: true }))}
              className={`flex-1 py-3 px-4 rounded-lg border transition-none ${
                formData.nftEnabled
                  ? "bg-secondary-300 text-black border-secondary-300"
                  : "bg-white/5 text-white border-white/20"
              }`}
            >
              Enable NFT
            </button>
          </div>
        </div>

        {formData.nftEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Edition Size</label>
              <input
                type="number"
                value={formData.nftEditionSize}
                onChange={(e) => setFormData(prev => ({ ...prev, nftEditionSize: Number(e.target.value) }))}
                placeholder="100"
                min="1"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-secondary-300 text-white placeholder:text-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Mint Price (QUIV)</label>
              <input
                type="number"
                value={formData.nftPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, nftPrice: Number(e.target.value) }))}
                placeholder="0.1"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-secondary-300 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-transparent text-white/70 font-medium rounded-lg border border-white/20 transition-none"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-secondary-300 text-black font-bold rounded-lg transition-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PublishingStep3;
