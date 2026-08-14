'use client'

import { Footer } from '@/components/global/comic-library/Footer'
import { Header } from '@/components/global/comic-library/Header'
import { Sidebar } from '@/components/global/comic-library/Sidebar'
import MarketplaceTour from '@/components/onboarding/MarketplaceTour'
import { useState } from 'react'

export default function MainPage({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    const handleSidebarToggle = () => {
        setIsSidebarCollapsed(prev => !prev)
    }

    return (
        <div className="min-h-screen bg-black-500 w-full font-recursive">
            <MarketplaceTour />

            {/* Mobile Layout */}
            <div className="lg:hidden">
                <Header
                    onMobileMenuToggle={toggleMobileMenu}
                    isMobileMenuOpen={isMobileMenuOpen}
                />
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuClose={closeMobileMenu}
                    isCollapsed={false} // Not used on mobile
                    onToggleCollapse={() => {}} // Not used on mobile
                />

                <main
                    className={`p-4 overflow-y-auto bg-black-500 w-full transition-all duration-300 ${
                        isMobileMenuOpen ? 'blur-sm' : ''
                    }`}
                >
                    {children}
                </main>

                <Footer />
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block w-full">
                {/* Fixed Sidebar */}
                <Sidebar 
                    isMobileMenuOpen={false} 
                    onMobileMenuClose={() => {}}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapse={handleSidebarToggle}
                />

                {/* Main Content Area - Responsive margin based on sidebar state */}
                <div className={`${isSidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
                    {/* Header */}
                    <div className="sticky top-0 z-30">
                        <Header onMobileMenuToggle={() => {}} isMobileMenuOpen={false} />
                    </div>

                    {/* Main Content - No height restrictions, natural flow */}
                    <main className="flex-1 bg-black-500 w-full">
                        <div className="w-full">
                            <div className="px-6 py-6">
                                {children}
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    )
}
