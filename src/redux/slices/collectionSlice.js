import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/config/api";
import axiosInstance from "../axios-instance";

// Initial state
const initialState = {
    collections: null,
    userCollections: null,
    currentCollection: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    successMessage: null
};

// Async thunks Create a collection
export const createCollection = createAsyncThunk("collections/create", async(payload, {rejectWithValue}) => {
    try {
                
        const formData = new FormData();
        formData.append("title", payload.title);
        if (payload.description) {
            formData.append("description", payload.description);
        }
        if (payload.genre && Array.isArray(payload.genre)) {
            payload
                .genre
                .forEach((g) => {
                    formData.append("genre", g);
                });
        }
        if (payload.bannerImage) {
            formData.append("bannerImage", payload.bannerImage);
        }

        const response = await axiosInstance.post(API_ENDPOINTS.collections.root, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to create collection");
    }
});

// Get all collections
export const getAllCollections = createAsyncThunk("collections/getAll", async(_, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.collections.all);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to fetch collections");
    }
});

// Get user collections
export const getUserCollections = createAsyncThunk("collections/getUserCollections", async(_, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.collections.user);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to fetch user collections");
    }
});

// Get collection by ID
export const getCollectionById = createAsyncThunk("collections/getById", async({
    id
}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.collections.byId(id));
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to fetch collection");
    }
});

// Update collection
export const updateCollection = createAsyncThunk("collections/update", async({
    id,
    ...payload
}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.put(API_ENDPOINTS.collections.byId(id), payload, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to update collection");
    }
});

// Delete collection
export const deleteCollection = createAsyncThunk("collections/delete", async({
    id
}, {rejectWithValue}) => {
    try {
        await axiosInstance.delete(API_ENDPOINTS.collections.byId(id));
        return id;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || "Failed to delete collection");
    }
});

const collectionSlice = createSlice({
    name: "collections",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        setCurrentCollection: (state, action) => {
            state.currentCollection = action.payload;
        },
        clearCurrentCollection: (state) => {
            state.currentCollection = null;
        }
    },
    extraReducers: (builder) => {
        // Create Collection
        builder.addCase(createCollection.pending, (state) => {
            state.isCreating = true;
            state.error = null;
        }).addCase(createCollection.fulfilled, (state, action) => {
            state.isCreating = false;
            if (state.collections) {
                state
                    .collections
                    .push(action.payload.data.collection);
            }
            
            state.successMessage = action.payload.message || "Collection created successfully";
        }).addCase(createCollection.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload || "Failed to create collection";
        });

        // Get All Collections
        builder.addCase(getAllCollections.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getAllCollections.fulfilled, (state, action) => {
            state.isLoading = false;
            state.collections = action.payload.data
                ?.data || action.payload.data || action.payload;
        }).addCase(getAllCollections.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch collections";
        });

        // Get User Collections
        builder.addCase(getUserCollections.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getUserCollections.fulfilled, (state, action) => {
            state.isLoading = false;
            state.userCollections = action.payload.data
                ?.data || action.payload.data || action.payload;
        }).addCase(getUserCollections.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch user collections";
        });

        // Get Collection By ID
        builder.addCase(getCollectionById.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getCollectionById.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentCollection = action.payload.data
                ?.collection || action.payload.data
                    ?.data || action.payload.data;
        }).addCase(getCollectionById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch collection";
        });

        // Update Collection
        builder.addCase(updateCollection.pending, (state) => {
            state.isUpdating = true;
            state.error = null;
        }).addCase(updateCollection.fulfilled, (state, action) => {
            state.isUpdating = false;
            const updatedCollection = action.payload.data
                ?.collection || action.payload.data;
            if (state.currentCollection
                ?._id === updatedCollection._id) {
                state.currentCollection = updatedCollection;
            }
            // Update in collections array
            if (state.collections) {
                const index = state
                    .collections
                    .findIndex(c => c._id === updatedCollection._id);
                if (index !== -1) {
                    state.collections[index] = updatedCollection;
                }
            }
            // Update in userCollections array
            if (state.userCollections) {
                const index = state
                    .userCollections
                    .findIndex(c => c._id === updatedCollection._id);
                if (index !== -1) {
                    state.userCollections[index] = updatedCollection;
                }
            }
            state.successMessage = action.payload.message || "Collection updated successfully";
        }).addCase(updateCollection.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = action.payload || "Failed to update collection";
        });

        // Delete Collection
        builder.addCase(deleteCollection.pending, (state) => {
            state.isDeleting = true;
            state.error = null;
        }).addCase(deleteCollection.fulfilled, (state, action) => {
            state.isDeleting = false;
            const deletedId = action.payload;

            // Remove from collections array
            if (state.collections) {
                state.collections = state
                    .collections
                    .filter(c => c._id !== deletedId);
            }
            // Remove from userCollections array
            if (state.userCollections) {
                state.userCollections = state
                    .userCollections
                    .filter(c => c._id !== deletedId);
            }
            // Clear current collection if it was deleted
            if (state.currentCollection
                ?._id === deletedId) {
                state.currentCollection = null;
            }
            state.successMessage = "Collection deleted successfully";
        }).addCase(deleteCollection.rejected, (state, action) => {
            state.isDeleting = false;
            state.error = action.payload || "Failed to delete collection";
        });
    }
});

// Actions
export const {
    clearError,
    clearSuccessMessage,
    setCurrentCollection,
    clearCurrentCollection
} = collectionSlice.actions;

// Selectors
export const selectCollections = (state) => state.collections.collections;
export const selectUserCollections = (state) => state.collections.userCollections;
export const selectCurrentCollection = (state) => state.collections.currentCollection;
export const selectIsLoading = (state) => state.collections.isLoading;
export const selectIsCreating = (state) => state.collections.isCreating;
export const selectIsUpdating = (state) => state.collections.isUpdating;
export const selectIsDeleting = (state) => state.collections.isDeleting;
export const selectCollectionError = (state) => state.collections.error;
export const selectSuccessMessage = (state) => state.collections.successMessage;

// Reducer
export default collectionSlice.reducer;
