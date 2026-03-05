'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CollectionEpisodesPage from '@/features/comic-pad/components/episodes/episode-page';

import EpisodeForm from '@/features/comic-pad/components/episodes/episode-form';
import GeneralModal from '@/components/modals/GeneralModal';
import { useAppDispatch } from '@/redux/hook';
import { getCollectionById } from '@/redux/slices/collectionSlice';
import { MainButton } from '@/components/button';

interface PageProps {
    params: {
        id: string;
    };
}

export default function CollectionEpisodesRoute({ params }: PageProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const [collection, setCollection] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpenUploadModal, setIsOpenUploadModal] = React.useState(false);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(getCollectionById({id:params.id})).unwrap();
                
                const apiCollection = result?.data?.collection || result?.data || result;
                
                const mappedCollection = {
                    id: apiCollection.id || apiCollection._id,
                    title: apiCollection.title,
                    description: apiCollection.description,
                    coverImage: apiCollection.bannerImage,
                    episodes: apiCollection.comic || [],
                    totalEpisodes: apiCollection.totalEpisodes || (apiCollection.episodes ? apiCollection.episodes.length : 0),
                    genre: apiCollection.genre || [],
                    creator: apiCollection.creatorId || {},
                };
                
                setCollection(mappedCollection);
                setError(null);
            } catch (error) {
                setError('Failed to load collection');
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