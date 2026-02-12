'use client';

import { useParams } from 'next/navigation';
import EpisodeForm from '@/features/comic-pad/components/episodes/episode-form';

export default function UploadEpisodePage() {
  const params = useParams();
  const collectionId = params?.id as string;

  return (
    <div className="min-h-screen bg-black-500 flex items-center justify-center">
      <EpisodeForm collectionId={collectionId} />
    </div>
  );
}
