import { money } from '../lib/catalog';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
export default function CartSummary({ totals }) {
  const reduceMotion = useReducedMotion();
  return (
    <aside className="rigora-glass rounded-xl p-5">
      <h2 className="font-semibold">Order summary</h2>
      <div className="mt-5 flex justify-between text-sm">
        <span className="text-zinc-400">Subtotal</span>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={totals.subtotal}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.14 }}
          >
            {money(totals.subtotal)}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
        <span>Estimated total</span>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={totals.estimatedTotal}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.14 }}
          >
            {money(totals.estimatedTotal)}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        Taxes and shipping are calculated at checkout.
      </p>
    </aside>
  );
}
