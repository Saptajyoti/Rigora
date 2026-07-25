import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
export function OrderSuccess() {
  const { id } = useParams();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl font-semibold text-cyan-300">Order confirmed</h1>
        <p className="mt-4 text-zinc-400">Your build is officially in motion.</p>
        <Link
          to={`/orders/${id}`}
          className="mt-8 inline-block rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-zinc-950"
        >
          View order
        </Link>
      </main>
    </>
  );
}
export function OrderFailure() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-4xl font-semibold text-rose-300">Payment not completed</h1>
        <p className="mt-4 text-zinc-400">
          No stock has been reserved. You can retry checkout.
        </p>
        <Link
          to="/checkout"
          className="mt-8 inline-block rounded-xl border border-white/15 px-5 py-3"
        >
          Return to checkout
        </Link>
      </main>
    </>
  );
}
export function OrderTracking() {
  const { id } = useParams();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-20">
        <h1 className="text-3xl font-semibold">Order tracking</h1>
        <p className="mt-5 text-zinc-400">
          Track order #{id.slice(-8).toUpperCase()} from its order details page.
        </p>
        <Link to={`/orders/${id}`} className="mt-6 inline-block text-cyan-300">
          View order status →
        </Link>
      </main>
    </>
  );
}
