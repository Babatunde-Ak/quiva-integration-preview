'use client';

import React from 'react';
import {Rocket, Sparkles} from 'lucide-react';

interface ListingSuccessModalProps {
    episodeTitle?: string;
     nftInfo?: {
        tokenId: string;
        serialNumber: number;
        transactionId: string;
    };
    onBackToCollection?: () => void;
    onViewListing?: () => void;
    isOpen?: boolean;
}

const ListingSuccessModal : React.FC < ListingSuccessModalProps > = ({
    episodeTitle = "Galatin Ep 1",
    onBackToCollection,
    onViewListing,
     nftInfo,
    isOpen = true
}) => {
    if (!isOpen) 
        return null;
    
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative max-w-md mx-4 w-full">
                {/* Modal Content */}
                <div
                    className="bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 text-center shadow-2xl">
                    {/* Success Icon */}
                    <div className="relative mb-8">
                        {/* Animated Background Sparkles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div
                                className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500/20 to-yellow-500/20 animate-pulse"></div>
                        </div>

                        {/* Rocket Icon with Animation */}
                        <div
                            className="relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-yellow-500 transform rotate-45 animate-bounce">
                            <Rocket className="w-8 h-8 text-white transform -rotate-45"/>
                        </div>

                        {/* Floating Sparkles */}
                        <div className="absolute -top-2 -right-2 animate-ping">
                            <Sparkles className="w-4 h-4 text-yellow-400"/>
                        </div>
                        <div className="absolute -bottom-1 -left-1 animate-pulse">
                            <Sparkles className="w-3 h-3 text-primary-400"/>
                        </div>
                        <div className="absolute top-1 left-8 animate-bounce delay-300">
                            <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
                        </div>
                        <div className="absolute bottom-2 right-6 animate-bounce delay-500">
                            <div className="w-1 h-1 rounded-full bg-primary-400"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white mb-4 font-recursive">
                        Episode Successfully minted
                    </h1>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-8 font-recursive">
                        Your episode has been successfully published to the Hedera blockchain. Users can
                        now mint your episode to read them.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        {/* Primary Action */}
                        <button
                            onClick={onViewListing}
                            className="w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-yellow-500 text-black rounded-full font-semibold text-lg hover:from-primary-400 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25 font-recursive">
                            View Listing
                        </button>

                        {/* Secondary Action */}
                        <button
                            onClick={onBackToCollection}
                            className="w-full py-4 px-6 border-2 border-white/20 text-white rounded-full font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200 font-recursive">
                            Back to collection
                        </button>
                    </div>
                </div>

                {/* Animated Background Glow */}
                <div
                    className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary-500/10 to-yellow-500/10 blur-xl transform scale-110 animate-pulse -z-10"></div>
            </div>
        </div>
    );
};

export default ListingSuccessModal;