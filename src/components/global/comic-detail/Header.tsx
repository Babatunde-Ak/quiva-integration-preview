'use client'

import { Search, Bell, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { QuivaLogo } from '@/components/utils/function'

export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const notificationRef = useRef(null)

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)

    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    // Format timestamp
    const formatTime = (timestamp) => {
        const diff = Date.now() - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        return `${minutes}m ago`
    }

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showNotifications])

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
            label: 'Browse',
            path: '/marketplace',
            isActive: pathname === '/marketplace'
        }
    ]

    const handleNavigation = (path) => {
        router.push(path)
        setIsMobileMenuOpen(false)
    }

    return (
        <>
            <header className="bg-black-500 border-b border-dashed border-white/30 sticky top-0 z-40 w-full">
                <div className="px-4 lg:px-6 py-3">
                    <div className="flex items-center justify-between lg:space-x-8">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden text-white hover:bg-black-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <QuivaLogo showText className="invert" />
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    variant="ghost"
                                    className={`font-light transition-colors px-4 py-2 ${
                                        item.isActive
                                            ? 'text-white bg-black-500 hover:bg-black-500'
                                            : 'text-white/60 hover:bg-black-500 hover:text-white font-normal'
                                    }`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    {item.isActive && (
                                        <div className="w-1 h-4 bg-orange-500 rounded-full mr-2" />
                                    )}
                                    {item.label}
                                </Button>
                            ))}
                        </nav>

                        {/* User Actions */}
                        <div className="flex items-center space-x-2 lg:space-x-3">

                            {/* Notification Bell */}
                            <div className="relative" ref={notificationRef}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:text-white hover:bg-gray-800 relative"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500"
                                        >
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </Badge>
                                    )}
                                </Button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-black-500 border border-gray-700 rounded-lg shadow-xl z-50">
                                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                            <h3 className="text-white font-semibold">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={markAllAsRead}
                                                    className="text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                                                >
                                                    Mark all read
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-4 text-center text-gray-400">
                                                    No notifications
                                                </div>
                                            ) : (
                                                notifications.map(notification => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 border-b border-gray-700 hover:bg-gray-800 cursor-pointer transition-colors ${
                                                            !notification.read ? 'bg-gray-800/50' : ''
                                                        }`}
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <p className={`text-sm ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                                                                {notification.message}
                                                            </p>
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatTime(notification.timestamp)}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avatar */}
                            <Avatar className="w-7 h-7 lg:w-8 lg:h-8 border border-secondary-200/50">
                                <AvatarImage src="https://github.com/shadcn.png" alt="User Avatar" />
                                <AvatarFallback className="bg-secondary-200 text-white text-xs font-medium">
                                    GA
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-700 bg-[#1A1A1A]">
                        <nav className="px-4 py-3 space-y-2">
                            {navigationItems.map((item) => (
                                <Button
                                    key={item.path}
                                    variant="ghost"
                                    className={`w-full justify-start font-medium transition-colors ${
                                        item.isActive
                                            ? 'text-white bg-black-500 hover:bg-black-500'
                                            : 'text-white/60 hover:bg-black-500 hover:text-white font-normal'
                                    }`}
                                    onClick={() => handleNavigation(item.path)}
                                >
                                    {item.isActive && (
                                        <div className="w-1 h-4 bg-secondary-200 rounded-full mr-3" />
                                    )}
                                    {item.label}
                                </Button>
                            ))}
                            
                        </nav>
                    </div>
                )}
            </header>
        </>
    )
}