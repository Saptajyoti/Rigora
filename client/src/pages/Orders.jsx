import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import EmptyState from '../components/EmptyState';
import { fetchOrders } from '../store/orderSlice';
import { money } from '../lib/catalog';
export default function Orders() {
  const { orders, loading, error } = useSelector((s) => s.orders);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-3xl font-semibold">Your orders</h1>
        {loading ? (
          <p className="mt-8 text-zinc-400">Loading orders…</p>
        ) : error ? (
          <p className="mt-8 text-rose-300">{error}</p>
        ) : !orders.length ? (
          <div className="mt-8">
            <EmptyState
              title="No orders yet"
              text="Your completed orders will appear here."
            />
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="block rounded-2xl border border-white/10 bg-white/[.04] p-5"
              >
                <div className="flex justify-between gap-5">
                  <div>
                    <p className="font-semibold">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                      {order.orderStatus}
                    </p>
                  </div>
                  <p className="font-semibold">{money(order.grandTotal)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
