import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import MiniCart from './MiniCart';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader() {
  const { user } = useSelector((state) => state.auth);
  const { cart, guest, totals, wishlist } = useSelector((state) => state.store);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = cart
    ? totals.itemCount
    : guest.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist?.products?.length || 0;
  return (
    <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-bold tracking-[.25em] text-cyan-300">
          RIGORA
        </Link>
        <nav
          className={`${mobileOpen ? 'absolute left-0 right-0 top-full flex border-b border-foreground/10 bg-background p-5' : 'hidden'} items-center gap-4 text-sm text-zinc-300 md:flex md:static md:border-0 md:bg-transparent md:p-0`}
        >
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/brands">Brands</Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/admin" className="text-cyan-300">
                Admin
              </Link>
              <Link to="/admin/orders" className="text-cyan-300">
                Orders
              </Link>
            </>
          )}
          <Link
            to={user ? '/profile' : '/login'}
            className="rounded-lg border border-foreground/15 px-3 py-1.5 text-foreground"
          >
            {user ? 'Profile' : 'Sign in'}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link aria-label="Search" to="/search" className="rounded-lg p-2 text-zinc-300">
            <Search size={18} />
          </Link>
          <ThemeToggle />
          <Link
            aria-label="Wishlist"
            to="/wishlist"
            className="relative rounded-lg p-2 text-zinc-300"
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
            className="relative rounded-lg p-2 text-zinc-300"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] text-zinc-950">
                {itemCount}
              </span>
            )}
          </button>
          <button
            className="p-2 md:hidden"
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
