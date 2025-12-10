'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const EditProfileView = ({ user }) => {
    // Form state
    const [formData, setFormData] = useState({
        displayName: user?.displayName || 'Yuna Dean',
        username: user?.username || '',
        bio: user?.bio || 'I love to read fanfiction and action series. Passionate collector of NFT comics and digital art.',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612c95f?auto=format&fit=crop&w=800&q=80',
        bannerImage: user?.bannerImage || '/user-profile-bg.png',
        socials: {
            twitter: user?.socials?.twitter || '',
            discord: user?.socials?.discord || ''
        }
    });

    // Form handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSocialChange = (platform, value) => {
        setFormData(prev => ({
            ...prev,
            socials: {
                ...prev.socials,
                [platform]: value
            }
        }));
    };

    const handleImageUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange(type, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Updating profile with:', formData);
        alert('Profile updated successfully!');
    };

    const EditProfileContent = () => (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 max-w-4xl">
            {/* Change Image Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Change image</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Display Picture */}
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <img
                                    src={formData.avatar}
                                    alt="Display Picture"
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-black-50"
                                />
                            </div>
                            <h3 className="text-sm font-medium text-white mt-4 mb-2">Display Picture</h3>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-black-200 text-white text-sm rounded-lg border border-black-50 hover:bg-black-100/50 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Upload picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload('avatar', e)}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Banner Picture */}
                    <div className="space-y-4">
                        <div>
                            <div className="relative">
                                <img
                                    src={formData.bannerImage}
                                    alt="Banner"
                                    className="w-full h-32 sm:h-40 object-cover rounded-lg border border-black-50"
                                />
                            </div>
                            <h3 className="text-sm font-medium text-white mt-4 mb-2">Banner Picture</h3>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-black-200 text-white text-sm rounded-lg border border-black-50 hover:bg-black-100/50 transition-colors cursor-pointer">
                                <Upload className="w-4 h-4" />
                                Upload picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload('bannerImage', e)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Details Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Update details</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Display Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Display name"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            className="w-full px-4 py-3 bg-black-200 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full px-4 py-3 bg-black-200 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <textarea
                        placeholder="Brief description for your profile."
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full px-4 py-3 bg-black-200 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors resize-none"
                    />
                </div>
            </div>

            {/* Link Your Socials Section */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Link your socials</h2>
                
                <div className="space-y-4">
                    {/* Twitter/X */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Link X"
                            value={formData.socials.twitter}
                            onChange={(e) => handleSocialChange('twitter', e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-black-200 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
                        />
                        <X className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                    </div>

                    {/* Discord */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Link Discord"
                            value={formData.socials.discord}
                            onChange={(e) => handleSocialChange('discord', e.target.value)}
                            className="w-full px-4 py-3 pr-12 bg-black-200 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Settings */}
            <div className="border-t border-black-50 pt-8 mb-8">
                <h2 className="text-lg font-semibold text-white mb-6">Privacy Settings</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black-200 border border-black-50 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Public Profile</h3>
                            <p className="text-white/60 text-sm">Make your profile visible to other users</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-black-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-200"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-black-200 border border-black-50 rounded-lg">
                        <div>
                            <h3 className="text-white font-medium">Show Collection</h3>
                            <p className="text-white/60 text-sm">Display your NFT collection on your profile</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-black-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-200"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black-50">
                <button
                    type="button"
                    className="px-6 py-3 bg-black-200 text-white border border-black-50 rounded-lg font-medium hover:bg-black-100/50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-secondary-200 text-black-200 rounded-lg font-medium hover:bg-primary-500 transition-colors"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );

    return (
        <EditProfileContent />
    );
};

export default EditProfileView;