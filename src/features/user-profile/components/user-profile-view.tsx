// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CurrentReadCard, MintedComicCard, FavoriteComicCard, ListedComicCard } from './cards/ProfileCards';
// import EmptyState from './states/EmptyState';
// import { mockUserComics } from '../utils/userData';
// import { MainButton } from '@/components/button';
// import { useAppSelector, useAppDispatch } from '@/redux/hook';
// import { getUserProfile } from '@/redux/slices/authSlice';

// const UserProfile = ({ onEditProfile, onComicAction }) => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const authUser = useAppSelector((state) => state.auth?.user?.data);
//     const profileData = useAppSelector((state) => state.auth?.profile?.data);

//     const userData = profileData?.user || profileData || authUser;

//     useEffect(() => {
//         if (authUser?._id) {
//             dispatch(getUserProfile(authUser._id));
//         }
//     }, [authUser?._id, dispatch]);

//     const formatJoinDate = (dateString) => {
//         if (!dateString) return 'Unknown';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//     };

//     const user = {
//         id: userData?._id || '',
//         name: userData?.displayName || 'User',
//         displayName: userData?.username || userData?.displayName || 'User',
//         avatar: userData?.avatar || '/default-avatar.png',
//         banner: userData?.banner || '/user-profile-bg.png',
//         joinDate: formatJoinDate(userData?.createdAt),
//         bio: userData?.bio || '',
//         stats: {
//             totalComics: 0,
//             portfolioValue: 0,
//             mintedComics: 0
//         }
//     };

//     const comics = mockUserComics;
//     const [activeTab, setActiveTab] = useState('currentReads');

//     const tabs = [
//         { key: 'currentReads', label: 'Current Reads' },
//         { key: 'mintedComics', label: 'Minted Comics' },
//         { key: 'favoriteComics', label: 'Favorite Comics' },
//         { key: 'listedComics', label: 'Listed Comics' }
//     ];

//     const formatCurrency = (value) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//             minimumFractionDigits: 0,
//             maximumFractionDigits: 0
//         }).format(value);
//     };

//     const formatNumber = (value) => {
//         return new Intl.NumberFormat('en-US').format(value);
//     };

//     // Handle different actions for empty states
//     const handleEmptyStateAction = (action) => {
//         switch (action) {
//             case 'explore':
//                 router.push('/marketplace');
//                 break;
//             case 'browse':
//                 router.push('/marketplace?tab=all');
//                 break;
//             case 'mint':
//                 router.push('/create');
//                 break;
//             case 'list':
//                 router.push('/my-collection?action=list');
//                 break;
//             default:
//                 router.push('/marketplace');
//         }
//     };

//     // Handle card interactions
//     const handleCardClick = (comicId) => {
//         router.push(`/comic/${comicId}`);
//     };

//     const handleToggleFavorite = (comicId, isFavorited) => {
//         // Handle favorite toggle logic
//         console.log(`${isFavorited ? 'Added to' : 'Removed from'} favorites:`, comicId);
//         onComicAction?.({ id: comicId }, isFavorited ? 'favorite' : 'unfavorite');
//     };

//     const renderComicsList = () => {
//         const currentComics = comics[activeTab] || [];

//         if (currentComics.length === 0) {
//             return (
//                 <EmptyState 
//                     type={activeTab}
//                     onAction={handleEmptyStateAction}
//                 />
//             );
//         }

//         // Render different card types based on active tab
//         switch (activeTab) {
//             case 'currentReads':
//                 return (
//                     <div className="flex flex-col gap-4 sm:gap-6">
//                         {currentComics.map((comic, index) => (
//                             <CurrentReadCard
//                                 key={comic.id || index}
//                                 {...comic}
//                                 onContinueReading={() => {
//                                     onComicAction?.(comic, 'read');
//                                     router.push(`/read/${comic.id}`);
//                                 }}
//                             />
//                         ))}
//                     </div>
//                 );

//             case 'mintedComics':
//                 return (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
//                         {currentComics.map((comic, index) => (
//                             <MintedComicCard
//                                 key={comic.id || index}
//                                 {...comic}
//                                 onCardClick={handleCardClick}
//                             />
//                         ))}
//                     </div>
//                 );

//             case 'favoriteComics':
//                 return (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
//                         {currentComics.map((comic, index) => (
//                             <FavoriteComicCard
//                                 key={comic.id || index}
//                                 {...comic}
//                                 onCardClick={handleCardClick}
//                                 onToggleFavorite={handleToggleFavorite}
//                             />
//                         ))}
//                     </div>
//                 );

//             case 'listedComics':
//                 return (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
//                         {currentComics.map((comic, index) => (
//                             <ListedComicCard
//                                 key={comic.id || index}
//                                 {...comic}
//                                 onCardClick={handleCardClick}
//                             />
//                         ))}
//                     </div>
//                 );

//             default:
//                 return null;
//         }
//     };

//     return (
//         <div className="min-h-screen bg-background-primary text-text-primary font-space relative overflow-x-hidden">
            
//             {/* Header Section */}
//             <div className="relative px-4 sm:px-6 lg:px-16 py-6 sm:py-8 mx-auto">
//                 {/* Background Image with Overlay */}
//                 <div className="absolute inset-0">
//                     <img
//                         src={user.banner}
//                         alt="Cover"
//                         className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
//                     />
//                     <div className="absolute inset-0 bg-black-500/70" />
//                 </div>

//                 <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative z-10'>
                    
//                     <div className='flex flex-col justify-center'>
//                         <div className='flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left'>
//                             {/* Avatar Container */}
//                             <div className="relative flex-shrink-0 mb-4 sm:mb-0">
//                                 <img
//                                     src={user.avatar}
//                                     alt={user.name}
//                                     className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover relative z-10 transition-transform duration-400 hover:scale-105"
//                                 />
//                                 <div className="absolute inset-0 -m-2 rounded-full bg-gradient-secondary-200 opacity-60 animate-avatar-glow"/>
//                             </div>

//                             <div className="sm:ml-4 lg:ml-6 flex flex-col justify-center">
//                                 {/* Profile Info */}
//                                 <div className="flex flex-col gap-1 sm:gap-2 font-recursive">
//                                     <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white leading-tight">
//                                         {user.name}
//                                     </h1>
//                                     <p className="text-white text-xs sm:text-sm font-light">
//                                         {user.displayName} - Joined {user.joinDate}
//                                     </p>
//                                     <p className="text-white text-xs sm:text-sm font-light max-w-md">
//                                         {user.bio}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <MainButton 
//                             onClick={() => handleEmptyStateAction('browse')} 
//                             className="mt-4 sm:mt-6 w-full sm:max-w-52 rounded-md py-2 text-sm sm:text-base"
//                         >
//                             Total Comics: {user.stats.totalComics}
//                         </MainButton>
//                     </div>

//                     <div className="flex flex-col items-center lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">
//                         {/* Edit Profile Button */}
//                         <div className="w-full flex justify-center lg:justify-end">
//                             <button
//                                 className="flex items-center gap-2 bg-white/20 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm font-light transition-all duration-300 backdrop-blur-sm hover:bg-white/30"
//                                 onClick={onEditProfile}
//                             >
//                                 Edit Profile
//                                 <img 
//                                     src={'/penline.svg'}
//                                     alt="Edit"
//                                     className="w-3 h-3 sm:w-4 sm:h-4 object-cover transition-all duration-1000 ease-in-out"
//                                 />
//                             </button>
//                         </div>

//                         {/* Stats Section */}
//                         <div className="flex flex-row sm:flex-row lg:flex-row justify-center lg:justify-end gap-6 sm:gap-8 items-center text-white font-inter">
//                             <div className="text-center lg:text-left">
//                                 <div className="text-sm sm:text-base tracking-wide">Portfolio Value</div>
//                                 <div className="text-xs sm:text-sm font-semibold">
//                                     {formatNumber(user.stats.portfolioValue)}
//                                 </div>
//                             </div>

//                             <div className="text-center lg:text-left">
//                                 <div className="text-sm sm:text-base tracking-wide">Minted Comics</div>
//                                 <div className="text-xs sm:text-sm font-semibold">
//                                     {formatNumber(user.stats.mintedComics)}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Tabs Section */}
//             <div className="sticky top-0 bg-black-200 backdrop-blur-lg z-10 container max-w-full mx-2 sm:mx-4 md:mx-12 lg:mx-16 my-6 sm:my-8 lg:my-12 rounded-full p-1.5 sm:p-2">
//                 <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
//                     {tabs.map((tab) => (
//                         <button
//                             key={tab.key}
//                             className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-sm sm:text-base text-black-100 font-light whitespace-nowrap border transition-all duration-300 relative hover:text-white hover:bg-primary-secondary-200 hover:bg-opacity-5 
//                                 ${activeTab === tab.key
//                                     ? 'text-primary-secondary-200 border-secondary-200 bg-secondary-200'
//                                     : 'text-white border-transparent hover:bg-secondary-200 hover:bg-opacity-5'
//                                 }`}
//                             onClick={() => setActiveTab(tab.key)}
//                         >
//                             {tab.label}
//                         </button>
//                     ))}
//                 </div>  
//             </div>

//             {/* Content Section */}
//             <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 container bg-black-200 border rounded-2xl sm:rounded-3xl border-black-50 mx-2 sm:mx-4 md:mx-12 lg:mx-16 mb-6 sm:mb-8">
//                 <div className="mb-6 sm:mb-8">
//                     <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
//                         {activeTab === 'currentReads' && `You currently have ${comics[activeTab]?.length || 0} comics`}
//                         {activeTab === 'mintedComics' && 'Your Created Comics'}
//                         {activeTab === 'favoriteComics' && 'Your Favorite Comics'}
//                         {activeTab === 'listedComics' && 'Comics for Sale'}
//                     </h2>
//                 </div>

//                 <div>
//                     {renderComicsList()}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserProfile;

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { MintComicCard } from '../components/cards/MintComicCard';
// import ReadComicCard from '../components/cards/ReadComicCard';
// import EmptyState from './states/EmptyState';
// import { MainButton } from '@/components/button';
// import { useAppSelector, useAppDispatch } from '@/redux/hook';
// import { getUserProfile } from '@/redux/slices/authSlice';
// import useMirrorNodeQueries from '@/hook/useMirrorNodeQueries';
// import { useHederaWallet } from '@/providers/HashPackProvider';

// const UserProfile = ({ onEditProfile, onComicAction }) => {
//     const router = useRouter();
//     const dispatch = useAppDispatch();
//     const authUser = useAppSelector((state) => state.auth?.user?.data);
//     const profileData = useAppSelector((state) => state.auth?.profile?.data);
//     const { comics: comicsData } = useAppSelector((state: any) => state.comic);

//     const userData = profileData?.user || profileData || authUser;

//     // Hedera wallet
//     const { account } = useHederaWallet();
//     const { user: walletUser } = useAppSelector((state: any) => state.wallet);
//     const userWalletAddress = account || walletUser?.walletAddress;

//     // Mirror Node queries
//     const { fetchAccountNfts, fetchAccountOwnedNfts, accountNfts, accountOwnedNfts } = useMirrorNodeQueries();

//     // Local state
//     const [activeTab, setActiveTab] = useState('currentReads');
//     const [mintedNfts, setMintedNfts] = useState<any[]>([]);
//     const [isLoadingNfts, setIsLoadingNfts] = useState(false);

//     // Mock data for current reads
//     const [currentReads] = useState([
//         // You can populate this with actual reading history from your backend
//     ]);

//     // Fetch user profile
//     useEffect(() => {
//         if (authUser?._id) {
//             dispatch(getUserProfile(authUser._id));
//         }
//     }, [authUser?._id, dispatch]);

//     // Fetch user's minted NFTs when on minted comics tab
//     useEffect(() => {
//         if (activeTab === 'mintedComics' && userWalletAddress) {
//             fetchUserNfts();
//         }
//     }, [activeTab, userWalletAddress]);

//     const fetchUserNfts = async () => {
//         if (!userWalletAddress) {
//             console.log('⚠️ No wallet address available');
//             return;
//         }

//         setIsLoadingNfts(true);
//         try {
//             console.log('🔍 Fetching NFTs for wallet:', userWalletAddress);
            
//             // Fetch all NFTs owned by this user
//             // const nftsResponse = await fetchAccountNfts(userWalletAddress, undefined);
//             const nftsResponse = await fetchAccountOwnedNfts(userWalletAddress);
//             console.log('📦 User NFTs response:', nftsResponse);

//             if (Array.isArray(nftsResponse)) {
//                 // Get all comic tokens from Redux
//                 const allComics = comicsData?.data?.comics?.data || [];
//                 const comicTokenIds = allComics
//                     .filter((comic: any) => comic.nftId?.tokenId)
//                     .map((comic: any) => comic.nftId.tokenId);

//                 console.log('🎯 Comic token IDs:', comicTokenIds);

//                 // Filter NFTs to only include ones from your comic collection
//                 const userComicNfts = nftsResponse.filter((nft: any) => 
//                     comicTokenIds.includes(nft.token_id)
//                 );

//                 console.log('✅ Filtered comic NFTs:', userComicNfts);

//                 // Map NFTs to comic data
//                 const mappedNfts = userComicNfts.map((nft: any) => {
//                     // Find the corresponding comic
//                     const comic = allComics.find((c: any) => 
//                         c.nftId?.tokenId === nft.token_id
//                     );

//                     return {
//                         id: comic?._id,
//                         nftId: `${nft.token_id}-${nft.serial_number}`,
//                         title: comic?.title || 'Unknown Comic',
//                         image: comic?.bannerImage || nft.metadata?.image || '/dev_images/avatar-2.png',
//                         tokenId: nft.token_id,
//                         serialNumber: nft.serial_number,
//                         metadata: nft.metadata,
//                         comic: comic,
//                         // For MintComicCard props
//                         creator: comic?.creatorId?.displayName || comic?.creatorId?.username || 'Creator',
//                         creatorAvatar: comic?.creatorId?.avatar,
//                         mintPrice: comic?.nftId?.price?.toFixed(2) || '0',
//                         currentPrice: comic?.nftId?.price?.toFixed(2) || '0',
//                         views: comic?.views?.toString() || '0',
//                         number: nft.serial_number,
//                     };
//                 });

//                 setMintedNfts(mappedNfts);
//                 console.log('🎨 Mapped NFTs with comic data:', mappedNfts);
//             } else {
//                 setMintedNfts([]);
//             }
//         } catch (error) {
//             console.error('❌ Error fetching user NFTs:', error);
//             setMintedNfts([]);
//         } finally {
//             setIsLoadingNfts(false);
//         }
//     };

//     const formatJoinDate = (dateString) => {
//         if (!dateString) return 'Unknown';
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//     };

//     const user = {
//         id: userData?._id || '',
//         name: userData?.displayName || 'User',
//         displayName: userData?.username || userData?.displayName || 'User',
//         avatar: userData?.avatar || '/default-avatar.png',
//         banner: userData?.banner || '/user-profile-bg.png',
//         joinDate: formatJoinDate(userData?.createdAt),
//         bio: userData?.bio || '',
//         stats: {
//             totalComics: mintedNfts.length,
//             portfolioValue: 0,
//             mintedComics: mintedNfts.length
//         }
//     };

//     const tabs = [
//         { key: 'currentReads', label: 'Current Reads' },
//         { key: 'mintedComics', label: 'Minted Comics' },
//         { key: 'favoriteComics', label: 'Favorite Comics' },
//         { key: 'listedComics', label: 'Listed Comics' }
//     ];

//     const formatNumber = (value) => {
//         return new Intl.NumberFormat('en-US').format(value);
//     };

//     // Handle different actions for empty states
//     const handleEmptyStateAction = (action) => {
//         switch (action) {
//             case 'explore':
//                 router.push('/marketplace');
//                 break;
//             case 'browse':
//                 router.push('/marketplace?tab=all');
//                 break;
//             case 'mint':
//                 router.push('/create');
//                 break;
//             case 'list':
//                 router.push('/my-collection?action=list');
//                 break;
//             default:
//                 router.push('/marketplace');
//         }
//     };

//     // Handle comic click - Navigate to read page
//     const handleComicClick = (comicId: string) => {
//         console.log('📖 Starting to read comic:', comicId);
//         router.push(`/read/${comicId}`);
//     };

//     const renderComicsList = () => {
//         // Current Reads Tab
//         if (activeTab === 'currentReads') {
//             if (currentReads.length === 0) {
//                 return (
//                     <EmptyState 
//                         type="currentReads"
//                         onAction={handleEmptyStateAction}
//                     />
//                 );
//             }

//             return (
//                 <div className="flex flex-col gap-4 sm:gap-6">
//                     {currentReads.map((comic, index) => (
//                         <ReadComicCard
//                             key={comic.id || index}
//                             title={comic.title}
//                             description={comic.description || comic.summary}
//                             creator={comic.creator || comic.creatorId?.displayName}
//                             creatorAvatar={comic.creatorAvatar || comic.creatorId?.avatar}
//                             coverImage={comic.image || comic.bannerImage}
//                             progress={comic.progress || 0}
//                             genres={comic.genres || comic.genre || []}
//                             onContinueReading={() => handleComicClick(comic.id)}
//                         />
//                     ))}
//                 </div>
//             );
//         }

//         // Minted Comics Tab
//         if (activeTab === 'mintedComics') {
//             if (isLoadingNfts) {
//                 return (
//                     <div className="flex items-center justify-center py-20">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
//                             <p className="text-white/60">Loading your minted comics...</p>
//                         </div>
//                     </div>
//                 );
//             }

//             if (!userWalletAddress) {
//                 return (
//                     <EmptyState 
//                         type="mintedComics"
//                         onAction={handleEmptyStateAction}
//                         // customMessage="Connect your wallet to see your minted comics"
//                     />
//                 );
//             }

//             if (mintedNfts.length === 0) {
//                 return (
//                     <EmptyState 
//                         type="mintedComics"
//                         onAction={handleEmptyStateAction}
//                     />
//                 );
//             }

//             return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
//                     {mintedNfts.map((nft, index) => (
//                         <div key={nft.nftId || index} className="relative">
//                             {/* Owned Badge Overlay */}
//                             <div className="absolute top-2 left-2 z-20 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
//                                 <span>✓</span>
//                                 <span>Owned</span>
//                             </div>
                            
//                             {/* Serial Number Badge */}
//                             <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
//                                 #{nft.serialNumber}
//                             </div>

//                             <MintComicCard
//                                 id={nft.id}
//                                 title={nft.title}
//                                 creator={nft.creator}
//                                 creatorAvatar={nft.creatorAvatar}
//                                 mintPrice={nft.mintPrice}
//                                 currentPrice={nft.currentPrice}
//                                 views={nft.views}
//                                 image={nft.image}
//                                 number={nft.number}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             );
//         }

//         // Other tabs - Show empty state
//         return (
//             <EmptyState 
//                 type={activeTab}
//                 onAction={handleEmptyStateAction}
//             />
//         );
//     };

//     return (
//         <div className="min-h-screen bg-background-primary text-text-primary font-space relative overflow-x-hidden">
            
//             {/* Header Section */}
//             <div className="relative px-4 sm:px-6 lg:px-16 py-6 sm:py-8 mx-auto">
//                 {/* Background Image with Overlay */}
//                 <div className="absolute inset-0">
//                     <img
//                         src={user.banner}
//                         alt="Cover"
//                         className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
//                     />
//                     <div className="absolute inset-0 bg-black-500/70" />
//                 </div>

//                 <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative z-10'>
                    
//                     <div className='flex flex-col justify-center'>
//                         <div className='flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left'>
//                             {/* Avatar Container */}
//                             <div className="relative flex-shrink-0 mb-4 sm:mb-0">
//                                 <img
//                                     src={user.avatar}
//                                     alt={user.name}
//                                     className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full object-cover relative z-10 transition-transform duration-400 hover:scale-105"
//                                 />
//                                 <div className="absolute inset-0 -m-2 rounded-full bg-gradient-secondary-200 opacity-60 animate-avatar-glow"/>
//                             </div>

//                             <div className="sm:ml-4 lg:ml-6 flex flex-col justify-center">
//                                 {/* Profile Info */}
//                                 <div className="flex flex-col gap-1 sm:gap-2 font-recursive">
//                                     <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-white leading-tight">
//                                         {user.name}
//                                     </h1>
//                                     <p className="text-white text-xs sm:text-sm font-light">
//                                         {user.displayName} - Joined {user.joinDate}
//                                     </p>
//                                     {userWalletAddress && (
//                                         <p className="text-white/60 text-xs sm:text-sm font-mono">
//                                             {userWalletAddress.slice(0, 6)}...{userWalletAddress.slice(-4)}
//                                         </p>
//                                     )}
//                                     <p className="text-white text-xs sm:text-sm font-light max-w-md">
//                                         {user.bio}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <MainButton 
//                             onClick={() => handleEmptyStateAction('browse')} 
//                             className="mt-4 sm:mt-6 w-full sm:max-w-52 rounded-md py-2 text-sm sm:text-base"
//                         >
//                             Total Comics: {user.stats.totalComics}
//                         </MainButton>
//                     </div>

//                     <div className="flex flex-col items-center lg:items-end justify-between gap-4 sm:gap-6 lg:gap-8 relative z-10">
//                         {/* Edit Profile Button */}
//                         <div className="w-full flex justify-center lg:justify-end">
//                             <button
//                                 className="flex items-center gap-2 bg-white/20 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full text-sm font-light transition-all duration-300 backdrop-blur-sm hover:bg-white/30"
//                                 onClick={onEditProfile}
//                             >
//                                 Edit Profile
//                                 <img 
//                                     src={'/penline.svg'}
//                                     alt="Edit"
//                                     className="w-3 h-3 sm:w-4 sm:h-4 object-cover transition-all duration-1000 ease-in-out"
//                                 />
//                             </button>
//                         </div>

//                         {/* Stats Section */}
//                         <div className="flex flex-row sm:flex-row lg:flex-row justify-center lg:justify-end gap-6 sm:gap-8 items-center text-white font-inter">
//                             <div className="text-center lg:text-left">
//                                 <div className="text-sm sm:text-base tracking-wide">Portfolio Value</div>
//                                 <div className="text-xs sm:text-sm font-semibold">
//                                     {formatNumber(user.stats.portfolioValue)}
//                                 </div>
//                             </div>

//                             <div className="text-center lg:text-left">
//                                 <div className="text-sm sm:text-base tracking-wide">Minted Comics</div>
//                                 <div className="text-xs sm:text-sm font-semibold">
//                                     {formatNumber(user.stats.mintedComics)}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Tabs Section */}
//             <div className="sticky top-0 bg-black-200 backdrop-blur-lg z-10 container max-w-full mx-2 sm:mx-4 md:mx-12 lg:mx-16 my-6 sm:my-8 lg:my-12 rounded-full p-1.5 sm:p-2">
//                 <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
//                     {tabs.map((tab) => (
//                         <button
//                             key={tab.key}
//                             className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-sm sm:text-base text-black-100 font-light whitespace-nowrap border transition-all duration-300 relative hover:text-white hover:bg-primary-secondary-200 hover:bg-opacity-5 
//                                 ${activeTab === tab.key
//                                     ? 'text-primary-secondary-200 border-secondary-200 bg-secondary-200'
//                                     : 'text-white border-transparent hover:bg-secondary-200 hover:bg-opacity-5'
//                                 }`}
//                             onClick={() => setActiveTab(tab.key)}
//                         >
//                             {tab.label}
//                             {tab.key === 'mintedComics' && mintedNfts.length > 0 && (
//                                 <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
//                                     {mintedNfts.length}
//                                 </span>
//                             )}
//                         </button>
//                     ))}
//                 </div>  
//             </div>

//             {/* Content Section */}
//             <div className="px-2 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10 container bg-black-200 border rounded-2xl sm:rounded-3xl border-black-50 mx-2 sm:mx-4 md:mx-12 lg:mx-16 mb-6 sm:mb-8">
//                 <div className="mb-6 sm:mb-8">
//                     <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">
//                         {activeTab === 'currentReads' && `You currently have ${currentReads.length} comics`}
//                         {activeTab === 'mintedComics' && 'Your Minted Comics'}
//                         {activeTab === 'favoriteComics' && 'Your Favorite Comics'}
//                         {activeTab === 'listedComics' && 'Comics for Sale'}
//                     </h2>
//                 </div>

//                 <div>
//                     {renderComicsList()}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default UserProfile


'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MintComicCard } from '../components/cards/MintComicCard';
import ReadComicCard from '../components/cards/ReadComicCard';
import EmptyState from './states/EmptyState';
import { MainButton } from '@/components/button';
import { useAppSelector, useAppDispatch } from '@/redux/hook';
import { getUserProfile } from '@/redux/slices/authSlice';
import { useHederaWallet } from '@/providers/HashPackProvider';

const MIRROR_NODE = "https://testnet.mirrornode.hedera.com/api/v1";

const UserProfile = ({ onEditProfile, onComicAction }) => {

    const router = useRouter();
    const dispatch = useAppDispatch();

    const authUser = useAppSelector((state:any) => state.auth?.user?.data);
    const profileData = useAppSelector((state:any) => state.auth?.profile?.data);
    const { comics: comicsData } = useAppSelector((state:any) => state.comic);

    const userData = profileData?.user || profileData || authUser;

    const { account } = useHederaWallet();
    const { user: walletUser } = useAppSelector((state:any) => state.wallet);

    const userWalletAddress = account || walletUser?.walletAddress;

    const [activeTab, setActiveTab] = useState('currentReads');
    const [mintedNfts, setMintedNfts] = useState<any[]>([]);
    const [isLoadingNfts, setIsLoadingNfts] = useState(false);

    const [currentReads] = useState([]);

    useEffect(() => {
        if (authUser?._id) {
            dispatch(getUserProfile(authUser._id));
        }
    }, [authUser?._id]);

    useEffect(() => {
        if (activeTab === 'mintedComics' && userWalletAddress) {
            fetchUserComicNFTs();
        }
    }, [activeTab, userWalletAddress]);



    const fetchUserComicNFTs = async () => {

        if (!userWalletAddress) return;

        setIsLoadingNfts(true);

        try {

            const allComics = comicsData?.data?.comics?.data || [];

            // Build token index
            const comicIndex = new Map();

            allComics.forEach((comic:any) => {
                if (comic?.nftId?.tokenId) {
                    comicIndex.set(comic.nftId.tokenId, comic);
                }
            });

            const tokenIds = Array.from(comicIndex.keys());

            if (tokenIds.length === 0) {
                setMintedNfts([]);
                return;
            }

            // Query Mirror Node per token
            const nftResults = await Promise.all(

                tokenIds.map(async (tokenId) => {

                    try {

                        const res = await fetch(
                            `${MIRROR_NODE}/tokens/${tokenId}/nfts?account.id=${userWalletAddress}`
                        );

                        const data = await res.json();

                        return data?.nfts || [];

                    } catch (error) {
                        console.error("NFT query failed:", tokenId);
                        return [];
                    }

                })

            );

            const flattened = nftResults.flat();

            const mapped = flattened.map((nft:any) => {

                const comic = comicIndex.get(nft.token_id);

                return {

                    id: comic?._id,
                    nftId: `${nft.token_id}-${nft.serial_number}`,
                    title: comic?.title || "Unknown Comic",
                    image: comic?.bannerImage || "/dev_images/avatar-2.png",
                    tokenId: nft.token_id,
                    serialNumber: nft.serial_number,

                    creator:
                        comic?.creatorId?.displayName ||
                        comic?.creatorId?.username ||
                        "Creator",

                    creatorAvatar: comic?.creatorId?.avatar,

                    mintPrice: comic?.nftId?.price?.toFixed(2) || "0",
                    currentPrice: comic?.nftId?.price?.toFixed(2) || "0",

                    views: comic?.views?.toString() || "0",

                    number: nft.serial_number

                };

            });

            setMintedNfts(mapped);

        } catch (error) {

            console.error("NFT loading error", error);
            setMintedNfts([]);

        } finally {

            setIsLoadingNfts(false);

        }

    };



    const formatJoinDate = (dateString) => {

        if (!dateString) return "Unknown";

        const date = new Date(dateString);

        return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });

    };



    const user = {

        id: userData?._id || "",
        name: userData?.displayName || "User",
        displayName: userData?.username || "User",
        avatar: userData?.avatar || "/default-avatar.png",
        banner: userData?.banner || "/user-profile-bg.png",
        joinDate: formatJoinDate(userData?.createdAt),
        bio: userData?.bio || "",

        stats: {

            totalComics: mintedNfts.length,
            portfolioValue: 0,
            mintedComics: mintedNfts.length

        }

    };



    const tabs = [

        { key: "currentReads", label: "Current Reads" },
        { key: "mintedComics", label: "Minted Comics" },
        { key: "favoriteComics", label: "Favorite Comics" },
        { key: "listedComics", label: "Listed Comics" }

    ];



    const formatNumber = (value:any) => {
        return new Intl.NumberFormat("en-US").format(value);
    };



    const handleEmptyStateAction = (action:any) => {

        switch (action) {

            case "explore":
                router.push("/marketplace");
                break;

            case "browse":
                router.push("/marketplace?tab=all");
                break;

            case "mint":
                router.push("/create");
                break;

            case "list":
                router.push("/my-collection?action=list");
                break;

            default:
                router.push("/marketplace");

        }

    };



    const renderComicsList = () => {

        if (activeTab === "mintedComics") {

            if (isLoadingNfts) {

                return (

                    <div className="flex justify-center py-20">

                        <div className="text-center">

                            <div className="animate-spin h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4 rounded-full"></div>

                            <p className="text-white/60">
                                Loading your minted comics...
                            </p>

                        </div>

                    </div>

                );

            }

            if (!userWalletAddress || mintedNfts.length === 0) {

                return (
                    <EmptyState
                        type="mintedComics"
                        onAction={handleEmptyStateAction}
                    />
                );

            }

            return (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 justify-items-center">

                    {mintedNfts.map((nft,index)=>(

                        <div key={nft.nftId || index} className="relative">

                            <div className="absolute top-2 left-2 z-20 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                                ✓ Owned
                            </div>

                            <div className="absolute top-2 right-2 z-20 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
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
                            />

                        </div>

                    ))}

                </div>

            );

        }

        return (

            <EmptyState
                type={activeTab}
                onAction={handleEmptyStateAction}
            />

        );

    };



    return (

        <div className="min-h-screen bg-background-primary text-text-primary">

            <div className="px-6 py-8">

                <h1 className="text-3xl text-white mb-4">{user.name}</h1>

                <MainButton
                    onClick={()=>handleEmptyStateAction("browse")}
                >
                    Total Comics: {user.stats.totalComics}
                </MainButton>

            </div>

            <div className="px-6">

                <div className="flex gap-4 mb-8">

                    {tabs.map((tab)=>(
                        <button
                            key={tab.key}
                            onClick={()=>setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded ${
                                activeTab===tab.key
                                ? "bg-orange-500 text-white"
                                : "bg-black-200 text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                </div>

                {renderComicsList()}

            </div>

        </div>

    );

};

export default UserProfile;