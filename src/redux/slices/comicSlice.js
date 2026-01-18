import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
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
      const formData = new FormData();
      formData.append("title", payload.title);
      if (payload.description) {
        formData.append("description", payload.description);
      }
      if (payload.coverImage) {
        formData.append("coverImage", payload.coverImage);
      }

      const response = await axiosInstance.post("/comics", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
        throw error.response || "Failed to create comic"
    }
  }
);

// Create a full comic with pages
export const createFullComic = createAsyncThunk(
  "comics/createFull",
  async (payload, { rejectWithValue }) => {
    try {
      console.log(payload)

      const response = await axiosInstance.post(`/comics/full/${payload.collectionId}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
        throw error.response || "Failed to create full comic"
    }
  }
);

// Get all comics
export const getAllComics = createAsyncThunk(
  "comics/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/comics/all");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ||
          "Failed to fetch comics"
      );
    }
  }
);

// Get user comics
export const getUserComics = createAsyncThunk(
  "comics/getUserComics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/comics/user_comic");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ||
          "Failed to fetch user comics"
      );
    }
  }
);

// Get comic by ID
export const getComicById = createAsyncThunk(
  "comics/getById",
  async ({id}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/comics/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ||
          "Failed to fetch comic"
      );
    }
  }
);

// Get comic preview
export const getComicPreview = createAsyncThunk(
  "comics/preview",
  async ({id}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/comics/preview/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        error.response ||
        "Failed to fetch comic preview"
      );
    }
  }
);

// Update comic
export const updateComic = createAsyncThunk(
  "comics/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/comics/${id}`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ||
          "Failed to update comic"
      );
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
        `/comics/${id}/cover`,
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
        error.response ||
          "Failed to update comic cover"
      );
    }
  }
);

// Delete comic
export const deleteComic = createAsyncThunk(
  "comics/delete",
  async ({id}, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/comics/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response ||
          "Failed to delete comic"
      );
    }
  }
);

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

    // Delete Comic
    builder
      .addCase(deleteComic.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteComic.fulfilled, (state, action) => {
        state.isDeleting = false;
        if (state.currentComic?.id === action.payload) {
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
export const selectComics = (state) => state.comics.comics;
export const selectUserComics = (state) => state.comics.userComics;
export const selectCurrentComic = (state) => state.comics.currentComic;
export const selectPreviewComic = (state) => state.comics.previewComic;
export const selectIsLoading = (state) => state.comics.isLoading;
export const selectIsCreating = (state) => state.comics.isCreating;
export const selectIsUpdating = (state) => state.comics.isUpdating;
export const selectIsDeleting = (state) => state.comics.isDeleting;
export const selectIsPreviewing = (state) => state.comics.isPreviewing;
export const selectComicError = (state) => state.comics.error;
export const selectSuccessMessage = (state) => state.comics.successMessage;

// Reducer
export default comicSlice.reducer;