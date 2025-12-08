'use client';

import UserProfile from '@/features/user-profile/components/user-profile-view'

function page() {
    const onEditProfile = () => {
        // Handle edit profile action
    }

    const onComicAction = (comic, action) => {
        // Handle comic action based on the action type
    }

    return ( 
    <div className="w-full">
        <UserProfile onEditProfile={onEditProfile} onComicAction={onComicAction}/> 
    </div>
    )
}

export default page