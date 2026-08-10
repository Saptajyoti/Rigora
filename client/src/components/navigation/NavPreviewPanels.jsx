import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackageOpen,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { money } from '../../lib/catalog';

function PreviewLink({ children, description, icon: Icon, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-cyan-300/10"
    >
      {Icon && <Icon className="shrink-0 text-cyan-300" size={17} />}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{children}</span>
        {description && (
          <span className="block text-xs text-zinc-400">{description}</span>
        )}
      </span>
      <ArrowRight
        className="shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:text-cyan-300"
        size={15}
      />
    </Link>
  );
}

function PreviewTitle({ children, detail }) {
  return (
    <div className="px-3 pb-2 pt-1">
      <p className="rigora-kicker">{detail}</p>
      <h2 className="mt-1 text-sm font-semibold">{children}</h2>
    </div>
  );
}

export function BuildPreview() {
  return (
    <>
      <PreviewTitle detail="Rigora planner">Build your PC</PreviewTitle>
      <p className="px-3 pb-3 text-xs leading-5 text-zinc-400">
        Choose compatible, in-stock components and stay within your budget.
      </p>
      <PreviewLink
        icon={Sparkles}
        to="/build-planner"
        description="Start with your target spend"
      >
        Start a new build
      </PreviewLink>
      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/10 px-3 pt-3 text-xs">
        {['Gaming', 'Balanced', 'Creator'].map((item) => (
          <Link
            key={item}
            to="/build-planner"
            className="rigora-control border border-white/10 px-2 py-2 text-center transition hover:border-cyan-300/50 hover:text-cyan-300"
          >
            {item}
          </Link>
        ))}
      </div>
    </>
  );
}

export function CatalogPreview({ categories, loading, type }) {
  const isBrands = type === 'brands';
  const items = (isBrands ? categories.brands : categories.categories).slice(0, 6);
  const label = isBrands
    ? 'Featured brands'
    : type === 'products'
      ? 'Shop hardware'
      : 'Categories';
  const fallback = isBrands ? 'Brands are loading.' : 'Categories are loading.';

  return (
    <>
      <PreviewTitle detail="Rigora catalog">{label}</PreviewTitle>
      <div className="grid grid-cols-2 gap-1">
        {loading ? (
          <div className="col-span-2 px-3 py-5 text-xs text-zinc-400">{fallback}</div>
        ) : (
          items.map((item) => (
            <PreviewLink
              key={item._id}
              icon={isBrands ? undefined : Boxes}
              to={`/products?${isBrands ? 'brand' : 'category'}=${item._id}`}
              description={isBrands ? undefined : item.description || 'Explore parts'}
            >
              {item.name}
            </PreviewLink>
          ))
        )}
      </div>
      <div className="mt-2 border-t border-white/10 pt-2">
        <PreviewLink
          icon={PackageOpen}
          to={isBrands ? '/brands' : type === 'products' ? '/products' : '/categories'}
        >
          Browse all{' '}
          {isBrands ? 'brands' : type === 'products' ? 'products' : 'categories'}
        </PreviewLink>
      </div>
    </>
  );
}

export function OrdersPreview({ loading, orders }) {
  return (
    <>
      <PreviewTitle detail="Order activity">Recent orders</PreviewTitle>
      {loading ? (
        <div className="space-y-2 px-3 py-2">
          <div className="h-12 animate-pulse rounded-lg bg-white/10" />
          <div className="h-12 animate-pulse rounded-lg bg-white/10" />
        </div>
      ) : orders.length ? (
        <div className="space-y-1">
          {orders.slice(0, 2).map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block rounded-xl px-3 py-2.5 transition hover:bg-cyan-300/10"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold">
                  #{order._id.slice(-8).toUpperCase()}
                </span>
                <span>{money(order.grandTotal)}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{order.orderStatus}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="px-3 py-4 text-sm text-zinc-400">
          No orders yet. Your purchases will appear here.
        </p>
      )}
      <div className="mt-2 border-t border-white/10 pt-2">
        <PreviewLink icon={ClipboardList} to="/orders">
          View all orders
        </PreviewLink>
      </div>
    </>
  );
}

export function ProfilePreview({ onLogout, user, wishlistCount }) {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}` || 'R';

  if (!user)
    return (
      <>
        <PreviewTitle detail="Rigora account">Account</PreviewTitle>
        <p className="px-3 pb-3 text-xs leading-5 text-zinc-400">
          Sign in to access your account, orders, and wishlist.
        </p>
        <div className="grid grid-cols-2 gap-2 px-3">
          <Link
            to="/login"
            className="rigora-primary-action px-3 py-2 text-center text-sm"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rigora-control border border-white/15 px-3 py-2 text-center text-sm"
          >
            Create account
          </Link>
        </div>
      </>
    );

  return (
    <>
      <Link
        to="/profile"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-cyan-300/10"
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300/15 text-sm font-bold text-cyan-300">
            {initials.toUpperCase()}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          <span className="block truncate text-xs text-zinc-400">
            @{user.username || user.email}
          </span>
        </span>
      </Link>
      <div className="my-2 border-t border-white/10" />
      <PreviewLink
        icon={UserRound}
        to="/profile"
        description="View and edit account information"
      >
        My profile
      </PreviewLink>
      <PreviewLink
        icon={Heart}
        to="/wishlist"
        description={`${wishlistCount} saved item${wishlistCount === 1 ? '' : 's'}`}
      >
        Wishlist
      </PreviewLink>
      <PreviewLink
        icon={MessageSquare}
        to="/reviews"
        description="Manage your product reviews"
      >
        My reviews
      </PreviewLink>
      <div className="mt-2 border-t border-white/10 pt-2">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-300 transition hover:bg-rose-400/10"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </>
  );
}

export function AdminPreview() {
  return (
    <>
      <PreviewTitle detail="Restricted access">Admin control</PreviewTitle>
      <PreviewLink icon={LayoutDashboard} to="/admin" description="Catalog dashboard">
        Dashboard
      </PreviewLink>
      <PreviewLink
        icon={PackageOpen}
        to="/admin"
        description="Create and manage products"
      >
        Products
      </PreviewLink>
      <PreviewLink
        icon={ClipboardList}
        to="/admin/orders"
        description="Fulfillment and payment status"
      >
        Orders
      </PreviewLink>
      <PreviewLink
        icon={MessageSquare}
        to="/admin/reviews"
        description="Moderate customer feedback"
      >
        Reviews
      </PreviewLink>
    </>
  );
}
