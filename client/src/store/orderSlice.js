import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../lib/api';
export const checkout = createAsyncThunk(
  'orders/checkout',
  async (payload) => (await api.post('/orders/checkout', payload)).data,
);
export const verifyRazorpayPayment = createAsyncThunk(
  'orders/verify',
  async (payload) => (await api.post('/orders/verify-payment', payload)).data,
);
export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async () => (await api.get('/orders/my')).data.orders,
);
export const fetchOrder = createAsyncThunk(
  'orders/fetchOne',
  async (id) => (await api.get(`/orders/${id}`)).data.order,
);
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (id) => (await api.put(`/orders/${id}/cancel`)).data.order,
);
export const updateOrderStatus = createAsyncThunk(
  'orders/update',
  async ({ id, ...payload }) =>
    (await api.put(`/orders/admin/${id}`, payload)).data.order,
);
const slice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    current: null,
    loading: false,
    error: null,
    success: false,
    payment: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.error = null;
      state.success = false;
      state.payment = null;
    },
  },
  extraReducers: (builder) =>
    builder
      .addMatcher(
        (action) => action.type.startsWith('orders/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('orders/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith('orders/') && action.type.endsWith('/fulfilled'),
        (state, action) => {
          state.loading = false;
          state.success = true;
          if (action.type === fetchOrders.fulfilled.type) state.orders = action.payload;
          else if (action.payload?.order) state.current = action.payload.order;
          else if (action.type === fetchOrder.fulfilled.type)
            state.current = action.payload;
        },
      ),
});
export const { clearOrderState } = slice.actions;
export default slice.reducer;
