import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { confettiIcon } from '../../../../../public/dev_images';
import { MainButton } from '@/components/button';

interface CollectionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadEpisode: () => void;
  onSkip: () => void;
  collectionImage?: string;
}

const CollectionSuccess: React.FC<CollectionSuccessModalProps> = ({
  isOpen,
  onClose,
  onUploadEpisode,
  onSkip,
  collectionImage
}) => {
  if (!isOpen) return null;

  return (
      <div className="bg-transparent text-white max-w-md mx-auto rounded-lg relative">

        <div className="p-8 text-center space-y-8">
          {/* Collection Image */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={collectionImage || "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80"}
                alt="Collection cover"
                className="w-32 h-44 md:w-80 md:h-80 object-cover rounded-lg shadow-2xl"
              />

              {/* Celebration icon overlay - bottom right of image */}
              <div className="absolute -bottom-2 -right-2">
                <div className="w-12 h-12 bg-transparent rounded-full flex items-center justify-center shadow-lg">
                  {/* Party emoji with sparkles */}
                  <div className="relative">
                    {/* <span className="text-2xl">🎉</span> */}
                    <img src="/confetti-icon.svg" alt="Celebration" className="w-16 h-16 object-cover" />
                    {/* Sparkle effects */}
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
              Collection Published successfully!
            </h3>
            <p className="text-white/60 font-light">
              You&apos;re all set. Start uploading your first episode.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <MainButton
              onClick={onUploadEpisode}
              className='w-full'
            >
              Upload New Episode
            </MainButton>

            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full border border-white/20 text-white/80 hover:bg-white/5 hover:text-white font-semibold py-4 rounded-full text-base transition-all duration-200 bg-transparent"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>
  );
};

export default CollectionSuccess;
