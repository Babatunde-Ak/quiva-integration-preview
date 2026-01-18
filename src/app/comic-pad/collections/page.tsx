'use client';

import PublishedCollections from '@/features/comic-pad/components/collections/collection-page'
import { mockCollections } from '@/features/comic-pad/mock-data/data'
import { ApiCollection, mapApiCollectionsToMockFormat, MappedCollection } from '@/features/comic-pad/utils/utils';
import { useAppDispatch } from '@/redux/hook';
import { getUserCollections } from '@/redux/slices/collectionSlice';
import React, { useEffect, useState } from 'react'

function Page() {
    const dispatch = useAppDispatch();
    const [collections, setCollections] = useState<MappedCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setIsLoading(true);
                const result = await dispatch(getUserCollections()).unwrap();                
                // Extract collections from the nested response structure
                const apiCollections = result?.data?.collections || result?.data?.data || result?.data || [];
                
                // Map API response to mock data format
                const mappedCollections = mapApiCollectionsToMockFormat(apiCollections);
                
                console.log('Mapped Collections:', mappedCollections);
                setCollections(mappedCollections);
                setError(null);
            } catch (error) {
                console.error('Error fetching collections:', error);
                setError('Failed to load collections');
                // Fallback to mock data on error
                setCollections(null);
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

    return (
        <>
            <PublishedCollections collections={collections} />
        </>
    )
}

export default Page;