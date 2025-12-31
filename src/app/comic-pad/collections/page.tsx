import PublishedCollections from '@/features/comic-pad/components/collections/collection-page'
import { mockCollections } from '@/features/comic-pad/mock-data/data'
import React from 'react'

function page() {
    return (
        <>
            <PublishedCollections collections={mockCollections}/>
        </>
    )
}

export default page