import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../lib/api';

export const fetchProductReviews = createAsyncThunk(
  'reviews/product',
  async ({ productId, params }) =>
    (await api.get(`/products/${productId}/reviews`, { params })).data,
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ productId, form }) =>
    (
      await api.post(`/products/${productId}/reviews`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data.review,
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, form }) =>
    (
      await api.put(`/reviews/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data.review,
);

export const deleteReview = createAsyncThunk('reviews/delete', async (id) => {
  await api.delete(`/reviews/${id}`);
  return id;
});

export const toggleHelpful = createAsyncThunk(
  'reviews/helpful',
  async (id) => (await api.post(`/reviews/${id}/helpful`)).data.review,
);

export const fetchMyReviews = createAsyncThunk(
  'reviews/mine',
  async () => (await api.get('/reviews/me')).data.reviews,
);

export const fetchAdminReviews = createAsyncThunk(
  'reviews/admin',
  async (params) => (await api.get('/reviews/admin', { params })).data.reviews,
);

export const moderateReview = createAsyncThunk(
  'reviews/moderate',
  async ({ id, status }) =>
    (await api.put(`/reviews/admin/${id}/status`, { status })).data.review,
);

const initialState = {
  reviews: [],
  mine: [],
  admin: [],
  pagination: null,
  loading: false,
  mutationLoading: false,
  error: null,
};

const slice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Pending
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(updateReview.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(deleteReview.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(toggleHelpful.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })
      .addCase(moderateReview.pending, (state) => {
        state.mutationLoading = true;
        state.error = null;
      })

      // Fulfilled
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.mine = action.payload;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.reviews.unshift(action.payload);
        state.mine.unshift(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.mutationLoading = false;

        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );

        state.mine = state.mine.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.mutationLoading = false;
        state.reviews = state.reviews.filter((review) => review._id !== action.payload);
        state.mine = state.mine.filter((review) => review._id !== action.payload);
        state.admin = state.admin.filter((review) => review._id !== action.payload);
      })
      .addCase(toggleHelpful.fulfilled, (state, action) => {
        state.mutationLoading = false;

        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );

        state.mine = state.mine.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );
      })
      .addCase(moderateReview.fulfilled, (state, action) => {
        state.mutationLoading = false;

        state.admin = state.admin.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );

        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );
      })

      // Rejected
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.error.message;
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.error.message;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.error.message;
      })
      .addCase(toggleHelpful.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.error.message;
      })
      .addCase(moderateReview.rejected, (state, action) => {
        state.mutationLoading = false;
        state.error = action.error.message;
      });
  },
});

export default slice.reducer;
