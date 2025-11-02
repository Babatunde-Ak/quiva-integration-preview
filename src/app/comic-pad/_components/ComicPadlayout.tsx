'use client'

import {ComicPadHeader} from './ComicPadHeader'
import {ComicPadSideNav} from './ComicPadSideNav'
import {useState} from 'react'

export default function ComicPadLayout({children}) {
    const [isMobileMenuOpen,
        setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-black-100 w-full font-recursive">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <ComicPadHeader
                    onMobileMenuToggle={toggleMobileMenu}
                    isMobileMenuOpen={isMobileMenuOpen}/>
                <ComicPadSideNav
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuClose={closeMobileMenu}/>

                <main
                    className={`p-4 overflow-y-auto bg-black-100 w-full min-h-screen transition-all duration-300 ${isMobileMenuOpen
                    ? 'blur-sm'
                    : ''}`}>
                    {children}
                </main>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-[200px_1fr] xl:grid-cols-[250px_1fr] min-h-screen w-full">
                <div>
                    <ComicPadSideNav isMobileMenuOpen={false} onMobileMenuClose={() => {}}/>
                </div>

                <div className="flex flex-col w-full">
                    <ComicPadHeader onMobileMenuToggle={() => {}} isMobileMenuOpen={false}/>

                    <main className="flex-1 p-6 overflow-y-auto bg-black-100 w-full">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}