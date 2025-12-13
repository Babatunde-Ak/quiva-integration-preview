'use client';

import React, { useState } from 'react';

const NotificationsView = ({ user }) => {
    const [notifications, setNotifications] = useState({
        comicSold: true,
        successfulMint: true,
        comicPurchase: true,
        creatorDropAlert: true,
        bidOfferUpdates: true,
        // Email preferences
        emailDigest: true,
        marketingEmails: false,
        securityAlerts: true
    });

    const handleToggleNotification = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
        <label className={`relative inline-flex items-center cursor-pointer transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={enabled}
                onChange={onChange}
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-black-100 rounded-full peer-focus:outline-none transition-colors duration-300 ease-in-out peer-checked:bg-black-100 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-secondary-200 after:rounded-full after:h-5 after:w-5 after:transition-transform after:duration-300 after:ease-in-out peer-checked:after:translate-x-full peer-checked:after:border-secondary-200"></div>
        </label>
    );

    const NotificationItem = ({ title, description, isEnabled, onToggle, disabled = false }) => (
        <div className={`flex items-center justify-between p-4 bg-white/5 border border-black-50 rounded-lg hover:bg-black-100/30 transition-colors ${disabled ? 'opacity-60' : ''}`}>
            <div className="flex-1">
                <h3 className="text-white font-medium mb-1">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{description}</p>
            </div>
            <div className="ml-4">
                <ToggleSwitch 
                    enabled={isEnabled} 
                    onChange={onToggle}
                    disabled={disabled}
                />
            </div>
        </div>
    );

    const NotificationsContent = () => (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">

            {/* Email & In-App Notifications */}
            <div className="mb-8 bg-black-200 p-4 rounded-lg border border-black-50">
                <h2 className="text-lg font-semibold text-white mb-2">Email & In-App Notifications</h2>
                <p className="text-white/60 text-sm mb-6">
                    Select the updates you want to receive for your Quiva activities.
                </p>
                
                <div className="space-y-4">
                    <NotificationItem
                        title="Comic Sold"
                        description="When someone purchases one of your listed comics."
                        isEnabled={notifications.comicSold}
                        onToggle={() => handleToggleNotification('comicSold')}
                    />

                    <NotificationItem
                        title="Successful Mint"
                        description="When your minting of a comic is completed successfully."
                        isEnabled={notifications.successfulMint}
                        onToggle={() => handleToggleNotification('successfulMint')}
                    />

                    <NotificationItem
                        title="Comic Purchase"
                        description="When you buy a comic or collectible panel."
                        isEnabled={notifications.comicPurchase}
                        onToggle={() => handleToggleNotification('comicPurchase')}
                    />

                    <NotificationItem
                        title="Creator Drop Alert"
                        description="When your favorite creator releases a new comic or NFT series."
                        isEnabled={notifications.creatorDropAlert}
                        onToggle={() => handleToggleNotification('creatorDropAlert')}
                    />

                    <NotificationItem
                        title="Bid / Offer Updates"
                        description="When someone places or accepts an offer on your listing."
                        isEnabled={notifications.bidOfferUpdates}
                        onToggle={() => handleToggleNotification('bidOfferUpdates')}
                    />
                </div>
            </div>

            {/* Email Preferences */}
            <div className="bg-black-200 p-4 rounded-lg border border-black-50 pt-8 mb-8">
                <h2 className="text-lg font-semibold text-white mb-2">Email Preferences</h2>
                <p className="text-white/60 text-sm mb-6">
                    Control what emails you receive from Quiva.
                </p>
                
                <div className="space-y-4">
                    <NotificationItem
                        title="Weekly Digest"
                        description="Get a summary of your weekly activity and trending comics."
                        isEnabled={notifications.emailDigest}
                        onToggle={() => handleToggleNotification('emailDigest')}
                    />

                    <NotificationItem
                        title="Marketing & Promotions"
                        description="Receive updates about new features, events, and special offers."
                        isEnabled={notifications.marketingEmails}
                        onToggle={() => handleToggleNotification('marketingEmails')}
                    />

                    <NotificationItem
                        title="Security Alerts"
                        description="Important security notifications about your account."
                        isEnabled={notifications.securityAlerts}
                        onToggle={() => handleToggleNotification('securityAlerts')}
                        disabled={true}
                    />
                </div>
            </div>

            {/* Push Notification Settings */}
            <div className="bg-black-200 p-4 rounded-lg border border-black-50 pt-8">
                <h2 className="text-lg font-semibold text-white mb-2">Push Notifications</h2>
                <p className="text-white/60 text-sm mb-6">
                    Enable browser and mobile push notifications for real-time updates.
                </p>
                
                <div className="p-4 bg-black-200 border border-black-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-white font-medium">Browser Notifications</h3>
                            <p className="text-white/60 text-sm">Get notified even when Quiva is not open</p>
                        </div>
                        <button 
                            className="px-4 py-2 bg-secondary-200 text-black-200 text-sm rounded-lg font-medium hover:bg-primary-500 transition-colors"
                            onClick={() => {
                                if ('Notification' in window) {
                                    Notification.requestPermission();
                                }
                            }}
                        >
                            Enable
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-black-50 mt-8">
                <button 
                    className="px-6 py-3 bg-secondary-200 text-black-200 rounded-lg font-medium hover:bg-primary-500 transition-colors"
                    onClick={() => {
                        // Handle save notifications preferences
                        console.log('Saving notification preferences:', notifications);
                        alert('Notification preferences saved successfully!');
                    }}
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );

    return (
        <NotificationsContent />
    );
};

export default NotificationsView;