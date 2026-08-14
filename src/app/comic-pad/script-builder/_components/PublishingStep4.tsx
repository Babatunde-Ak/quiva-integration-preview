"use client";
import React, { useState } from "react";
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

interface PublishingStep4Props {
  onPublish: () => void;
  onBack: () => void;
  formData: FormData;
}

const PublishingStep4 = ({ onPublish, onBack, formData }: PublishingStep4Props) => {
  const [showModal, setShowModal] = useState(false);

  const handlePublish = () => {
    onPublish(); // backend logic
    setShowModal(true); // open success modal
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-6 pt-8 pb-12 text-white animate-fadeIn">
      {/* Step Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-none ${
              i + 1 === 4
                ? "bg-secondary-300 scale-110"
                : i + 1 < 4
                ? "bg-secondary-300/60"
                : "bg-white/30"
            }`}
          ></div>
        ))}
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
        Review & Publish
      </h3>

      <p className="text-white/60 text-center mb-8">
        Review your choices one last time. This is it! 🚀
      </p>

      {/* Comic Preview Card */}
      <div className="bg-white/5 border border-white/20 rounded-2xl overflow-hidden shadow-lg mb-8">
        <div className="relative w-full h-48">
          <Image
            src={formData.coverUrl || "/dev_images/placeholder.png"}
            alt="Comic Cover"
            fill
            className="object-cover"
          />
          <div className="absolute top-3 left-3 bg-secondary-300 text-black text-xs font-bold px-3 py-1 rounded-full">
            {formData.accessType === "Free" ? "FREE" : "PREMIUM"}
          </div>
        </div>

        <div className="p-6 space-y-3">
          <h4 className="text-lg font-bold">
            {formData.title || "Untitled Comic"}
          </h4>
          <p className="text-sm text-white/70">{formData.description}</p>

          <div className="text-sm text-white/80 space-y-1 mt-4">
            <p>
              <strong>Episode:</strong> {formData.episodeTitle || "Episode 1"}
            </p>
            <p>
              <strong>Visibility:</strong> Public
            </p>
            {formData.accessType === "PayPerRead" && (
              <p>
                <strong>Reading Access:</strong> Pay-Per-Read ({formData.price} HBAR)
              </p>
            )}
            {formData.nftEnabled && (
              <p>
                <strong>NFT Edition:</strong> Yes · Size: {formData.nftEditionSize} · Mint Price:{" "}
                {formData.nftPrice} HBAR
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      <p className="text-xs text-white/60 mb-6 text-center">
        By clicking <span className="text-orange-400 font-semibold">PUBLISH COMIC</span>, your comic
        will become live on the marketplace and cannot be easily undone.
      </p>

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <button
          onClick={handlePublish}
          className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 px-8 rounded-2xl shadow-lg transition text-lg"
        >
          Publish Comic
        </button>

        <button
          onClick={onBack}
          className="w-full bg-transparent text-white/70 font-medium py-4 px-8 rounded-2xl border border-white/20 transition-none"
        >
          Back
        </button>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fadeIn">
          <div className="bg-neutral-900 rounded-2xl p-6 w-[420px] shadow-xl text-center">
            {/* Logo / Brand */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold">
                Q
              </div>
            </div>

            {/* Cover Image */}
            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={formData.coverUrl || "/dev_images/placeholder.png"}
                alt="Comic Cover"
                fill
                className="object-cover"
              />
            </div>

            {/* Message */}
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">
              Your comic <span className="text-orange-400">“{formData.title}”</span> is LIVE!
            </h2>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => alert("Redirect to comic page")}
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition"
              >
                View comic
              </button>
              <button
                onClick={() => alert("Share comic")}
                className="w-full py-3 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition"
              >
                Share comic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishingStep4;