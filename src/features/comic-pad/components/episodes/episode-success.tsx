import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { MainButton } from '@/components/button';

interface EpisodeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadNewEpisode: () => void;
  onBackToCollection: () => void;
  episodeImage?: string;
  collectionCover?: string;
}

const EpisodeSuccess: React.FC<EpisodeSuccessModalProps> = ({
  isOpen,
  onClose,
  onUploadNewEpisode,
  onBackToCollection,
  episodeImage,
  collectionCover
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-transparent font-recursive text-white max-w-md mx-auto rounded-lg relative">

      <div className="p-8 text-center space-y-8">
        {/* Episode Images */}
        <div className="flex justify-center items-center">
          <div className="relative">
            {/* Main collection cover */}
            <img
              src={episodeImage || collectionCover || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&q=80"}
              alt="Collection cover"
              className="w-32 h-44 md:w-80 md:h-80 object-cover rounded-lg shadow-2xl"
            />

            {/* Celebration icon overlay */}
            <div className="absolute -bottom-2 -right-2">
                <div
                    className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                    {/* Party emoji with sparkles */}
                    <div className="relative">
                        {/* <span className="text-2xl">🎉</span> */}
                        <img
                            src="/confetti-icon.svg"
                            alt="Celebration"
                            className="w-16 h-16 object-cover"/> {/* Sparkle effects */}
                        <div className="absolute -top-1 -right-1 text-yellow-300 text-xs">✨</div>
                        <div className="absolute -bottom-1 -left-1 text-pink-300 text-xs">🎊</div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-white">
            Congrats! You are getting there
          </h3>
          <p className="text-white/60 font-light">
            Keep adding more episodes to this series or create a drop from it.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <MainButton
            onClick={onUploadNewEpisode}
            className="w-full"
          >
            Upload New Episode
          </MainButton>

          <Button
            onClick={onBackToCollection}
            variant="outline"
            className="w-full border-white text-white bg-transparent hover:bg-white font-semibold py-3 rounded-full">
            Back to collection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EpisodeSuccess;