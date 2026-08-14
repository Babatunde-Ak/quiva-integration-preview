'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/image-upload/ImageUpload';
import { IconToggleSwitch } from '@/components/switch/Switch';
import { MainButton } from '@/components/button';
import { genres } from '@/features/comic-pad/mock-data/data';

interface EpisodeDetailsData {
  title: string;
  episodeNumber: string;
  summary: string;
  maturityRating: string;
  bannerImage: File | null;
  collaborators: string[];
  genre?: string[];
}

interface ValidationState {
  title: boolean;
  episodeNumber: boolean;
  maturityRating: boolean;
  genre: boolean;
  bannerImage: boolean;
}

interface EpisodeDetailsStepProps {
  data: EpisodeDetailsData;
  onUpdate: (data: Partial<EpisodeDetailsData>) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isValid: boolean;
  validationErrors?: ValidationState;
  showValidation?: boolean;
}

const EpisodeDetailsStepComponent: React.FC<EpisodeDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onSaveDraft,
  isValid,
  validationErrors = {
    title: false,
    episodeNumber: false,
    maturityRating: false,
    genre: false,
    bannerImage: false
  },
  showValidation = false
}) => {
  const [newCollaborator, setNewCollaborator] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(false);

  const handleAddCollaborator = () => {
    if (newCollaborator.trim() && !data.collaborators.includes(newCollaborator.trim())) {
      onUpdate({
        collaborators: [...data.collaborators, newCollaborator.trim()]
      });
      setNewCollaborator('');
    }
  };

  const handleRemoveCollaborator = (index: number) => {
    onUpdate({
      collaborators: data.collaborators.filter((_, i) => i !== index)
    });
  };

  const handleGenreToggle = (genreId: string) => {
    const currentGenres = data.genre || [];
    onUpdate({
      genre: currentGenres.includes(genreId)
        ? currentGenres.filter(id => id !== genreId)
        : [...currentGenres, genreId]
    });
  };

  // Helper function to get error styling
  const getInputErrorClass = (hasError: boolean) => {
    return hasError ? 'border-red-500 focus:border-red-500' : 'border-black-50 focus:border-primary-500';
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create New Episode</h1>
          <p className="text-white/40 mb-6">Upload your chapter files and set up episode details.</p>
          
          {/* Progress Bar */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className="w-32 h-3 bg-primary-500 rounded-full"></div>
              <div className="w-32 h-3 bg-black-50 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Episode Details Section */}
          <div className="space-y-6">
            <h3 className="font-light text-white">Episode details</h3>

            <div className="space-y-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Input
                  placeholder="Enter episode title"
                  value={data.title}
                  onChange={(e) => onUpdate({ title: e.target.value })}
                  className={`bg-black-500 text-white placeholder-white/40 !py-2 ${
                    showValidation ? getInputErrorClass(validationErrors.title) : 'border-black-50 focus:border-primary-500'
                  }`}
                />
                {showValidation && validationErrors.title && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>Episode title is required</span>
                  </div>
                )}
              </div>

              {/* Episode Number Input */}
              <div className="space-y-2">
                <Input
                  placeholder="Enter episode No"
                  value={data.episodeNumber}
                  onChange={(e) => onUpdate({ episodeNumber: e.target.value })}
                  className={`bg-black-500 text-white placeholder-white/40 !py-2 ${
                    showValidation ? getInputErrorClass(validationErrors.episodeNumber) : 'border-black-50 focus:border-primary-500'
                  }`}
                />
                {showValidation && validationErrors.episodeNumber && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>Episode number is required</span>
                  </div>
                )}
              </div>

              {/* Summary Textarea */}
              <Textarea
                placeholder="Add an optional summary for this episode…"
                value={data.summary}
                onChange={(e) => onUpdate({ summary: e.target.value })}
                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-primary-500 min-h-[120px] resize-none"
              />

              {/* Genre Selection */}
              <div className="space-y-4">
                <p className="text-white">
                  Choose at least one genre so readers can find your episode.
                  {showValidation && validationErrors.genre && (
                    <span className="text-red-500"> *</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge
                      key={genre.id}
                      variant={(data.genre || []).includes(genre.id) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        (data.genre || []).includes(genre.id)
                          ? 'bg-white hover:bg-white text-black-100 border-white'
                          : 'bg-transparent border-white/60 text-white/30 hover:border-white/50'
                      } rounded-full px-3 py-2 font-normal ${
                        showValidation && validationErrors.genre && (data.genre || []).length === 0
                          ? 'border-red-500'
                          : ''
                      }`}
                      onClick={() => handleGenreToggle(genre.id)}
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                {showValidation && validationErrors.genre && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>Please select at least one genre</span>
                  </div>
                )}
              </div>

              {/* Maturity Rating */}
              <div className="space-y-2">
                <h3 className="font-light text-white">
                  Maturity Rating
                  {showValidation && validationErrors.maturityRating && (
                    <span className="text-red-500"> *</span>
                  )}
                </h3>
                <Select 
                  value={data.maturityRating} 
                  onValueChange={(value) => onUpdate({ maturityRating: value })}
                >
                  <SelectTrigger className={`bg-black-500 text-white ${
                    showValidation && validationErrors.maturityRating
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-black-50'
                  }`}>
                    <SelectValue placeholder="Who is this content for?" />
                  </SelectTrigger>
                  <SelectContent className="bg-black-400 border-black-50 text-white">
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="teen">Teen (13+)</SelectItem>
                    <SelectItem value="mature">Mature (17+)</SelectItem>
                    <SelectItem value="adult">Adult (18+)</SelectItem>
                  </SelectContent>
                </Select>
                {showValidation && validationErrors.maturityRating && (
                  <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle size={16} />
                    <span>Please select a maturity rating</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collaborators Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <IconToggleSwitch 
                      enabled={showCollaborators} 
                      onChange={(e) => setShowCollaborators(e.target.checked)}
                    />
                  </div>
                  <h3 className="ml-2 text-lg font-semibold text-white">Add Collaborators</h3>
                </div>
              </div>

              {showCollaborators && (
                <div className="space-y-4">
                  <Input
                    placeholder="Add your collaborators"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCollaborator();
                      }
                    }}
                    className="bg-black-500 border-black-50 text-white/60 placeholder-white/40 focus:border-primary-500 pr-4"
                  />

                  {data.collaborators.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {data.collaborators.map((collaborator, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-black-300 border border-black-50 rounded-md pr-3 py-1"
                        >
                          <span className="text-sm text-white">{collaborator}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCollaborator(index)}
                            className="text-white/40 hover:text-white transition-colors ml-1 p-1"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Banner Upload Section */}
          <ImageUpload
            image={data.bannerImage}
            onImageChange={(file) => onUpdate({ bannerImage: file })}
            label="Please upload a valid image file (PNG, JPG)."
            maxFileSizeMB={5}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8 max-w-2xl mx-auto">
          <MainButton
            onClick={onNext}
            disabled={false} // Remove disabled state to allow user to attempt
            className='w-full'
          >
            Next step
          </MainButton>

          <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              className="w-full border-white text-white bg-transparent hover:bg-white font-semibold py-3 rounded-full">
              Save as Draft
          </Button>
        </div>

        {/* Validation Summary */}
        {showValidation && !isValid && (
          <div className="mt-4 max-w-2xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Please complete all required fields</span>
              </div>
              <ul className="text-red-400 text-sm space-y-1">
                {validationErrors.title && <li>• Episode title is required</li>}
                {validationErrors.episodeNumber && <li>• Episode number is required</li>}
                {validationErrors.maturityRating && <li>• Maturity rating must be selected</li>}
                {validationErrors.genre && <li>• At least one genre must be selected</li>}
                {validationErrors.bannerImage && <li>• Banner image is required</li>}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeDetailsStepComponent;