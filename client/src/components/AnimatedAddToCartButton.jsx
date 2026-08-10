import { Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function AnimatedAddToCartButton({
  onAdd,
  disabled = false,
  className = '',
  icon = null,
  idleLabel = 'Add to cart',
  outOfStockLabel = 'Out of stock',
}) {
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState('idle');
  const requestInFlight = useRef(false);
  const resetTimeout = useRef(null);

  useEffect(
    () => () => {
      if (resetTimeout.current) window.clearTimeout(resetTimeout.current);
    },
    [],
  );

  const handleClick = async (event) => {
    if (requestInFlight.current || status !== 'idle' || disabled) return;

    try {
      requestInFlight.current = true;
      setStatus('pending');
      await onAdd(event);
      setStatus('added');
      resetTimeout.current = window.setTimeout(() => setStatus('idle'), 1250);
    } catch {
      setStatus('idle');
    } finally {
      requestInFlight.current = false;
    }
  };

  const label = disabled
    ? outOfStockLabel
    : status === 'pending'
      ? 'Adding...'
      : status === 'added'
        ? 'Added'
        : idleLabel;

  return (
    <motion.button
      type="button"
      disabled={disabled || status === 'pending'}
      onClick={handleClick}
      className={className}
      animate={
        reduceMotion || status !== 'added' ? { scale: 1 } : { scale: [1, 1.025, 1] }
      }
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : { type: 'spring', stiffness: 420, damping: 28, duration: 0.22 }
      }
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={label}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -3 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.16 }}
          className="flex items-center justify-center gap-2"
        >
          {status === 'added' ? <Check size={18} aria-hidden="true" /> : icon}
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
