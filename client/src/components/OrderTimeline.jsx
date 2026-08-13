import { Check, CircleX } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const stages = [
  { key: 'pending', label: 'Order placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTimeline({ status }) {
  const reduceMotion = useReducedMotion();
  const currentIndex = stages.findIndex((stage) => stage.key === status);
  const isCancelled = status === 'cancelled';
  const progress = currentIndex < 0 ? 0 : (currentIndex / (stages.length - 1)) * 100;

  if (isCancelled)
    return (
      <section className="rigora-panel mt-8 p-5">
        <div className="flex items-center gap-3 text-rose-300">
          <CircleX size={20} />
          <div>
            <h2 className="font-semibold">Order cancelled</h2>
            <p className="mt-1 text-sm text-zinc-400">
              This order is no longer progressing.
            </p>
          </div>
        </div>
      </section>
    );

  return (
    <section className="rigora-panel mt-8 p-5" aria-label="Order tracking progress">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="rigora-kicker">Order tracking</p>
          <h2 className="mt-1 font-semibold">Current status: {status}</h2>
        </div>
        <span className="text-sm text-cyan-300">
          Stage {Math.max(currentIndex + 1, 1)} of {stages.length}
        </span>
      </div>
      <ol className="relative mt-6 grid gap-5 md:grid-cols-5 md:gap-0">
        <div className="absolute left-[10%] right-[10%] top-4 hidden h-px bg-white/10 md:block" />
        <motion.div
          className="absolute left-[10%] right-[10%] top-4 hidden h-px origin-left bg-cyan-300 md:block"
          initial={false}
          animate={{ scaleX: progress / 100 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: [0.22, 1, 0.36, 1] }}
        />
        {stages.map((stage, index) => {
          const completed = index < currentIndex;
          const current = index === currentIndex;
          return (
            <li
              key={stage.key}
              className={`relative flex items-center gap-3 md:flex-col md:items-center md:text-center ${
                index < stages.length - 1
                  ? 'after:absolute after:left-4 after:top-8 after:h-5 after:w-px after:bg-white/10 md:after:hidden'
                  : ''
              }`}
            >
              <motion.span
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: reduceMotion ? 0.01 : 0.16,
                  delay: reduceMotion ? 0 : index * 0.03,
                }}
                className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs ${
                  completed
                    ? 'border-cyan-300 bg-cyan-300 text-zinc-950'
                    : current
                      ? 'border-cyan-300 bg-cyan-300/10 text-cyan-300'
                      : 'border-white/15 bg-[hsl(var(--rigora-surface))] text-zinc-500'
                }`}
              >
                {completed ? <Check size={15} aria-label="Completed" /> : index + 1}
              </motion.span>
              <span
                className={`text-sm ${
                  current
                    ? 'font-semibold text-cyan-300'
                    : completed
                      ? 'text-zinc-200'
                      : 'text-zinc-500'
                }`}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
