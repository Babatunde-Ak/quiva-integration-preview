'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import CollectionEpisodesPage from '@/features/comic-pad/components/episodes/episode-page';
import {dummyCollections} from '@/features/comic-pad/mock-data/data';
import EpisodeForm from '@/features/comic-pad/components/episodes/episode-form';
import GeneralModal from '@/components/modals/GeneralModal';

// For App Router (Next.js 13+)
interface PageProps {
    params : {
        id: string;
    };
}

export default function CollectionEpisodesRoute({params} : PageProps) {
    const router = useRouter();

    const [isOpenUploadModal, setIsOpenUploadModal] = React.useState(false);

    const handleGoBack = () => {
        router.push('/collections');
    };

    const handleUploadEpisode = () => {
        setIsOpenUploadModal(!isOpenUploadModal);
    };

    const handleCreateEpisode = () => {
        router.push(`/collections/${params.id}/create-episode`);
    };

    const onOpenChangeUploadModal = (open: boolean) => {
        setIsOpenUploadModal(open);
    }

    return (
        <>
            <CollectionEpisodesPage
            collection={dummyCollections[3]}
            onGoBack={handleGoBack}
            onUploadEpisode={handleUploadEpisode}
            onCreateEpisode={handleCreateEpisode}/>

            {/* Upload Modal */}
            <GeneralModal
                isOpen={isOpenUploadModal}
                onOpenChange={onOpenChangeUploadModal}
                backdrop='blur'
                size='full'
                modalContentClass='bg-black-500 max-h-screen lg:!m-16'
            >
                <div className="w-full h-screen !p-4 lg:!p-8 overflow-y-auto font-recursive">
                    <EpisodeForm />
                </div>
            </GeneralModal>
        </>
    );
}
