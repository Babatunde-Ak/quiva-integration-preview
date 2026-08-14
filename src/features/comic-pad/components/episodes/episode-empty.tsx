'use client';

import React from 'react';
import {useRouter, useParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {ChevronLeft} from 'lucide-react';
import { MainButton } from '@/components/button';
import { episodeBookIcon } from '../../../../../public/dev_images';

interface EpisodesEmptyProps {
    collectionTitle?: string;
    collectionId?: string;
    onGoBack?: () => void;
    onUploadEpisode?: () => void;
    onCreateEpisode?: () => void;
}

const EpisodesEmpty : React.FC < EpisodesEmptyProps > = ({
    collectionTitle = "Galactic Ronin",
    collectionId,
    onGoBack,
    onUploadEpisode,
    onCreateEpisode
}) => {
    const router = useRouter();
    const params = useParams();

    // Get collection ID from params if not provided as prop
    const id = collectionId || (params
        ?.id as string);

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else {
            router.back();
        }
    };

    const handleUploadEpisode = () => {
        if (onUploadEpisode) {
            onUploadEpisode();
        } else {
            // Navigate to upload episode page with collection ID
            router.push(`/comic-pad/collections/${id}/upload-episode`);
        }
    };

    const handleCreateEpisode = () => {
        if (onCreateEpisode) {
            onCreateEpisode();
        } else {
            // Navigate to create episode page with collection ID
            router.push(`/comic-pad/collections/${id}/upload-episode`);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white p-6">
            <div className=" mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ChevronLeft size={20}/>
                        <span>Go back</span>
                    </button>
                </div>

                {/* Title and Description */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        {collectionTitle}
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto font-light">
                        Select the Episodes you want to readers to start minting on the marketplace.
                    </p>
                </div>

                {/* Empty State */}
                <div
                    className="flex flex-col items-center justify-center min-h-[40vh] text-center bg-black-500 border border-black-50 rounded-lg p-8">
                    {/* Book Icon */}
                    <div className="mb-8">
                        <img src={episodeBookIcon.src} alt="Empty State" className='w-20 h-20 shadow-lg'/>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-bold text-white">
                            No Episode Yet
                        </h3>
                        <p className="text-white/60 text-sm max-w-md mx-auto font-light">
                            Start by creating your first comic universe.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <MainButton
                            onClick={handleUploadEpisode}
                        >
                            Upload an episode
                        </MainButton>

                        <Button
                            onClick={handleCreateEpisode}
                            variant="outline"
                            className="border border-white/20 text-white hover:bg-white/5 hover:text-white font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 bg-transparent">
                            Create an episode
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EpisodesEmpty;