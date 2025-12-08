'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CurrentReadCard, MintedComicCard, FavoriteComicCard, ListedComicCard } from './cards/ProfileCards';
import EmptyState from './states/EmptyState';
import { mockUser, mockUserComics } from '../utils/userData';
import { MainButton } from '@/components/button';

const UserProfile = ({ onEditProfile, onComicAction }) => {
    const router = useRouter();
    const user = mockUser;
    const comics = mockUserComics;
    const [activeTab, setActiveTab] = useState('currentReads');

    const tabs = [
        { key: 'currentReads', label: 'Current Reads' },
        { key: 'mintedComics', label: 'Minted Comics' },
        { key: 'favoriteComics', label: 'Favorite Comics' },
        { key: 'listedComics', label: 'Listed Comics' }
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    // Handle different actions for empty states
    const handleEmptyStateAction = (action) => {
        switch (action) {
            case 'explore':
                router.push('/marketplace');
                break;
            case 'browse':
                router.push('/marketplace?tab=all');
                break;
            case 'mint':
                router.push('/create');
                break;
            case 'list':
                router.push('/my-collection?action=list');
                break;
            default:
                router.push('/marketplace');
        }
    };

    // Handle card interactions
    const handleCardClick = (comicId) => {
        router.push(`/comic/${comicId}`);
    };

    const handleToggleFavorite = (comicId, isFavorited) => {
        // Handle favorite toggle logic
        console.log(`${isFavorited ? 'Added to' : 'Removed from'} favorites:`, comicId);
        onComicAction?.({ id: comicId }, isFavorited ? 'favorite' : 'unfavorite');
    };

    const renderComicsList = () => {
        const currentComics = comics[activeTab] || [];

        if (currentComics.length === 0) {
            return (
                <EmptyState 
                    type={activeTab}
                    onAction={handleEmptyStateAction}
                />
            );
        }

        // Render different card types based on active tab
        switch (activeTab) {
            case 'currentReads':
                return (
                    <div className="flex flex-col gap-6">
                        {currentComics.map((comic, index) => (
                            <CurrentReadCard
                                key={comic.id || index}
                                {...comic}
                                onContinueReading={() => {
                                    onComicAction?.(comic, 'read');
                                    router.push(`/read/${comic.id}`);
                                }}
                            />
                        ))}
                    </div>
                );

            case 'mintedComics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentComics.map((comic, index) => (
                            <MintedComicCard
                                key={comic.id || index}
                                {...comic}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                );

            case 'favoriteComics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentComics.map((comic, index) => (
                            <FavoriteComicCard
                                key={comic.id || index}
                                {...comic}
                                onCardClick={handleCardClick}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        ))}
                    </div>
                );

            case 'listedComics':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentComics.map((comic, index) => (
                            <ListedComicCard
                                key={comic.id || index}
                                {...comic}
                                onCardClick={handleCardClick}
                            />
                        ))}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background-primary text-text-primary font-space relative overflow-x-hidden">
            
            {/* Header Section */}
            <div className="relative px-10 lg:px-16 py-8 mx-auto">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img 
                        src={'/user-profile-bg.png'}
                        alt="Cover"
                        className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
                    />
                    {/* Gradient overlays can be uncommented if needed */}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-black-400/90 via-black-400/60 to-black-400/70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black-400/80 via-transparent to-black-400/60" /> */}
                </div>

                <div className='grid grid-cols-2 gap-8 children-z-30'>
                    
                    <div className='flex flex-col justify-center'>
                        <div className='flex items-center'>
                            {/* Avatar Container */}
                            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-28 h-28 rounded-full object-cover relative z-10 transition-transform duration-400 hover:scale-105"
                                />
                                <div className="absolute inset-0 -m-2 rounded-full bg-gradient-secondary-200 opacity-60 animate-avatar-glow"/>
                            </div>

                            <div className="ml-6 flex flex-col justify-center">
                                {/* Profile Info */}
                                <div className="flex flex-col gap-2 font-recursive">
                                    <h1 className="text-xl lg:text-3xl font-bold text-white leading-tight">
                                        {user.name}
                                    </h1>
                                    <p className="text-white text-sm font-light">
                                        {user.displayName} - Joined {user.joinDate}
                                    </p>
                                    <p className="text-white text-sm font-light">
                                        {user.bio}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <MainButton 
                            onClick={() => handleEmptyStateAction('browse')} 
                            className="mt-4 max-w-52 rounded-md py-2"
                        >
                            Total Comics: {user.stats.totalComics}
                        </MainButton>
                    </div>

                    <div className="flex flex-col lg:items-end justify-between gap-8 children-z-30">
                        {/* Profile Info */}
                        <div className="flex-1 min-w-0 text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-5 mb-3">
                                <button
                                    className="flex items-center gap-2 bg-white/20 text-white px-5 py-3 rounded-full text-sm font-light transition-all duration-300 backdrop-blur-sm hover:bg-white/30 mx-auto lg:mx-0"
                                    onClick={onEditProfile}
                                >
                                    Edit Profile
                                    <img 
                                        src={'/penline.svg'}
                                        alt="Edit"
                                        className="w-4 h-4 object-cover transition-all duration-1000 ease-in-out"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="flex justify-end gap-8 items-center pt-6 mt-16 text-white font-inter">
                            <div className="text-left p-5">
                                <div className="text-base tracking-wide">Portfolio Value</div>
                                <div className="text-sm font-semibold">
                                    {formatNumber(234.096)} 
                                </div>
                            </div>

                            <div className="text-left">
                                <div className="text-base tracking-wide">Minted Comics</div>
                                <div className="text-sm font-semibold">
                                    {formatNumber(user.stats.mintedComics)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="sticky top-0 bg-black-200 backdrop-blur-lg z-10 container max-w-4xl w-fit mx-4 md:mx-12 lg:mx-16 my-12 rounded-full p-2">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`py-2 px-4 rounded-full text-base text-black-100 font-light whitespace-nowrap border transition-all duration-300 relative hover:text-white hover:bg-primary-secondary-200 hover:bg-opacity-5 
                                ${activeTab === tab.key
                                    ? 'text-primary-secondary-200 border-secondary-200 bg-secondary-200'
                                    : 'text-white border-transparent hover:bg-secondary-200 hover:bg-opacity-5'
                                }`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>  
            </div>

            {/* Content Section */}
            <div className="px-4 lg:px-6 py-10 container bg-black-200 border rounded-3xl border-black-50 mx-4 md:mx-12 lg:mx-16 mb-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white">
                        {activeTab === 'currentReads' && `You currently have ${comics[activeTab]?.length || 0} comics`}
                        {activeTab === 'mintedComics' && 'Your Created Comics'}
                        {activeTab === 'favoriteComics' && 'Your Favorite Comics'}
                        {activeTab === 'listedComics' && 'Comics for Sale'}
                    </h2>
                </div>

                <div>
                    {renderComicsList()}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;