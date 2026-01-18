'use client';

import { MainButton } from '@/components/button';
import React from 'react';

interface DropSuccessModalProps {
    episodeTitle?: string;
    onBackToCollection?: () => void;
    onViewListing?: () => void;
    isOpen?: boolean;
}

const DropSuccessModal: React.FC<DropSuccessModalProps> = ({
    episodeTitle = "Galatin Ep 1",
    onBackToCollection,
    onViewListing,
    isOpen = true
}) => {
    if (!isOpen) 
        return null;
    
    return (
        <div className=" flex items-center justify-center bg-black-100 backdrop-blur-sm">
            <div className="relative max-w-md mx-auto w-full">
                {/* Modal Content */}
                <div className="bg-black rounded-2xl p-8 text-center">
                    {/* Party Popper Emoji */}
                    <div className="text-6xl mb-6 animate-bounce">
                        🎉
                    </div>

                    {/* Title */}
                    <h1 className="text-xl font-bold text-white mb-3 font-recursive">
                        Drop Published Successfully
                    </h1>

                    {/* Description */}
                    <p className="text-white/40 text-sm leading-relaxed mb-8 font-recursive px-2">
                        Your episode has been successfully published to the Hedera blockchain. Users can now mint, trade, and engage with your new episode in real time.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* Primary Action */}
                        <MainButton
                            onClick={onViewListing}
                            className="w-full">
                            View Drop
                        </MainButton>

                        {/* Secondary Action */}
                        <button
                            onClick={onBackToCollection}
                            className="w-full py-4 px-6 border border-white/30 text-white rounded-full font-semibold text-sm hover:border-white/50 hover:bg-white/5 transition-all duration-200 font-recursive">
                            Back to collection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DropSuccessModal;