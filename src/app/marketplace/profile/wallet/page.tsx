import WalletView from '@/features/user-profile/components/wallet-view'
import { mockUser } from '@/features/user-profile/utils/userData'
import React from 'react'

function page() {
    return (
        <>
            <WalletView user={mockUser}/>
        </>
    )
}

export default page