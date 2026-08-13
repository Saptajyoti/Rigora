import { Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { springs, withReducedMotion } from '../motion/transitions';

export default function AnimatedWishlistButton({
  onToggle,
  isWishlisted,
  className = '',
  label = 'Toggle wishlist',
}) {
  const reduceMotion = useReducedMotion();
  const [pending, setPending] = useState(false);
  const [feedbackKey, setFeedbackKey] = useState(null);

  const handleToggle = async (event) => {
    if (pending) return;

    try {
      setPending(true);
      await onToggle(event);
      setFeedbackKey(Date.now());
    } catch {
      // A failed request must not show a saved-state confirmation.
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      key={feedbackKey}
      initial={{ scale: 1 }}
      animate={
        reduceMotion || feedbackKey === null ? { scale: 1 } : { scale: [1, 1.15, 1] }
      }
      transition={withReducedMotion(reduceMotion, springs.confirmation)}
      aria-label={label}
      aria-pressed={isWishlisted}
      className={className}
    >
      <Heart fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
    </motion.button>
  );
}
