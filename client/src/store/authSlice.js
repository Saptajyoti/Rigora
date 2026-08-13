import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../lib/api';

const getErrorMessage = (error) =>
  error.response?.data?.message || 'Something went wrong. Please try again.';

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.status === 401 ? null : getErrorMessage(error),
      );
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/admin/login', credentials);
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', details);
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (details, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/profile', details);
      return data.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

const initialState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.error = action.payload;
      })

      // Logout (must come BEFORE addMatcher)
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })

      // Pending matcher
      .addMatcher(
        (action) =>
          [
            login.pending.type,
            adminLogin.pending.type,
            register.pending.type,
            updateProfile.pending.type,
            logout.pending.type,
          ].includes(action.type),
        (state) => {
          state.isLoading = true;
          state.error = null;
        },
      )

      // Fulfilled matcher
      .addMatcher(
        (action) =>
          [
            login.fulfilled.type,
            adminLogin.fulfilled.type,
            register.fulfilled.type,
            updateProfile.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.user = action.payload;
        },
      )

      // Rejected matcher
      .addMatcher(
        (action) =>
          [
            login.rejected.type,
            adminLogin.rejected.type,
            register.rejected.type,
            updateProfile.rejected.type,
            logout.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
