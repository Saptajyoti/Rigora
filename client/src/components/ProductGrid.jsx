import ProductCard from './ProductCard';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getMotionVariants, viewportOptions } from '../motion/variants';

export function ProductCardSkeleton() {
  return (
    <div className="rigora-panel overflow-hidden">
      <div className="rigora-product-skeleton aspect-square" />
      <div className="space-y-3 p-4">
        <div className="rigora-product-skeleton h-3 w-20 rounded" />
        <div className="rigora-product-skeleton h-5 w-5/6 rounded" />
        <div className="rigora-product-skeleton h-5 w-3/5 rounded" />
        <div className="rigora-product-skeleton mt-7 h-10 rounded-lg" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  animateOnView = false,
  resultKey = '',
}) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  if (loading && !products.length)
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  if (!products.length)
    return (
      <motion.p
        className="rigora-panel border-dashed p-10 text-center text-zinc-400"
        initial="hidden"
        animate="visible"
        variants={variants.scaleIn}
      >
        No hardware matches your filters.
      </motion.p>
    );

  if (animateOnView)
    return (
      <motion.div
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        variants={variants.staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
      >
        {products.map((product) => (
          <motion.div key={product._id} variants={variants.staggerItem}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    );

  return (
    <motion.div
      className="relative"
      animate={{ opacity: loading ? 0.42 : 1 }}
      transition={reduceMotion ? { duration: 0.01 } : { duration: 0.14 }}
      aria-busy={loading}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={resultKey || products.map((product) => product._id).join('-')}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {products.map((product) => (
            <motion.div key={product._id} variants={variants.staggerItem}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
