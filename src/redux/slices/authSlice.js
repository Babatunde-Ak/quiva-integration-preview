import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios-instance';
import { walletAuth, walletVerifyAuth } from './walletSlice';

const initialState = {
    sendOtp: {
        isLoading: false,
        error: null,
        success: false,
        email: null
    },
    verifyOtp: {
        isLoading: false,
        error: null,
        success: false
    },
    user: {
        token: null,
        data: null,
        expiresAt: null,
        isAuthenticated: false
    },
    profile: {
        data: null,
        isLoading: false,
        error: null
    },
    onboarding: {
        isLoading: false,
        error: null,
        success: false
    },
    usernameCheck: {
        isLoading: false,
        error: null,
        isAvailable: null,
        checkedUsername: null
    },
    updateProfile: {
        isLoading: false,
        error: null,
        success: false
    },
    uploadAvatar: {
        isLoading: false,
        error: null,
        success: false
    }
};


// AUTHENTICATION THUNKS (existing)
export const sendOtpEmail = createAsyncThunk(
    'auth/sendOtpEmail',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/email/send-otp', credentials);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to send OTP'
            );
        }
    }
);

export const verifyOtpEmail = createAsyncThunk(
    'auth/verifyOtpEmail',
    async (otpData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/email/verify-otp', otpData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to verify OTP'
            );
        }
    }
);

// USER PROFILE THUNKS (new and updated)
export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/auth/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to get user profile'
            );
        }
    }
);


export const completeOnboarding = createAsyncThunk(
    'auth/completeOnboarding',
    async (onboardingData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/user/onboarding', onboardingData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to complete onboarding'
            );
        }
    }
);

export const checkUsername = createAsyncThunk(
    'auth/checkUsername',
    async ({ username }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/user/check-username', { username });
            return { ...response.data, checkedUsername: username };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to check username'
            );
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const userId = profileData.get('id');
            const response = await axiosInstance.put(`/auth/${userId}/profile`, profileData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to update profile'
            );
        }
    }
);

export const uploadAvatar = createAsyncThunk(
    'auth/uploadAvatar',
    async (avatarData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/auth/user/update-avatar', avatarData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to upload avatar'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reset OTP states
        resetOtpStates: (state) => {
            state.sendOtp = {
                isLoading: false,
                error: null,
                success: false,
                email: null
            };
            state.verifyOtp = {
                isLoading: false,
                error: null,
                success: false
            };
        },
        
        // Reset profile states
        resetProfileStates: (state) => {
            state.onboarding = {
                isLoading: false,
                error: null,
                success: false
            };
            state.usernameCheck = {
                isLoading: false,
                error: null,
                isAvailable: null,
                checkedUsername: null
            };
            state.updateProfile = {
                isLoading: false,
                error: null,
                success: false
            };
            state.uploadAvatar = {
                isLoading: false,
                error: null,
                success: false
            };
        },
        
        // Clear username check when user starts typing new username
        clearUsernameCheck: (state) => {
            state.usernameCheck.isAvailable = null;
            state.usernameCheck.checkedUsername = null;
            state.usernameCheck.error = null;
        },
        
        // Set token manually (if needed)
        setToken: (state, action) => {
            const { token, expiresAt, user } = action.payload;
            state.user.token = token;
            state.user.expiresAt = expiresAt;
            state.user.data = user;
            state.user.isAuthenticated = true;
        },
        
        // Logout user
        logout: (state) => {
            state.user = {
                token: null,
                data: null,
                expiresAt: null,
                isAuthenticated: false
            };
            state.profile.data = null;
            // Clear localStorage
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userData');
                localStorage.removeItem('token');
            }
        },
        
        // Clear errors
        clearErrors: (state) => {
            state.sendOtp.error = null;
            state.verifyOtp.error = null;
            state.profile.error = null;
            state.onboarding.error = null;
            state.usernameCheck.error = null;
            state.updateProfile.error = null;
            state.uploadAvatar.error = null;
        }
    },
    extraReducers: (builder) => {
        // Send OTP Email
        builder
            .addCase(sendOtpEmail.pending, (state) => {
                state.sendOtp.isLoading = true;
                state.sendOtp.error = null;
                state.sendOtp.success = false;
            })
            .addCase(sendOtpEmail.fulfilled, (state, action) => {
                state.sendOtp.isLoading = false;
                state.sendOtp.success = true;
                state.sendOtp.email = action.meta.arg.email; // Store the email used
            })
            .addCase(sendOtpEmail.rejected, (state, action) => {
                state.sendOtp.isLoading = false;
                state.sendOtp.error = action.payload;
                state.sendOtp.success = false;
            });

        // Verify OTP Email
        builder
            .addCase(verifyOtpEmail.pending, (state) => {
                state.verifyOtp.isLoading = true;
                state.verifyOtp.error = null;
                state.verifyOtp.success = false;
            })
            .addCase(verifyOtpEmail.fulfilled, (state, action) => {
                state.verifyOtp.isLoading = false;
                state.verifyOtp.success = true;
                
                // Set user data if verification includes auth data
                if (action.payload.token) {
                    state.user.token = action.payload.token;
                    state.user.data = action.payload.user;
                    state.user.isAuthenticated = true;
                    
                    // Store in localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('userData', JSON.stringify(action.payload));
                        localStorage.setItem('token', action.payload.token);
                    }
                }
            })
            .addCase(verifyOtpEmail.rejected, (state, action) => {
                state.verifyOtp.isLoading = false;
                state.verifyOtp.error = action.payload;
                state.verifyOtp.success = false;
            });

        // Get User Profile
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.profile.isLoading = true;
                state.profile.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.profile.isLoading = false;
                state.profile.data = action.payload.data;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.profile.isLoading = false;
                state.profile.error = action.payload;
            });

        // Complete Onboarding
        builder
            .addCase(completeOnboarding.pending, (state) => {
                state.onboarding.isLoading = true;
                state.onboarding.error = null;
                state.onboarding.success = false;
            })
            .addCase(completeOnboarding.fulfilled, (state, action) => {
                state.onboarding.isLoading = false;
                state.onboarding.success = true;
                // Update user data if returned
                if (action.payload.user) {
                    state.user.data = action.payload.user;
                    state.profile.data = action.payload.user;
                }
            })
            .addCase(completeOnboarding.rejected, (state, action) => {
                state.onboarding.isLoading = false;
                state.onboarding.error = action.payload;
                state.onboarding.success = false;
            });

        // Check Username
        builder
            .addCase(checkUsername.pending, (state) => {
                state.usernameCheck.isLoading = true;
                state.usernameCheck.error = null;
                state.usernameCheck.isAvailable = null;
            })
            .addCase(checkUsername.fulfilled, (state, action) => {
                state.usernameCheck.isLoading = false;
                state.usernameCheck.isAvailable = action.payload.available;
                state.usernameCheck.checkedUsername = action.payload.checkedUsername;
            })
            .addCase(checkUsername.rejected, (state, action) => {
                state.usernameCheck.isLoading = false;
                state.usernameCheck.error = action.payload;
                state.usernameCheck.isAvailable = null;
            });

        // Update Profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.updateProfile.isLoading = true;
                state.updateProfile.error = null;
                state.updateProfile.success = false;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updateProfile.isLoading = false;
                state.updateProfile.success = true;
                // Update user and profile data if returned
                if (action.payload.data) {
                    state.user.data = action.payload.data;
                    state.profile.data = action.payload.data;
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updateProfile.isLoading = false;
                state.updateProfile.error = action.payload;
                state.updateProfile.success = false;
            });

        // Upload Avatar
        builder
            .addCase(uploadAvatar.pending, (state) => {
                state.uploadAvatar.isLoading = true;
                state.uploadAvatar.error = null;
                state.uploadAvatar.success = false;
            })
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                state.uploadAvatar.isLoading = false;
                state.uploadAvatar.success = true;
                // Update avatar in profile data
                if (state.profile.data && action.payload.avatar) {
                    state.profile.data.avatar = action.payload.avatar;
                }
                if (state.user.data && action.payload.avatar) {
                    state.user.data.avatar = action.payload.avatar;
                }
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.uploadAvatar.isLoading = false;
                state.uploadAvatar.error = action.payload;
                state.uploadAvatar.success = false;
            });
        // Wallet Auth
        builder
            .addCase(walletAuth.pending, (state) => {
                state.sendOtp.isLoading = true; // reuse loading flags or make a new one
                state.sendOtp.error = null;
            })
            .addCase(walletAuth.fulfilled, (state, action) => {
                state.sendOtp.isLoading = false;
                // backend only returns message, so nothing to store yet
            })
            .addCase(walletAuth.rejected, (state, action) => {
                state.sendOtp.isLoading = false;
                state.sendOtp.error = action.payload;
            });

        builder
            .addCase(walletVerifyAuth.pending, (state) => {
                state.verifyOtp.isLoading = true;
                state.verifyOtp.error = null;
                state.verifyOtp.success = false;
            })
            .addCase(walletVerifyAuth.fulfilled, (state, action) => {
                state.verifyOtp.isLoading = false;
                state.verifyOtp.success = true;

                if (action.payload.token) { 
                state.user.token = action.payload.token;
                state.user.data = action.payload.user;
                state.user.isAuthenticated = true;

                if (typeof window !== "undefined") {
                    localStorage.setItem("userData", JSON.stringify(action.payload));
                    localStorage.setItem("token", action.payload.token);
                }
                }
            })
            .addCase(walletVerifyAuth.rejected, (state, action) => {
                state.verifyOtp.isLoading = false;
                state.verifyOtp.error = action.payload;
                state.verifyOtp.success = false;
            });

        
    }
});

export const { 
    resetOtpStates, 
    resetProfileStates,
    clearUsernameCheck,
    setToken, 
    logout, 
    clearErrors 
} = authSlice.actions;

export default authSlice.reducer;