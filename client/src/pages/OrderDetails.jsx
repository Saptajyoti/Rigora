import { motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import OrderTimeline from '../components/OrderTimeline';
import PageIntro from '../components/PageIntro';
import SiteHeader from '../components/SiteHeader';
import { money } from '../lib/catalog';
import { getMotionVariants } from '../motion/variants';
import { cancelOrder, fetchOrder } from '../store/orderSlice';

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading, error } = useSelector((state) => state.orders);
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  if (error)
    return (
      <>
        <SiteHeader />
        <main className="p-10 text-rose-300">{error}</main>
      </>
    );
  if (loading || !order || order._id !== id)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-5 py-10">
          <div className="rigora-panel space-y-4 p-5">
            <div className="rigora-product-skeleton h-5 w-40 rounded" />
            <div className="rigora-product-skeleton h-4 w-64 rounded" />
            <div className="rigora-product-skeleton h-24 w-full rounded" />
          </div>
        </main>
      </>
    );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link to="/orders" className="text-cyan-300">
          Back to orders
        </Link>
        <motion.div
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mt-5" variants={variants.staggerItem}>
            <PageIntro
              eyebrow="Order details"
              title={`Order #${order._id.slice(-8).toUpperCase()}`}
              description={`${order.orderStatus} · Payment ${order.paymentStatus}`}
              action={
                ['pending', 'confirmed', 'processing'].includes(order.orderStatus) && (
                  <button
                    onClick={() => dispatch(cancelOrder(order._id))}
                    className="text-sm text-rose-300"
                  >
                    Cancel order
                  </button>
                )
              }
            />
          </motion.div>
          <motion.section
            className="rigora-panel mt-8 space-y-3 p-5"
            variants={variants.staggerItem}
          >
            <h2 className="font-semibold">Items</h2>
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between gap-4 text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{money(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-white/10 pt-4 font-semibold">
              <span>Total</span>
              <span>{money(order.grandTotal)}</span>
            </div>
          </motion.section>
          <motion.div variants={variants.staggerItem}>
            <OrderTimeline status={order.orderStatus} />
          </motion.div>
          <motion.div variants={variants.staggerItem}>
            <Link
              to={`/orders/${order._id}/tracking`}
              className="mt-6 inline-block text-cyan-300"
            >
              View tracking details
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </>
  );
}
