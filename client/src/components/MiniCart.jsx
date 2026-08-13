import { ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { money } from '../lib/catalog';
import { springs, withReducedMotion } from '../motion/transitions';
import { getMotionVariants } from '../motion/variants';

export default function MiniCart({ open, onClose }) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const { cart, guest, totals } = useSelector((state) => state.store);
  const items = cart?.items || guest.map((item) => ({ ...item, product: item.product }));
  const closeButtonRef = useRef(null);
  const focusTimerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    focusTimerRef.current = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && [
        <motion.button
          key="mini-cart-backdrop"
          type="button"
          tabIndex={-1}
          aria-label="Close mini cart"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60"
          variants={variants.fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        />,
        <motion.aside
          key="mini-cart-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className="rigora-glass rigora-floating-surface fixed right-3 top-3 z-40 flex h-[calc(100%_-_1.5rem)] w-[calc(100%_-_1.5rem)] max-w-md flex-col rounded-2xl p-5 shadow-2xl shadow-black/30 sm:right-5 sm:top-5 sm:h-[calc(100%_-_2.5rem)] sm:w-full"
          variants={variants.drawer}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={withReducedMotion(reduceMotion, springs.drawer)}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag size={18} /> Cart ({totals.itemCount})
            </h2>
            <button
              type="button"
              onClick={onClose}
              ref={closeButtonRef}
              aria-label="Close cart"
              className="rigora-control p-2"
            >
              <X />
            </button>
          </div>
          <div className="mt-6 flex-1 space-y-4 overflow-auto" aria-busy={false}>
            {items.length ? (
              <AnimatePresence initial={false} mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item._id || item.productId}
                    layout={!reduceMotion}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                    transition={withReducedMotion(reduceMotion, { duration: 0.16 })}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="line-clamp-2">
                      {item.product.name} x {item.quantity}
                    </span>
                    <AnimatePresence initial={false} mode="wait">
                      <motion.span
                        key={`${item._id || item.productId}-${item.quantity}`}
                        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={withReducedMotion(reduceMotion, { duration: 0.14 })}
                      >
                        {money(item.product.price * item.quantity)}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.p
                className="text-sm text-zinc-500"
                variants={variants.scaleIn}
                initial="hidden"
                animate="visible"
              >
                Your cart is empty.
              </motion.p>
            )}
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={totals.subtotal}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={withReducedMotion(reduceMotion, { duration: 0.14 })}
                >
                  {money(totals.subtotal)}
                </motion.span>
              </AnimatePresence>
            </div>
            {items.length > 0 && (
              <Link
                onClick={onClose}
                to="/checkout"
                className="rigora-primary-action mt-4 block py-3 text-center text-sm"
              >
                Checkout
              </Link>
            )}
            <Link
              onClick={onClose}
              to="/cart"
              className="rigora-control mt-3 block border border-white/15 py-3 text-center text-sm"
            >
              View cart
            </Link>
          </div>
        </motion.aside>,
      ]}
    </AnimatePresence>
  );
}
