import { ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { money } from '../lib/catalog';

export default function MiniCart({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const { cart, guest, totals } = useSelector((state) => state.store);
  const items = cart?.items || guest.map((item) => ({ ...item, product: item.product }));

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const drawerTransition = reduceMotion
    ? { duration: 0.16 }
    : { type: 'spring', stiffness: 360, damping: 34 };

  return (
    <AnimatePresence>
      {open && [
        <motion.button
          key="mini-cart-backdrop"
          aria-label="Close mini cart"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.18 }}
        />,
        <motion.aside
          key="mini-cart-drawer"
          aria-label="Shopping cart"
          className="rigora-glass fixed right-3 top-3 z-40 flex h-[calc(100%_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-sm flex-col rounded-2xl p-5 shadow-2xl shadow-black/30 sm:right-5 sm:top-5 sm:h-[calc(100%_-_2.5rem)] sm:w-full"
          initial={reduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
          transition={drawerTransition}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag size={18} /> Cart ({totals.itemCount})
            </h2>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="rigora-control p-2"
            >
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
              className="rigora-primary-action mt-4 block py-3 text-center text-sm"
            >
              View cart
            </Link>
          </div>
        </motion.aside>,
      ]}
    </AnimatePresence>
  );
}
