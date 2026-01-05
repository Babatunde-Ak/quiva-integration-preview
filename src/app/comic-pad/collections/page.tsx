'use client';

import PublishedCollections from '@/features/comic-pad/components/collections/collection-page'
import { mockCollections } from '@/features/comic-pad/mock-data/data'
import { useAppDispatch } from '@/redux/hook';
import { getAllCollections } from '@/redux/slices/collectionSlice';
import React, { useEffect, useState } from 'react'

// Type definitions
interface Creator {
  _id: string;
  walletAddress: string;
  avatar?: string;
  username?: string;
}

interface Comic {
  _id: string;
  title: string;
  coverImage: string;
  totalPages: number;
}

interface ApiCollection {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  bannerImage: string;
  bannerCid: string;
  isDeleted: boolean;
  creatorId: Creator;
  comic: Comic[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface MappedCollection {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  episodes: Array<{
    id: string;
    thumbnail: string;
  }>;
  totalEpisodes: number;
}

// Mapping function
const mapApiCollectionsToMockFormat = (apiCollections: ApiCollection[]): MappedCollection[] => {
  return apiCollections.map(collection => ({
    id: collection._id,
    title: collection.title,
    description: collection.description,
    coverImage: collection.bannerImage,
    episodes: collection.comic.map(comic => ({
      id: comic._id,
      thumbnail: comic.coverImage
    })),
    totalEpisodes: collection.comic.length
  }));
};

function Page() {
    const dispatch = useAppDispatch();
    const [collections, setCollections] = useState<MappedCollection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setIsLoading(true);
                // @ts-ignore
                const result = await dispatch(getAllCollections()).unwrap();
                console.log('Fetched Collections:', result);
                
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
                setCollections(mockCollections);
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