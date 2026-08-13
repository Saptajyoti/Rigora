import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import OrderTimeline from '../components/OrderTimeline';
import SiteHeader from '../components/SiteHeader';
import { fetchOrder } from '../store/orderSlice';

export function OrderSuccess() {
  const { id } = useParams();
  const reduceMotion = useReducedMotion();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-cyan-300"
        >
          <motion.svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
            <motion.path
              d="m5 12 4.2 4.2L19 6.8"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
              transition={{
                duration: reduceMotion ? 0.01 : 0.24,
                delay: reduceMotion ? 0 : 0.1,
              }}
            />
          </motion.svg>
        </motion.div>
        <motion.h1
          className="mt-6 text-4xl font-semibold text-cyan-300"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.2,
            delay: reduceMotion ? 0 : 0.12,
          }}
        >
          Order confirmed
        </motion.h1>
        <motion.p
          className="mt-4 text-zinc-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.18,
            delay: reduceMotion ? 0 : 0.18,
          }}
        >
          Order #{id.slice(-8).toUpperCase()} is confirmed. Your build is officially in
          motion.
        </motion.p>
        <p className="mt-3 text-sm text-zinc-500">
          Review your order details and tracking updates next.
        </p>
        <Link
          to={`/orders/${id}`}
          className="rigora-primary-action mt-8 inline-block px-5 py-3"
        >
          View order
        </Link>
      </main>
    </>
  );
}

export function OrderFailure() {
  const reduceMotion = useReducedMotion();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-4xl font-semibold text-rose-300">Payment not completed</h1>
          <p className="mt-4 text-zinc-400">
            No stock has been reserved. You can retry checkout.
          </p>
          <Link
            to="/checkout"
            className="rigora-control mt-8 inline-block border border-white/15 px-5 py-3"
          >
            Return to checkout
          </Link>
        </motion.div>
      </main>
    </>
  );
}

export function OrderTracking() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  if (error)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20 text-rose-300">{error}</main>
      </>
    );
  if (loading || !order || order._id !== id)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20">
          <div className="rigora-panel space-y-4 p-5">
            <div className="rigora-product-skeleton h-5 w-40 rounded" />
            <div className="rigora-product-skeleton h-28 w-full rounded" />
          </div>
        </main>
      </>
    );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-20">
        <h1 className="text-3xl font-semibold">Order tracking</h1>
        <p className="mt-3 text-zinc-400">Order #{order._id.slice(-8).toUpperCase()}</p>
        <OrderTimeline status={order.orderStatus} />
        <Link to={`/orders/${order._id}`} className="mt-6 inline-block text-cyan-300">
          View order details
        </Link>
      </main>
    </>
  );
}
