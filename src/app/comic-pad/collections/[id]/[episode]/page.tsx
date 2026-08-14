'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { getComicById, clearCurrentComic } from '@/redux/slices/comicSlice';
import EpisodeDetailsView from '@/features/comic-pad/components/episodes/episode-details-view';
import { Loader2 } from 'lucide-react';

interface PageProps {
    params: {
        id: string;
        episode: string;
    };
}

export default function EpisodeDetailsPage({ params }: PageProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentComic, isLoading } = useAppSelector((state: any) => state.comic);

    useEffect(() => {
        if (params.episode) {
            dispatch(getComicById({ id: params.episode } as any));
        }

        return () => {
            dispatch(clearCurrentComic());
        };
    }, [params.episode, dispatch]);

    const handleGoBack = () => {
        router.push(`/comic-pad/collections/${params.id}`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-white/60 text-sm">Loading episode...</p>
                </div>
            </div>
        );
    }

    if (!currentComic) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-white/60 text-lg mb-4">Episode not found</p>
                <button
                    onClick={handleGoBack}
                    className="bg-primary-500 hover:bg-primary-600 text-black font-medium px-6 py-3 rounded-full transition-all"
                >
                    Back to Collection
                </button>
            </div>
        );
    }

    return (
        <EpisodeDetailsView
            episode={currentComic}
            collectionId={params.id}
            onGoBack={handleGoBack}
        />
    );
}
