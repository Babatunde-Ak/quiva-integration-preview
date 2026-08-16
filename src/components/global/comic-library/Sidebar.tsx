'use client'

import { MainButton } from '@/components/button'
import { Button } from '@/components/ui/button'
import { QuivaLogo } from '@/components/utils/function'
import { useAppSelector } from '@/redux/hook'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightSmall,
  PenTool,
  ChartSpline,
  History,
  Bell,
  User,
  Settings,
  HelpCircle,
  BookOpen,
  LayoutGrid,
  Tag,
  Bookmark,
  Activity,
  Monitor,
  DollarSign,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

interface SidebarProps {
  isMobileMenuOpen: boolean
  onMobileMenuClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

type NavItem = {
  label: string
  path: string
  description?: string
}

type NavGroup = {
  label: string
  isGroup: true
  path?: string
  children: NavItem[]
}

type NavEntry = NavItem | NavGroup

function isGroup(entry: NavEntry): entry is NavGroup {
  return (entry as NavGroup).isGroup === true
}

const getNavIcon = (label: string) => {
  const iconClass = 'w-5 h-5 flex-shrink-0'

  switch (label.toLowerCase()) {
    case 'explore':
      return <img src="/category.svg" alt="Explore" className={iconClass} />
    case 'favourites':
      return <img src="/heart-circle-icon.svg" alt="Favourites" className={iconClass} />
    case 'collections':
      return <img src="/collections-icon.svg" alt="Collections" className={iconClass} />
    case 'top creators':
      return <img src="/users-icons.png" alt="Top Creators" className={iconClass} />
    case 'auction':
      return <Tag className={iconClass} />
    case 'analytics':
      return <ChartSpline className={iconClass} />
    case 'history':
      return <History className={iconClass} />
    case 'notifications':
      return <Bell className={iconClass} />
    case 'profile':
      return <User className={iconClass} />
    case 'setting':
      return <Settings className={iconClass} />
    case 'support':
      return <HelpCircle className={iconClass} />
    case 'comicpad':
      return <BookOpen className={iconClass} />
    case 'studio':
      return <Monitor className={iconClass} />
    case 'my comics':
      return <BookOpen className={iconClass} />
    case 'earnings':
      return <DollarSign className={iconClass} />
    case 'gallery':
      return <img src="/wallet-icon.svg" alt="Gallery" className={iconClass} />
    case 'portfolio':
      return <LayoutGrid className={iconClass} />
    case 'listings':
      return <Tag className={iconClass} />
    case 'watchlist':
      return <Bookmark className={iconClass} />
    case 'favorites':
      return <img src="/heart-circle-icon.svg" alt="Favorites" className={iconClass} />
    case 'activity log':
      return <Activity className={iconClass} />
    case 'dashboard':
      return <LayoutDashboard className={iconClass} />
    default:
      return <img src="/category.svg" alt={label} className={iconClass} />
  }
}

export function Sidebar({ isMobileMenuOpen, onMobileMenuClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const { user } = useAppSelector((state: any) => state.wallet)

  useEffect(() => {
    if (!isMobile) {
      const body = document.body
      if (isCollapsed) {
        body.classList.remove('sidebar-expanded')
        body.classList.add('sidebar-collapsed')
      } else {
        body.classList.remove('sidebar-collapsed')
        body.classList.add('sidebar-expanded')
      }
      return () => {
        body.classList.remove('sidebar-expanded', 'sidebar-collapsed')
      }
    }
  }, [isCollapsed, isMobile])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navigationEntries: NavEntry[] = [
    { label: 'Dashboard', path: '/marketplace/dashboard' },
    { label: 'Explore', path: '/marketplace' },
    { label: 'Collections', path: '/marketplace/collections' },
    { label: 'Top Creators', path: '/marketplace/top-creators' },
    // {
    //   label: 'Comicpad',
    //   isGroup: true,
    //   path: '/comic-pad',
    //   children: [
    //     { label: 'My Comics', path: '/comic-pad/my-comics' },
    //     { label: 'Earnings', path: '/comic-pad/earnings' },
    //   ],
    // },
    { label: 'Analytics', path: '/marketplace/analytics' },
    // { label: 'Favourites', path: '/marketplace/library' },
    // { label: 'History', path: '/marketplace/history' },
    // { label: 'Notifications', path: '/marketplace/notification' },
    {
      label: 'Profile',
      isGroup: true,
      path: '/marketplace/user-profile',
      children: [
        { label: 'Gallery', path: '/marketplace/user-profile?tab=mintedComics', description: 'Owned collectibles' },
        { label: 'Portfolio', path: '/marketplace/profile/portfolio', description: 'Comics published' },
        { label: 'Listings', path: '/marketplace/user-profile?tab=listedComics', description: 'Comics listed for sale' },
        { label: 'Watchlist', path: '/marketplace/watchlist' },
        { label: 'Favorites', path: '/marketplace/user-profile?tab=favoriteComics' },
        { label: 'Activity log', path: '/marketplace/activity' },
      ],
    },
    {
      label: 'Setting',
      isGroup: true,
      children: [
        { label: 'Edit Profile', path: '/marketplace/profile/edit' },
        { label: 'Notifications', path: '/marketplace/profile/notifications' },
        { label: 'Wallet', path: '/marketplace/profile/wallet' },
      ],
    },
    { label: 'Support', path: '/marketplace/support' },
  ]

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) onMobileMenuClose()
  }

  const handleLogout = () => {
    router.push('/')
    if (isMobile) onMobileMenuClose()
  }

  const handleBecomeCreator = () => {
    if (user && user.walletAddress) {
      router.push('/comic-pad')
    } else {
      toast.info('Please Connect Wallet')
    }
    if (isMobile) onMobileMenuClose()
  }

  const isPathActive = (path: string) => pathname === path

  const isGroupActive = (children: NavItem[]) =>
    children.some(child => pathname === child.path || pathname.startsWith(child.path + '/'))

  // ── Shared nav renderer ──────────────────────────────────────────────────
  const renderEntries = (collapsed: boolean) =>
    navigationEntries.map(entry => {
      if (!isGroup(entry)) {
        const active = isPathActive(entry.path)
        return (
          <div key={entry.path} className="relative group">
            <Button
              variant="ghost"
              className={`w-full font-medium sidebar-button-hover sidebar-focus relative ${
                collapsed ? 'justify-center px-2' : 'justify-start px-3'
              } ${
                active
                  ? 'text-white bg-black-400 hover:bg-black-300 hover:text-white'
                  : 'text-white/40 hover:bg-black-400 hover:text-white'
              }`}
              onClick={() => handleNavigation(entry.path)}
            >
              {active && !collapsed && <div className="sidebar-active-indicator" />}
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <div className={active && collapsed ? 'bg-secondary-200 px-1.5 py-1.5 rounded-full' : ''}>
                  {getNavIcon(entry.label)}
                </div>
                {!collapsed && <span className="whitespace-nowrap overflow-hidden">{entry.label}</span>}
              </div>
            </Button>
            {collapsed && <div className="sidebar-tooltip">{entry.label}</div>}
          </div>
        )
      }

      // Group entry
      const groupActive = isGroupActive(entry.children)
      const isOpen = !!openGroups[entry.label]

      if (collapsed) {
        return (
          <div key={entry.label} className="relative group">
            <Button
              variant="ghost"
              className={`w-full justify-center px-2 font-medium sidebar-button-hover sidebar-focus ${
                groupActive
                  ? 'text-white bg-black-400 hover:bg-black-300 hover:text-white'
                  : 'text-white/40 hover:bg-black-400 hover:text-white'
              }`}
              onClick={() => entry.path ? handleNavigation(entry.path) : toggleGroup(entry.label)}
            >
              <div className={groupActive ? 'bg-secondary-200 px-1.5 py-1.5 rounded-full' : ''}>
                {getNavIcon(entry.label)}
              </div>
            </Button>
            <div className="sidebar-tooltip">{entry.label}</div>
          </div>
        )
      }

      return (
        <div key={entry.label}>
          {/* Group header */}
          <div
            className={`flex items-center w-full rounded-md transition-colors sidebar-button-hover ${
              groupActive
                ? 'text-white'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Button
              variant="ghost"
              className={`flex-1 justify-start px-3 font-medium sidebar-focus hover:bg-black-400 ${
                groupActive ? 'text-white hover:text-white' : 'text-white/40 hover:text-white'
              }`}
              onClick={() => entry.path ? handleNavigation(entry.path) : toggleGroup(entry.label)}
            >
              <div className="flex items-center gap-3">
                {getNavIcon(entry.label)}
                <span className="whitespace-nowrap overflow-hidden">{entry.label}</span>
              </div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`flex-shrink-0 h-9 w-8 hover:bg-black-400 sidebar-focus ${
                groupActive ? 'text-white hover:text-white' : 'text-white/40 hover:text-white'
              }`}
              onClick={() => toggleGroup(entry.label)}
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              ) : (
                <ChevronRightSmall className="w-4 h-4 transition-transform duration-200" />
              )}
            </Button>
          </div>

          {/* Children */}
          {isOpen && (
            <div className="ml-4 pl-3 border-l border-dashed border-white/20 mt-1 space-y-0.5">
              {entry.children.map(child => {
                const childActive = isPathActive(child.path)
                return (
                  <Button
                    key={child.path}
                    variant="ghost"
                    className={`w-full justify-start px-3 h-auto py-1.5 font-light sidebar-button-hover sidebar-focus ${
                      childActive
                        ? 'text-white bg-black-400 hover:bg-black-300 hover:text-white'
                        : 'text-white/40 hover:bg-black-400 hover:text-white'
                    }`}
                    onClick={() => handleNavigation(child.path)}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm leading-tight">{child.label}</span>
                      {child.description && (
                        <span className="text-[10px] text-white/30 leading-tight">{child.description}</span>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      )
    })

  // ── Mobile sidebar ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={onMobileMenuClose} />
        )}
        <aside
          className={`lg:hidden fixed top-0 left-0 h-full w-[260px] bg-black-200 border-r border-dashed border-white/30 px-4 py-6 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
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

          <nav className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden sidebar-nav mb-4">
            {renderEntries(false)}
          </nav>

          <div className="flex flex-col gap-2 mt-auto">
            <Button
              className="bg-secondary-200 hover:bg-secondary-300 text-white font-medium rounded-full transition-all duration-200 hover:scale-105 text-xs sidebar-focus"
              onClick={handleBecomeCreator}
              data-tour="publish-comic"
            >
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Publish on Comicpad
              </div>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 text-white/40 hover:text-red-400 hover:bg-red-500/10 font-medium sidebar-focus rounded-lg"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </div>
            </Button>
          </div>
        </aside>
      </>
    )
  }

  // ── Desktop collapsible sidebar ───────────────────────────────────────────
  return (
    <aside
      className={`sidebar-container hidden lg:flex h-screen bg-black-200 border-r border-dashed border-white/30 flex-col z-40 transition-all duration-300 ease-in-out overflow-hidden fixed left-0 top-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center p-4 h-16 flex-shrink-0 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!isCollapsed ? (
            <div className="transition-all duration-300 ease-in-out">
              <QuivaLogo showText className="invert" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <QuivaLogo className="invert" />
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

        {/* Expand button in collapsed state */}
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

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden sidebar-nav min-h-0">
          <div className="space-y-1">{renderEntries(!!isCollapsed)}</div>

          {/* Publish button */}
          <div className="mt-auto pt-6">
            <div className="relative group">
              {isCollapsed ? (
                <Button
                  variant="ghost"
                  className="w-full p-3 bg-secondary-200 hover:bg-secondary-300 text-black hover:text-white transition-all duration-200 hover:scale-105 rounded-lg sidebar-focus"
                  onClick={handleBecomeCreator}
                  data-tour="publish-comic"
                >
                  <PenTool className="w-5 h-5" />
                  <div className="sidebar-tooltip">Publish on Comicpad</div>
                </Button>
              ) : (
                <MainButton
                  onClick={handleBecomeCreator}
                  className="text-xs !px-5 w-full flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 sidebar-focus"
                >
                  <span data-tour="publish-comic" className="flex w-full items-center justify-center gap-2">
                    <PenTool className="w-4 h-4" />
                    Publish on Comicpad
                  </span>
                </MainButton>
              )}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-dashed border-white/20 flex-shrink-0">
          <div className="relative group">
            <Button
              variant="ghost"
              className={`w-full font-medium sidebar-focus text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors ${
                isCollapsed ? 'justify-center px-2' : 'justify-start px-3'
              }`}
              onClick={handleLogout}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Logout</span>}
              </div>
            </Button>
            {isCollapsed && <div className="sidebar-tooltip">Logout</div>}
          </div>
        </div>
      </div>
    </aside>
  )
}
