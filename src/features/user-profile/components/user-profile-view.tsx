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
import useMirrorNodeQueries from '@/hook/useMirrorNodeQueries';
import { useHederaWallet } from '@/providers/HashPackProvider';
import { getUserComics, selectUserComics } from '@/redux/slices/comicSlice';

const UserProfile = ({ onEditProfile, onComicAction }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth?.user?.data);
    // profileData takes precedence over userComics / comicsData
    const profileData = useAppSelector((state) => state.auth?.profile?.data);
    const { comics, isLoading } = useAppSelector((state: any) => state.comic);
    const { currentComic } = useAppSelector((state: any) => state.comic);
    const userComicsData = useAppSelector(selectUserComics);

    const userData = profileData?.user || profileData || authUser;

    // Hedera wallet
    const { account } = useHederaWallet();
    const { user: walletUser } = useAppSelector((state: any) => state.wallet);
    const userWalletAddress = account || walletUser?.walletAddress;

    // Mirror Node queries
    const { fetchAccountNfts } = useMirrorNodeQueries();

    const validTabs = ['currentReads', 'mintedComics', 'favoriteComics', 'listedComics'];
    const tabParam = searchParams.get('tab');

    // Local state
    const [activeTab, setActiveTab] = useState(
        validTabs.includes(tabParam ?? '') ? tabParam! : 'currentReads'
    );
    const [mintedNfts, setMintedNfts] = useState<any[]>([]);
    const [isLoadingNfts, setIsLoadingNfts] = useState(false);
    const [debugInfo, setDebugInfo] = useState<any>(null);

    // Mock data for current reads
    const [currentReads] = useState([]);

    // Sync active tab with URL param
    useEffect(() => {
        if (tabParam && validTabs.includes(tabParam)) {
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

    // Fetch user's minted NFTs when on minted comics tab
    useEffect(() => {
        if (activeTab === 'mintedComics' && userWalletAddress) {
            fetchUserNfts();
        }
    }, [activeTab, userWalletAddress]);

    // Helper function to normalize token IDs for comparison
    const normalizeTokenId = (tokenId: string): string => {
        if (!tokenId) return '';
        return tokenId.toString().trim().toLowerCase();
    };

    const fetchUserNfts = async () => {
        if (!userWalletAddress) {
            console.log('⚠️ No wallet address available');
            return;
        }

        setIsLoadingNfts(true);
        try {
            console.log('🔍 Fetching NFTs for wallet:', userWalletAddress);

            const nftsResponse = await fetchAccountNfts(userWalletAddress, undefined);

            console.log('📦 NFTs response:', nftsResponse);

            if (nftsResponse?.nfts && Array.isArray(nftsResponse.nfts)) {
                const allComics = comics?.data?.comics?.data || [];

                console.log('📚 All comics from Redux:', allComics);
                console.log('📚 Comics count:', allComics.length);

                const comicTokenIds = allComics
                    .filter((comic: any) => comic.nftId?.tokenId)
                    .map((comic: any) => ({
                        original: comic.nftId.tokenId,
                        normalized: normalizeTokenId(comic.nftId.tokenId),
                        comic: comic
                    }));

                console.log('🎯 Comic token IDs from database:');
                comicTokenIds.forEach(item => {
                    console.log(`  - Original: "${item.original}" | Normalized: "${item.normalized}" | Comic: "${item.comic.title}"`);
                });

                const userNftTokenIds = nftsResponse.nfts.map((nft: any) => ({
                    original: nft.token_id,
                    normalized: normalizeTokenId(nft.token_id),
                    nft: nft
                }));

                console.log('🎯 User NFT token IDs from wallet:');
                userNftTokenIds.forEach(item => {
                    console.log(`  - Original: "${item.original}" | Normalized: "${item.normalized}"`);
                });

                const normalizedComicTokenSet = new Set(
                    comicTokenIds.map(item => item.normalized)
                );

                console.log('🔍 Normalized comic token set:', Array.from(normalizedComicTokenSet));

                const userComicNfts = nftsResponse.nfts.filter((nft: any) => {
                    const normalizedNftToken = normalizeTokenId(nft.token_id);
                    const isMatch = normalizedComicTokenSet.has(normalizedNftToken);

                    console.log(`🔎 Checking NFT ${nft.token_id}:`, {
                        normalized: normalizedNftToken,
                        isMatch: isMatch
                    });

                    return isMatch;
                });

                console.log('✅ Filtered comic NFTs (ONLY platform NFTs):', userComicNfts);
                console.log('✅ Filtered count:', userComicNfts.length);

                const nftsToDisplay = userComicNfts;
                console.log('🎨 NFTs to display (platform only):', nftsToDisplay);

                const mappedNfts = nftsToDisplay.map((nft: any) => {
                    const normalizedNftToken = normalizeTokenId(nft.token_id);

                    const comicMatch = comicTokenIds.find(item =>
                        item.normalized === normalizedNftToken
                    );

                    const comic = comicMatch?.comic;

                    let parsedMetadata = nft.metadata;
                    if (typeof parsedMetadata === 'string') {
                        try {
                            parsedMetadata = JSON.parse(parsedMetadata);
                        } catch (e) {
                            console.log('Could not parse metadata for NFT:', nft.token_id);
                        }
                    }

                    const getImage = () => {
                        if (comic?.bannerImage) {
                            console.log(`✅ Using comic banner for ${nft.token_id}:`, comic.bannerImage);
                            return comic.bannerImage;
                        }
                        if (parsedMetadata?.image) {
                            console.log(`✅ Using NFT metadata image for ${nft.token_id}:`, parsedMetadata.image);
                            return parsedMetadata.image;
                        }
                        if (parsedMetadata?.image_url) {
                            console.log(`✅ Using NFT image_url for ${nft.token_id}:`, parsedMetadata.image_url);
                            return parsedMetadata.image_url;
                        }
                        if (typeof parsedMetadata === 'string' && parsedMetadata.startsWith('http')) {
                            console.log(`✅ Using metadata URL for ${nft.token_id}:`, parsedMetadata);
                            return parsedMetadata;
                        }
                        console.log(`⚠️ No image found for ${nft.token_id}, using default`);
                        return '/dev_images/avatar-2.png';
                    };

                    const imageUrl = getImage();

                    console.log(`🔍 Mapping platform NFT ${nft.token_id}:`, {
                        found: !!comic,
                        comicTitle: comic?.title,
                        comicBanner: comic?.bannerImage,
                        metadataImage: parsedMetadata?.image,
                        finalImage: imageUrl,
                        nftTokenId: nft.token_id,
                        serialNumber: nft.serial_number
                    });

                    return {
                        id: comic?._id || `platform-${nft.token_id}`,
                        nftId: `${nft.token_id}-${nft.serial_number}`,
                        title: comic?.title || `Comic NFT #${nft.serial_number}`,
                        image: imageUrl,
                        tokenId: nft.token_id,
                        serialNumber: nft.serial_number,
                        metadata: parsedMetadata,
                        comic: comic,
                        creator: comic?.creatorId?.displayName || comic?.creatorId?.username || parsedMetadata?.creator || 'Unknown Creator',
                        creatorAvatar: comic?.creatorId?.avatar || parsedMetadata?.creator_avatar,
                        mintPrice: comic?.nftId?.price?.toFixed(2) || '0',
                        currentPrice: comic?.nftId?.price?.toFixed(2) || '0',
                        views: comic?.views?.toString() || '0',
                        number: nft.serial_number,
                        isMatched: true
                    };
                });

                setMintedNfts(mappedNfts);

                setDebugInfo({
                    totalNftsInWallet: nftsResponse.nfts.length,
                    comicsInDatabase: allComics.length,
                    platformNftsFound: userComicNfts.length,
                    comicTokenIds: comicTokenIds.map(item => item.original),
                    userNftTokenIds: userNftTokenIds.map(item => item.original),
                });

                console.log('🎨 Final mapped NFTs (all from platform):', mappedNfts);
                console.log(`📊 Summary: Found ${mappedNfts.length} platform NFTs out of ${nftsResponse.nfts.length} total NFTs`);
            } else {
                console.log('⚠️ No NFTs found in response');
                setMintedNfts([]);
                setDebugInfo({ error: 'No NFTs in response' });
            }
        } catch (error) {
            console.error('❌ Error fetching user NFTs:', error);
            setMintedNfts([]);
            setDebugInfo({ error: error.message });
        } finally {
            setIsLoadingNfts(false);
        }
    };

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
            totalComics: mintedNfts.length,
            portfolioValue: 0,
            mintedComics: mintedNfts.length
        }
    };

    const tabs = [
        { key: 'currentReads', label: 'Current Reads' },
        { key: 'mintedComics', label: 'Minted Comics' },
        { key: 'favoriteComics', label: 'Favorite Comics' },
        { key: 'listedComics', label: 'Listed Comics' }
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
                router.push('/create');
                break;
            case 'list':
                router.push('/my-collection?action=list');
                break;
            default:
                router.push('/marketplace');
        }
    };

    const handleComicClick = (nft: any) => {
        console.log('🎯 Comic NFT clicked:', nft);

        if (nft.id && !nft.id.startsWith('platform-')) {
            router.push(`/marketplace/detail?id=${nft.id}`);
        } else {
            router.push(`/marketplace`);
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
                    {currentReads.map((comic, index) => (
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

            if (!userWalletAddress) {
                return (
                    <EmptyState
                        type="mintedComics"
                        onAction={handleEmptyStateAction}
                    />
                );
            }

            if (mintedNfts.length === 0) {
                return (
                    <div className="space-y-4">
                        <EmptyState
                            type="mintedComics"
                            onAction={handleEmptyStateAction}
                        />

                        {debugInfo && debugInfo.totalNftsInWallet > 0 && (
                            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                                <p className="text-yellow-400 text-sm mb-2">
                                    ℹ️ You have {debugInfo.totalNftsInWallet} NFT{debugInfo.totalNftsInWallet !== 1 ? 's' : ''} in your wallet,
                                    but none are from Quiva comics.
                                </p>
                                <p className="text-yellow-400/70 text-xs">
                                    Only NFTs minted through Quiva will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
                    {mintedNfts.map((nft, index) => (
                        <div key={nft.nftId || index} className="relative">
                            <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                #{nft.serialNumber}
                            </div>

                            <MintComicCard
                                id={nft.id}
                                title={nft.title}
                                creator={nft.creator}
                                creatorAvatar={nft.creatorAvatar}
                                mintPrice={nft.mintPrice}
                                currentPrice={nft.currentPrice}
                                views={nft.views}
                                image={nft.image}
                                number={nft.number}
                                tokenId={nft.tokenId}
                            />
                        </div>
                    ))}
                </div>
            );
        }

        // Other tabs
        return (
            <EmptyState
                type={activeTab}
                onAction={handleEmptyStateAction}
            />
        );
    };

    return (
        <div className="min-h-screen bg-background-primary text-text-primary font-space relative overflow-x-hidden">

            {/* Header Section */}
            <div className="relative px-4 sm:px-6 lg:px-16 py-6 sm:py-8 mx-auto">
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
            <div className="sticky top-0 bg-black-200 backdrop-blur-lg z-10 container max-w-full mx-2 sm:mx-4 md:mx-12 lg:mx-16 my-6 sm:my-8 lg:my-12 rounded-full p-1.5 sm:p-2">
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
                            {tab.key === 'mintedComics' && mintedNfts.length > 0 && (
                                <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    {mintedNfts.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 container bg-black-200 border rounded-2xl sm:rounded-3xl border-black-50 mx-2 sm:mx-4 md:mx-12 lg:mx-16 mb-6 sm:mb-8">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
                        {activeTab === 'currentReads' && `You currently have ${currentReads.length} comics`}
                        {activeTab === 'mintedComics' && 'Your Quiva Comics'}
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
