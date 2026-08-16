'use client';

import UserProfile from '@/features/user-profile/components/user-profile-view'
import { useRouter } from 'next/navigation'

function Page() {
    const router = useRouter()
    const onEditProfile = () => {
        // Handle edit profile action
        router.push("/marketplace/profile/edit")
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

export default Page
