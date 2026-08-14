"use client";
import { ArrowLeft } from "lucide-react";

interface PublishingModalProps {
  onClose: () => void;
}

export default function PublishingModal({ onClose }: PublishingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full mx-auto shadow-2xl">
        {/* Comic Panels Grid */}
        <div className="space-y-3 mb-8">
          {/* Top Row - 3 panels */}
          <div className="grid grid-cols-3 gap-3">
            {[
              "/anime-character-walking-in-school-hallway.jpg",
              "/anime-girl-with-pink-hair-close-up-portrait.jpg",
              "/anime-character-with-dark-hair-side-profile.jpg",
            ].map((src, idx) => (
              <div
                key={idx}
                className="aspect-[4/3] bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={src}
                  alt={`Comic panel ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Bottom Row - 2 panels */}
          <div className="grid grid-cols-2 gap-3">
            {[
              "/anime-character-with-cap-and-uniform-in-school-set.jpg",
              "/anime-characters-in-school-building-interior.jpg",
            ].map((src, idx) => (
              <div
                key={idx}
                className="aspect-[4/3] bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={src}
                  alt={`Comic panel ${idx + 4}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center mb-8">
          <p className="text-white text-sm font-medium tracking-wide mb-2">
            PUBLISH YOUR COMIC | STEP 1 OF 4
          </p>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-balance">
            Give your masterpiece one last look
          </h2>
          <p className="text-sm text-muted-foreground text-balance">
            Review your comic panels before sharing with the world
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors text-lg"
          >
            Next
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center border border-border hover:bg-muted text-foreground font-medium py-3 rounded-lg transition-colors bg-transparent text-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </button>
        </div>
      </div>
    </div>
  );
}
