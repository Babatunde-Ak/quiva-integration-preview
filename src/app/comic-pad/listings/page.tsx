import ListView from '@/features/comic-pad/components/listing/listing-view'
import { useRouter } from 'next/navigation';
import React from 'react'

function page() {
    const router = useRouter();

    const onComplete = () => {
        router.push('/marketplace');
    }
    
    return (
        <>
            <ListView onComplete={onComplete}/>
        </>
    )
}

export default page