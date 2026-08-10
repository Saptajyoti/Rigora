import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import SiteHeader from '../components/SiteHeader';
import { cancelOrder, fetchOrder } from '../store/orderSlice';
import { money } from '../lib/catalog';
import PageIntro from '../components/PageIntro';
export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading, error } = useSelector((s) => s.orders);
  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);
  if (loading || !order)
    return (
      <>
        <SiteHeader />
        <main className="p-10 text-zinc-400">Loading order…</main>
      </>
    );
  if (error)
    return (
      <>
        <SiteHeader />
        <main className="p-10 text-rose-300">{error}</main>
      </>
    );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link to="/orders" className="text-cyan-300">
          ← Orders
        </Link>
        <div className="mt-5">
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
        </div>
        <div className="rigora-panel mt-8 space-y-3 p-5">
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{money(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-4 font-semibold">
            <span>Total</span>
            <span>{money(order.grandTotal)}</span>
          </div>
        </div>
        <Link
          to={`/orders/${order._id}/tracking`}
          className="mt-6 inline-block text-cyan-300"
        >
          Track order →
        </Link>
      </main>
    </>
  );
}
