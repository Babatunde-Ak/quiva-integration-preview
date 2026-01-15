'use client';

import React, {useState, useEffect} from 'react';
import {useParams, useRouter} from 'next/navigation';
import EpisodesEmpty from './episode-empty';
import EpisodesList from './episode-list';
import { MappedCollection } from '../../utils/utils';

interface Episode {
    id : string;
    title : string;
    thumbnail : string;
    description?: string;
    publishDate?: string;
    isPublished?: boolean;
}

interface Collection {
    id : string;
    title : string;
    description : string;
    coverImage : string;
    episodes : Episode[];
}

interface CollectionEpisodesPageProps {
    // Optional props for when data is passed from parent
    collection?: MappedCollection;
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

    const [collection, setCollection] = useState < MappedCollection | null > (propCollection || null);
    const [isLoading, setIsLoading] = useState(!propCollection);
    const [error, setError] = useState < string | null > (null);
    const [selectedEpisodes, setSelectedEpisodes] = useState<string[]>([]);

    // Fetch collection data if not provided as prop
    useEffect(() => {
        if (!propCollection && collectionId) {
            fetchCollection(collectionId);
        }
    }, [collectionId, propCollection]);

    const fetchCollection = async(id : string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Replace this with your actual API call
            const response = await fetch(`/api/collections/${id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch collection');
            }

            const data = await response.json();
            setCollection(data);
        } catch (err) {
            setError(err instanceof Error
                ? err.message
                : 'An error occurred');
            console.error('Error fetching collection:', err);
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
        if (onCreateDrop) {
            onCreateDrop(episodeId);
        } else {
            console.log('Create drop for episode:', episodeId);
            // Navigate to create drop page
            router.push(`/collections/${collectionId}/drops`);
        }
    };

    const handleListToMarketplace = (episodeId: string) => {
        if (onListToMarketplace) {
            onListToMarketplace(episodeId);
        } else {
            console.log('List to marketplace for episode:', episodeId);
            // Navigate to marketplace listing
            router.push(`/comic-pad/listing`);
        }
    };

    const handleViewEpisodeDetails = (episodeId: string) => {
        if (onViewEpisodeDetails) {
            onViewEpisodeDetails(episodeId);
        } else {
            console.log('View details for episode:', episodeId);
            // Navigate to episode details
            router.push(`/collections/${collectionId}/episodes/${episodeId}/details`);
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
                        onClick={() => fetchCollection(collectionId)}
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