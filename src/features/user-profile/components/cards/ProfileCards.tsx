import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Picture from '@/components/picture/Index';
import { hbar } from '../../../../../public/dev_images';
import { Heart, Check } from 'lucide-react';

// Responsive CurrentReadCard for current reads
export const CurrentReadCard = ({
    title,
    description,
    creator,
    creatorAvatar,
    coverImage,
    progress = 20,
    genres = [],
    onContinueReading = () => {},
    className = ""
}) => {
    return (
        <div className={`p-3 sm:p-4 lg:p-6 group relative flex flex-col lg:flex-row bg-black-500 border-2 border-black-50 rounded-2xl lg:rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 ${className}`}>
            {/* Cover Image */}
            <div className="relative w-full lg:w-64 h-48 sm:h-56 lg:h-auto flex-shrink-0 mb-4 lg:mb-0">
                <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover rounded-lg lg:rounded-none transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Genres - Mobile overlay */}
                <div className="absolute top-2 left-2 lg:hidden">
                    <div className="flex flex-wrap gap-1">
                        {genres.slice(0, 2).map((genre, index) => (
                            <span
                                key={index}
                                className="text-white text-[10px] font-light px-2 py-1 rounded bg-black-200/80 backdrop-blur-sm border border-black-50"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 lg:p-6 flex flex-col">
                <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center mb-3 lg:mb-0'>
                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3 leading-tight">
                        {title}
                    </h3>

                    {/* Genres - Desktop */}
                    <div className="hidden lg:flex flex-wrap gap-2 mb-4">
                        {genres.map((genre, index) => (
                            <span
                                key={index}
                                className="text-white text-xs font-light px-3 py-1 rounded-md bg-black-200 backdrop-blur-sm border border-black-50"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-500 mb-3 lg:mb-4 leading-relaxed line-clamp-2 lg:line-clamp-none">
                    {description}
                </p>

                {/* Creator Info */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 lg:mb-4">
                    <img
                        src={creatorAvatar}
                        alt={creator}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md border border-black-50"
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] sm:text-xs text-white tracking-wide font-light">
                            Creator
                        </span>
                        <span className="text-xs sm:text-sm text-white font-bold">
                            {creator}
                        </span>
                    </div>
                </div>

                {/* Spacer to push progress and button to bottom */}
                <div className="flex-1" />

                {/* Progress Bar */}
                <div className="mb-3 lg:mb-4">
                    <div className="flex justify-between items-center mb-2 gap-2 sm:gap-4">
                        <div className="w-full h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary-200 hover:bg-primary-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">{progress}%</span>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-full sm:w-fit bg-secondary-200 hover:bg-primary-500 font-normal text-black-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    onClick={onContinueReading}
                >
                    <span>Continue Reading</span>
                </button>
            </div>
        </div>
    );
};

// Responsive Minted Comics Card
export const MintedComicCard = ({ 
    id,
    title, 
    creator = "Creator",
    creatorAvatar,
    mintPrice = "1,000",
    views = "4.89K",
    image, 
    number = 1,
    onCardClick
}) => {
    const router = useRouter();

    return (
        <motion.div 
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCardClick?.(id)}
        >
            {/* Image Container */}
            <div className="relative">
                <motion.img 
                    src={image} 
                    alt={title}
                    className="w-full h-[160px] sm:h-[180px] lg:h-[200px] object-cover rounded-lg"
                />
            </div>

            {/* Content Section */}
            <div className="pt-3 sm:pt-4">
                {/* Title Row */}
                <div className='flex justify-between items-center mb-2 sm:mb-3'>
                    <h3 className="text-white text-sm sm:text-base lg:text-lg font-medium truncate flex-1 mr-2 sm:mr-3">
                        {title}
                    </h3>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
                        <span className="text-black-200 text-xs sm:text-sm font-semibold">{number}</span>
                    </div>
                </div>

                {/* Creator and Stats Row */}
                <div className='flex justify-between items-center'>
                    {/* Creator Section */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mr-2 sm:mr-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/50 text-[8px] sm:text-[10px]">Creator</p>
                            <p className="text-white text-[10px] sm:text-xs truncate leading-tight">{creator}</p>
                        </div>
                    </div>

                    {/* Mint Price */}
                    <div className='flex flex-col items-center flex-shrink-0'>
                        <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                            <span className="hidden sm:inline">Mint Price</span>
                            <span className="sm:hidden">MP</span>
                        </span>
                        <div className="flex items-center gap-0.5 mt-0.5">
                            <span className="text-[9px] sm:text-[10px]">{mintPrice}</span>
                            <Picture src={hbar} alt="HBAR" className="w-2 h-2 sm:w-3 sm:h-3"/>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Responsive Favorite Comics Card (with heart)
export const FavoriteComicCard = ({ 
    id,
    title, 
    creator = "Creator",
    creatorAvatar,
    views = "4.89K",
    image, 
    number = 1,
    isLiked = true,
    onCardClick,
    onToggleFavorite
}) => {
    const [liked, setLiked] = useState(isLiked);

    const handleLike = (e) => {
        e.stopPropagation();
        setLiked(!liked);
        onToggleFavorite?.(id, !liked);
    };

    return (
        <motion.div 
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
            onClick={() => onCardClick?.(id)}
        >
            {/* Image Container with Heart */}
            <div className="relative">
                <motion.img 
                    src={image} 
                    alt={title}
                    className="w-full h-[160px] sm:h-[180px] lg:h-[200px] object-cover rounded-lg"
                />
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                    <button
                        onClick={handleLike}
                        className="p-0.5 sm:p-1 bg-primary-400 rounded-sm transition-colors"
                    >
                        <Heart size={10} className="sm:w-3 sm:h-3" fill={liked ? 'black' : 'none'} stroke='black' />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="pt-3 sm:pt-4">
                <div className='flex justify-between items-center mb-2 sm:mb-3'>
                    <h3 className="text-white text-sm sm:text-base lg:text-lg font-medium truncate flex-1 mr-2 sm:mr-3">{title}</h3>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
                        <span className="text-black-200 text-xs sm:text-sm font-semibold">{number}</span>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mr-2 sm:mr-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/50 text-[8px] sm:text-[10px]">Creator</p>
                            <p className="text-white text-[10px] sm:text-xs truncate leading-tight">{creator}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Responsive Listed Comics Card (with status)
export const ListedComicCard = ({ 
    id,
    title, 
    creator = "Creator",
    creatorAvatar,
    listingPrice = "2,500",
    image, 
    number = 1,
    isListed = true,
    listingId,
    bannerImage,
    onCardClick
}) => {
    const router = useRouter();

    const handleCardClick = () => {
        if (listingId) {
            // Navigate to chapter page with comics tab to show direct listing
            router.push(`/marketplace/chapter?id=${id}&tab=comics`);
        } else if (onCardClick) {
            onCardClick(id);
        }
    };

    return (
        <motion.div 
            className="w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
            onClick={handleCardClick}
        >
            {/* Image Container */}
            <div className="relative">
                <motion.img 
                    src={image} 
                    alt={title}
                    className="w-full h-[160px] sm:h-[180px] lg:h-[200px] object-cover rounded-lg"
                />
            </div>

            {/* Content Section */}
            <div className="pt-3 sm:pt-4">
                <div className='flex justify-between items-center mb-2 sm:mb-3'>
                    <h3 className="text-white text-sm sm:text-base lg:text-lg font-medium truncate flex-1 mr-2 sm:mr-3">{title}</h3>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black] flex-shrink-0">
                        <span className="text-black-200 text-xs sm:text-sm font-semibold">{number}</span>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 mr-2 sm:mr-4">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white/50 text-[8px] sm:text-[10px]">Creator</p>
                            <p className="text-white text-[10px] sm:text-xs truncate leading-tight">{creator}</p>
                        </div>
                    </div>

                    {/* Right side - Price and Status */}
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-white flex-shrink-0">
                        <div className='flex flex-col items-center'>
                            <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                                <span className="hidden sm:inline">Listing Price</span>
                                <span className="sm:hidden">LP</span>
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <span className="text-[9px] sm:text-[10px]">{listingPrice}</span>
                                <Picture src={hbar} alt="HBAR" className="w-2 h-2 sm:w-3 sm:h-3"/>
                            </div>
                        </div>

                        <div className='flex flex-col items-center'>
                            <span className="text-white text-[8px] sm:text-xs font-light leading-tight">
                                <span className="hidden sm:inline">Status</span>
                                <span className="sm:hidden">S</span>
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5 bg-black-200 border border-black-50 px-1 sm:px-2 py-0.5 rounded-md">
                                <span className="text-[8px] sm:text-[10px]">Listed</span>
                                <Check className="w-2 h-2 sm:w-3 sm:h-3 text-green-500"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};