'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { IconToggleSwitch } from '@/components/switch/Switch';
import { MainButton } from '@/components/button';

interface EpisodeDetailsData {
  title: string;
  episodeNumber: string;
  summary: string;
  maturityRating: string;
  bannerImage: File | null;
  collaborators: string[];
}

interface EpisodeDetailsStepProps {
  data: EpisodeDetailsData;
  onUpdate: (data: Partial<EpisodeDetailsData>) => void;
  onNext: () => void;
  onSaveDraft: () => void;
  isValid: boolean;
}

const EpisodeDetailsStepComponent: React.FC<EpisodeDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onSaveDraft,
  isValid
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpdate({ bannerImage: file });
    }
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      <div className=" mx-auto">
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

        <form className="grid lg:grid-cols-2 gap-8">
          {/* Episode Details Section */}
          <div className="space-y-6">
            <h3 className="font-light text-white">Episode details</h3>

            <div className="space-y-4">
              <Input
                placeholder="Enter episode title"
                value={data.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-primary-500 !py-2"
              />

              <Input
                placeholder="Enter episode No"
                value={data.episodeNumber}
                onChange={(e) => onUpdate({ episodeNumber: e.target.value })}
                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-primary-500 !py-2"
              />

              <Textarea
                placeholder="Add an optional summary for this episode…"
                value={data.summary}
                onChange={(e) => onUpdate({ summary: e.target.value })}
                className="bg-black-500 border-black-50 text-white placeholder-white/40 focus:border-primary-500 min-h-[120px] resize-none"
              />

              {/* Maturity Rating */}
              
              <div className="space-y-2">
                <h3 className="font-light text-white">
                    Maturity Rating
                </h3>
                <Select 
                  value={data.maturityRating} 
                  onValueChange={(value) => onUpdate({ maturityRating: value })}
                >
                  <SelectTrigger className="bg-black-500 border-black-50 text-white">
                    <SelectValue placeholder="Who is this content for?" />
                  </SelectTrigger>
                  <SelectContent className="bg-black-400 border-black-50 text-white">
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="teen">Teen (13+)</SelectItem>
                    <SelectItem value="mature">Mature (17+)</SelectItem>
                    <SelectItem value="adult">Adult (18+)</SelectItem>
                  </SelectContent>
                </Select>
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
          <div className="space-y-4">
            <div className="border border-black-50 bg-black-200 rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
              {data.bannerImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={URL.createObjectURL(data.bannerImage)}
                      alt="Banner preview"
                      className="object-cover w-full max-h-96 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdate({ bannerImage: null })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">{data.bannerImage.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto mb-4 text-white/50" size={48} />
                  <p className="text-white/40 mb-4 font-light max-w-xl">
                    Please upload a valid image file (PNG, JPG).
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-transparent border-primary-500 text-primary-500 hover:text-primary-500 hover:bg-primary-500/10 rounded-full"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    Upload Banner
                  </Button>
                </>
              )}
            </div>
            <input
              id="banner-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </form>

        {/* Action Buttons */}
        <div className="space-y-4 pt-8 max-w-2xl mx-auto">
          <MainButton
            onClick={onNext}
            disabled={!isValid}
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
      </div>
    </div>
  );
};

export default EpisodeDetailsStepComponent;