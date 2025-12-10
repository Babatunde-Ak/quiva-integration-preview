import EditProfileView from '@/features/user-profile/components/edit-profile-view'
import { mockUser } from '@/features/user-profile/utils/userData'
import React from 'react'

function page() {
    return (
        <>
            <EditProfileView user={mockUser}/>
        </>
    )
}

export default page