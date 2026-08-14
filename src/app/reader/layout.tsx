'use client'

import {Header} from '@/components/global/comic-library/Header'
import {Sidebar} from '@/components/global/comic-library/Sidebar'
import {useState} from 'react'

export default function Page({children}) {
    const [isMobileMenuOpen,
        setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-black-500 w-full font-recursive ">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <Header
                    onMobileMenuToggle={toggleMobileMenu}
                    isMobileMenuOpen={isMobileMenuOpen}
                />
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuClose={closeMobileMenu}/>

                <main
                    className={`p-4 overflow-y-auto bg-black-500 w-full transition-all duration-300 ${isMobileMenuOpen
                    ? 'blur-sm'
                    : ''}`}>
                    {children}
                </main>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-[280px_1fr] min-h-screen w-full ">
                <div>
                    <Sidebar isMobileMenuOpen={false} onMobileMenuClose={() => {}}/>
                </div>

                <div className="flex flex-col w-full">
                    <Header onMobileMenuToggle={() => {}} isMobileMenuOpen={false}/>

                    <main className="flex-1 p-6 overflow-y-auto bg-black-500 w-full">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}