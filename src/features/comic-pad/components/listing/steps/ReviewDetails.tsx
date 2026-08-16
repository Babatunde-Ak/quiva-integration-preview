'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { MainButton } from '@/components/button';
import { toast } from 'react-toastify';

interface ReviewDetailsProps {
    episodeData?: {
        title: string;
        image: string;
        rarity: {
            name: string;
            type: 'legendary' | 'epic' | 'common';
            supply?: string;
            maxSupply?: number;
        };
        supply: string;
        price: string;
        royalty?: string;
    };
    onBack?: () => void;
    onList?: () => void;
}

interface CheckboxState {
    irreversible: boolean;
    termsAccepted: boolean;
}

const ReviewDetails: React.FC<ReviewDetailsProps> = ({
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
    const [checkboxes, setCheckboxes] = useState<CheckboxState>({
        irreversible: false,
        termsAccepted: false
    });
    
    const [showValidation, setShowValidation] = useState(false);

    const getRarityColor = (type: string) => {
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

    const getRarityIcon = (type: string) => {
        switch (type) {
            case 'legendary':
                return '👑';
            case 'epic':
                return '🏆';
            case 'common':
                return '⚪';
            default:
                return '⚪';
        }
    };

    const formatSupply = (supply: string, rarity: any) => {
        // If it's common rarity and supply is a large number, show "Infinite"
        if (rarity?.type === 'common') {
            const numSupply = parseInt(supply);
            if (numSupply > 10000) {
                return 'Infinite';
            }
        }
        return supply;
    };

    const formatPrice = (price: string) => {
        // Ensure price has HBAR suffix
        if (!price.includes('HBAR')) {
            return `${price} HBAR`;
        }
        return price;
    };

    const handleCheckboxChange = (field: keyof CheckboxState, checked: boolean) => {
        setCheckboxes(prev => ({
            ...prev,
            [field]: checked
        }));

        // Clear validation if user is fixing the issue
        if (checked && showValidation) {
            setShowValidation(false);
        }
    };

    const isFormValid = () => {
        return checkboxes.irreversible && checkboxes.termsAccepted;
    };

    const handleList = () => {
        if (!isFormValid()) {
            setShowValidation(true);
            toast.error('Please accept both confirmations to proceed with minting');
            return;
        }

        toast.success('Confirmations complete! Proceeding to mint...');
        onList?.();
    };

    // Debug logging to see what data we're receiving
    useEffect(() => {
        console.log('ReviewDetails received episodeData:', episodeData);
    }, [episodeData]);

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
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 max-w-3xl mx-auto w-full">
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
                    <div className="relative p-6 bg-black-100 border border-black-50 rounded-xl">
                        {/* Episode Image */}
                        <div className="w-full aspect-video rounded-xl overflow-hidden mb-6 bg-black-200 border border-black-50">
                            <img
                                src={episodeData?.image || 'https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg'}
                                alt={episodeData.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                                }}
                            />
                        </div>

                        {/* Episode Details */}
                        <div className="space-y-6">
                            {/* Title and Rarity */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Episode Title</p>
                                    <p className="text-white font-medium">{episodeData.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm mb-1">Rarity</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-lg">{getRarityIcon(episodeData.rarity.type)}</span>
                                        <p className={`font-medium ${getRarityColor(episodeData.rarity.type)}`}>
                                            {episodeData.rarity.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-black-50"></div>

                            {/* Supply */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Total Supply</p>
                                    <p className="text-white font-medium">
                                        {formatSupply(episodeData.supply, episodeData.rarity)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm mb-1">Supply Type</p>
                                    <p className="text-white/80 font-light">
                                        {episodeData.rarity.type === 'common' ? 'Mass Distribution' :
                                         episodeData.rarity.type === 'epic' ? 'Limited Edition' : 
                                         'Ultra Rare'}
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-black-50"></div>

                            {/* Price */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Price per NFT</p>
                                    <p className="text-white font-medium text-lg">
                                        {formatPrice(episodeData.price)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm mb-1">Estimated Revenue</p>
                                    <p className="text-white/80 font-light">
                                        {(() => {
                                            const price = parseFloat(episodeData.price.replace(/[^0-9.]/g, ''));
                                            const supply = episodeData.rarity.type === 'common' && parseInt(episodeData.supply) > 10000 
                                                ? '∞' 
                                                : parseInt(episodeData.supply).toLocaleString();
                                            return supply === '∞' ? 'Variable' : `${(price * parseInt(episodeData.supply)).toLocaleString()} HBAR`;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* <div className="h-px bg-black-50"></div> */}

                            {/* Creator Royalty - Fixed at 5% */}
                            {/* <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm mb-1">Creator Royalty</p>
                                    <p className="text-white font-medium">5%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/60 text-sm mb-1">Per Resale</p>
                                    <p className="text-white/80 font-light">
                                        {(parseFloat(episodeData.price.replace(/[^0-9.]/g, '')) * 0.05).toFixed(2)} HBAR
                                    </p>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Warning Notice */}
                <div className="w-full mb-8">
                    <div className={`bg-black-100 border rounded-xl p-6 transition-colors ${
                        showValidation && !isFormValid() 
                            ? 'border-red-500 bg-red-500/5' 
                            : 'border-black-50'
                    }`}>
                        <div className="flex items-start gap-3 mb-4">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="text-white text-base font-semibold mb-2">Please read this</p>
                                <p className="text-red-400 text-sm leading-relaxed">
                                    You are about to List this Episode to the Quiva Marketplace. Once published on Hedera, this action cannot be undone.
                                </p>
                            </div>
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-4 mt-4 pl-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={checkboxes.irreversible}
                                    onChange={(e) => handleCheckboxChange('irreversible', e.target.checked)}
                                    className={`mt-0.5 w-4 h-4 rounded border cursor-pointer transition-colors ${
                                        showValidation && !checkboxes.irreversible
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-zinc-600 bg-transparent checked:bg-primary-500 checked:border-primary-500'
                                    }`}
                                />
                                <span className={`font-light text-sm transition-colors ${
                                    showValidation && !checkboxes.irreversible
                                        ? 'text-red-400'
                                        : 'text-white/70 group-hover:text-white/90'
                                }`}>
                                    I understand this action is irreversible
                                    {showValidation && !checkboxes.irreversible && <span className="text-red-500"> *</span>}
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={checkboxes.termsAccepted}
                                    onChange={(e) => handleCheckboxChange('termsAccepted', e.target.checked)}
                                    className={`mt-0.5 w-4 h-4 rounded border cursor-pointer transition-colors ${
                                        showValidation && !checkboxes.termsAccepted
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-zinc-600 bg-transparent checked:bg-primary-500 checked:border-primary-500'
                                    }`}
                                />
                                <span className={`font-light text-sm transition-colors ${
                                    showValidation && !checkboxes.termsAccepted
                                        ? 'text-red-400'
                                        : 'text-white/70 group-hover:text-white/90'
                                }`}>
                                    By clicking on &quot;Mint&quot; you agree to Quiva&apos;s{' '}
                                    <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer underline">
                                        terms of service
                                    </span>
                                    {showValidation && !checkboxes.termsAccepted && <span className="text-red-500"> *</span>}
                                </span>
                            </label>
                        </div>

                        {/* Validation Message */}
                        {showValidation && !isFormValid() && (
                            <div className="flex items-center gap-2 text-red-500 text-sm mt-4 pl-4">
                                <AlertCircle size={16} />
                                <span>Please accept both confirmations to proceed</span>
                            </div>
                        )}
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
                    onClick={handleList}
                    disabled={false} // Allow button to be clickable to show validation
                    className={`w-full flex-1 py-4 px-6 text-black rounded-full !text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25 ${
                        isFormValid() ? 'opacity-100' : 'opacity-90'
                    }`}>
                    Mint & List
                </MainButton>
            </div>
        </div>
    );
};

export default ReviewDetails;
