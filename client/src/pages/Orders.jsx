import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EmptyState from '../components/EmptyState';
import PageIntro from '../components/PageIntro';
import SiteHeader from '../components/SiteHeader';
import { money } from '../lib/catalog';
import { getMotionVariants } from '../motion/variants';
import { fetchOrders } from '../store/orderSlice';

function OrderSkeleton() {
  return (
    <div className="rigora-panel p-5">
      <div className="flex justify-between gap-5">
        <div className="space-y-3">
          <div className="rigora-product-skeleton h-4 w-32 rounded" />
          <div className="rigora-product-skeleton h-3 w-48 rounded" />
        </div>
        <div className="rigora-product-skeleton h-5 w-20 rounded" />
      </div>
    </div>
  );
}

export default function Orders() {
  const { orders, loading, error } = useSelector((state) => state.orders);
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <PageIntro
          eyebrow="Order archive"
          title="Your orders"
          description="Track and revisit every completed Rigora order."
        />
        {loading ? (
          <div className="mt-8 space-y-4" aria-label="Loading orders">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
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
          <motion.div
            className="mt-8 space-y-4"
            variants={variants.staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {orders.map((order) => (
              <motion.div key={order._id} variants={variants.staggerItem}>
                <Link
                  to={`/orders/${order._id}`}
                  className="rigora-panel rigora-panel-interactive block p-5"
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </>
  );
}
