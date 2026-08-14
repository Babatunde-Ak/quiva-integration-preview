'use client'

import {Bell, Menu, X} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Badge} from '@/components/ui/badge'
import {useState, useEffect, useRef} from 'react'
import {QuivaLogo} from '@/components/utils/function'
import {useRouter} from 'next/navigation'
import {FaArrowLeft} from 'react-icons/fa'
import ComicConnect from '@/components/global/comic-library/ComicConnect'
import { useAppSelector } from '@/redux/hook'
import { RootState } from '@/redux/store'

export function ComicPadHeader({onMobileMenuToggle, isMobileMenuOpen}) {
    const router = useRouter()
    const {user} = useAppSelector((state: any) => state.wallet)
    const [notifications,
        setNotifications] = useState([
        {
            id: 1,
            message: "New comic release: Spider-Man #1",
            read: false,
            timestamp: Date.now() - 300000
        }, {
            id: 2,
            message: "Your favorite creator posted",
            read: false,
            timestamp: Date.now() - 600000
        }, {
            id: 3,
            message: "Weekly digest available",
            read: true,
            timestamp: Date.now() - 86400000
        }
    ])
    const [showNotifications,
        setShowNotifications] = useState(false)
    const [showUserMenu,
        setShowUserMenu] = useState(false)
    const notificationRef = useRef(null)
    const userMenuRef = useRef(null)

    // Count unread notifications
    const unreadCount = notifications
        .filter(n => !n.read)
        .length

    // Mark notification as read
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id
            ? {
                ...n,
                read: true
            }
            : n))
    }

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({
            ...n,
            read: true
        })))
    }

    // Format timestamp
    const formatTime = (timestamp) => {
        const diff = Date.now() - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (days > 0) 
            return `${days}d ago`
        if (hours > 0) 
            return `${hours}h ago`
        return `${minutes}m ago`
    }

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    return (
        <header
            className="bg-black-200 border-b border-dashed border-white/30 sticky top-0 z-30">
            <div className="px-4 lg:px-6 py-3">
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-3 w-full items-center">
                    {/* Back to Marketplace */}
                    <button
                        onClick={() => router.push('/marketplace')}
                        className="text-white/70 hover:text-primary-100 transition text-sm flex items-center gap-1 group">
                        <FaArrowLeft
                            className="text-xl group-hover:-translate-x-1 transition-transform"/>
                        <span>Marketplace</span>
                    </button>

                    {/* Welcome Message */}
                    <div className="flex flex-col items-center justify-center">
                        <h4
                            className="text-white text-sm lg:text-base xl:text-xl font-medium tracking-wider">
                            Welcome {user?.username || 'Creator'}!
                        </h4>
                        <p className="text-white/60 text-xs xl:text-sm">
                            Let&apos;s build something epic.
                        </p>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center justify-end gap-2">
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white hover:bg-black-300 relative"
                                onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell className="w-5 h-5"/> {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500">
                                        {unreadCount > 9
                                            ? '9+'
                                            : unreadCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-80 bg-black-200 border border-white/70 rounded-lg shadow-xl z-50">
                                    <div className="p-4 border-b border-white/70 flex justify-between items-center">
                                        <h3 className="text-white font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                className="text-xs text-white/60 hover:text-white hover:bg-black-300">
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0
                                            ? (
                                                <div className="p-4 text-center text-white/40">
                                                    No notifications
                                                </div>
                                            )
                                            : (notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`p-4 border-b border-black-300 hover:bg-black-300 cursor-pointer transition-colors ${ !notification.read
                                                    ? 'bg-black-300/50'
                                                    : ''}`}
                                                    onClick={() => markAsRead(notification.id)}>
                                                    <div className="flex justify-between items-start">
                                                        <p
                                                            className={`text-sm ${notification.read
                                                            ? 'text-white/40'
                                                            : 'text-white'}`}>
                                                            {notification.message}
                                                        </p>
                                                        {!notification.read && (<div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"/>)}
                                                    </div>
                                                    <p className="text-xs text-white/50 mt-1">
                                                        {formatTime(notification.timestamp)}
                                                    </p>
                                                </div>
                                            )))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar with Status */}
                        {/* <RainbowConnect/> */}
                        <ComicConnect />

                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="flex lg:hidden items-center justify-between">
                    {/* Mobile Menu Button & Logo */}
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-black-300"
                            onClick={onMobileMenuToggle}>
                            {isMobileMenuOpen
                                ? <X className="w-5 h-5"/>
                                : <Menu className="w-5 h-5"/>}
                        </Button>
                        <QuivaLogo showText className="invert"/>
                    </div>

                    {/* Mobile User Actions */}
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/70 hover:text-white hover:bg-black-300 relative"
                                onClick={() => setShowNotifications(!showNotifications)}>
                                <Bell className="w-5 h-5"/> {unreadCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500">
                                        {unreadCount > 9
                                            ? '9+'
                                            : unreadCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* Mobile Notification Dropdown */}
                            {showNotifications && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-80 bg-black-200 border border-white/70 rounded-lg shadow-xl z-50">
                                    <div className="p-4 border-b border-white/70 flex justify-between items-center">
                                        <h3 className="text-white font-semibold">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={markAllAsRead}
                                                className="text-xs text-white/60 hover:text-white hover:bg-black-300">
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-black-300 hover:bg-black-300 cursor-pointer transition-colors ${ !notification.read
                                                ? 'bg-black-300/50'
                                                : ''}`}
                                                onClick={() => markAsRead(notification.id)}>
                                                <div className="flex justify-between items-start">
                                                    <p
                                                        className={`text-sm ${notification.read
                                                        ? 'text-white/40'
                                                        : 'text-white'}`}>
                                                        {notification.message}
                                                    </p>
                                                    {!notification.read && (<div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"/>)}
                                                </div>
                                                <p className="text-xs text-white/50 mt-1">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar */}
                        {/* <RainbowConnect/> */}
                        <ComicConnect />

                    </div>
                </div>
            </div>
        </header>
    )
}