'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { MainButton } from '@/components/button';

interface EpisodePreviewData {
  title: string;
  episodeNumber: string;
  previewImage?: string;
}

interface PreviewPublishStepProps {
  data: EpisodePreviewData;
  onPublish: () => void;
  onPrev: () => void;
  onSaveDraft: () => void;
  isLoading: boolean;
}

const PreviewPublishStep: React.FC<PreviewPublishStepProps> = ({
  data,
  onPublish,
  onPrev,
  onSaveDraft,
  isLoading
}) => {

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">PDF Upload</h1>
            <p className="text-white/40 mb-6">For full-chapter upload</p>
            
            {/* Progress Bar */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-16 h-1 bg-primary-500 rounded-full"></div>
                <div className="w-16 h-1 bg-primary-500 rounded-full"></div>
                <div className="w-16 h-1 bg-primary-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="w-8"></div> {/* Spacer for balance */}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center min-h-[60vh]">
          {/* Left Side - Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Swipe to see a preview of your episode
            </h2>
            
            {/* Warning Alert */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-red-500 text-sm font-medium">
                    ⚠️ Important <br/>
                    Publishing on-chain does NOT make content available for sale at Quiva Marketplace.<br/>After publishing, creators must:<br/>
                    <ul className="list-disc list-inside">
                      <li>List the Episode, or</li>
                      <li>Create a Drop</li>
                    </ul>
                  </span>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Episode Preview */}
          <div className="flex justify-center lg:justify-end lg:col-span-2">
            <div className="relative w-full">
              <img
                src={data.previewImage || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop"}
                alt="Episode preview"
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg"></div>
              
              {/* Episode Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-white font-bold text-xl mb-1">
                  {data.title || "The Episode"}
                </h3>
                <p className="text-white/80 text-sm">
                  Episode {data.episodeNumber || "1"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8 max-w-2xl mx-auto">
          <MainButton
            onClick={onPublish}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Publishing Episode...' : 'Publish Episode'}
          </MainButton>

          <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              className="w-full font-recursive border-white text-white bg-transparent hover:bg-white font-light py-3 rounded-full">
              Save as Draft
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPublishStep;