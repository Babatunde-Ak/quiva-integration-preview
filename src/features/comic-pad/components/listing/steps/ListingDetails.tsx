'use client';

import React, {useState} from 'react';
import {ChevronLeft, Crown} from 'lucide-react';

interface ListingDetailsProps {
    selectedRarity?: {
        name: string;
        type: 'legendary' | 'epic' | 'common';
        supply: string;
    };
    onBack?: () => void;
    onNext?: (data : ListingDetailsData) => void;
}

interface ListingDetailsData {
    sales : string;
    price : string;
    royalty : string;
}

const ListingDetails : React.FC < ListingDetailsProps > = ({
    selectedRarity = {
        name: 'Legendary',
        type: 'legendary',
        supply: 'Supply 1 — 5,000'
    },
    onBack,
    onNext
}) => {
    const [formData,
        setFormData] = useState < ListingDetailsData > ({sales: '', price: '', royalty: ''});

    const handleInputChange = (field : keyof ListingDetailsData, value : string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = () => {
        onNext
            ?.(formData);
    };

    const isValid = formData.sales && formData.price && formData.royalty;

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
                        Listing Details
                    </h1>
                    <p className="text-gray-400 text-base font-light">
                        Set the pricing parameters for this episode.
                    </p>
                </div>

                {/* Selected Rarity Display */}
                <div className="w-full mb-8">
                    <div
                        className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
                            <Crown className="w-5 h-5 text-yellow-500"/>
                        </div>
                        <div>
                            <p className="text-yellow-400 font-semibold">{selectedRarity.name}</p>
                            <p className="text-gray-400 text-sm">{selectedRarity.supply}</p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-6">
                    {/* Sales */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Sales
                        </label>
                        <input
                            type="text"
                            placeholder="Set maximum sales count e.g., 100"
                            value={formData.sales}
                            onChange={(e) => handleInputChange('sales', e.target.value)}
                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900/70 transition-all duration-200"/>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Price (HBAR)
                        </label>
                        <input
                            type="text"
                            placeholder="Enter price per NFT e.g., 10"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900/70 transition-all duration-200"/>
                    </div>

                    {/* Royalty */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            Royalty (%)
                        </label>
                        <input
                            type="text"
                            placeholder="Set percentage you receive e.g., 10%"
                            value={formData.royalty}
                            onChange={(e) => handleInputChange('royalty', e.target.value)}
                            className="w-full px-4 py-4 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900/70 transition-all duration-200"/>
                    </div>
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
                        onClick={handleNext}
                        disabled={!isValid}
                        className="flex-1 py-4 px-6 bg-primary-500 text-black rounded-full font-semibold text-lg hover:bg-primary-400 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingDetails;