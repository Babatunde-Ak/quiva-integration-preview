import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  waitlist: {
    data: null,
    status: false,
    error: null
  }
};

export const waitlist = createAsyncThunk('waitlist', async (data) => {
  try {
    const response = await axios.post(`/waitlist`, data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw error;
  }
});

const authSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {
    clearWaitlistError: (state) => {
      state.waitlist.error = null;
    }
  },
  extraReducers: (builder) => {
    // Waitlist reducer
    builder.addCase(waitlist.pending, (state) => {
      state.waitlist.status = true;
      state.waitlist.error = null;
    });
    builder.addCase(waitlist.fulfilled, (state, action) => {
      state.waitlist.status = false;
      state.waitlist.data = action.payload;
    });
    builder.addCase(waitlist.rejected, (state, action) => {
      state.waitlist.status = false;
      state.waitlist.error = action.error.message;
    });
  }
});

export const { clearWaitlistError } = authSlice.actions;

export default authSlice.reducer;