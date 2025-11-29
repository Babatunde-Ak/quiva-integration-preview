'use client'

import { MainButton } from '@/components/button'
import { Button } from '@/components/ui/button'
import { QuivaLogo } from '@/components/utils/function'
import { X } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export function Sidebar({ isMobileMenuOpen, onMobileMenuClose }) {
  const router = useRouter()
  const pathname = usePathname()

  // Navigation items
  const navigationItems = [
    {
      label: 'Explore',
      path: '/marketplace',
      isActive: pathname === '/marketplace'
    },
    {
      label: 'My Library', 
      path: '/marketplace/library',
      isActive: pathname === '/marketplace/library'
    },
    {
      label: 'Collections', 
      path: '/marketplace/collections',
      isActive: pathname === '/marketplace/collections'
    },
    {
      label: 'Top Creators', 
      path: '/marketplace/top-creators',
      isActive: pathname === '/marketplace/top-creators'
    },
  ]

  const handleNavigation = (path) => {
    router.push(path)
    onMobileMenuClose()
  }

  const handleBecomeCreator = () => {
    router.push('/comic-pad')
    onMobileMenuClose()
  }

  return (
    <>
      {/* Desktop Sidebar - FIXED: Removed fixed positioning */}
      <aside className="hidden lg:flex w-full h-screen bg-black-200 border-r border-dashed border-white/30 px-4 py-6 flex-col z-40 sticky top-0">
        {/* Logo */}
        <div className="flex items-center justify-left mb-8 pt-2">
          <QuivaLogo showText className="invert" />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 mb-8">
          {navigationItems.map((item) => (
            <Button 
              key={item.path}
              variant="ghost" 
              className={`w-full justify-start font-medium transition-colors hover:text-white ${
                item.isActive 
                  ? 'text-white bg-black-400 hover:bg-black-300 ' 
                  : 'text-white/40 hover:bg-black-400 '
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Become a Creator Button */}
        <MainButton
          onClick={handleBecomeCreator}
          className='text-xs !px-5'
        >
          Become a Creator
        </MainButton>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black/50" 
          onClick={onMobileMenuClose} 
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-[250px] bg-black-200 border-r border-dashed border-white/30 px-4 py-6 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo and Close Button */}
        <div className="flex justify-between items-center mb-8">
          <QuivaLogo showText className="invert" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-black-400"
            onClick={onMobileMenuClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 mb-8">
          {navigationItems.map((item) => (
            <Button 
              key={item.path}
              variant="ghost" 
              className={`w-full justify-start font-medium transition-colors hover:text-white ${
                item.isActive 
                  ? 'text-white bg-black-400 hover:bg-black-300' 
                  : 'text-white/40 hover:bg-black-400 '
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Become a Creator Button */}
        <Button 
          className="bg-secondary-200 hover:bg-orange-600 text-white font-medium rounded-full transition-colors text-xs"
          onClick={handleBecomeCreator}
        >
          Become a Creator
        </Button>
      </aside>
    </>
  )
}