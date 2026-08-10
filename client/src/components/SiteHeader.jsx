import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import MiniCart from './MiniCart';
import RigoraLogo from './RigoraLogo';
import ThemeToggle from './ThemeToggle';
import NavPreview from './navigation/NavPreview';
import {
  AdminPreview,
  BuildPreview,
  CatalogPreview,
  OrdersPreview,
  ProfilePreview,
} from './navigation/NavPreviewPanels';
import { useCatalogResources } from '../hooks/useCatalog';
import { logout } from '../store/authSlice';
import { fetchOrders } from '../store/orderSlice';

export default function SiteHeader() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cart, cartAddSequence, guest, totals, wishlist } = useSelector(
    (state) => state.store,
  );
  const reduceMotion = useReducedMotion();
  const { brands, categories, loading: catalogLoading } = useCatalogResources();
  const { loading: ordersLoading, orders } = useSelector((state) => state.orders);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [cartBadgeKey, setCartBadgeKey] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ordersPreviewOpened, setOrdersPreviewOpened] = useState(false);
  const ordersRequested = useRef(false);
  const itemCount = cart
    ? totals.itemCount
    : guest.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist?.products?.length || 0;
  const previousCart = useRef({ itemCount, sequence: cartAddSequence });

  useEffect(() => {
    const previous = previousCart.current;

    if (cartAddSequence > previous.sequence && itemCount > previous.itemCount) {
      setCartBadgeKey(cartAddSequence);
    }

    previousCart.current = { itemCount, sequence: cartAddSequence };
  }, [cartAddSequence, itemCount]);

  useEffect(() => {
    if (
      !ordersPreviewOpened ||
      !user ||
      orders.length > 0 ||
      ordersLoading ||
      ordersRequested.current
    )
      return;

    ordersRequested.current = true;
    dispatch(fetchOrders());
  }, [dispatch, orders.length, ordersLoading, ordersPreviewOpened, user]);

  const closeMobileNavigation = () => setMobileOpen(false);
  const catalogResources = { brands, categories };
  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <div className="rigora-glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-5 py-3">
        <Link to="/" aria-label="Rigora home" className="text-cyan-300">
          <RigoraLogo />
        </Link>
        <nav
          className={`${mobileOpen ? 'rigora-glass absolute left-3 right-3 top-[calc(100%+0.5rem)] flex rounded-xl px-5 py-6 shadow-xl shadow-black/20' : 'hidden'} flex-col items-start gap-5 text-sm md:static md:flex md:flex-row md:items-center md:gap-4 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          <div className="flex w-full flex-col items-start gap-5 md:hidden">
            <NavLink to="/products" onClick={closeMobileNavigation}>
              Products
            </NavLink>
            <NavLink to="/build-planner" onClick={closeMobileNavigation}>
              Build PC
            </NavLink>
            <NavLink to="/categories" onClick={closeMobileNavigation}>
              Categories
            </NavLink>
            <NavLink to="/brands" onClick={closeMobileNavigation}>
              Brands
            </NavLink>
            {user && user.role !== 'admin' && (
              <NavLink to="/orders" onClick={closeMobileNavigation}>
                Orders
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <>
                <NavLink to="/admin" onClick={closeMobileNavigation}>
                  Admin
                </NavLink>
                <NavLink to="/admin/orders" onClick={closeMobileNavigation}>
                  Orders
                </NavLink>
              </>
            )}
            <NavLink to={user ? '/profile' : '/login'} onClick={closeMobileNavigation}>
              {user ? 'Profile' : 'Sign in'}
            </NavLink>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <NavPreview label="Products" to="/products">
              <CatalogPreview
                categories={catalogResources}
                loading={catalogLoading}
                type="products"
              />
            </NavPreview>
            <NavPreview label="Build PC" to="/build-planner">
              <BuildPreview />
            </NavPreview>
            <NavPreview label="Categories" to="/categories">
              <CatalogPreview
                categories={catalogResources}
                loading={catalogLoading}
                type="categories"
              />
            </NavPreview>
            <NavPreview label="Brands" to="/brands">
              <CatalogPreview
                categories={catalogResources}
                loading={catalogLoading}
                type="brands"
              />
            </NavPreview>
            {user && user.role !== 'admin' && (
              <NavPreview
                label="Orders"
                to="/orders"
                onOpen={() => setOrdersPreviewOpened(true)}
              >
                <OrdersPreview loading={ordersLoading} orders={orders} />
              </NavPreview>
            )}
            {user?.role === 'admin' && (
              <>
                <NavPreview label="Admin" to="/admin">
                  <AdminPreview />
                </NavPreview>
                <NavPreview label="Orders" to="/admin/orders">
                  <AdminPreview />
                </NavPreview>
              </>
            )}
            <NavPreview
              label={user ? 'Profile' : 'Sign in'}
              to={user ? '/profile' : '/login'}
              align="right"
              triggerClassName="rigora-control border border-foreground/15 px-3 py-1.5 hover:border-cyan-300"
            >
              <ProfilePreview
                user={user}
                wishlistCount={wishlistCount}
                onLogout={() => dispatch(logout())}
              />
            </NavPreview>
          </div>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            aria-label="Search"
            to="/search"
            className="rigora-control p-2 text-zinc-300"
          >
            <Search size={18} />
          </Link>
          <ThemeToggle />
          <Link
            aria-label="Wishlist"
            to="/wishlist"
            className="rigora-control relative p-2 text-zinc-300"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-violet-500 px-1 text-[10px] text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Open cart"
            onClick={() => setMiniCartOpen(true)}
            className="rigora-control relative p-2 text-zinc-300"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <motion.span
                key={cartBadgeKey}
                initial={{ scale: 1 }}
                animate={
                  reduceMotion || cartBadgeKey === null
                    ? { scale: 1 }
                    : { scale: [1, 1.2, 1] }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.01 }
                    : { type: 'spring', stiffness: 480, damping: 24, duration: 0.24 }
                }
                className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] text-zinc-950"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
          <button
            className="rigora-control p-2 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <MiniCart open={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
    </header>
  );
}
