'use client';

import React, { useState } from 'react';
import { ChevronLeft, Crown } from 'lucide-react';
import { MainButton } from '@/components/button';

interface ListingDetailsProps {
    selectedRarity?: {
        name: string;
        type: 'legendary' | 'epic' | 'common';
        supply: string;
        icon: React.ReactNode;
    };
    onBack?: () => void;
    onNext?: (data: ListingDetailsData) => void;
}

interface ListingDetailsData {
    supply: string;
    price: string;
    royalty: string;
}

const DEFAULT_ROYALTY = '5';

const ListingDetails: React.FC<ListingDetailsProps> = ({
    selectedRarity = {
        name: 'Legendary',
        type: 'legendary',
        supply: 'Supply 1 — 5,000',
        icon: <Crown size={24} className="text-yellow-500" />
    },
    onBack,
    onNext
}) => {
    const [formData, setFormData] = useState<ListingDetailsData>({
        supply: '',
        price: '',
        royalty: DEFAULT_ROYALTY
    });

    const handleInputChange = (field: keyof ListingDetailsData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        onNext?.({
            ...formData,
            royalty: DEFAULT_ROYALTY // Ensure royalty is always 5%
        });
    };

    const isValid = formData.supply && formData.price;

    return (
        <div className="min-h-screen bg-black text-white font-recursive flex flex-col">
            {/* Header */}
            <div className="flex items-center p-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                    <span className="font-medium">Go back</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 max-w-md mx-auto w-full">
                {/* Title Section */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Listing Details
                    </h1>
                    <p className="text-white/50 text-base font-light">
                        Set the pricing parameters for this episode.
                    </p>
                </div>

                {/* Selected Rarity Display */}
                <div className="w-full mb-8">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                                selectedRarity.type === 'legendary'
                                    ? 'bg-yellow-500/20'
                                    : selectedRarity.type === 'epic'
                                    ? 'bg-purple-500/20'
                                    : 'bg-gray-500/20'
                            }`}>
                            {selectedRarity.icon}
                        </div>
                        <div>
                            <p className="text-white font-semibold">{selectedRarity.name}</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-6">
                    {/* Supply */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Total Supply
                        </label>
                        <input
                            type="text"
                            placeholder="Enter total supply (e.g., 5000)"
                            value={formData.supply}
                            onChange={(e) => handleInputChange('supply', e.target.value)}
                            className="w-full px-4 py-4 bg-black-100 border border-black-50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-black-100 transition-all duration-200"
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Price (HBAR)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter price per NFT (e.g., 10)"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full px-4 py-4 bg-black-100 border border-black-50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-black-100 transition-all duration-200"
                        />
                    </div>

                    {/* Royalty Info (Read-only display) */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Royalty
                        </label>
                        <div className="w-full px-4 py-4 bg-black-100 border border-black-50 rounded-xl text-white/70">
                            {DEFAULT_ROYALTY}% (Default)
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-4xl mx-auto flex justify-center gap-4 px-6 pb-6">
                <button
                    onClick={onBack}
                    className="w-full flex-1 py-4 px-6 border-2 border-white/30 text-white rounded-full text-lg hover:border-white/80 hover:bg-white/5 transition-all duration-200">
                    Back
                </button>
                <MainButton
                    onClick={handleNext}
                    disabled={!isValid}
                    className="w-full flex-1 py-4 px-6 text-black rounded-full !text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    Next
                </MainButton>
            </div>
        </div>
    );
};

export default ListingDetails;