'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAppSelector } from '@/redux/hook';

const Layout = ({ children }: { children: React.ReactNode }) => {
    const authUser = useAppSelector((state) => state.auth?.user?.data);
    const profileData = useAppSelector((state) => state.auth?.profile?.data);
    const user = profileData?.user || profileData || authUser;
    const router = useRouter();
    const pathname = usePathname();

    const navigationItems = [
        { key: 'general', label: 'General', href: '/user-profile' },
        { key: 'edit', label: 'Edit profile', href: '/profile/edit' },
        { key: 'wallet', label: 'Wallet', href: '/profile/wallet' },
        { key: 'notifications', label: 'Notifications', href: '/profile/notifications' }
    ];

    const getActiveSection = () => {
        if (pathname === '/user-profile') return 'general';
        if (pathname.includes('/edit')) return 'edit';
        if (pathname.includes('/wallet')) return 'wallet';
        if (pathname.includes('/notifications')) return 'notifications';
        return 'general';
    };

    const getSubtitle = () => {
        const activeSection = getActiveSection();
        switch (activeSection) {
            case 'edit':
                return "Set up your Quiva presence";
            case 'wallet':
                return "Link multiple wallets and set one as our primary. Your primary wallet can't be unlinked and is used by default.";
            case 'notifications':
                return "Manage your email and in-app notification preferences.";
            default:
                return "Manage your account settings";
        }
    };

    const handleNavigation = (href) => {
        router.push('/marketplace' + href);
    };

    const handleBack = () => {
        router.push('/marketplace/user-profile');
    };

    const activeSection = getActiveSection();
    const subtitle = getSubtitle();

    return (
        <div className="min-h-screen bg-background-primary text-text-primary font-space bg-black-500">
            {/* Header */}
            <div className="">
                <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-4">
                    <button 
                        onClick={handleBack}
                        className="p-2 rounded-lg hover:bg-black-100/50 transition-colors lg:hidden"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.avatar || '/default-avatar.png'}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover border-2 border-black-50"
                        />
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-white">
                                {`${user?.displayName || 'User'} / Settings`}
                            </h1>
                            <p className="text-sm text-white/60">
                                {subtitle}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 ">
                    {/* Mobile Navigation */}
                    <div className="lg:hidden border-b border-black-50">
                        <div className="flex overflow-x-auto no-scrollbar">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleNavigation(item.href)}
                                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                        activeSection === item.key
                                            ? 'text-white border-secondary-200'
                                            : 'text-white/60 border-transparent hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:block p-4 space-y-2">
                        {navigationItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => handleNavigation(item.href)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                    activeSection === item.key
                                        ? 'bg-secondary-200 text-black-200'
                                        : 'text-white/80 hover:bg-black-100/30 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 ">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
