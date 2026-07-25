import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../lib/api';

const guestKey = 'rigora_guest_cart';

const readGuest = () => {
  if (typeof window === 'undefined') return [];

  try {
    const items = JSON.parse(localStorage.getItem(guestKey) || '[]');

    if (!Array.isArray(items)) return [];

    return items.filter(
      (item) =>
        item &&
        item.productId &&
        item.product &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    localStorage.removeItem(guestKey);
    return [];
  }
};

const saveGuest = (items) => {
  try {
    localStorage.setItem(guestKey, JSON.stringify(items));
  } catch {
    // Ignore storage errors.
  }
};

const guestTotals = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0,
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    estimatedTotal: subtotal,
    itemCount,
  };
};

const initialGuest = readGuest();

export const loadStore = createAsyncThunk(
  'store/load',
  async (_, { rejectWithValue }) => {
    try {
      const [cart, wishlist] = await Promise.all([
        api.get('/cart'),
        api.get('/wishlist'),
      ]);

      return {
        ...cart.data,
        wishlist: wishlist.data.wishlist,
      };
    } catch (error) {
      return rejectWithValue(error.response?.status);
    }
  },
);

export const mergeGuestCart = createAsyncThunk('store/merge', async (_, { dispatch }) => {
  const items = readGuest();

  if (items.length) {
    await api.post('/cart/merge', { items });
    localStorage.removeItem(guestKey);
  }

  return dispatch(loadStore()).unwrap();
});

export const addToCart = createAsyncThunk(
  'store/add',
  async ({ product, quantity = 1 }, { getState }) => {
    if (!getState().auth.user) {
      const items = readGuest();

      const existing = items.find((item) => item.productId === product._id);

      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        items.push({
          productId: product._id,
          quantity: Math.min(quantity, product.stock),
          product,
        });
      }

      saveGuest(items);

      return {
        guest: items,
        totals: guestTotals(items),
      };
    }

    const { data } = await api.post('/cart/items', {
      productId: product._id,
      quantity,
    });

    return data;
  },
);

export const updateCart = createAsyncThunk(
  'store/update',
  async ({ itemId, quantity }, { getState }) => {
    if (!getState().auth.user) {
      const items = readGuest();

      const item = items.find((i) => i.productId === itemId);

      if (item) {
        item.quantity = Math.min(quantity, item.product.stock);
      }

      saveGuest(items);

      return {
        guest: items,
        totals: guestTotals(items),
      };
    }

    const { data } = await api.put(`/cart/items/${itemId}`, {
      quantity,
    });

    return data;
  },
);

export const removeCart = createAsyncThunk(
  'store/remove',
  async (itemId, { getState }) => {
    if (!getState().auth.user) {
      const items = readGuest().filter((item) => item.productId !== itemId);

      saveGuest(items);

      return {
        guest: items,
        totals: guestTotals(items),
      };
    }

    const { data } = await api.delete(`/cart/items/${itemId}`);

    return data;
  },
);

export const clearGuestCart = createAsyncThunk('store/clearGuest', async () => {
  localStorage.removeItem(guestKey);
  return [];
});

export const toggleWishlist = createAsyncThunk('store/wish', async (productId) => {
  const { data } = await api.post('/wishlist/toggle', {
    productId,
  });

  return data;
});
const slice = createSlice({
  name: 'store',
  initialState: {
    cart: null,
    totals: guestTotals(initialGuest),
    wishlist: null,
    guest: initialGuest,
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    // -----------------------------
    // Pending
    // -----------------------------
    builder
      .addCase(loadStore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // -----------------------------
      // Fulfilled
      // -----------------------------
      .addCase(loadStore.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.totals = action.payload.totals;
        state.wishlist = action.payload.wishlist;
        state.guest = [];
      })

      .addCase(mergeGuestCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.totals = action.payload.totals;
        state.wishlist = action.payload.wishlist;
        state.guest = [];
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.guest) {
          state.guest = action.payload.guest;
          state.totals = action.payload.totals;
        } else {
          state.cart = action.payload.cart;
          state.totals = action.payload.totals;
        }
      })

      .addCase(updateCart.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.guest) {
          state.guest = action.payload.guest;
          state.totals = action.payload.totals;
        } else {
          state.cart = action.payload.cart;
          state.totals = action.payload.totals;
        }
      })

      .addCase(removeCart.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.guest) {
          state.guest = action.payload.guest;
          state.totals = action.payload.totals;
        } else {
          state.cart = action.payload.cart;
          state.totals = action.payload.totals;
        }
      })

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload.wishlist;
      })

      .addCase(clearGuestCart.fulfilled, (state) => {
        state.loading = false;
        state.guest = [];
        state.totals = {
          itemCount: 0,
          subtotal: 0,
          estimatedTotal: 0,
        };
      })

      // -----------------------------
      // Rejected
      // -----------------------------
      .addCase(loadStore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});
export default slice.reducer;
