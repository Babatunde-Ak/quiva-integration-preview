'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { MintComicCard } from '../components/cards/MintComicCard';
import ReadComicCard from '../components/cards/ReadComicCard';
import EmptyState from './states/EmptyState';
import { MainButton } from '@/components/button';
import { useAppSelector, useAppDispatch } from '@/redux/hook';
import { getUserProfile } from '@/redux/slices/authSlice';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { getUserComics } from '@/redux/slices/comicSlice';
import { useAccount } from 'wagmi';
import { useUserPurchasedComics } from '@/hook/usePurchasedComics';
import OfferManagementSection from '@/features/offers-bids/components/OfferManagementSection';

const VALID_PROFILE_TABS = ['currentReads', 'mintedComics', 'favoriteComics', 'listedComics', 'offersBids', 'offersReceived'];

const UserProfile = ({ onEditProfile, onComicAction }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth?.user?.data);
    // profileData takes precedence over userComics / comicsData
    const profileData = useAppSelector((state) => state.auth?.profile?.data);
    const userData = profileData?.user || profileData || authUser;

    // HashPack remains available as the Hedera account fallback.
    const { account } = useHederaWallet();
    const { user: walletUser } = useAppSelector((state: any) => state.wallet);

    // The official Wagmi-backed purchased-comics hook is authoritative for ownership.
    const { address: wagmiAddress, isConnected } = useAccount();
    const userWalletAddress = wagmiAddress || account || walletUser?.walletAddress;
    const { ownedComics, isLoading: isLoadingNfts } = useUserPurchasedComics();

    const tabParam = searchParams.get('tab');

    // Local state
    const [activeTab, setActiveTab] = useState(
        VALID_PROFILE_TABS.includes(tabParam ?? '') ? tabParam! : 'currentReads'
    );

    // Mock data for current reads
    const [currentReads] = useState([]);

    // Sync active tab with URL param
    useEffect(() => {
        if (tabParam && VALID_PROFILE_TABS.includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Fetch user profile and comics on mount
    useEffect(() => {
        if (authUser?._id) {
            dispatch(getUserProfile(authUser._id));
        }
        dispatch(getUserComics());
    }, [authUser?._id, dispatch]);

    const formatJoinDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const user = {
        id: userData?._id || '',
        name: userData?.displayName || 'User',
        displayName: userData?.username || userData?.displayName || 'User',
        avatar: userData?.avatar || '/default-avatar.png',
        banner: userData?.banner || '/user-profile-bg.png',
        joinDate: formatJoinDate(userData?.createdAt),
        bio: userData?.bio || '',
        stats: {
            totalComics: ownedComics.length,
            portfolioValue: 0,
            mintedComics: ownedComics.length
        }
    };

    const tabs = [
        { key: 'currentReads', label: 'Current Reads' },
        { key: 'mintedComics', label: 'Minted Comics' },
        { key: 'favoriteComics', label: 'Favorite Comics' },
        { key: 'listedComics', label: 'Listed Comics' },
        { key: 'offersBids', label: 'Offers/Bids' },
        { key: 'offersReceived', label: 'Offers Received' }
    ];

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const handleEmptyStateAction = (action) => {
        switch (action) {
            case 'explore':
                router.push('/marketplace');
                break;
            case 'browse':
                router.push('/marketplace?tab=all');
                break;
            case 'mint':
                router.push('/marketplace');
                break;
            case 'list':
                router.push('/marketplace/collections/resell');
                break;
            default:
                router.push('/marketplace');
        }
    };

    const renderComicsList = () => {
        // Current Reads Tab
        if (activeTab === 'currentReads') {
            if (currentReads.length === 0) {
                return (
                    <EmptyState
                        type="currentReads"
                        onAction={handleEmptyStateAction}
                    />
                );
            }

            return (
                <div className="flex flex-col gap-4 sm:gap-6">
                    {currentReads.map((comic: any, index) => (
                        <ReadComicCard
                            key={comic.id || index}
                            title={comic.title}
                            description={comic.description || comic.summary}
                            creator={comic.creator || comic.creatorId?.displayName}
                            creatorAvatar={comic.creatorAvatar || comic.creatorId?.avatar}
                            coverImage={comic.image || comic.bannerImage}
                            progress={comic.progress || 0}
                            genres={comic.genres || comic.genre || []}
                            onContinueReading={() => router.push(`/marketplace/detail?id=${comic.id}`)}
                        />
                    ))}
                </div>
            );
        }

        // Minted Comics Tab - ONLY PLATFORM NFTs
        if (activeTab === 'mintedComics') {
            if (isLoadingNfts) {
                return (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                            <p className="text-white/60">Loading your Quiva comics...</p>
                        </div>
                    </div>
                );
            }

            if (!isConnected && !userWalletAddress) {
                return (
                    <EmptyState
                        type="mintedComics"
                        onAction={handleEmptyStateAction}
                    />
                );
            }

            if (ownedComics.length === 0) {
                return (
                    <div className="space-y-4">
                        <EmptyState
                            type="mintedComics"
                            onAction={handleEmptyStateAction}
                        />
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                    {ownedComics.map((item, index) => (
                        <div key={`${item.tokenId}-${item.serialNumber}-${index}`} className="relative">
                            <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                #{item.serialNumber}
                            </div>

                            <MintComicCard
                                id={item.comicId}
                                title={item.title}
                                creator={item.rawComicData?.creatorId?.displayName || item.rawComicData?.creatorId?.username || 'Unknown Creator'}
                                creatorAvatar={item.rawComicData?.creatorId?.avatar}
                                mintPrice={item.rawComicData?.nftId?.price?.toFixed(2) || '0'}
                                currentPrice={item.rawComicData?.nftId?.price?.toFixed(2) || '0'}
                                views={item.rawComicData?.views?.toString() || '0'}
                                image={item.bannerImage}
                                number={item.serialNumber}
                                tokenId={item.tokenId}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        if (activeTab === 'offersBids') {
            return <OfferManagementSection view="sent" />;
        }

        if (activeTab === 'offersReceived') {
            return <OfferManagementSection view="received" />;
        }

        // Other tabs
        return (
            <EmptyState
                type={activeTab}
                onAction={handleEmptyStateAction}
            />
        );
    };

    const shouldShowContentHeading = !['offersBids', 'offersReceived'].includes(activeTab);

    return (
        <div className="min-h-screen w-full min-w-0 overflow-x-clip bg-background-primary text-text-primary font-space relative">

            {/* Header Section */}
            <div className="relative w-full min-w-0 px-4 sm:px-6 lg:px-10 xl:px-12 py-6 sm:py-8 mx-auto">
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        src={user.banner}
                        alt="Cover"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                        quality={90}
                    />
                    <div className="absolute inset-0 bg-black-500/70" />
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative z-10'>

                    <div className='flex flex-col justify-center'>
                        <div className='flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left'>
                            <div className="relative flex-shrink-0 mb-4 sm:mb-0">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover relative z-10 transition-transform duration-400 hover:scale-105"
                                />
                                <div className="absolute inset-0 -m-2 rounded-full bg-gradient-secondary-200 opacity-60 animate-avatar-glow"/>
                            </div>

                            <div className="sm:ml-4 lg:ml-6 flex flex-col justify-center">
                                <div className="flex flex-col gap-1 sm:gap-2 font-recursive">
                                    <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white leading-tight">
                                        {user.name}
                                    </h1>
                                    <p className="text-white text-xs sm:text-sm font-light">
                                        {user.displayName} - Joined {user.joinDate}
                                    </p>
                                    {userWalletAddress && (
                                        <p className="text-white/60 text-xs sm:text-sm font-mono">
                                            {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
                                        </p>
                                    )}
                                    <p className="text-white text-xs sm:text-sm font-light max-w-md">
                                        {user.bio}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <MainButton
                            onClick={() => handleEmptyStateAction('browse')}
                            className="mt-4 sm:mt-6 w-full sm:max-w-52 rounded-md py-2 text-sm sm:text-base"
                        >
                            Quiva Comics: {user.stats.totalComics}
                        </MainButton>
                    </div>

                    <div className="flex flex-col items-center lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">
                        <div className="w-full flex justify-center lg:justify-end">
                            <button
                                className="flex items-center gap-2 bg-white/20 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm font-light transition-all duration-300 backdrop-blur-sm hover:bg-white/30"
                                onClick={onEditProfile}
                            >
                                Edit Profile
                                <img
                                    src={'/penline.svg'}
                                    alt="Edit"
                                    className="w-3 h-3 sm:w-4 sm:h-4 object-cover transition-all duration-1000 ease-in-out"
                                />
                            </button>
                        </div>

                        <div className="flex flex-row sm:flex-row lg:flex-row justify-center lg:justify-end gap-6 sm:gap-8 items-center text-white font-inter">
                            <div className="text-center lg:text-left">
                                <div className="text-sm sm:text-base tracking-wide">Portfolio Value</div>
                                <div className="text-xs sm:text-sm font-semibold">
                                    {formatNumber(user.stats.portfolioValue)}
                                </div>
                            </div>

                            <div className="text-center lg:text-left">
                                <div className="text-sm sm:text-base tracking-wide">Quiva Comics</div>
                                <div className="text-xs sm:text-sm font-semibold">
                                    {formatNumber(user.stats.mintedComics)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="sticky top-0 z-10 mx-auto my-6 sm:my-8 lg:my-10 w-full min-w-0 max-w-[1180px] rounded-full bg-black-200 p-1.5 sm:p-2 backdrop-blur-lg">
                <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-sm sm:text-base text-black-100 font-light whitespace-nowrap border transition-all duration-300 relative hover:text-white hover:bg-primary-secondary-200 hover:bg-opacity-5
                                ${activeTab === tab.key
                                    ? 'text-primary-secondary-200 border-secondary-200 bg-secondary-200'
                                    : 'text-white border-transparent hover:bg-secondary-200 hover:bg-opacity-5'
                                }`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {tab.key === 'mintedComics' && ownedComics.length > 0 && (
                                <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    {ownedComics.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="mx-auto mb-6 sm:mb-8 w-full min-w-0 max-w-[1180px] rounded-2xl sm:rounded-3xl border border-black-50 bg-black-200 px-3 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-10">
                {shouldShowContentHeading && (
                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                            {activeTab === 'currentReads' && `You currently have ${currentReads.length} comics`}
                            {activeTab === 'mintedComics' && 'Your Quiva Comics'}
                            {activeTab === 'favoriteComics' && 'Your Favorite Comics'}
                            {activeTab === 'listedComics' && 'Comics for Sale'}
                        </h2>
                    </div>
                )}

                <div className="w-full min-w-0">
                    {renderComicsList()}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
