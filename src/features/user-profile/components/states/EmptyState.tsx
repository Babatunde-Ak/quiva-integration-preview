import React from 'react';
import {MainButton} from '@/components/button';

const EmptyState = ({
    type = 'currentReads',
    onAction
}) => {
    const getEmptyStateConfig = () => {
        switch (type) {
            case 'currentReads':
                return {
                    title: "Nothing to read yet",
                    description: "You have not started any comic. Pick one and dive into your next story adventure" +
                            ".",
                    buttonText: "Explore Comics",
                    action: () => onAction
                        ?.('explore')
                };
            case 'favoriteComics':
                return {
                    title: "Your shelf looks empty",
                    description: "You haven't favorited any comic yet",
                    buttonText: "Browse Collection",
                    action: () => onAction
                        ?.('browse')
                };
            case 'mintedComics':
                return {
                    title: "No minted comic yet",
                    description: "Once you mint a comic, it'll show up here. Own your first digital collectible an" +
                            "d start building your library",
                    buttonText: "Mint your first comic",
                    action: () => onAction
                        ?.('mint')
                };
            case 'listedComics':
                return {
                    title: "No comics listed yet",
                    description: "List your comics for sale and start earning from your collection",
                    buttonText: "List a comic",
                    action: () => onAction
                        ?.('list')
                };
            default:
                return {
                    title: "Nothing here yet",
                    description: "Start exploring and building your collection!",
                    buttonText: "Get Started",
                    action: () => onAction
                        ?.('explore')
                };
        }
    };

    const config = getEmptyStateConfig();

    return (
        <div
            className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 text-center">
            {/* Book Icon */}
            <div
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-4 sm:mb-6 opacity-70">
                <svg viewBox="0 0 64 64" className="w-full h-full text-white" fill="none">
                    {/* Open Book Icon */}
                    <path
                        d="M8 12H24C28.4183 12 32 15.5817 32 20V52C32 48.6863 29.3137 46 26 46H8V12Z"
                        fill="currentColor"
                        opacity="0.6"/>
                    <path
                        d="M56 12H40C35.5817 12 32 15.5817 32 20V52C32 48.6863 34.6863 46 38 46H56V12Z"
                        fill="currentColor"
                        opacity="0.6"/>
                    <path
                        d="M8 12H24C28.4183 12 32 15.5817 32 20V52C32 48.6863 29.3137 46 26 46H8V12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"/>
                    <path
                        d="M56 12H40C35.5817 12 32 15.5817 32 20V52C32 48.6863 34.6863 46 38 46H56V12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"/> {/* Bookmark */}
                    <path
                        d="M32 8V24L36 20L40 24V8"
                        stroke="#E9872B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="#E9872B"/>
                </svg>
            </div>

            {/* Title */}
            <h3
                className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 sm:mb-3 font-recursive">
                {config.title}
            </h3>

            {/* Description */}
            <p
                className="text-white/70 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-md lg:max-w-lg mb-6 sm:mb-8 font-inter">
                {config.description}
            </p>

            {/* Action Button */}
            <MainButton
                onClick={config.action}
                className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto max-w-xs">
                {config.buttonText}
            </MainButton>
        </div>
    );
};

export default EmptyState;