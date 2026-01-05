'use client';

import React from 'react';
import {ChevronLeft} from 'lucide-react';

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
                    <p className="text-gray-400 text-base font-light">
                        Confirm all details before publishing to blockchain.
                    </p>
                </div>

                {/* Episode Preview */}
                <div className="w-full mb-8">
                    <div
                        className="relative bg-gray-900/30 rounded-2xl p-6 border border-gray-700/30">
                        {/* Episode Image */}
                        <div
                            className="w-full aspect-square rounded-xl overflow-hidden mb-6 bg-gray-800">
                            <img
                                src={episodeData.image}
                                alt={episodeData.title}
                                className="w-full h-full object-cover"/>
                        </div>

                        {/* Episode Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Episode & Rarity</p>
                                    <p className="text-white font-semibold">{episodeData.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm mb-1">Starfall — {episodeData.rarity.name}</p>
                                    <p className="text-white font-semibold">{episodeData.supply}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Supply</p>
                                    <p className="text-white font-semibold">{episodeData.supply}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm mb-1">Price</p>
                                    <p className="text-white font-semibold">{episodeData.price}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Price</p>
                                    <p className="text-white font-semibold">{episodeData.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 text-sm mb-1">Royalty</p>
                                    <p className="text-white font-semibold">{episodeData.royalty}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Notice */}
                <div className="w-full mb-8">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400 text-sm font-medium mb-2">Please note this</p>
                        <p className="text-red-400/80 text-xs leading-relaxed">
                            After you proceed with this listing minting, you acknowledge that all details
                            cannot be changed.
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="w-full text-center">
                    <p className="text-gray-500 text-xs mb-1">Estimated Gas Fee</p>
                    <p className="text-gray-400 text-sm">~0.5 HBAR</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div
                className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent">
                <div className="max-w-md mx-auto flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 py-4 px-6 border-2 border-white/20 text-white rounded-full font-semibold text-lg hover:border-white/40 hover:bg-white/5 transition-all duration-200">
                        Back
                    </button>
                    <button
                        onClick={onList}
                        className="flex-1 py-4 px-6 bg-primary-500 text-black rounded-full font-semibold text-lg hover:bg-primary-400 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25">
                        List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails;