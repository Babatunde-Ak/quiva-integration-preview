'use client';

import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {ArrowLeft, Check} from 'lucide-react';
import { MainButton } from '@/components/button';

type MintTypeOption = |'public' | 'whitelist' | 'wl-priority' | 'dutch-auction' | 'scheduled' | 'airdrop';

interface MintTypeProps {
    onBack : () => void;
    onNext : (mintType : MintTypeOption) => void;
    isLoading?: boolean;
}

const MintType : React.FC < MintTypeProps > = ({
    onBack,
    onNext,
    isLoading = false
}) => {
    const [selectedType,
        setSelectedType] = useState < MintTypeOption > ('public');

    const mintOptions = [
        {
            id: 'public' as MintTypeOption,
            title: 'Public Mint',
            description: 'Open to everyone. FCFS until supply runs out.',
            icon: '🌐'
        }, {
            id: 'whitelist' as MintTypeOption,
            title: 'Whitelist Only',
            description: 'Only approved wallets can mint.',
            icon: '✓'
        }, {
            id: 'wl-priority' as MintTypeOption,
            title: 'WL Priority',
            description: 'WL gets early access before public mint opens.',
            icon: '⭐'
        }, {
            id: 'dutch-auction' as MintTypeOption,
            title: 'Dutch Auction',
            description: 'Price decreases over time from a start price.',
            icon: '📉'
        }, {
            id: 'scheduled' as MintTypeOption,
            title: 'Scheduled Mint',
            description: 'Set a fixed start and end time.',
            icon: '📅'
        }, {
            id: 'airdrop' as MintTypeOption,
            title: 'Airdrop / Free Claim',
            description: 'Price = 0. Minting restricted to wallet addresses.',
            icon: '🎁'
        }
    ];

    const handleNext = () => {
        onNext(selectedType);
    };

    return (
        <div
            className="min-h-screen bg-black-100 text-white font-recursive flex items-center justify-center p-6">
            <div className="w-full max-w-4xl">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    <span className="text-sm">Go back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Choose Mint Type</h1>
                    <p className="text-white/50 text-sm">Select how collectors will mint this Drop.</p>
                </div>

                {/* Mint Type Selection */}
                <div className="mb-12">
                    <label className="block text-sm mb-6 text-white/70">Mint Type</label>

                    <div className="grid md:grid-cols-3 gap-4">
                        {mintOptions.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedType(option.id)}
                                className={` relative border rounded-xl p-6 text-left transition-all ${selectedType === option.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : 'border-black-50 bg-black-100 hover:border-white/20'} `}>
                                {/* Checkbox */}
                                <div
                                    className={` absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center ${selectedType === option.id
                                    ? 'border-primary-500 bg-primary-500'
                                    : 'border-white/30'} `}>
                                    {selectedType === option.id && (<Check className="w-3 h-3 text-white"/>)}
                                </div>

                                {/* Icon */}
                                {/* <div className="text-3xl mb-3">{option.icon}</div> */}

                                {/* Title */}
                                <h3 className="text-white font-semibold mb-2 pr-6 text-center">
                                    {option.title}
                                </h3>

                                {/* Description */}
                                <p className="text-white/50 text-sm leading-relaxed text-center">
                                    {option.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="bg-transparent border border-white text-white hover:bg-white/50 hover:text-white rounded-full h-14 font-medium text-base">
                        Back
                    </Button>
                    <MainButton
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        className="disabled:opacity-50 disabled:cursor-not-allowed ">
                        {isLoading
                            ? 'Processing...'
                            : 'Next'}
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default MintType;