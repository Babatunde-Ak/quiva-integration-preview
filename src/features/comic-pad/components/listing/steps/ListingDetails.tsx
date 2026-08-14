'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Crown, AlertCircle } from 'lucide-react';
import { MainButton } from '@/components/button';
import { toast } from 'react-toastify';

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

interface ValidationState {
    supply: boolean;
    price: boolean;
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

    const [validationErrors, setValidationErrors] = useState<ValidationState>({
        supply: false,
        price: false
    });

    const [showValidation, setShowValidation] = useState(false);

    // Get supply range based on rarity
    const getSupplyRange = () => {
        switch (selectedRarity.type) {
            case 'legendary':
                return { min: 1, max: 5000, label: '1 - 5,000' };
            case 'epic':
                return { min: 5001, max: 8000, label: '5,001 - 8,000' };
            case 'common':
                return { min: 8001, max: Infinity, label: '8,001+' };
            default:
                return { min: 1, max: 5000, label: '1 - 5,000' };
        }
    };

    const supplyRange = getSupplyRange();

    // Validation functions
    const validateSupply = (value: string): boolean => {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1) return false;
        
        if (selectedRarity.type === 'common') {
            return numValue >= supplyRange.min;
        } else {
            return numValue >= supplyRange.min && numValue <= supplyRange.max;
        }
    };

    const validatePrice = (value: string): boolean => {
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue > 0;
    };

    const validateForm = (): ValidationState => {
        return {
            supply: !validateSupply(formData.supply),
            price: !validatePrice(formData.price)
        };
    };

    // Update validation when form data changes
    useEffect(() => {
        if (showValidation) {
            const newErrors = validateForm();
            setValidationErrors(newErrors);
        }
    }, [formData, showValidation]);

    const handleInputChange = (field: keyof ListingDetailsData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error for the specific field being edited
        if (showValidation) {
            const isFieldValid = field === 'supply' 
                ? validateSupply(value) 
                : field === 'price' 
                ? validatePrice(value) 
                : true;
            
            if (isFieldValid) {
                setValidationErrors(prev => ({
                    ...prev,
                    [field]: false
                }));
            }
        }
    };

    const getSupplyErrorMessage = (): string => {
        const numValue = parseInt(formData.supply);
        
        if (!formData.supply || isNaN(numValue)) {
            return 'Supply is required';
        }
        
        if (numValue < 1) {
            return 'Supply must be at least 1';
        }
        
        switch (selectedRarity.type) {
            case 'legendary':
                if (numValue > 5000) {
                    return `Legendary rarity supply cannot exceed 5,000`;
                }
                break;
            case 'epic':
                if (numValue <= 5000) {
                    return `Epic rarity supply must be greater than 5,000`;
                }
                if (numValue > 8000) {
                    return `Epic rarity supply cannot exceed 8,000`;
                }
                break;
            case 'common':
                if (numValue <= 8000) {
                    return `Common rarity supply must be greater than 8,000`;
                }
                break;
        }
        
        return 'Invalid supply range';
    };

    const handleNext = () => {
        const errors = validateForm();
        setValidationErrors(errors);
        setShowValidation(true);
        
        const hasErrors = Object.values(errors).some(Boolean);
        
        if (hasErrors) {
            const errorMessages = [];
            if (errors.supply) errorMessages.push('Valid supply amount');
            if (errors.price) errorMessages.push('Valid price');
            
            toast.error(`Please provide: ${errorMessages.join(', ')}`);
            return;
        }
        
        toast.success("Listing details validated successfully!");
        
        onNext?.({
            ...formData,
            royalty: DEFAULT_ROYALTY // Ensure royalty is always 5%
        });
    };

    const getInputErrorClass = (hasError: boolean) => {
        return hasError 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-black-50 focus:border-primary-500/50';
    };

    const isValid = validateSupply(formData.supply) && validatePrice(formData.price);

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
                            <p className="text-white/50 text-sm">
                                {selectedRarity.type === 'common' ? 'Infinite Supply' : `Range: ${supplyRange.label}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-6">
                    {/* Supply */}
                    <div className="space-y-2">
                        <label className="block text-white font-medium mb-3">
                            Total Supply
                            <span className="text-primary-500"> *</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            placeholder={
                                selectedRarity.type === 'common' 
                                    ? "Enter supply (8001 or higher)" 
                                    : `Enter supply (${supplyRange.label})`
                            }
                            value={formData.supply}
                            onChange={(e) => handleInputChange('supply', e.target.value)}
                            className={`w-full px-4 py-4 bg-black-100 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-black-100 transition-all duration-200 ${
                                showValidation ? getInputErrorClass(validationErrors.supply) : 'border border-black-50 focus:border-primary-500/50'
                            }`}
                        />
                        {showValidation && validationErrors.supply && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>{getSupplyErrorMessage()}</span>
                            </div>
                        )}
                        <div className="text-white/40 text-sm">
                            {selectedRarity.type === 'legendary' && "Legendary: Premium limited edition (1-5,000)"}
                            {selectedRarity.type === 'epic' && "Epic: High-tier collectible (5,001-8,000)"}
                            {selectedRarity.type === 'common' && "Common: Mass distribution (8,001+)"}
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="block text-white font-medium mb-3">
                            Price (HBAR)
                            <span className="text-primary-500"> *</span>
                        </label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter price per NFT (e.g., 10.5)"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className={`w-full px-4 py-4 bg-black-100 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-black-100 transition-all duration-200 ${
                                showValidation ? getInputErrorClass(validationErrors.price) : 'border border-black-50 focus:border-primary-500/50'
                            }`}
                        />
                        {showValidation && validationErrors.price && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                                <AlertCircle size={16} />
                                <span>Please enter a valid price greater than 0</span>
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
                    onClick={handleNext}
                    disabled={false} // Allow button to be clickable to show validation errors
                    className="w-full flex-1 py-4 px-6 text-black rounded-full !text-lg transform hover:scale-105 transition-all duration-200 shadow-2xl shadow-primary-500/25">
                    Next
                </MainButton>
            </div>

            {/* Validation Summary */}
            {showValidation && !isValid && (
                <div className="w-full max-w-md mx-auto px-6 pb-6">
                    <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-500 mb-2">
                            <AlertCircle size={20} />
                            <span className="font-semibold">Please fix the following errors</span>
                        </div>
                        <ul className="text-red-400 text-sm space-y-1">
                            {validationErrors.supply && <li>• {getSupplyErrorMessage()}</li>}
                            {validationErrors.price && <li>• Valid price is required</li>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetails;