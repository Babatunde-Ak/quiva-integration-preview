'use client';

import GeneralModal from '@/components/modals/GeneralModal';
import PublishedCollections from '@/features/comic-pad/components/collections/collection-page'
import CollectionView from '@/features/comic-pad/components/collections/collection-view';

import { ApiCollection, mapApiCollectionsToMockFormat, MappedCollection } from '@/features/comic-pad/utils/utils';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getUserCollections } from '@/redux/slices/collectionSlice';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function Page() {
    const dispatch = useAppDispatch();
    const [collections, setCollections] = useState<MappedCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpenUploadModal, setIsOpenUploadModal] = useState(false);

    const { error: errorCollection } = useAppSelector((state: any) => state.collections);

    const handleCreateNew = () => {
        setIsOpenUploadModal(true);
    };

    const onOpenChangeUploadModal = (open: boolean) => {
        setIsOpenUploadModal(open);
    };

    const onCloseUploadModal = () => {
        setIsOpenUploadModal(false);
    };

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(getUserCollections()).unwrap();                
                // Extract collections from the nested response structure
                const apiCollections = result?.data?.collections || result?.data?.data || result?.data || [];
                
                // Map API response to mock data format
                const mappedCollections = mapApiCollectionsToMockFormat(apiCollections);
                
                setCollections(mappedCollections);
                setError(null);
            } catch (error) {
                console.error('Error fetching collections:', error);
                setError('Failed to load collections');
                // Set to empty array instead of null
                setCollections([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollections();
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Loading collections...</p>
            </div>
        );
    }

    if(error || errorCollection) {
        return(
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error || errorCollection}</p>
            </div>
        )
    }

    return (
        <>
            <PublishedCollections collections={collections} onCreateNew={handleCreateNew} />

            {/* Upload Modal */}
            <GeneralModal
                isOpen={isOpenUploadModal}
                onOpenChange={onOpenChangeUploadModal}
                onClose={onCloseUploadModal}
                backdrop='blur'
                size='full'
                modalContentClass='bg-black-500 max-h-screen lg:!m-16'
            >
                <div className="w-full h-screen !p-4 lg:!p-8 overflow-y-auto">
                    <CollectionView onClose={onCloseUploadModal} />
                </div>
            </GeneralModal>
        </>
    )
}

export default Page;