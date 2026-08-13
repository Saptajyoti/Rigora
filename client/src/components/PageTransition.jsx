import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { transitions, withReducedMotion } from '../motion/transitions';

export default function PageTransition({ children, routeKey }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={routeKey}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
        transition={withReducedMotion(reduceMotion, transitions.standard)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
