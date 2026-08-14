import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/config/api";
import axiosInstance from "../axios-instance";

// Types
interface WalletAuthResponse {
  message: string;
}

interface WalletVerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface WalletAuthPayload {
  walletAddress: `0x${string}`;
}

interface WalletVerifyPayload {
  walletAddress: `0x${string}`;
  message: string;
  signature: `0x${string}`;
}

interface WalletAuthState {
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
  message: string | null;
  token: string | null;
  refreshToken: string | null;
  user: any | null;
  isAuthenticated: boolean;
  walletAddress: `0x${string}` | null;
}

// Initial state
const initialState: WalletAuthState = {
  isLoading: false,
  isVerifying: false,
  error: null,
  message: null,
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  walletAddress: null,
};

// Async thunks
export const walletAuth = createAsyncThunk<
  WalletAuthResponse,
  WalletAuthPayload,
  { rejectValue: string }
>("auth/walletAuth", async ({ walletAddress }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.auth.walletMessage, {
      walletAddress,
    });
    // Backend wraps responses as { data: { ... } } — same pattern as walletVerifyAuth
    return response.data.data ?? response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.response?.data ||
        "Failed to get wallet message"
    );
  }
});

export const walletVerifyAuth = createAsyncThunk<
  WalletVerifyResponse,
  WalletVerifyPayload,
  { rejectValue: string }
>("auth/walletVerifyAuth", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.auth.walletVerify, payload);

    // Store token in localStorage if needed
    if (response.data.data.accessToken) {
      localStorage.setItem("authToken", response.data.data.accessToken);
    }

    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.response?.data ||
        "Wallet verification failed"
    );
  }
});

export const creatorRegister = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>("auth/creatorRegister", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(API_ENDPOINTS.auth.becomeCreator(id), {});
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Creator registration failed"
    );
  }
});

const walletAuthSlice = createSlice({
  name: "walletAuth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.walletAddress = null;
      state.message = null;
      state.error = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
    },
    setWalletAddress: (state, action) => {
      state.walletAddress = action.payload;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.user = action.payload.user ?? null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Wallet Auth (Get Message)
    builder
      .addCase(walletAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(walletAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
      })
      .addCase(walletAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to get wallet message";
      });

    // Wallet Verify Auth
    builder
      .addCase(walletVerifyAuth.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(walletVerifyAuth.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(walletVerifyAuth.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload || "Wallet verification failed";
        state.isAuthenticated = false;
      });

    // Creator Register
    builder
      .addCase(creatorRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(creatorRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.isCreator = true;
        } else {
          state.error = "User data not found";
        }
      })
      .addCase(creatorRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Creator registration failed";
      });
  },
});

// Actions
export const { clearError, clearMessage, logout, setWalletAddress, setAuthenticated } =
  walletAuthSlice.actions;

// Selectors
export const selectWalletAuth = (state: { walletAuth: WalletAuthState }) =>
  state.walletAuth;
export const selectIsAuthenticated = (state: { walletAuth: WalletAuthState }) =>
  state.walletAuth.isAuthenticated;
export const selectUser = (state: { walletAuth: WalletAuthState }) =>
  state.walletAuth.user;
export const selectWalletAddress = (state: { walletAuth: WalletAuthState }) =>
  state.walletAuth.walletAddress;

// Reducer
export default walletAuthSlice.reducer;
