'use client';

import EditProfileView from '@/features/user-profile/components/edit-profile-view'
import { useAppSelector } from '@/redux/hook'
import React from 'react'

function Page() {
    const authUser = useAppSelector((state) => state.auth?.user?.data);
    const profileData = useAppSelector((state) => state.auth?.profile?.data);
    const userData = profileData?.user || profileData || authUser;

    return (
        <>
            <EditProfileView user={userData}/>
        </>
    )
}

export default Page
