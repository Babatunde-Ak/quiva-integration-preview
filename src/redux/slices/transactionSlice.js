import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { API_ENDPOINTS } from "@/config/api";
import axiosInstance from "../axios-instance";

// Initial state
const initialState = {
    transactions: null,
    userTransactions: null,
    currentTransaction: null,
    comicBuyers: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isVerifying: false,
    error: null,
    successMessage: null
};

// Async thunks Get all transactions
export const getAllTransactions = createAsyncThunk("transactions/getAll", async({
    limit = 200,
    skip = 0
} = {}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.transactions.root, {
            params: {
                limit,
                skip
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to fetch transactions");
    }
});

// Create a new transaction
export const createTransaction = createAsyncThunk("transactions/create", 
    async({comicId, walletAddress, txHash, price, currency}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.post(API_ENDPOINTS.transactions.root, {comicId, walletAddress, txHash, price, currency}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to create transaction");
    }
});

// Get all user transactions
export const getAllUserTransactions = createAsyncThunk("transactions/getUserAll", async(_, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.transactions.userAll);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to fetch user transactions");
    }
});

// Verify if user has purchased NFT
export const verifyNftPurchase = createAsyncThunk("transactions/verifyNft", async({
    comicId
}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.transactions.verifyNft(comicId));
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to verify NFT purchase");
    }
});

// Get buyers for a specific comic
export const getBuyersByComic = createAsyncThunk("transactions/getBuyersByComic", async({
    comicId
}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.transactions.byComic(comicId));
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to fetch comic buyers");
    }
});

// Get transaction by hash
export const getTransactionByHash = createAsyncThunk("transactions/getByHash", async({
    txHash
}, {rejectWithValue}) => {
    try {
        const response = await axiosInstance.get(API_ENDPOINTS.transactions.byHash(txHash));
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to fetch transaction");
    }
});

// Update transaction status
export const updateTransactionStatus = createAsyncThunk("transactions/updateStatus", async({
    txHash,
    newStatus
}, {rejectWithValue}) => {

    try {
        const response = await axiosInstance.put(API_ENDPOINTS.transactions.status, {txHash, newStatus});
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response
            ?.data
                ?.message || error.message || "Failed to update transaction status");
    }
});

const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        },
        setCurrentTransaction: (state, action) => {
            state.currentTransaction = action.payload;
        },
        clearCurrentTransaction: (state) => {
            state.currentTransaction = null;
        },
        clearComicBuyers: (state) => {
            state.comicBuyers = null;
        }
    },
    extraReducers: (builder) => {
        // Get All Transactions
        builder.addCase(getAllTransactions.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getAllTransactions.fulfilled, (state, action) => {
            state.isLoading = false;
            state.transactions = action.payload;
        }).addCase(getAllTransactions.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch transactions";
        });

        // Create Transaction
        builder.addCase(createTransaction.pending, (state) => {
            state.isCreating = true;
            state.error = null;
        }).addCase(createTransaction.fulfilled, (state, action) => {
            state.isCreating = false;
            // Add new transaction to the list if it exists
            if (state.transactions
                ?.data) {
                state
                    .transactions
                    .data
                    .unshift(action.payload.data);
            }
            if (state.userTransactions
                ?.data) {
                state
                    .userTransactions
                    .data
                    .unshift(action.payload.data);
            }
            state.successMessage = "Transaction created successfully";
        }).addCase(createTransaction.rejected, (state, action) => {
            state.isCreating = false;
            state.error = action.payload || "Failed to create transaction";
        });

        // Get All User Transactions
        builder.addCase(getAllUserTransactions.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getAllUserTransactions.fulfilled, (state, action) => {
            state.isLoading = false;
            state.userTransactions = action.payload;
        }).addCase(getAllUserTransactions.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch user transactions";
        });

        // Verify NFT Purchase
        builder.addCase(verifyNftPurchase.pending, (state) => {
            state.isVerifying = true;
            state.error = null;
        }).addCase(verifyNftPurchase.fulfilled, (state, action) => {
            state.isVerifying = false;
            // Store verification result in currentTransaction for easy access
            state.currentTransaction = action.payload;
        }).addCase(verifyNftPurchase.rejected, (state, action) => {
            state.isVerifying = false;
            state.error = action.payload || "Failed to verify NFT purchase";
        });

        // Get Buyers by Comic
        builder.addCase(getBuyersByComic.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getBuyersByComic.fulfilled, (state, action) => {
            state.isLoading = false;
            state.comicBuyers = action.payload;
        }).addCase(getBuyersByComic.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch comic buyers";
        });

        // Get Transaction by Hash
        builder.addCase(getTransactionByHash.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        }).addCase(getTransactionByHash.fulfilled, (state, action) => {
            state.isLoading = false;
            state.currentTransaction = action.payload.data;
        }).addCase(getTransactionByHash.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch transaction";
        });

        // Update Transaction Status
        builder.addCase(updateTransactionStatus.pending, (state) => {
            state.isUpdating = true;
            state.error = null;
        }).addCase(updateTransactionStatus.fulfilled, (state, action) => {
            state.isUpdating = false;

            // Update the transaction in the current transaction if it matches
            if (state.currentTransaction
                ?.txHash === action.payload.data.txHash) {
                state.currentTransaction = action.payload.data;
            }

            // Update in the transactions list
            if (state.transactions
                ?.data) {
                const index = state
                    .transactions
                    .data
                    .findIndex(tx => tx.txHash === action.payload.data.txHash);
                if (index !== -1) {
                    state.transactions.data[index] = action.payload.data;
                }
            }

            // Update in user transactions list
            if (state.userTransactions
                ?.data) {
                const index = state
                    .userTransactions
                    .data
                    .findIndex(tx => tx.txHash === action.payload.data.txHash);
                if (index !== -1) {
                    state.userTransactions.data[index] = action.payload.data;
                }
            }

            state.successMessage = "Transaction status updated successfully";
        }).addCase(updateTransactionStatus.rejected, (state, action) => {
            state.isUpdating = false;
            state.error = action.payload || "Failed to update transaction status";
        });
    }
});

// Actions
export const {
    clearError,
    clearSuccessMessage,
    setCurrentTransaction,
    clearCurrentTransaction,
    clearComicBuyers
} = transactionSlice.actions;

// Selectors
export const selectTransactions = (state) => state.transactions.transactions;
export const selectUserTransactions = (state) => state.transactions.userTransactions;
export const selectCurrentTransaction = (state) => state.transactions.currentTransaction;
export const selectComicBuyers = (state) => state.transactions.comicBuyers;
export const selectIsLoading = (state) => state.transactions.isLoading;
export const selectIsCreating = (state) => state.transactions.isCreating;
export const selectIsUpdating = (state) => state.transactions.isUpdating;
export const selectIsVerifying = (state) => state.transactions.isVerifying;
export const selectTransactionError = (state) => state.transactions.error;
export const selectTransactionSuccessMessage = (state) => state.transactions.successMessage;

// Reducer
export default transactionSlice.reducer;
