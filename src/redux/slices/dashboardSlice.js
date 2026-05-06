import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axios-instance';

// ── Referral ──────────────────────────────────────────────────────────────────

export const getReferralCode = createAsyncThunk(
  'dashboard/getReferralCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/referrals/code');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to get referral code');
    }
  }
);

export const claimReferral = createAsyncThunk(
  'dashboard/claimReferral',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/referrals/claim/${code}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to claim referral');
    }
  }
);

export const getReferralHistory = createAsyncThunk(
  'dashboard/getReferralHistory',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const skip = (page - 1) * limit;
      const response = await axiosInstance.get('/referrals/history', { params: { limit, skip } });
      return { ...response.data, page };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to get referral history');
    }
  }
);

// ── Activity Feed ─────────────────────────────────────────────────────────────

export const getActivityFeed = createAsyncThunk(
  'dashboard/getActivityFeed',
  async ({ limit = 20, skip = 0, type } = {}, { rejectWithValue }) => {
    try {
      const params = { limit, skip };
      if (type) params.type = type;
      const response = await axiosInstance.get('/activity', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.response?.data || 'Failed to get activity feed');
    }
  }
);

// ── Check-in ──────────────────────────────────────────────────────────────────

export const checkIn = createAsyncThunk(
  'dashboard/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/checkin');
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) return rejectWithValue('already_checked_in');
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const getCheckinStreak = createAsyncThunk(
  'dashboard/getCheckinStreak',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/checkin/streak');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get streak');
    }
  }
);

// ── User Tasks ────────────────────────────────────────────────────────────────

export const getUserTasks = createAsyncThunk(
  'dashboard/getUserTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/usertasks');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get tasks');
    }
  }
);

export const claimUserTask = createAsyncThunk(
  'dashboard/claimUserTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/usertasks/${taskId}/claim`);
      return { ...response.data, taskId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim task');
    }
  }
);

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const getLeaderboard = createAsyncThunk(
  'dashboard/getLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/leaderboard/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get leaderboard');
    }
  }
);

export const getLeaderboardFull = createAsyncThunk(
  'dashboard/getLeaderboardFull',
  async ({ limit = 100 } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/leaderboard', { params: { limit } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get leaderboard');
    }
  }
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  referralCode: { data: null, isLoading: false, error: null },
  claimReferral: { isLoading: false, error: null, success: false },
  referralHistory: { data: [], total: 0, page: 1, isLoading: false, error: null },
  activityFeed: { data: [], isLoading: false, error: null },
  checkin: {
    streak: 0,
    lastCheckinDate: null,
    alreadyCheckedIn: false,
    isLoading: false,
    error: null,
  },
  userTasks: { data: [], isLoading: false, error: null },
  claimTask: { claimingId: null, error: null },
  leaderboard: { topUsers: [], currentUser: null, allUsers: [], isLoading: false, error: null },
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Referral Code
    builder
      .addCase(getReferralCode.pending, (state) => {
        state.referralCode.isLoading = true;
        state.referralCode.error = null;
      })
      .addCase(getReferralCode.fulfilled, (state, action) => {
        state.referralCode.isLoading = false;
        state.referralCode.data = action.payload?.data?.code ?? null;
      })
      .addCase(getReferralCode.rejected, (state, action) => {
        state.referralCode.isLoading = false;
        state.referralCode.error = action.payload;
      });

    // Claim Referral
    builder
      .addCase(claimReferral.pending, (state) => {
        state.claimReferral.isLoading = true;
        state.claimReferral.error = null;
        state.claimReferral.success = false;
      })
      .addCase(claimReferral.fulfilled, (state) => {
        state.claimReferral.isLoading = false;
        state.claimReferral.success = true;
      })
      .addCase(claimReferral.rejected, (state, action) => {
        state.claimReferral.isLoading = false;
        state.claimReferral.error = action.payload;
      });

    // Referral History
    builder
      .addCase(getReferralHistory.pending, (state) => {
        state.referralHistory.isLoading = true;
        state.referralHistory.error = null;
      })
      .addCase(getReferralHistory.fulfilled, (state, action) => {
        state.referralHistory.isLoading = false;
        state.referralHistory.data = action.payload?.data?.history ?? [];
        state.referralHistory.total = action.payload?.data?.total ?? 0;
        state.referralHistory.page = action.payload?.page ?? 1;
      })
      .addCase(getReferralHistory.rejected, (state, action) => {
        state.referralHistory.isLoading = false;
        state.referralHistory.error = action.payload;
      });

    // Activity Feed
    builder
      .addCase(getActivityFeed.pending, (state) => {
        state.activityFeed.isLoading = true;
        state.activityFeed.error = null;
      })
      .addCase(getActivityFeed.fulfilled, (state, action) => {
        state.activityFeed.isLoading = false;
        state.activityFeed.data = action.payload?.data ?? [];
      })
      .addCase(getActivityFeed.rejected, (state, action) => {
        state.activityFeed.isLoading = false;
        state.activityFeed.error = action.payload;
      });

    // Check-in
    builder
      .addCase(checkIn.pending, (state) => {
        state.checkin.isLoading = true;
        state.checkin.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.checkin.isLoading = false;
        state.checkin.streak = action.payload?.data?.streak ?? state.checkin.streak;
        state.checkin.alreadyCheckedIn = true;
        state.checkin.lastCheckinDate = new Date().toISOString();
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.checkin.isLoading = false;
        if (action.payload === 'already_checked_in') {
          state.checkin.alreadyCheckedIn = true;
        } else {
          state.checkin.error = action.payload;
        }
      });

    // Get Checkin Streak
    builder
      .addCase(getCheckinStreak.fulfilled, (state, action) => {
        state.checkin.streak = action.payload?.data?.streak ?? 0;
        state.checkin.lastCheckinDate = action.payload?.data?.lastCheckinDate ?? null;
        const last = action.payload?.data?.lastCheckinDate;
        if (last) {
          state.checkin.alreadyCheckedIn =
            new Date(last).toDateString() === new Date().toDateString();
        }
      })
      .addCase(getCheckinStreak.rejected, (state, action) => {
        state.checkin.error = action.payload;
      });

    // User Tasks
    builder
      .addCase(getUserTasks.pending, (state) => {
        state.userTasks.isLoading = true;
        state.userTasks.error = null;
      })
      .addCase(getUserTasks.fulfilled, (state, action) => {
        state.userTasks.isLoading = false;
        state.userTasks.data = action.payload?.data ?? [];
      })
      .addCase(getUserTasks.rejected, (state, action) => {
        state.userTasks.isLoading = false;
        state.userTasks.error = action.payload;
      });

    // Claim User Task
    builder
      .addCase(claimUserTask.pending, (state, action) => {
        state.claimTask.claimingId = action.meta.arg;
        state.claimTask.error = null;
      })
      .addCase(claimUserTask.fulfilled, (state, action) => {
        state.claimTask.claimingId = null;
        // Mark task as completed
        state.userTasks.data = state.userTasks.data.map((t) =>
          t._id === action.payload.taskId ? { ...t, completed: true } : t
        );
      })
      .addCase(claimUserTask.rejected, (state, action) => {
        state.claimTask.claimingId = null;
        state.claimTask.error = action.payload;
      });

    // Leaderboard (me)
    builder
      .addCase(getLeaderboard.pending, (state) => {
        state.leaderboard.isLoading = true;
        state.leaderboard.error = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.topUsers = action.payload?.data?.topUsers ?? [];
        state.leaderboard.currentUser = action.payload?.data?.currentUser ?? null;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.error = action.payload;
      });

    // Leaderboard Full
    builder
      .addCase(getLeaderboardFull.pending, (state) => {
        state.leaderboard.isLoading = true;
      })
      .addCase(getLeaderboardFull.fulfilled, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.allUsers = action.payload?.data ?? [];
      })
      .addCase(getLeaderboardFull.rejected, (state, action) => {
        state.leaderboard.isLoading = false;
        state.leaderboard.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
