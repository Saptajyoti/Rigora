import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import storeReducer from './storeSlice';
import orderReducer from './orderSlice';
import reviewReducer from './reviewSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    store: storeReducer,
    orders: orderReducer,
    reviews: reviewReducer,
  },
});
