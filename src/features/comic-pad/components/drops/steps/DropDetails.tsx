'use client';

import React, {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ArrowLeft, Crown} from 'lucide-react';
import ImageUpload from '@/components/image-upload/ImageUpload';
import { MainButton } from '@/components/button';

interface DropFormData {
    supply : string;
    price : string;
    royalty : string;
    maxMintPerWallet : string;
    bannerImage : File | null;
}

interface RarityOption {
    name : string;
    type : 'legendary' | 'epic' | 'common';
    supply : string;
    icon : React.ReactNode;
}

interface DropDetailsProps {
    selectedRarity?: RarityOption;
    onBack : () => void;
    onNext : (data : DropFormData) => void;
    isLoading?: boolean;
}

// Cookie utility functions
const setCookie = (name : string, value : string, days : number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name : string) : string | null => {
    const nameEQ = name + "=";
    const ca = document
        .cookie
        .split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') 
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) 
            return c.substring(nameEQ.length, c.length);
        }
    return null;
};

const deleteCookie = (name : string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

const DropDetails : React.FC < DropDetailsProps > = ({
    selectedRarity,
    onBack,
    onNext,
    isLoading = false
}) => {
    const initialFormData : DropFormData = {
        supply: '',
        price: '',
        royalty: '',
        maxMintPerWallet: '',
        bannerImage: null
    };

    const [formData,
        setFormData] = useState < DropFormData > (initialFormData);
    const [supplyError,
        setSupplyError] = useState < string > ('');

    // Load draft from cookies on component mount
    useEffect(() => {
        const draftData = getCookie('drop_details_draft');
        if (draftData) {
            try {
                const parsedDraft = JSON.parse(decodeURIComponent(draftData));
                setFormData(prev => ({
                    ...prev,
                    ...parsedDraft,
                    bannerImage: null // Can't restore File from cookie
                }));
            } catch (error) {
                console.error('Error loading draft:', error);
                deleteCookie('drop_details_draft');
            }
        }
    }, []);

    // Auto-save to cookies
    useEffect(() => {
        const draftToSave = {
            supply: formData.supply,
            price: formData.price,
            royalty: formData.royalty,
            maxMintPerWallet: formData.maxMintPerWallet
            // Note: bannerImage excluded as File can't be stored in cookies
        };

        if (formData.supply || formData.price) {
            setCookie('drop_details_draft', encodeURIComponent(JSON.stringify(draftToSave)), 7);
        }
    }, [formData]);

    // Supply validation
    useEffect(() => {
        if (selectedRarity && formData.supply) {
            const supplyNum = parseInt(formData.supply.replace(/,/g, ''));
            const maxSupply = getMaxSupplyForRarity(selectedRarity.type);

            if (maxSupply !== Infinity && supplyNum > maxSupply) {
                setSupplyError(`Oops! This supply is more than ${selectedRarity.name} stats`);
            } else {
                setSupplyError('');
            }
        }
    }, [formData.supply, selectedRarity]);

    const getMaxSupplyForRarity = (rarityType : 'legendary' | 'epic' | 'common') : number => {
        switch (rarityType) {
            case 'legendary':
                return 5000;
            case 'epic':
                return 8000;
            case 'common':
                return Infinity;
            default:
                return Infinity;
        }
    };

    const handleSaveDraft = () => {
        try {
            const draftToSave = {
                supply: formData.supply,
                price: formData.price,
                royalty: formData.royalty,
                maxMintPerWallet: formData.maxMintPerWallet
            };

            setCookie('drop_details_draft', encodeURIComponent(JSON.stringify(draftToSave)), 7);
            alert('Draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
        }
    };

    const handleSubmit = (e : React.FormEvent) => {
        e.preventDefault();
        if (supplyError) 
            return;
        deleteCookie('drop_details_draft');
        onNext(formData);
    };

    const isFormValid = formData.supply && formData.price && formData.royalty && formData.maxMintPerWallet && !supplyError;

    return (
        <div
            className="min-h-screen bg-black-100 text-white font-recursive flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Header with Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform"/>
                    <span className="text-sm">Go back</span>
                </button>

                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Drop Details</h1>
                    <p className="text-white/50 text-sm">Set the core parameters for this Drop.</p>
                    {selectedRarity && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-white/70">
                            {selectedRarity.icon}
                            <span className="text-sm font-medium">
                                {selectedRarity.name}
                                - {selectedRarity.supply}
                            </span>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Left Column - Form Fields */}
                        <div className="space-y-6">
                            {/* Rarity Display with Supply Input */}
                            <div>
                                <label className="flex items-center gap-2 mb-3 text-sm font-light">
                                    {selectedRarity
                                        ?.icon || <Crown className="w-5 h-5 text-yellow-500"/>}
                                    {selectedRarity
                                        ?.name || 'Legendary'}
                                </label>
                                <Input
                                    type="text"
                                    placeholder={selectedRarity
                                    ?.type === 'common'
                                        ? 'Infinite supply'
                                        : '6,000'}
                                    value={formData.supply}
                                    onChange={(e) => {
                                    const value = e
                                        .target
                                        .value
                                        .replace(/[^\d]/g, '');
                                    const formatted = value
                                        ? parseInt(value).toLocaleString()
                                        : '';
                                    setFormData(prev => ({
                                        ...prev,
                                        supply: formatted
                                    }));
                                }}
                                    disabled={selectedRarity
                                    ?.type === 'common'}
                                    className="bg-black-100 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4 disabled:opacity-50 disabled:cursor-not-allowed"/> {supplyError && (
                                    <p className="text-red-500 text-sm mt-2">{supplyError}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block mb-3 text-sm font-light">
                                    Price (HBAR)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter price per mint (e.g., 12)"
                                    value={formData.price}
                                    onChange={(e) => {
                                    const value = e
                                        .target
                                        .value
                                        .replace(/[^\d.]/g, '');
                                    setFormData(prev => ({
                                        ...prev,
                                        price: value
                                    }));
                                }}
                                    className="bg-black-100 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4"/>
                            </div>

                            {/* Royalty */}
                            <div>
                                <label className="block mb-3 text-sm font-light">
                                    Royalty (%)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Set secondary sale royalty (e.g., 5%)"
                                    value={formData.royalty}
                                    onChange={(e) => {
                                    const value = e
                                        .target
                                        .value
                                        .replace(/[^\d]/g, '');
                                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                        setFormData(prev => ({
                                            ...prev,
                                            royalty: value
                                        }));
                                    }
                                }}
                                    className="bg-black-100 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4"/>
                            </div>

                            {/* Max Mint Per Wallet */}
                            <div>
                                <label className="block mb-3 text-sm font-light">
                                    Max Mint Per Wallet
                                </label>
                                <Input
                                    type="text"
                                    placeholder="How many copies each wallet can mint"
                                    value={formData.maxMintPerWallet}
                                    onChange={(e) => {
                                    const value = e
                                        .target
                                        .value
                                        .replace(/[^\d]/g, '');
                                    setFormData(prev => ({
                                        ...prev,
                                        maxMintPerWallet: value
                                    }));
                                }}
                                    className="bg-black-100 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4"/>
                            </div>
                        </div>

                        {/* Right Column - Image Upload */}
                        <ImageUpload
                            image={formData.bannerImage}
                            onImageChange={(file) => setFormData(prev => ({
                            ...prev,
                            bannerImage: file
                        }))}
                            label="Upload a banner image for this drop (PNG, JPG) (max 5MB)"
                            maxFileSizeMB={5}/>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 mt-12 max-w-2xl mx-auto">
                        <MainButton
                            type="submit"
                            disabled={isLoading || !isFormValid}
                            className="w-full disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading
                                ? 'Processing...'
                                : 'Next'}
                        </MainButton>

                        <Button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-full h-14 font-medium text-base">
                            Save as Draft
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DropDetails;