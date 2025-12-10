import NotificationsView from '@/features/user-profile/components/notifications-view'
import { mockUser } from '@/features/user-profile/utils/userData'
import React from 'react'

function page() {
    return (
        <>
            <NotificationsView user={mockUser}/>
        </>
    )
}

export default page