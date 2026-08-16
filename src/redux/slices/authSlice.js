import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '@/config/api';
import axiosInstance from '../axios-instance';
import { walletAuth, walletVerifyAuth } from './walletSlice';

const initialState = {
    // Authentication states
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
    
    // User data
    user: {
        token: null,
        data: null,
        expiresAt: null,
        isAuthenticated: false
    },
    
    // Profile management
    profile: {
        data: null,
        isLoading: false,
        error: null
    },
    
    // User operations
    createUser: {
        isLoading: false,
        error: null,
        success: false
    },
    
    updateUser: {
        isLoading: false,
        error: null,
        success: false
    },
    
    deleteUser: {
        isLoading: false,
        error: null,
        success: false
    },
    
    // All users (admin functionality)
    allUsers: {
        data: [],
        isLoading: false,
        error: null
    },
    
    // Profile updates
    updateProfile: {
        isLoading: false,
        error: null,
        success: false
    },
    
    updateEmail: {
        isLoading: false,
        error: null,
        success: false
    },
    
    updateUsername: {
        isLoading: false,
        error: null,
        success: false
    },
    
    // Creator functionality
    becomeCreator: {
        isLoading: false,
        error: null,
        success: false
    },
    
    // Token management
    refreshToken: {
        isLoading: false,
        error: null,
        success: false
    },
    
    // Collaborators
    collaborators: {
        data: [],
        isLoading: false,
        error: null
    },
    
    // Onboarding and username check
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
    
    // Avatar upload
    uploadAvatar: {
        isLoading: false,
        error: null,
        success: false
    }
};

// Helper function to ensure state object exists
const ensureStateObject = (state, key, defaultValue) => {
    if (!state[key]) {
        state[key] = defaultValue;
    }
    return state[key];
};

// ============================================================================
// ASYNC THUNKS FOR ALL ENDPOINTS
// ============================================================================

// 1. POST /api/auth - Create a new user
export const createUser = createAsyncThunk(
    'auth/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.auth.root, userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to create user'
            );
        }
    }
);

// 2. GET /api/auth - Get all users
export const getAllUsers = createAsyncThunk(
    'auth/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.auth.root);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to get all users'
            );
        }
    }
);

// 3. GET /api/auth/{id} - Get a user by ID
export const getUserById = createAsyncThunk(
    'auth/getUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.auth.byId(id));
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to get user'
            );
        }
    }
);

// 4. PUT /api/auth/{id} - Update a user by ID
export const updateUserById = createAsyncThunk(
    'auth/updateUserById',
    async ({ id, userData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.auth.byId(id), userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to update user'
            );
        }
    }
);

// 5. DELETE /api/auth/{id} - Delete a user by ID
export const deleteUserById = createAsyncThunk(
    'auth/deleteUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(API_ENDPOINTS.auth.byId(id));
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to delete user'
            );
        }
    }
);

// 6. PUT /api/auth/{id}/profile - Update user profile (avatar, banner, display name, bio)
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async ({ id, profileData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.auth.profile(id), profileData, {
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

// 7. PUT /api/auth/{id}/email - Update user email
export const updateUserEmail = createAsyncThunk(
    'auth/updateUserEmail',
    async ({ id, email }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.auth.email(id), { email });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to update email'
            );
        }
    }
);

// 8. PUT /api/auth/{id}/username - Update user username
export const updateUserUsername = createAsyncThunk(
    'auth/updateUserUsername',
    async ({ id, username }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.auth.username(id), { username });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to update username'
            );
        }
    }
);

// 9. PUT /api/auth/{id}/become-creator - Upgrade user role to Creator
export const becomeCreator = createAsyncThunk(
    'auth/becomeCreator',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(API_ENDPOINTS.auth.becomeCreator(id));
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to become a creator'
            );
        }
    }
);

// 10. POST /api/auth/refresh - Refresh access token
export const refreshAccessToken = createAsyncThunk(
    'auth/refreshAccessToken',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(API_ENDPOINTS.auth.refresh);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to refresh token'
            );
        }
    }
);

// 11. GET /api/auth/collaborators/all - Get all creators for collaborators
export const getAllCollaborators = createAsyncThunk(
    'auth/getAllCollaborators',
    async (_, { rejectWithValue }) => {
        console.log("🚀 Fetching all collaborators in slice...");
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.auth.collaborators);
            console.log("✅ Collaborators response:", response.data);
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching collaborators:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
            return rejectWithValue(
                error.response?.data?.message || 
                error.response?.data || 
                'Failed to get collaborators'
            );
        }
    }
);

// ============================================================================
// EXISTING EMAIL OTP THUNKS
// ============================================================================

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

// ============================================================================
// EXISTING PROFILE THUNKS
// ============================================================================

export const getUserProfile = createAsyncThunk(
    'auth/getUserProfile',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.auth.byId(id));
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

// ============================================================================
// AUTH SLICE
// ============================================================================

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Reset OTP states
        resetOtpStates: (state) => {
            ensureStateObject(state, 'sendOtp', initialState.sendOtp);
            ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
            
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
        
        // Reset all states
        resetAllStates: (state) => {
            Object.keys(initialState).forEach(key => {
                if (key !== 'user') {
                    state[key] = initialState[key];
                }
            });
        },
        
        // Reset profile states
        resetProfileStates: (state) => {
            ensureStateObject(state, 'onboarding', initialState.onboarding);
            ensureStateObject(state, 'usernameCheck', initialState.usernameCheck);
            ensureStateObject(state, 'updateProfile', initialState.updateProfile);
            ensureStateObject(state, 'uploadAvatar', initialState.uploadAvatar);
            
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
            ensureStateObject(state, 'usernameCheck', initialState.usernameCheck);
            state.usernameCheck.isAvailable = null;
            state.usernameCheck.checkedUsername = null;
            state.usernameCheck.error = null;
        },
        
        // Set token manually (if needed)
        setToken: (state, action) => {
            ensureStateObject(state, 'user', initialState.user);
            const { token, expiresAt, user } = action.payload;
            state.user.token = token;
            state.user.expiresAt = expiresAt;
            state.user.data = user;
            state.user.isAuthenticated = true;
        },
        
        // Set user data
        setUser: (state, action) => {
            ensureStateObject(state, 'user', initialState.user);
            state.user.data = action.payload;
        },
        
        // Logout user
        logout: (state) => {
            ensureStateObject(state, 'user', initialState.user);
            ensureStateObject(state, 'profile', initialState.profile);
            
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
        
        // Clear all errors
        clearErrors: (state) => {
            Object.keys(state).forEach(key => {
                if (state[key] && typeof state[key] === 'object' && 'error' in state[key]) {
                    state[key].error = null;
                }
            });
        },
        
        // Clear specific error
        clearError: (state, action) => {
            const { section } = action.payload;
            if (state[section] && 'error' in state[section]) {
                state[section].error = null;
            }
        }
    },
    extraReducers: (builder) => {
        // ================================================================
        // CREATE USER
        // ================================================================
        builder
            .addCase(createUser.pending, (state) => {
                ensureStateObject(state, 'createUser', initialState.createUser);
                state.createUser.isLoading = true;
                state.createUser.error = null;
                state.createUser.success = false;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                ensureStateObject(state, 'createUser', initialState.createUser);
                state.createUser.isLoading = false;
                state.createUser.success = true;
            })
            .addCase(createUser.rejected, (state, action) => {
                ensureStateObject(state, 'createUser', initialState.createUser);
                state.createUser.isLoading = false;
                state.createUser.error = action.payload;
                state.createUser.success = false;
            });

        // ================================================================
        // GET ALL USERS
        // ================================================================
        builder
            .addCase(getAllUsers.pending, (state) => {
                ensureStateObject(state, 'allUsers', initialState.allUsers);
                state.allUsers.isLoading = true;
                state.allUsers.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                ensureStateObject(state, 'allUsers', initialState.allUsers);
                state.allUsers.isLoading = false;
                state.allUsers.data = action.payload.data || action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                ensureStateObject(state, 'allUsers', initialState.allUsers);
                state.allUsers.isLoading = false;
                state.allUsers.error = action.payload;
            });

        // ================================================================
        // GET ALL COLLABORATORS - CRITICAL FIX
        // ================================================================
        builder
            .addCase(getAllCollaborators.pending, (state) => {
                if (!state.collaborators) {
                    state.collaborators = { data: [], isLoading: false, error: null };
                }
                state.collaborators.isLoading = true;
                state.collaborators.error = null;
                console.log("🔄 Setting collaborators loading to true");
            })
            .addCase(getAllCollaborators.fulfilled, (state, action) => {
                if (!state.collaborators) {
                    state.collaborators = { data: [], isLoading: false, error: null };
                }
                state.collaborators.isLoading = false;
                state.collaborators.data = action.payload.data || action.payload;
                console.log("✅ Collaborators data set:", state.collaborators.data);
            })
            .addCase(getAllCollaborators.rejected, (state, action) => {
                if (!state.collaborators) {
                    state.collaborators = { data: [], isLoading: false, error: null };
                }
                state.collaborators.isLoading = false;
                state.collaborators.error = action.payload;
                console.log("❌ Collaborators error:", action.payload);
            });

        // ================================================================
        // Other existing cases with safety checks...
        // ================================================================
        
        // Send OTP Email
        builder
            .addCase(sendOtpEmail.pending, (state) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = true;
                state.sendOtp.error = null;
                state.sendOtp.success = false;
            })
            .addCase(sendOtpEmail.fulfilled, (state, action) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = false;
                state.sendOtp.success = true;
                state.sendOtp.email = action.meta.arg.email;
            })
            .addCase(sendOtpEmail.rejected, (state, action) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = false;
                state.sendOtp.error = action.payload;
                state.sendOtp.success = false;
            });

        // Verify OTP Email
        builder
            .addCase(verifyOtpEmail.pending, (state) => {
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                state.verifyOtp.isLoading = true;
                state.verifyOtp.error = null;
                state.verifyOtp.success = false;
            })
            .addCase(verifyOtpEmail.fulfilled, (state, action) => {
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                ensureStateObject(state, 'user', initialState.user);
                
                state.verifyOtp.isLoading = false;
                state.verifyOtp.success = true;
                
                if (action.payload.token) {
                    state.user.token = action.payload.token;
                    state.user.data = action.payload.user;
                    state.user.isAuthenticated = true;
                    
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('userData', JSON.stringify(action.payload));
                        localStorage.setItem('token', action.payload.token);
                    }
                }
            })
            .addCase(verifyOtpEmail.rejected, (state, action) => {
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                state.verifyOtp.isLoading = false;
                state.verifyOtp.error = action.payload;
                state.verifyOtp.success = false;
            });

        // ================================================================
        // GET USER BY ID
        // ================================================================
        builder
            .addCase(getUserById.pending, (state) => {
                state.profile = { data: state.profile?.data || null, isLoading: true, error: null };
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.profile = { data: action.payload.data || action.payload, isLoading: false, error: null };
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.profile = { data: state.profile?.data || null, isLoading: false, error: action.payload };
            });

        // ================================================================
        // GET USER PROFILE
        // ================================================================
        builder
            .addCase(getUserProfile.pending, (state) => {
                state.profile = { data: state.profile?.data || null, isLoading: true, error: null };
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.profile = { data: action.payload.data || action.payload, isLoading: false, error: null };
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.profile = { data: state.profile?.data || null, isLoading: false, error: action.payload };
            });

        // ================================================================
        // UPDATE USER PROFILE (displayName, bio, avatar, banner)
        // ================================================================
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.updateProfile = { isLoading: true, error: null, success: false };
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updateProfile = { isLoading: false, error: null, success: true };
                const updatedUser = action.payload?.data?.user || action.payload?.data;
                if (updatedUser) {
                    ensureStateObject(state, 'user', initialState.user);
                    state.user.data = { ...state.user.data, ...updatedUser };
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updateProfile = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // UPDATE USER BY ID (username, email, role)
        // ================================================================
        builder
            .addCase(updateUserById.pending, (state) => {
                state.updateUser = { isLoading: true, error: null, success: false };
            })
            .addCase(updateUserById.fulfilled, (state, action) => {
                state.updateUser = { isLoading: false, error: null, success: true };
                const updatedUser = action.payload?.data?.user || action.payload?.data;
                if (updatedUser) {
                    ensureStateObject(state, 'user', initialState.user);
                    state.user.data = { ...state.user.data, ...updatedUser };
                }
            })
            .addCase(updateUserById.rejected, (state, action) => {
                state.updateUser = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // UPDATE USERNAME
        // ================================================================
        builder
            .addCase(updateUserUsername.pending, (state) => {
                state.updateUsername = { isLoading: true, error: null, success: false };
            })
            .addCase(updateUserUsername.fulfilled, (state, action) => {
                state.updateUsername = { isLoading: false, error: null, success: true };
                const updatedUser = action.payload?.data?.user || action.payload?.data;
                if (updatedUser) {
                    ensureStateObject(state, 'user', initialState.user);
                    state.user.data = { ...state.user.data, ...updatedUser };
                }
            })
            .addCase(updateUserUsername.rejected, (state, action) => {
                state.updateUsername = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // UPDATE EMAIL
        // ================================================================
        builder
            .addCase(updateUserEmail.pending, (state) => {
                state.updateEmail = { isLoading: true, error: null, success: false };
            })
            .addCase(updateUserEmail.fulfilled, (state) => {
                state.updateEmail = { isLoading: false, error: null, success: true };
            })
            .addCase(updateUserEmail.rejected, (state, action) => {
                state.updateEmail = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // DELETE USER
        // ================================================================
        builder
            .addCase(deleteUserById.pending, (state) => {
                state.deleteUser = { isLoading: true, error: null, success: false };
            })
            .addCase(deleteUserById.fulfilled, (state) => {
                state.deleteUser = { isLoading: false, error: null, success: true };
            })
            .addCase(deleteUserById.rejected, (state, action) => {
                state.deleteUser = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // BECOME CREATOR
        // ================================================================
        builder
            .addCase(becomeCreator.pending, (state) => {
                state.becomeCreator = { isLoading: true, error: null, success: false };
            })
            .addCase(becomeCreator.fulfilled, (state) => {
                state.becomeCreator = { isLoading: false, error: null, success: true };
            })
            .addCase(becomeCreator.rejected, (state, action) => {
                state.becomeCreator = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // ONBOARDING
        // ================================================================
        builder
            .addCase(completeOnboarding.pending, (state) => {
                state.onboarding = { isLoading: true, error: null, success: false };
            })
            .addCase(completeOnboarding.fulfilled, (state) => {
                state.onboarding = { isLoading: false, error: null, success: true };
            })
            .addCase(completeOnboarding.rejected, (state, action) => {
                state.onboarding = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // CHECK USERNAME
        // ================================================================
        builder
            .addCase(checkUsername.pending, (state) => {
                state.usernameCheck = { isLoading: true, error: null, isAvailable: null, checkedUsername: state.usernameCheck?.checkedUsername || null };
            })
            .addCase(checkUsername.fulfilled, (state, action) => {
                state.usernameCheck = { isLoading: false, error: null, isAvailable: action.payload.isAvailable ?? action.payload.success, checkedUsername: action.payload.checkedUsername };
            })
            .addCase(checkUsername.rejected, (state, action) => {
                state.usernameCheck = { isLoading: false, error: action.payload, isAvailable: null, checkedUsername: state.usernameCheck?.checkedUsername || null };
            });

        // ================================================================
        // UPLOAD AVATAR
        // ================================================================
        builder
            .addCase(uploadAvatar.pending, (state) => {
                state.uploadAvatar = { isLoading: true, error: null, success: false };
            })
            .addCase(uploadAvatar.fulfilled, (state) => {
                state.uploadAvatar = { isLoading: false, error: null, success: true };
            })
            .addCase(uploadAvatar.rejected, (state, action) => {
                state.uploadAvatar = { isLoading: false, error: action.payload, success: false };
            });

        // ================================================================
        // REFRESH TOKEN
        // ================================================================
        builder
            .addCase(refreshAccessToken.pending, (state) => {
                state.refreshToken = { isLoading: true, error: null, success: false };
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                state.refreshToken = { isLoading: false, error: null, success: true };
                ensureStateObject(state, 'user', initialState.user);
                if (action.payload.token) {
                    state.user.token = action.payload.token;
                }
            })
            .addCase(refreshAccessToken.rejected, (state, action) => {
                state.refreshToken = { isLoading: false, error: action.payload, success: false };
            });

        // Wallet Auth cases
        builder
            .addCase(walletAuth.pending, (state) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = true;
                state.sendOtp.error = null;
            })
            .addCase(walletAuth.fulfilled, (state, action) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = false;
            })
            .addCase(walletAuth.rejected, (state, action) => {
                ensureStateObject(state, 'sendOtp', initialState.sendOtp);
                state.sendOtp.isLoading = false;
                state.sendOtp.error = action.payload;
            });

        builder
            .addCase(walletVerifyAuth.pending, (state) => {
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                state.verifyOtp.isLoading = true;
                state.verifyOtp.error = null;
                state.verifyOtp.success = false;
            })
            .addCase(walletVerifyAuth.fulfilled, (state, action) => {
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                ensureStateObject(state, 'user', initialState.user);
                
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
                ensureStateObject(state, 'verifyOtp', initialState.verifyOtp);
                state.verifyOtp.isLoading = false;
                state.verifyOtp.error = action.payload;
                state.verifyOtp.success = false;
            });
    }
});

export const { 
    resetOtpStates, 
    resetAllStates,
    resetProfileStates,
    clearUsernameCheck,
    setToken,
    setUser,
    logout, 
    clearErrors,
    clearError
} = authSlice.actions;

export default authSlice.reducer;
