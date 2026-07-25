import { ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { money } from '../lib/catalog';

export default function MiniCart({ open, onClose }) {
  const { cart, guest, totals } = useSelector((state) => state.store);
  const items = cart?.items || guest.map((item) => ({ ...item, product: item.product }));
  if (!open) return null;
  return (
    <>
      <button
        aria-label="Close mini cart"
        onClick={onClose}
        className="fixed inset-0 z-30 bg-black/60"
      />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-[#090b12] p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShoppingBag size={18} /> Cart ({totals.itemCount})
          </h2>
          <button onClick={onClose} aria-label="Close cart">
            <X />
          </button>
        </div>
        <div className="mt-6 flex-1 space-y-4 overflow-auto">
          {items.length ? (
            items.map((item) => (
              <div
                key={item._id || item.productId}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="line-clamp-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span>{money(item.product.price * item.quantity)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">Your cart is empty.</p>
          )}
        </div>
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>
          <Link
            onClick={onClose}
            to="/cart"
            className="mt-4 block rounded-xl bg-cyan-300 py-3 text-center text-sm font-semibold text-zinc-950"
          >
            View cart
          </Link>
        </div>
      </aside>
    </>
  );
}
