import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCurrentUser } from './store/authSlice';
import { loadStore, mergeGuestCart } from './store/storeSlice';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { OrderFailure, OrderSuccess, OrderTracking } from './pages/OrderStatus';
import AdminOrders from './pages/AdminOrders';
import MyReviews from './pages/MyReviews';
import AdminReviews from './pages/AdminReviews';
import BuildPlanner from './pages/BuildPlanner';

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PageTransition from './components/PageTransition';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { user, isInitialized } = useSelector((state) => state.auth);
  const guestItems = useSelector((state) => state.store.guest);

  // Restore authenticated user on app load
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // Hydrate cart & wishlist after authentication
  useEffect(() => {
    if (!isInitialized) return;

    if (user) {
      if (guestItems.length > 0) {
        dispatch(mergeGuestCart());
      } else {
        dispatch(loadStore());
      }
    }
  }, [dispatch, user, isInitialized, guestItems.length]);

  return (
    <PageTransition routeKey={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/build-planner" element={<BuildPlanner />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/orders/:id/tracking" element={<OrderTracking />} />
          <Route path="/orders/success/:id" element={<OrderSuccess />} />
          <Route path="/orders/failure/:id" element={<OrderFailure />} />
          <Route path="/reviews" element={<MyReviews />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
          </Route>
        </Route>
      </Routes>
    </PageTransition>
  );
}
