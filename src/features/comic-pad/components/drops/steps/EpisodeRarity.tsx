'use client';

import React, {useState} from 'react';
import {ChevronLeft, Crown, Circle, Infinity} from 'lucide-react';
import { MainButton } from '@/components/button';
import { crownIcon, sportsMedal } from '../../../../../../public/dev_images';
import Image from 'next/image';

interface RarityOption {
    id : 'legendary' | 'epic' | 'common';
    name : string;
    icon : React.ReactNode;
    supply : string;
    color : string;
    bgColor : string;
    borderColor : string;
    iconColor : string;
}

interface EpisodeRarityProps {
    episodeTitle?: string;
    onBack?: () => void;
    onCancel?: () => void;
    onContinue?: (selectedRarity : string) => void;
}

const EpisodeRarity : React.FC < EpisodeRarityProps > = ({
    episodeTitle = "Galatin Ep 1",
    onBack,
    onCancel,
    onContinue
}) => {
    const [selectedRarity,
        setSelectedRarity] = useState < string > ('legendary');

    const rarityOptions : RarityOption[] = [
        {
            id: 'legendary',
            name: 'Legendary',
            icon: <Image src={crownIcon} alt="legendary" className="w-8 h-8 object-cover"/>,
            supply: 'Supply 1 — 5,000',
            color: 'text-yellow-400',
            bgColor: 'bg-gradient-to-b from-yellow-500/20 to-yellow-600/10',
            borderColor: 'border-yellow-500/30',
            iconColor: 'text-yellow-500'
        }, {
            id: 'epic',
            name: 'Epic',
            icon: <Image src={sportsMedal} alt="legendary" className="w-8 h-8 object-cover"/>,
            supply: 'Supply 1 — 8,000',
            color: 'text-purple-400',
            bgColor: 'bg-gradient-to-b from-purple-500/20 to-purple-600/10',
            borderColor: 'border-purple-500/30',
            iconColor: 'text-purple-500'
        }, {
            id: 'common',
            name: 'Common',
            icon: <Image src={sportsMedal} alt="legendary" className="w-8 h-8 object-cover"/>,
            supply: 'Infinite',
            color: 'text-white/80',
            bgColor: 'bg-gradient-to-b from-gray-500/20 to-gray-600/10',
            borderColor: 'border-gray-500/30',
            iconColor: 'text-gray-500'
        }
    ];

    const handleRaritySelect = (rarityId : string) => {
        setSelectedRarity(rarityId);
    };

    const handleContinue = () => {
        onContinue(selectedRarity);
    };

    return (
        <div className="min-h-screen bg-black-100 text-white font-recursive flex flex-col">
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
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
                {/* Title Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {episodeTitle}
                    </h1>
                    <p className="text-white/50 text-lg font-light max-w-md">
                        Carefully choose the Rarity details for this episode.
                    </p>
                </div>

                {/* Rarity Type Section */}
                <div className="w-full max-w-4xl mb-12">
                    <h2 className="text-white text-xl mb-4">
                        Rarity Type
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {rarityOptions.map((option) => (
                            <div
                                key={option.id}
                                onClick={() => handleRaritySelect(option.id)}
                                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${selectedRarity === option.id
                                ? 'transform scale-105'
                                : ''}`}>
                                {/* Selection Checkbox */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div
                                        className={`w-6 h-6 rounded border-2 transition-all duration-200 ${selectedRarity === option.id
                                        ? 'bg-primary-500 border-primary-500'
                                        : 'border-gray-500 bg-transparent'}`}>
                                        {selectedRarity === option.id && (
                                            <svg
                                                className="w-full h-full text-black-100"
                                                viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"/>
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Card */}
                                <div
                                    className={` relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${selectedRarity === option.id
                                    ? `${option.borderColor} ${option.bgColor}`
                                    : 'border-black-50 bg-black-100'} hover:border-black-50/70 backdrop-blur-sm `}>
                                    <div className="p-8 text-center">
                                        {/* Icon */}
                                        <div
                                            className={` inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 ${selectedRarity === option.id
                                            ? `${option.bgColor} ${option.iconColor}`
                                            : 'bg-black-50 text-gray-500'} `}>
                                            {option.icon}
                                        </div>

                                        {/* Title */}
                                        <h3
                                            className={` text-xl font-bold mb-2 transition-colors duration-300 ${selectedRarity === option.id
                                            ? option.color
                                            : 'text-white/80'} `}>
                                            {option.name}
                                        </h3>

                                        {/* Supply */}
                                        <p className="text-gray-500 text-sm">
                                            {option.supply}
                                        </p>
                                    </div>

                                    {/* Glow effect for selected */}
                                    {selectedRarity === option.id && (<div
                                        className={` absolute inset-0 rounded-2xl opacity-20 blur-xl ${option.bgColor} `}/>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div
                    className="w-full max-w-4xl bg-black-100 rounded-xl p-6 backdrop-blur-sm border border-black-50">
                    <h3 className="text-white text-lg mb-3">
                        What does Rarity Mean?
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Rarity defines the total supply for this episode. Each rarity level set a fixed
                        number of supply that can be minted. Once the supply is reached, no more copies
                        can be created.
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full max-w-4xl  mx-auto flex justify-center gap-4">
                <button
                    onClick={onCancel}
                    className="w-full flex-1 py-4 px-6 border-2 border-white/30 text-white rounded-full text-lg hover:border-white/80 hover:bg-white/5 transition-all duration-200">
                    Cancel
                </button>
                <MainButton
                    onClick={handleContinue}
                    className="w-full flex-1 py-4 px-6 bg-primary-500 text-black rounded-full !text-lg hover:bg-primary-400 transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25">
                    Continue
                </MainButton>
            </div>
        </div>
    );
};

export default EpisodeRarity;