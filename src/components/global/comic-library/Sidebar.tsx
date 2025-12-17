'use client'

import { MainButton } from '@/components/button'
import { Button } from '@/components/ui/button'
import { QuivaLogo } from '@/components/utils/function'
import { 
  X, 
  Search, 
  BookOpen, 
  Folder, 
  Users, 
  User,
  ChevronLeft,
  ChevronRight,
  PenTool
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SidebarProps {
  isMobileMenuOpen: boolean
  onMobileMenuClose: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

// Icon mapping for navigation items
const getNavIcon = (label: string) => {
  const iconClass = "w-5 h-5 flex-shrink-0"
  
  switch (label.toLowerCase()) {
    case 'explore':
      return <img src="/category.svg" alt="Explore" className={iconClass} />
    case 'favourites':
      return <img src="/heart-circle-icon.svg" alt="Explore" className={iconClass} />
    case 'collections':
      return <img src="/collections-icon.svg" alt="Explore" className={iconClass} />
    case 'top creators':
      return <img src="/users-icons.png" alt="Explore" className={iconClass} />
    case 'user profile':
      return <img src="/wallet-icon.svg" alt="Explore" className={iconClass} />
    default:
      return <img src="/category.svg" alt="Explore" className={iconClass} />
  }
}

export function Sidebar({ isMobileMenuOpen, onMobileMenuClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  // Manage sidebar state class on document body for layout adjustments
  useEffect(() => {
    if (!isMobile) {
      const body = document.body;
      if (isCollapsed) {
        body.classList.remove('sidebar-expanded');
        body.classList.add('sidebar-collapsed');
      } else {
        body.classList.remove('sidebar-collapsed');
        body.classList.add('sidebar-expanded');
      }
      
      return () => {
        body.classList.remove('sidebar-expanded', 'sidebar-collapsed');
      };
    }
  }, [isCollapsed, isMobile]);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigation items
  const navigationItems = [
    {
      label: 'Explore',
      path: '/marketplace',
      isActive: pathname === '/marketplace'
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
    {
      label: 'Favourites', 
      path: '/marketplace/library',
      isActive: pathname === '/marketplace/library'
    },
    {
      label: 'User Profile', 
      path: '/marketplace/user-profile',
      isActive: pathname === '/marketplace/user-profile'
    },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) onMobileMenuClose()
  }

  const handleBecomeCreator = () => {
    router.push('/comic-pad')
    if (isMobile) onMobileMenuClose()
  }

  // Mobile sidebar (preserve original functionality)
  if (isMobile) {
    return (
      <>
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
              className="text-white hover:bg-black-400 sidebar-focus"
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
                className={`w-full justify-start font-medium sidebar-button-hover sidebar-focus ${
                  item.isActive 
                    ? 'text-white bg-black-400 hover:bg-black-300' 
                    : 'text-white/40 hover:bg-black-400 hover:text-white'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="flex items-center gap-3">
                  {getNavIcon(item.label)}
                  {item.label}
                </div>
              </Button>
            ))}
          </nav>

          {/* Become a Creator Button */}
          <Button 
            className="bg-secondary-200 hover:bg-secondary-300 text-white font-medium rounded-full transition-all duration-200 hover:scale-105 text-xs sidebar-focus"
            onClick={handleBecomeCreator}
          >
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Become a Creator
            </div>
          </Button>
        </aside>
      </>
    )
  }

  // Desktop collapsible sidebar
  return (
    <aside className={`sidebar-container hidden lg:flex h-screen bg-black-200 border-r border-dashed border-white/30 flex-col z-40 transition-all duration-300 ease-in-out overflow-hidden fixed left-0 top-0 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header with logo and collapse toggle - Fixed height */}
        <div className={`flex items-center p-4 h-16 flex-shrink-0 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          {!isCollapsed ? (
            <div className="transition-all duration-300 ease-in-out">
              <QuivaLogo showText className="invert" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out">
              <span className="text-black font-bold text-lg"><QuivaLogo className="invert" /></span>
            </div>
          )}
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="text-white/60 hover:text-white hover:bg-black-400 transition-colors duration-200 sidebar-focus"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Expand button for collapsed state - Fixed height */}
        {isCollapsed && (
          <div className="px-2 py-2 border-b border-dashed border-white/30 h-12 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="w-full h-8 text-white/60 hover:text-white hover:bg-black-400 transition-colors duration-200 sidebar-focus"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Navigation Menu - Scrollable area */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden sidebar-nav min-h-0">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <div key={item.path} className="relative group">
                <Button 
                  variant="ghost" 
                  className={`w-full font-medium sidebar-button-hover sidebar-focus relative ${
                    isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                  } ${
                    item.isActive 
                      ? 'text-white bg-black-400 hover:bg-black-300 hover:text-white' 
                      : 'text-white/40 hover:bg-black-400 hover:text-white'
                  }`}
                  onClick={() => handleNavigation(item.path)}
                >
                  {/* Active indicator line - only show when expanded */}
                  {item.isActive && !isCollapsed && (
                    <div className="sidebar-active-indicator" />
                  )}
                  
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className={`${item.isActive && isCollapsed ? 'bg-secondary-200 px-1.5 py-1.5 rounded-full' : ''}`}>
                      {getNavIcon(item.label)}
                    </div>
                    {!isCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="sidebar-tooltip">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Become a Creator Button - Fixed at bottom of scrollable area */}
          <div className="mt-auto pt-6">
            <div className="relative group">
              {isCollapsed ? (
                <Button
                  variant="ghost"
                  className="w-full p-3 bg-secondary-200 hover:bg-secondary-300 text-black hover:text-white transition-all duration-200 hover:scale-105 rounded-lg sidebar-focus"
                  onClick={handleBecomeCreator}
                >
                  <PenTool className="w-5 h-5" />
                  <div className="sidebar-tooltip">
                    Become a Creator
                  </div>
                </Button>
              ) : (
                <MainButton
                  onClick={handleBecomeCreator}
                  className='text-xs !px-5 w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 sidebar-focus'
                >
                  <PenTool className="w-4 h-4" />
                  Become a Creator
                </MainButton>
              )}
            </div>
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-dashed border-white/20 h-16 flex-shrink-0 flex items-center justify-center">
          {!isCollapsed ? (
            <div className="text-xs text-white/40 text-center transition-opacity duration-300">
              © 2025 Quiva Comics
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-1 bg-white/20 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}