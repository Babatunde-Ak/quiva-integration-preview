'use client';

import React from 'react';
import {ChevronLeft} from 'lucide-react';
import { MainButton } from '@/components/button';

interface ReviewDetailsProps {
    episodeData?: {
        title: string;
        image: string;
        rarity: {
            name: string;
            type: 'legendary' | 'epic' | 'common';
        };
        supply: string;
        price: string;
        royalty: string;
    };
    onBack?: () => void;
    onList?: () => void;
}

const ReviewDetails : React.FC < ReviewDetailsProps > = ({
    episodeData = {
        title: 'Galatin Ep 1',
        image: '/api/placeholder/200/200',
        rarity: {
            name: 'Legendary',
            type: 'legendary'
        },
        supply: '5,000',
        price: '12 HBAR',
        royalty: '5%'
    },
    onBack,
    onList
}) => {
    const getRarityColor = (type : string) => {
        switch (type) {
            case 'legendary':
                return 'text-yellow-400';
            case 'epic':
                return 'text-purple-400';
            case 'common':
                return 'text-gray-400';
            default:
                return 'text-gray-400';
        }
    };

    

    return (
        <div className="min-h-screen bg-black text-white font-recursive flex flex-col">
            {/* Header */}
            <div className="flex items-center p-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                    <ChevronLeft size={20}/>
                    <span className="font-medium">Go back</span>
                </button>
            </div>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col items-center justify-center px-6 pb-24 max-w-md mx-auto w-full">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Review Details
                    </h1>
                    <p className="text-white/50 text-base font-light">
                        Confirm all details before publishing to blockchain.
                    </p>
                </div>

                {/* Episode Preview */}
                <div className="w-full mb-8">
                    <div
                        className="relative p-6">
                        {/* Episode Image */}
                        <div
                            className="w-full aspect-square rounded-xl p-4 overflow-hidden mb-6 bg-black-100 border border-black-50">
                            <img
                                src={episodeData.image}
                                alt={episodeData.title}
                                className="w-full h-full object-cover"/>
                        </div>

                        {/* Episode Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/40text-sm mb-1">Episode & Rarity</p>
                                    <p className="text-white font-semibold">{episodeData.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40text-sm mb-1">Starfall — {episodeData.rarity.name}</p>
                                    <p className="text-white font-semibold">{episodeData.supply}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/40text-sm mb-1">Supply</p>
                                    <p className="text-white font-semibold">{episodeData.supply}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40text-sm mb-1">Price</p>
                                    <p className="text-white font-semibold">{episodeData.price}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/40text-sm mb-1">Price</p>
                                    <p className="text-white font-semibold">{episodeData.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40text-sm mb-1">Royalty</p>
                                    <p className="text-white font-semibold">{episodeData.royalty}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Notice */}
                <div className="w-full mb-8">
                    <div className="border border-black-50 rounded-xl p-4">
                        <p className="text-white text-sm font-medium mb-2">Please read this</p>
                        <p className="text-red-400/80 text-xs leading-relaxed">
                            ⚠️ You are about to List this Episode to the Quiva Marketplace. Once published on Hedera, this action cannot be undone.
                        </p>
                    </div>
                </div>

                
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-4xl  mx-auto flex justify-center gap-4">
                <button
                    onClick={onBack}
                    className="w-full flex-1 py-4 px-6 border-2 border-white/30 text-white rounded-full text-lg hover:border-white/80 hover:bg-white/5 transition-all duration-200">
                    Back
                </button>
                <MainButton
                    onClick={onList}
                    className="w-full flex-1 py-4 px-6 text-black rounded-full !text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25">
                    Next
                </MainButton>
            </div>
            
        </div>
    );
};

export default ReviewDetails;