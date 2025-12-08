import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Picture from '@/components/picture/Index';
import { hbar } from '../../../../../public/dev_images';
import { Heart, Check } from 'lucide-react';

// Compact version of ReadComicCard for current reads
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
        <div className={`p-6 group relative flex bg-black-500 border-2 border-black-50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 ${className}`}>
            {/* Cover Image - Left Side */}
            <div className="relative w-64 flex-shrink-0">
                <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 p-6 flex flex-col">
                <div className='flex justify-between items-center'>
                    {/* Title */}
                    <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                        {title}
                    </h3>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
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
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                    {description}
                </p>

                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={creatorAvatar}
                        alt={creator}
                        className="w-8 h-8 rounded-md border border-black-50"
                    />
                    <div className="flex flex-col">
                        <span className="text-xs text-white tracking-wide font-light">
                            Creator
                        </span>
                        <span className="text-sm text-white font-bold">
                            {creator}
                        </span>
                    </div>
                </div>

                {/* Spacer to push progress and button to bottom */}
                <div className="flex-1" />

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2 gap-4">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary-200 hover:bg-primary-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-sm font-bold text-white">{progress}%</span>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-fit bg-secondary-200 hover:bg-primary-500 font-normal text-black-200 px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/50 flex items-center justify-center gap-2"
                    onClick={onContinueReading}
                >
                    <span>Continue Reading</span>
                </button>
            </div>
        </div>
    );
};

// Minted Comics Card
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
            className="w-full max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
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
                    className="w-full h-[200px] object-cover rounded-lg"
                />
            </div>

            {/* Content Section */}
            <div className="pt-4">
                {/* Title Row */}
                <div className='flex justify-between items-center mb-3'>
                    <h3 className="text-white text-lg font-medium truncate flex-1 mr-3">
                        {title}
                    </h3>
                    <div className="w-7 h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black]">
                        <span className="text-black-200 text-sm font-semibold">{number}</span>
                    </div>
                </div>

                {/* Creator and Stats Row */}
                <div className='flex justify-between items-center'>
                    {/* Creator Section */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                        <div className="w-8 h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px]">Creator</p>
                            <p className="text-white text-xs truncate">{creator}</p>
                        </div>
                    </div>

                    {/* Mint Price */}
                    <div className='flex flex-col items-center'>
                        <span className="text-white text-xs font-light">Mint Price</span>
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px]">{mintPrice}</span>
                            <Picture src={hbar} alt="HBAR" className="w-3 h-3"/>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Favorite Comics Card (with heart)
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
            className="w-full max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
            onClick={() => onCardClick?.(id)}
        >
            {/* Image Container with Heart */}
            <div className="relative">
                <motion.img 
                    src={image} 
                    alt={title}
                    className="w-full h-[200px] object-cover rounded-lg"
                />
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={handleLike}
                        className="p-1 bg-primary-400 rounded-sm transition-colors"
                    >
                        <Heart size={12} fill={liked ? 'black' : 'none'} stroke='black' />
                    </button>
                </div>
            </div>

            {/* Content Section - Same as MintedComicCard */}
            <div className="pt-4">
                <div className='flex justify-between items-center mb-3'>
                    <h3 className="text-white text-lg font-medium truncate flex-1 mr-3">{title}</h3>
                    <div className="w-7 h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black]">
                        <span className="text-black-200 text-sm font-semibold">{number}</span>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                        <div className="w-8 h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px]">Creator</p>
                            <p className="text-white text-xs truncate">{creator}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Listed Comics Card (with status)
export const ListedComicCard = ({ 
    id,
    title, 
    creator = "Creator",
    creatorAvatar,
    listingPrice = "2,500",
    image, 
    number = 1,
    isListed = true,
    onCardClick
}) => {
    return (
        <motion.div 
            className="w-full max-w-[360px] bg-black-200 rounded-xl overflow-hidden cursor-pointer p-3 sm:p-4 border-[2px] border-black-50 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all duration-200 mx-auto"
            onClick={() => onCardClick?.(id)}
        >
            {/* Image Container */}
            <div className="relative">
                <motion.img 
                    src={image} 
                    alt={title}
                    className="w-full h-[200px] object-cover rounded-lg"
                />
            </div>

            {/* Content Section */}
            <div className="pt-4">
                <div className='flex justify-between items-center mb-3'>
                    <h3 className="text-white text-lg font-medium truncate flex-1 mr-3">{title}</h3>
                    <div className="w-7 h-7 bg-secondary-200 rounded-md flex items-center justify-center border border-black-200 shadow-[1px_1px_0_0_black]">
                        <span className="text-black-200 text-sm font-semibold">{number}</span>
                    </div>
                </div>

                <div className='flex justify-between items-center'>
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                        <div className="w-8 h-8 bg-black-100/50 rounded flex items-center justify-center overflow-hidden">
                            {creatorAvatar ? (
                                <img src={creatorAvatar} alt="Creator" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white text-xs font-bold">{creator.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-white/50 text-[10px]">Creator</p>
                            <p className="text-white text-xs truncate">{creator}</p>
                        </div>
                    </div>

                    {/* Right side - Price and Status */}
                    <div className="flex items-center gap-3 text-xs text-white">
                        <div className='flex flex-col items-center'>
                            <span className="text-white text-xs font-light">Listing Price</span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px]">{listingPrice}</span>
                                <Picture src={hbar} alt="HBAR" className="w-3 h-3"/>
                            </div>
                        </div>

                        <div className='flex flex-col items-center'>
                            <span className="text-white text-xs font-light">Status</span>
                            <div className="flex items-center gap-1 mt-1 bg-black-200 border border-black-50 px-2 py-1 rounded-md">
                                <span className="text-[10px]">Listed</span>
                                <Check className="w-3 h-3 text-green-500"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};