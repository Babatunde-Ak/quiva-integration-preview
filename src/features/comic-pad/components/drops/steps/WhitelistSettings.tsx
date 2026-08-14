'use client';

import React, {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {ArrowLeft, Upload} from 'lucide-react';
import { MainButton } from '@/components/button';

interface WhitelistSettingsProps {
    onBack : () => void;
    onNext : (data : WhitelistData) => void;
    isLoading?: boolean;
}

interface WhitelistData {
    wallets : string[];
    maxMintPerWallet : string;
    reservedSupply : string;
}

const WhitelistSettings : React.FC < WhitelistSettingsProps > = ({
    onBack,
    onNext,
    isLoading = false
}) => {
    const [wallets,
        setWallets] = useState < string[] > ([]);
    const [pasteText,
        setPasteText] = useState('');
    const [maxMintPerWallet,
        setMaxMintPerWallet] = useState('');
    const [reservedSupply,
        setReservedSupply] = useState('');
    const [stats,
        setStats] = useState({valid: 0, duplicates: 0, invalid: 0});
    const fileInputRef = useRef < HTMLInputElement > (null);

    const parseWallets = (text : string) => {
        // Split by newlines first
        const lines = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Check if first line might be a header
        const firstLine = lines[0];
        const hasHeader = firstLine
            .toLowerCase()
            .includes('wallet') || firstLine
            .toLowerCase()
            .includes('address') || !(/^0\.0\.\d+/.test(firstLine));

        // Skip header if present
        const dataLines = hasHeader
            ? lines.slice(1)
            : lines;

        const addresses : string[] = [];

        dataLines.forEach(line => {
            // Handle CSV format - take first column
            if (line.includes(',')) {
                const firstColumn = line
                    .split(',')[0]
                    .trim();
                addresses.push(firstColumn// Handle space or tab separated
                );
            } else if (line.includes('\t') || line.includes(' ')) {
                const firstColumn = line
                    .split(/[\t\s]+/)[0]
                    .trim();
                addresses.push(firstColumn// Single address per line
                );
            } else {
                addresses.push(line);
            }
        });

        // Simple validation for wallet addresses
        const validAddresses : string[] = [];
        const seenAddresses = new Set < string > ();
        let duplicates = 0;
        let invalid = 0;

        addresses.forEach(addr => {
            // Validate Hedera format (0.0.xxxxx) or long hex format
            const isHederaFormat = /^0\.0\.\d+$/.test(addr);
            const isLongFormat = /^[a-fA-F0-9]{40,}$/.test(addr);

            if (!isHederaFormat && !isLongFormat) {
                invalid++;
                return;
            }

            const normalized = addr.toLowerCase();
            if (seenAddresses.has(normalized)) {
                duplicates++;
                return;
            }

            seenAddresses.add(normalized);
            validAddresses.push(addr);
        });

        setWallets(validAddresses);
        setStats({valid: validAddresses.length, duplicates, invalid});
    };

    const handleFileUpload = (event : React.ChangeEvent < HTMLInputElement >) => {
        const file = event.target.files
            ?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target
                    ?.result as string;
                setPasteText(text);
                parseWallets(text);
            };
            reader.readAsText(file);
        }
    };

    const handleNext = () => {
        if (wallets.length > 0) {
            onNext({wallets, maxMintPerWallet, reservedSupply});
        }
    };

    const isFormValid = wallets.length > 0 && maxMintPerWallet && reservedSupply;

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
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">Whitelist Settings</h1>
                    <p className="text-white/50 text-sm">Manage wallet access and mint limits.</p>
                </div>

                {/* Form Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Paste Wallets */}
                    <div className="space-y-4">
                        <label className="block text-sm font-light text-white/70">Paste Wallets</label>

                        <textarea
                            placeholder="Enter wallets"
                            value={pasteText}
                            onChange={(e) => {
                                setPasteText(e.target.value);
                                // Auto-parse on change
                                if (e.target.value.trim()) {
                                parseWallets(e.target.value);
                                } else {
                                // Clear wallets if text is cleared
                                setWallets([]);
                                setStats({ valid: 0, duplicates: 0, invalid: 0 });
                                }
                            }}
                            onPaste={(e) => {
                                // Auto-parse on paste with slight delay to ensure value is updated
                                setTimeout(() => {
                                const text = e.currentTarget.value;
                                if (text.trim()) {
                                    parseWallets(text);
                                }
                                }, 10);
                            }}
                            className="w-full h-32 bg-black-200 border border-black-50 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 resize-none"/>

                        <div className="text-center text-white/40 text-sm">Or</div>

                        {/* File Upload Area */}
                        <div
                            onClick={() => fileInputRef.current
                            ?.click()}
                            className="border-2 border-dashed border-black-50 rounded-lg p-8 text-center cursor-pointer hover:border-white/20 transition-colors">
                            <Upload className="w-12 h-12 mx-auto mb-3 text-white/40"/>
                            <p className="text-white/60 mb-2">Drag your file(s) or browse</p>
                            <p className="text-white/30 text-xs">Only support .csv, .txt, .xlsx</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt,.xlsx"
                            onChange={handleFileUpload}
                            className="hidden"/> {/* Real-time parsing feedback */}
                        {pasteText && wallets.length === 0 && stats.invalid > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <p className="text-red-400 text-sm">
                                    No valid wallets found. Please check the format.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Settings */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                WL Max Mint Per Wallet
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter limit (e.g., 2)"
                                value={maxMintPerWallet}
                                onChange={(e) => {
                                const value = e
                                    .target
                                    .value
                                    .replace(/[^\d]/g, '');
                                setMaxMintPerWallet(value);
                            }}
                                className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4"/>
                        </div>

                        <div>
                            <label className="block text-sm font-light text-white/70 mb-3">
                                Reserved Supply
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter Reserved Supply Amount"
                                value={reservedSupply}
                                onChange={(e) => {
                                const value = e
                                    .target
                                    .value
                                    .replace(/[^\d]/g, '');
                                const formatted = value
                                    ? parseInt(value).toLocaleString()
                                    : '';
                                setReservedSupply(formatted);
                            }}
                                className="bg-black-200 border-black-50 text-white placeholder:text-white/30 focus:border-primary-500/30 focus:ring-0 rounded-lg h-12 px-4"/>
                        </div>

                        {/* Statistics - Real-time update */}
                        {wallets.length > 0 && (
                            <div
                                className="space-y-3 pt-4 bg-black-200 border border-black-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-light">Valid wallets:</span>
                                    <span className="text-primary-500 font-semibold">{stats
                                            .valid
                                            .toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-light">Duplicates removed</span>
                                    <span className="text-white/60">{stats.duplicates}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-light">Invalid addresses</span>
                                    <span className="text-white/60">{stats.invalid}</span>
                                </div>
                            </div>
                        )}

                        {/* Empty state hint */}
                        {!pasteText && wallets.length === 0 && (
                            <div className="pt-4 text-center">
                                <p className="text-white/40 text-sm">
                                    Paste wallet addresses or upload a file to see statistics
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="bg-transparent border border-white/20 text-white hover:bg-white/5 rounded-full h-14 font-medium text-base">
                        Back
                    </Button>
                    <MainButton
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || !isFormValid}
                        className="disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {isLoading
                            ? 'Processing...'
                            : 'Next'}
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default WhitelistSettings;