'use client';

import React, {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import EpisodesEmpty from './episode-empty';
import EpisodesList from './episode-list';
import { getCollectionById } from '@/redux/slices/collectionSlice';
import { useAppDispatch } from '@/redux/hook';

interface CollectionEpisodesPageProps {
    collection?: any;
    onGoBack?: () => void;
    onUploadEpisode?: () => void;
    onCreateEpisode?: () => void;
    onCreateDrop?: (episodeId: string) => void;
    onListToMarketplace?: (episodeId: string) => void;
    onViewEpisodeDetails?: (episodeId: string) => void;
}

const CollectionEpisodesPage : React.FC < CollectionEpisodesPageProps > = ({
    collection: propCollection, 
    onGoBack, 
    onUploadEpisode, 
    onCreateEpisode,
    onCreateDrop,
    onListToMarketplace,
    onViewEpisodeDetails
}) => {
    const params = useParams();
    const router = useRouter();
    const collectionId = params?.id as string;

    const [collection, setCollection] = useState <any> (propCollection || null);
    const [isLoading, setIsLoading] = useState(!propCollection);
    const [error, setError] = useState <string | null> (null);
    const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

    const dispatch = useAppDispatch();

    const fetchCollection = async () => {
        try {
            setIsLoading(true);
            const result = await dispatch(getCollectionById({id: collectionId})).unwrap();                
            // Extract collections from the nested response structure
            const apiCollection = result?.data?.collections || result?.data?.data || result?.data || [];

            setCollection(apiCollection);
            setError(null);
        } catch (error) {
            console.error('Error fetching collections:', error);
            setError('Failed to load collections');
            // Fallback to mock data on error
            setCollection(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle episode selection
    const handleSelectEpisodes = (episodeIds: string[]) => {
        setSelectedEpisodes(episodeIds);
        console.log('Selected episodes:', episodeIds);
    };

    // Handle episode actions with fallback navigation
    const handleCreateDrop = (episodeId: string) => {
        router.push(`/comic-pad/collections/${collectionId}/${episodeId}/drops`);
        
        // if (onCreateDrop) {
        //     onCreateDrop(episodeId);
        // } else {
            // Navigate to create drop page
            // router.push(`/comic-pad/collections/${collectionId}/${episodeId}/drops`);
        // }
    };

    const handleListToMarketplace = (episodeId: string) => {
        if (onListToMarketplace) {
            onListToMarketplace(episodeId);
        } else {
            // Navigate to marketplace listing
            router.push(`/comic-pad/collections/${collectionId}/${episodeId}/listing`);
        }
    };

    const handleViewEpisodeDetails = (episodeId: string) => {
        if (onViewEpisodeDetails) {
            onViewEpisodeDetails(episodeId);
        } else {
            // Navigate to episode details
            router.push(`/comic-pad/collections/${collectionId}/${episodeId}`);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div
                className="min-h-screen bg-black-500 text-white flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-white/60">Loading collection...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div
                className="min-h-screen bg-black-500 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => fetchCollection()}
                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Collection not found
    if (!collection) {
        return (
            <div
                className="min-h-screen bg-black-500 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60">Collection not found</p>
                </div>
            </div>
        );
    }

    // Empty episodes state
    if (!collection.episodes || collection.episodes.length === 0) {
        return (
            <EpisodesEmpty
                collectionTitle={collection.title}
                collectionId={collection.id}
                onGoBack={onGoBack}
                onUploadEpisode={onUploadEpisode}
                onCreateEpisode={onCreateEpisode}
            />
        );
    }

    // Episodes list view - using EpisodesList component
    return (
        <EpisodesList
            collectionTitle={collection.title}
            episodes={collection.episodes}
            onGoBack={onGoBack}
            onUploadEpisode={onUploadEpisode}
            onCreateDrop={handleCreateDrop}
            onListToMarketplace={handleListToMarketplace}
            onViewEpisodeDetails={handleViewEpisodeDetails}
            onSelectEpisodes={handleSelectEpisodes}
        />
    );
};

export default CollectionEpisodesPage;