// This page handles /comic-pad/collections/[id]/upload-episode
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import EpisodeForm from '@/features/comic-pad/components/episodes/episode-form';

export default function UploadEpisodePage() {
  // Get id from the dynamic route (folder is [id])
  const params = useParams();
  const collectionId = params?.id as string;

  useEffect(() => {
    console.log('UploadEpisodePage params:', params);
    console.log('collectionId:', collectionId);
  }, [params, collectionId]);

  return (
    <div className="min-h-screen bg-black-500 flex items-center justify-center">
      <EpisodeForm collectionId={collectionId} />
    </div>
  );
}
