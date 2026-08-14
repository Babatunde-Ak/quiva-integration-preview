'use client';

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hook';
import { updateUserProfile, updateUserUsername, getUserProfile } from '@/redux/slices/authSlice';

const EditProfileView = ({ user }) => {
    const dispatch = useAppDispatch();
    const authUser = useAppSelector((state) => state.auth?.user?.data);
    const profileLoading = useAppSelector((state) => state.auth?.updateProfile?.isLoading);
    const usernameLoading = useAppSelector((state) => state.auth?.updateUsername?.isLoading);

    const userId = user?._id || authUser?._id;
    const isLoading = profileLoading || usernameLoading;

    // Form state
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        bio: user?.bio || '',
        avatar: user?.avatar || '/default-avatar.png',
        bannerImage: user?.banner || '/user-profile-bg.png',
        socials: {
            twitter: user?.socials?.twitter || '',
            discord: user?.socials?.discord || ''
        }
    });

    // Track actual file objects for upload
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState(null);

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
            if (type === 'avatar') setAvatarFile(file);
            if (type === 'bannerImage') setBannerFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange(type, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) return;

        setSubmitStatus(null);

        try {
            // Update profile (displayName, bio, avatar, banner) via multipart/form-data
            const profileFormData = new FormData();
            profileFormData.append('displayName', formData.displayName);
            profileFormData.append('bio', formData.bio);
            if (avatarFile) profileFormData.append('avatar', avatarFile);
            if (bannerFile) profileFormData.append('banner', bannerFile);

            // @ts-ignore - thunk params defined in JS file
            const profileResult = await dispatch(
                updateUserProfile({ id: userId, profileData: profileFormData } as any)
            ).unwrap();

            // Update username if it changed
            if (formData.username && formData.username !== user?.username) {
                // @ts-ignore - thunk params defined in JS file
                await dispatch(
                    updateUserUsername({ id: userId, username: formData.username } as any)
                ).unwrap();
            }

            // Refresh profile data in store
            // @ts-ignore - thunk params defined in JS file
            dispatch(getUserProfile(userId));

            setSubmitStatus('success');
        } catch (error) {
            console.error('Failed to update profile:', error);
            setSubmitStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 max-w-4xl mb-12">
            {/* Change Image Section */}
            <div className="mb-8 bg-black-200 p-4 rounded-lg border border-black-50">
                <h2 className="text-lg font-semibold text-white mb-6">Change image</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <label className="inline-flex items-center justify-center gap-2 bg-white/25 w-full py-2 px-4 text-white text-sm rounded-full hover:bg-black-100/50 transition-colors cursor-pointer">
                                Upload picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload('avatar', e)}
                                />
                                <Upload className="w-4 h-4" />
                            </label>
                        </div>
                    </div>

                    {/* Banner Picture */}
                    <div className="space-y-4 col-span-2">
                        <div>
                            <div className="relative">
                                <img
                                    src={formData.bannerImage}
                                    alt="Banner"
                                    className="w-full h-24 sm:h-32 object-cover rounded-lg border border-black-50"
                                />
                            </div>
                            <h3 className="text-sm font-medium text-white mt-4 mb-2">Banner Picture</h3>
                            <label className="inline-flex items-center justify-center gap-2 bg-white/25 w-full py-2 px-4 text-white text-sm rounded-full hover:bg-black-100/50 transition-colors cursor-pointer">                                
                                Upload picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload('bannerImage', e)}
                                />
                                <Upload className="w-4 h-4" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Details Section */}
            <div className="mb-8 bg-black-200 p-4 rounded-lg border border-black-50">
                <h2 className="text-lg font-semibold text-white mb-6">Update details</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Display Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Display name"
                            value={formData.displayName}
                            onChange={(e) => handleInputChange('displayName', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors"
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
                        className="w-full px-4 py-3 bg-white/5 border border-black-50 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-secondary-200 transition-colors resize-none"
                    />
                </div>
            </div>

            {/* Link Your Socials Section */}
            <div className="mb-8 bg-black-200 p-4 rounded-lg border border-black-50">
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

            {/* Status Message */}
            {submitStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                    Profile updated successfully!
                </div>
            )}
            {submitStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    Failed to update profile. Please try again.
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-black-50">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-secondary-200 text-black-200 rounded-lg font-medium hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
};

export default EditProfileView;