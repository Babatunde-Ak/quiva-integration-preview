import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/config/api";
import axiosInstance from "../axios-instance";

// Initial state
const initialState = {
  comics: null,
  userComics: null,
  currentComic: null,
  previewComic: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isPreviewing: false,
  error: null,
  successMessage: null,
};

// Async thunks

// Create a basic comic
export const createComic = createAsyncThunk(
  "comics/create",
  async (payload, { rejectWithValue }) => {
    try {
      if (!payload.collectionId) {
        return rejectWithValue("Collection ID is required to create a comic.");
      }

      const formData = new FormData();
      formData.append("title", payload.title);
      if (payload.summary) {
        formData.append("summary", payload.summary);
      }
      if (payload.bannerImage) {
        formData.append("bannerImage", payload.bannerImage);
      }

      const response = await axiosInstance.post(API_ENDPOINTS.comics.create(payload.collectionId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.message || "Failed to create comic";
    }
  }
);

// Create a full comic with pages
export const createFullComic = createAsyncThunk(
  "comics/createFull",
  async ({formData, payload, collectionId}, { rejectWithValue }) => {
    try {
      // `payload` means the files were uploaded to storage already and only their references
      // are being sent, which keeps the request small enough to survive production's body
      // limit. `formData` is the older multipart path, kept for any caller still using it.
      const response = payload
        ? await axiosInstance.post(API_ENDPOINTS.comics.createFull(collectionId), payload)
        : await axiosInstance.post(
            API_ENDPOINTS.comics.createFull(collectionId),
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to create full comic";
      return rejectWithValue(message);
    }
  }
);

// Get all comics
export const getAllComics = createAsyncThunk(
  "comics/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.comics.all);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.quivaSafeMessage || "Marketplace data could not be loaded. Please try again shortly.");
    }
  }
);

// Get user comics
export const getUserComics = createAsyncThunk(
  "comics/getUserComics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.comics.user);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.quivaSafeMessage || "Marketplace data could not be loaded. Please try again shortly."
      );
    }
  }
);

// Get comic by ID
export const getComicById = createAsyncThunk(
  "comics/getById",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.comics.byId(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch comic");
    }
  }
);

// Get comic preview
export const getComicPreview = createAsyncThunk(
  "comics/preview",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.comics.preview(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch comic preview"
      );
    }
  }
);

// Get paid comic (must have paid to access)
export const getPaidComic = createAsyncThunk(
  "comics/getPaid",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.comics.paid(id));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch paid comic"
      );
    }
  }
);

// Update comic
export const updateComic = createAsyncThunk(
  "comics/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.comics.update(id), payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update comic");
    }
  }
);

// Update comic cover
export const updateComicCover = createAsyncThunk(
  "comics/updateCover",
  async ({ id, coverImage }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("coverImage", coverImage);

      const response = await axiosInstance.put(
        API_ENDPOINTS.comics.updateCover(id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update comic cover"
      );
    }
  }
);

export const updateComicToken = createAsyncThunk(
  "comics/updateToken",
  async ({ comicId, tokenId, listingId, campaignId, campaignType, price, maxSupply, serial, transactionId, metadataTopicIds }, { rejectWithValue }) => {
    try {
      const payload = {
        tokenId,
        listingId,
        campaignId,
        campaignType,
        price,
        maxSupply,
        serial,
        transactionId,
      };

      // Preserve the official serialization expected by the backend. Omitting
      // this field is materially different from submitting an empty array.
      if (metadataTopicIds !== undefined) {
        payload.metadataTopicIds = Array.isArray(metadataTopicIds)
          ? JSON.stringify(metadataTopicIds)
          : metadataTopicIds;
      }

      const response = await axiosInstance.put(
        API_ENDPOINTS.comics.updateToken(comicId),
        payload        
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update comic token information"
      );
    }
  }
);

// Delete comic
export const deleteComic = createAsyncThunk(
  "comics/delete",
  async ({ id }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.comics.delete(id));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to delete comic");
    }
  }
);

// Delete comic


const comicSlice = createSlice({
  name: "comics",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentComic: (state, action) => {
      state.currentComic = action.payload;
    },
    clearCurrentComic: (state) => {
      state.currentComic = null;
    },
    clearPreviewComic: (state) => {
      state.previewComic = null;
    },
  },
  extraReducers: (builder) => {
    // Create Comic
    builder
      .addCase(createComic.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createComic.fulfilled, (state, action) => {
        state.isCreating = false;
        state.comics.push(action.payload);
        state.userComics.push(action.payload);
        state.successMessage = "Comic created successfully";
      })
      .addCase(createComic.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create comic";
      });

    // Create Full Comic
    builder
      .addCase(createFullComic.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createFullComic.fulfilled, (state, action) => {
        state.isCreating = false;
        state.successMessage = "Full comic created successfully";
      })
      .addCase(createFullComic.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create full comic";
      });

    // Get All Comics
    builder
      .addCase(getAllComics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllComics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comics = action.payload;
      })
      .addCase(getAllComics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch comics";
      });

    // Get User Comics
    builder
      .addCase(getUserComics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserComics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userComics = action.payload;
      })
      .addCase(getUserComics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user comics";
      });

    // Get Comic By ID
    builder
      .addCase(getComicById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getComicById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentComic = action.payload.data.comic;
      })
      .addCase(getComicById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch comic";
      });

    // Get Comic Preview
    builder
      .addCase(getComicPreview.pending, (state) => {
        state.isPreviewing = true;
        state.error = null;
      })
      .addCase(getComicPreview.fulfilled, (state, action) => {
        state.isPreviewing = false;
        state.previewComic = action.payload.data.comic;
      })
      .addCase(getComicPreview.rejected, (state, action) => {
        state.isPreviewing = false;
        state.error = action.payload || "Failed to fetch comic preview";
      });

    // Get Paid Comic
    builder
      .addCase(getPaidComic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPaidComic.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentComic = action.payload.data.comic;
      })
      .addCase(getPaidComic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch paid comic";
      });

    // Update Comic
    builder
      .addCase(updateComic.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateComic.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (state.currentComic?._id === action.payload.data.comic._id) {
          state.currentComic = action.payload.data.comic;
        }
        state.successMessage = "Comic updated successfully";
      })
      .addCase(updateComic.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update comic";
      });

    // Update Comic Cover
    builder
      .addCase(updateComicCover.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateComicCover.fulfilled, (state, action) => {
        state.isUpdating = false;
        if (state.currentComic?._id === action.payload.data._id) {
          state.currentComic = action.payload.data.comic;
        }
        state.successMessage = "Comic cover updated successfully";
      })
      .addCase(updateComicCover.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update comic cover";
      });

    // Update Comic Token
    builder
      .addCase(updateComicToken.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateComicToken.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update current comic if it's the one being updated
        if (state.currentComic?._id === action.payload.data?.comic?._id) {
          state.currentComic = action.payload.data.comic;
        }
        // Update in comics list if exists
        if (state.comics && Array.isArray(state.comics)) {
          const index = state.comics.findIndex(
            (comic) => comic._id === action.payload.data?.comic?._id
          );
          if (index !== -1) {
            state.comics[index] = action.payload.data.comic;
          }
        }
        // Update in user comics if exists
        if (state.userComics && Array.isArray(state.userComics)) {
          const index = state.userComics.findIndex(
            (comic) => comic._id === action.payload.data?.comic?._id
          );
          if (index !== -1) {
            state.userComics[index] = action.payload.data.comic;
          }
        }
        state.successMessage = "Comic token information updated successfully";
      })
      .addCase(updateComicToken.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update comic token";
      });

    // Delete Comic
    builder
      .addCase(deleteComic.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteComic.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Remove from comics list
        if (state.comics && Array.isArray(state.comics)) {
          state.comics = state.comics.filter(
            (comic) => comic._id !== action.payload
          );
        }
        // Remove from user comics
        if (state.userComics && Array.isArray(state.userComics)) {
          state.userComics = state.userComics.filter(
            (comic) => comic._id !== action.payload
          );
        }
        // Clear current comic if it's the deleted one
        if (state.currentComic?._id === action.payload) {
          state.currentComic = null;
        }
        state.successMessage = "Comic deleted successfully";
      })
      .addCase(deleteComic.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete comic";
      });
  },
});

// Actions
export const {
  clearError,
  clearSuccessMessage,
  setCurrentComic,
  clearCurrentComic,
  clearPreviewComic,
} = comicSlice.actions;

// Selectors
export const selectComics = (state) => state.comic.comics;
export const selectUserComics = (state) => state.comic.userComics;
export const selectCurrentComic = (state) => state.comic.currentComic;
export const selectPreviewComic = (state) => state.comic.previewComic;
export const selectIsLoading = (state) => state.comic.isLoading;
export const selectIsCreating = (state) => state.comic.isCreating;
export const selectIsUpdating = (state) => state.comic.isUpdating;
export const selectIsDeleting = (state) => state.comic.isDeleting;
export const selectIsPreviewing = (state) => state.comic.isPreviewing;
export const selectComicError = (state) => state.comic.error;
export const selectSuccessMessage = (state) => state.comic.successMessage;

// Reducer
export default comicSlice.reducer;
