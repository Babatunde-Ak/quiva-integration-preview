'use client';

import React, {useState} from 'react';
import ComicCard from './cards/ComicCard';
import {mockUser, mockUserComics} from '../utils/data';
import { MainButton } from '@/components/button';

const UserProfile = ({onEditProfile, onComicAction}) => {
    const user = mockUser
    const comics = mockUserComics
    const [activeTab,
        setActiveTab] = useState('currentReads');

    const tabs = [
        {
            key: 'currentReads',
            label: 'Current Reads'
        }, {
            key: 'mintedComics',
            label: 'Minted Comics'
        }, {
            key: 'favoriteComics',
            label: 'Favorite Comics'
        }, {
            key: 'listedComics',
            label: 'Listed Comics'
        }
    ];

    const formatCurrency = (value) => {
        return new Intl
            .NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
            .format(value);
    };

    const formatNumber = (value) => {
        return new Intl
            .NumberFormat('en-US')
            .format(value);
    };

    const renderComicsList = () => {
        const currentComics = comics[activeTab] || [];

        if (currentComics.length === 0) {
            return (
                <div className="text-center py-20 px-5 text-white">
                    <div className="w-16 h-16 mx-auto mb-6 opacity-50">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="w-full h-full">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47686 9.24649 5 7.5 5C5.75351 5 4.16789 5.47686 3 6.25278V19.2528C4.16789 18.4769 5.75351 18 7.5 18C9.24649 18 10.8321 18.4769 12 19.2528M12 6.25278C13.1679 5.47686 14.7535 5 16.5 5C18.2465 5 19.8321 5.47686 21 6.25278V19.2528C19.8321 18.4769 18.2465 18 16.5 18C14.7535 18 13.1679 18.4769 12 19.2528"/>
                        </svg>
                    </div>
                    <h3 className="text-2xl text-text-primary mb-3">No comics found</h3>
                    <p className="max-w-md mx-auto">Start exploring and add some comics to your collection!</p>
                </div>
            );
        }

        return (
            <div
                className="flex flex-col gap-6 animate-fade-in-up">
                {currentComics.map((comic, index) => (<ComicCard
                    key={comic.id || index}
                    {...comic}
                    onContinueReading={() => onComicAction
                    ?.(comic, 'read')}
                    />))}
            </div>
        );
    };

    return (
        <div
            className="min-h-screen bg-background-primary text-text-primary font-space relative overflow-x-hidden">
            
            {/* Header Section */}
            <div className="relative px-10 lg:px-16 py-8 mx-auto">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 ">
                    <img 
                    src={'/user-profile-bg.png'}
                    alt={` Cover`}
                    className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
                    />
                    {/* Dark gradient overlay */}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-black-400/90 via-black-400/60 to-black-400/70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black-400/80 via-transparent to-black-400/60" /> */}
                </div>

                <div className='grid grid-cols-2 gap-8 children-z-30'>
                    
                    <div className='flex flex-col justify-center'>
                        <div className='flex  items-center'>
                            {/* Avatar Container */}
                            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-28 h-28 rounded-full object-cover relative z-10 transition-transform duration-400 hover:scale-105"/>
                                <div className="absolute inset-0 -m-2 rounded-full bg-gradient-secondary-200 opacity-60 animate-avatar-glow"/>
                            </div>

                            <div className="ml-6 flex flex-col justify-center">
                                {/* Profile Info */}
                                <div
                                    className="flex flex-col gap-2 font-recursive ">
                                    <h1
                                        className=" text-xl lg:text-3xl font-bold text-white leading-tight">
                                        Yuna
                                    </h1>
                                    <p className="text-white text-sm font-light">Yuna Dean - Joined November 2024</p>
                                    <p className="text-white text-sm font-light">I love to read fanfiction and action series.</p>
                                </div>
                            </div>
                        </div>

                        <MainButton onClick={onEditProfile} className="mt-4 max-w-52 rounded-md py-2">
                            Total Comics: 32
                        </MainButton>
                    </div>

                    <div className="flex flex-col lg:items-end justify-between gap-8 children-z-30">

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0 text-center lg:text-left">
                            <div
                                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-5 mb-3">
                                
                                <button
                                    className={`
                                        flex items-center gap-2 bg-white/20 text-white
                                        px-5 py-3 rounded-full text-sm font-light transition-all duration-300 backdrop-blur-sm
                                        hover:bg-white/30 mx-auto lg:mx-0
                                    `}
                                    onClick={onEditProfile}>
                                    Edit Profile
                                    <img 
                                        src={'/penline.svg'}
                                        alt={` Cover`}
                                        className="w-4 h-4 object-cover transition-all duration-1000 ease-in-out"
                                        />
                                </button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div
                            className="flex justify-end gap-8 items-center pt-6 mt-16 text-white font-inter">
                            <div
                                className="text-left p-5">
                                    <div className="text-base tracking-wide ">
                                        Portfolio Value
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {formatNumber(234.096)} 
                                    </div>
                            </div>

                            <div className="text-left">
                                <div className="text-base tracking-wide ">
                                    Minted Comics
                                </div>
                                <div className="text-sm font-semibold">
                                    {formatNumber(user.stats.mintedComics)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                
            </div>

            {/* Tabs Section */}
            <div
                className="sticky top-0 bg-black-200 backdrop-blur-lg z-10 container max-w-4xl w-fit mx-4 md:mx-12 lg:mx-16 my-12 rounded-full p-2">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={` py-2 px-4 rounded-full text-base text-black-100 font-light whitespace-nowrap border transition-all duration-300 relative hover:text-white hover:bg-primary-secondary-200 hover:bg-opacity-5 
                                ${activeTab === tab.key
                            ? 'text-primary-secondary-200 border-secondary-200 bg-secondary-200'
                            : 'text-white border-transparent hover:bg-secondary-200 hover:bg-opacity-5'} `}
                            onClick={() => setActiveTab(tab.key)}>
                            {tab.label}
                        </button>
                    ))}
                </div>  
            </div>

            {/* Content Section */}
            <div className="px-10 lg:px-16 py-10 container bg-black-200 border border-black-50 rounded-md mx-4 md:mx-12 lg:mx-16">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white">
                        {activeTab === 'currentReads' && `You currently have ${comics[activeTab]
                            ?.length || 0} comics`}
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