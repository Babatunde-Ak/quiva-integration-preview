'use client';

import React, {useState, useMemo} from 'react';
import {ArrowLeft} from 'lucide-react';
import {MainButton} from '@/components/button';

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
        maxMintPerWallet?: string;
        mintType?: string;
        bannerImage?: File | string;
    };
    onBack?: () => void;
    onList?: () => void;
}

const ReviewDetails : React.FC < ReviewDetailsProps > = ({
    episodeData = {
        title: 'Starfall',
        image: 'https://i.ebayimg.com/images/g/b6oAAOSwez5l-jYm/s-l1200.jpg',
        rarity: {
            name: 'Legendary',
            type: 'legendary'
        },
        supply: '5,000',
        price: '12 HBAR',
        royalty: '5%',
        maxMintPerWallet: '3',
        mintType: 'WL Priority',
        bannerImage: 'https://i.ebayimg.com/images/g/b6oAAOSwez5l-jYm/s-l1200.jpg'
    },
    onBack,
    onList
}) => {
    const [checkbox1,
        setCheckbox1] = useState(false);
    const [checkbox2,
        setCheckbox2] = useState(false);

    const isFormValid = checkbox1 && checkbox2;

    // Generate image src for bannerImage if it's a File
    const bannerImageUrl = useMemo(() => {
        if (episodeData.bannerImage instanceof File) {
            return URL.createObjectURL(episodeData.bannerImage);
        }
        return episodeData.bannerImage || episodeData.image;
    }, [episodeData.bannerImage, episodeData.image]);

    const getMintTypeDisplay = (type?: string) => {
        if (!type) 
            return 'Public Mint';
        
        const typeMap : {
            [key : string] : string
        } = {
            'public': 'Public Mint',
            'whitelist': 'Whitelist Only',
            'wl-priority': 'WL Priority',
            'dutch-auction': 'Dutch Auction',
            'scheduled': 'Scheduled Mint',
            'airdrop': 'Airdrop / Free Claim'
        };

        return typeMap[type] || type;
    };

    return (
        <div
            className="min-h-screen bg-black-100 text-white font-recursive flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    <span className="text-sm">Go back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Review Drop</h1>
                    <p className="text-white/50 text-sm">Confirm all details before publishing.</p>
                </div>

                {/* Episode Image */}
                <div className="flex justify-center mb-8">
                    <div
                        className="w-48 h-48 rounded-lg overflow-hidden bg-black-200 border border-black-50">
                        <img
                            src={bannerImageUrl}
                            alt={episodeData.title}
                            className="w-full h-full object-cover"/>
                    </div>
                </div>

                {/* Details List */}
                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <span className="text-white font-light">Episode & Rarity</span>
                        <span className="text-white/60 font-light">
                            {episodeData.title}{" "}
                            — {episodeData.rarity.name}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-white font-light">Supply</span>
                        <span className="text-white/60 font-light">{episodeData.supply}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-white font-light">Price</span>
                        <span className="text-white/60 font-light">{episodeData.price}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-white font-light">Royalty</span>
                        <span className="text-white/60 font-light">{episodeData.royalty}</span>
                    </div>

                    {episodeData.maxMintPerWallet && (
                        <div className="flex justify-between items-center">
                            <span className="text-white font-light">Max Mint Per Wallet</span>
                            <span className="text-white/60 font-light">{episodeData.maxMintPerWallet}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <span className="text-white font-light">Mint Type</span>
                        <span className="text-white/60 font-light">
                            {getMintTypeDisplay(episodeData.mintType)}
                        </span>
                    </div>
                </div>

                {/* Warning Box */}
                <div className="bg-black-100 border border-black-50 rounded-xl p-4 mb-2">
                    <div className="flex items-start gap-3 mb-4">
                        <div>
                            <p className="text-white font-semibold mb-2 text-sm">Please read this</p>
                            <p className="text-red-400 text-xs leading-relaxed mb-4">
                                ⚠️ You are about to list/mint this Episode to the Quiva Marketplace. Once published
                                on Hedera, this action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 ">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={checkbox1}
                                onChange={(e) => setCheckbox1(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-primary-500 checked:border-primary-500 cursor-pointer accent-primary-500"/>
                            <span
                                className="text-white/70 text-xs group-hover:text-white/90 transition-colors">
                                I understand this action is irreversible
                            </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={checkbox2}
                                onChange={(e) => setCheckbox2(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-white/30 bg-transparent checked:bg-primary-500 checked:border-primary-500 cursor-pointer accent-primary-500"/>
                            <span
                                className="text-white/70 text-xs group-hover:text-white/90 transition-colors">
                                By clicking on &quot;Mint&quot; you agree to Quiva&apos;s{' '}
                                <span className="text-primary-500 hover:underline cursor-pointer">
                                    terms of service
                                </span>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    <button
                        onClick={onBack}
                        className="w-full py-4 border border-white/20 text-white rounded-full text-base font-medium hover:bg-white/5 transition-all">
                        Back
                    </button>
                    <MainButton
                        onClick={onList}
                        disabled={!isFormValid}
                        className="w-full py-4 text-black rounded-full text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        Publish Drop
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails;
