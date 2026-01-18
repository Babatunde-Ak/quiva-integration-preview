'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CollectionEpisodesPage from '@/features/comic-pad/components/episodes/episode-page';
import { dummyCollections } from '@/features/comic-pad/mock-data/data';
import EpisodeForm from '@/features/comic-pad/components/episodes/episode-form';
import GeneralModal from '@/components/modals/GeneralModal';
import { useAppDispatch } from '@/redux/hook';
import { getCollectionById } from '@/redux/slices/collectionSlice';
import { MappedCollection } from '@/features/comic-pad/utils/utils';
import { MainButton } from '@/components/button';

interface PageProps {
    params: {
        id: string;
    };
}

export default function CollectionEpisodesRoute({ params }: PageProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const [collection, setCollection] = useState<MappedCollection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpenUploadModal, setIsOpenUploadModal] = React.useState(false);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(getCollectionById({id:params.id})).unwrap();
                
                // Extract collection from the nested response structure
                const apiCollection = result?.data?.collection || result?.data || result;
                
                // Map API response to the expected format
                // You may need to adjust this mapping based on your actual API response
                const mappedCollection: MappedCollection = {
                    id: apiCollection.id || apiCollection._id,
                    title: apiCollection.title || apiCollection.name,
                    description: apiCollection.description,
                    coverImage: apiCollection.coverImage || apiCollection.cover_image || apiCollection.image,
                    episodes: apiCollection.episodes || [],
                    totalEpisodes: apiCollection.totalEpisodes || (apiCollection.episodes ? apiCollection.episodes.length : 0),
                    // Add other fields as needed based on your MappedCollection type
                };
                
                console.log('Fetched Collection:', mappedCollection);
                setCollection(mappedCollection);
                setError(null);
            } catch (error) {
                console.error('Error fetching collection:', error);
                setError('Failed to load collection');
                // Fallback to mock data on error
                setCollection(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, [dispatch, params.id]);

    const handleGoBack = () => {
        router.push('/comic-pad/collections');
    };

    const handleUploadEpisode = () => {
        setIsOpenUploadModal(!isOpenUploadModal);
    };

    const handleCreateEpisode = () => {
        router.push(`/collections/${params.id}/create-episode`);
    };

    const onOpenChangeUploadModal = (open: boolean) => {
        setIsOpenUploadModal(open);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading collection...</p>
            </div>
        );
    }

    if (error && !collection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-primary-500 text-lg mb-4">{error}</p>
                <MainButton 
                    onClick={handleGoBack}
                    className=""
                >
                    Go Back to Collections
                </MainButton>
            </div>
        );
    }

    return (
        <>
            <CollectionEpisodesPage
                collection={collection}
                onGoBack={handleGoBack}
                onUploadEpisode={handleUploadEpisode}
                onCreateEpisode={handleCreateEpisode}
            />

            {/* Upload Modal */}
            <GeneralModal
                isOpen={isOpenUploadModal}
                onOpenChange={onOpenChangeUploadModal}
                backdrop='blur'
                size='full'
                modalContentClass='bg-black-500 max-h-screen lg:!m-16'
            >
                <div className="w-full h-screen !p-4 lg:!p-8 overflow-y-auto font-recursive">
                    <EpisodeForm collectionId={params.id} onClose={() => setIsOpenUploadModal(false)} />
                </div>
            </GeneralModal>
        </>
    );
}