import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import EmptyState from '../components/EmptyState';
import SiteHeader from '../components/SiteHeader';
import WishlistCard from '../components/WishlistCard';
import { ProductCardSkeleton } from '../components/ProductGrid';
import { loadStore } from '../store/storeSlice';
import { useDispatch } from 'react-redux';
import PageIntro from '../components/PageIntro';
import { getMotionVariants } from '../motion/variants';

export default function Wishlist() {
  const { wishlist, loading, error } = useSelector((state) => state.store);
  const dispatch = useDispatch();
  const products = wishlist?.products || [];
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PageIntro
          eyebrow="Saved hardware"
          title="Wishlist"
          description="Keep the components worth revisiting in one place."
        />
        {loading && !wishlist ? (
          <div
            className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            aria-label="Loading wishlist"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8">
            <p className="text-rose-300">{error}</p>
            <button onClick={() => dispatch(loadStore())} className="mt-3 text-cyan-300">
              Retry
            </button>
          </div>
        ) : !products.length ? (
          <div className="mt-8">
            <motion.div variants={variants.scaleIn} initial="hidden" animate="visible">
              <EmptyState
                title="Your wishlist is empty"
                text="Save the hardware you want to revisit."
              />
            </motion.div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence initial={false} mode="popLayout">
              {products.map((product) => (
                <WishlistCard key={product._id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </>
  );
}
