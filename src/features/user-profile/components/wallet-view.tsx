'use client';

import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

const WalletView = ({ user }) => {
    const [wallets, setWallets] = useState([
        {
            id: 1,
            address: '0xda99...9278',
            balance: '$500,000.00',
            isPrimary: true,
            avatar: user?.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612c95f?auto=format&fit=crop&w=800&q=80"
        }
    ]);

    const handleDeleteWallet = (walletId) => {
        const walletToDelete = wallets.find(w => w.id === walletId);
        if (walletToDelete?.isPrimary) {
            alert("You cannot delete your primary wallet");
            return;
        }
        
        setWallets(wallets.filter(wallet => wallet.id !== walletId));
    };

    const handleAddWallet = () => {
        // This would typically open a wallet connection modal
        console.log('Add new wallet clicked');
        // For demo, add a mock wallet
        const newWallet = {
            id: Date.now(),
            address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
            balance: '$0.00',
            isPrimary: false,
            avatar: user?.avatar || "https://images.unsplash.com/photo-1494790108755-2616b612c95f?auto=format&fit=crop&w=800&q=80"
        };
        setWallets([...wallets, newWallet]);
    };

    const WalletContent = () => (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            {/* Description */}
            <div className="mb-8">
                <p className="text-white/60 text-sm leading-relaxed">
                    Link multiple wallets and set one as our primary. Your primary wallet can't be unlinked and is used by default.
                </p>
            </div>

            {/* Link Wallet Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Link Wallet</h2>
                
                <div className="space-y-4">
                    {wallets.map((wallet) => (
                        <div 
                            key={wallet.id}
                            className="flex items-center justify-between p-4 bg-black-200 border border-black-50 rounded-lg hover:bg-black-100/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={wallet.avatar}
                                    alt="Wallet"
                                    className="w-12 h-12 rounded-full object-cover border border-black-50"
                                />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{wallet.address}</span>
                                        {wallet.isPrimary && (
                                            <span className="text-xs bg-secondary-200 text-black-200 px-2 py-1 rounded-full font-medium">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/60 text-sm">{wallet.balance}</p>
                                </div>
                            </div>
                            
                            {!wallet.isPrimary && (
                                <button
                                    onClick={() => handleDeleteWallet(wallet.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Remove wallet"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add New Wallet Button */}
                <button
                    onClick={handleAddWallet}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-secondary-200 text-black-200 rounded-lg font-medium hover:bg-primary-500 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add new wallet
                </button>
            </div>

            {/* Wallet Security Section */}
            <div className="border-t border-black-50 pt-8">
                <h2 className="text-lg font-semibold text-white mb-4">Security Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black-200 border border-black-50 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                            <p className="text-white/60 text-sm">Add an extra layer of security to your wallet connections</p>
                        </div>
                        <button className="text-secondary-200 hover:text-primary-500 text-sm font-medium transition-colors">
                            Enable
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-black-200 border border-black-50 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Transaction Notifications</h3>
                            <p className="text-white/60 text-sm">Get notified for all wallet transactions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-black-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-200"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <WalletContent />
    );
};

export default WalletView;