import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useState } from 'react';

import { imageUrl, money, useImageFallback } from '../lib/catalog';
import { addToCart, toggleWishlist } from '../store/storeSlice';
import ProductBadges from './ProductBadges';
import AnimatedAddToCartButton from './AnimatedAddToCartButton';
import { springs, transitions, withReducedMotion } from '../motion/transitions';
import useFinePointer from '../hooks/useFinePointer';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const wishlist = useSelector((state) => state.store.wishlist?.products || []);

  const [loadingWish, setLoadingWish] = useState(false);
  const hasFinePointer = useFinePointer();
  const [wishlistFeedbackKey, setWishlistFeedbackKey] = useState(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [1, -1]), springs.depth);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-1, 1]), springs.depth);

  const isWishlisted = wishlist.some((item) => {
    const id = item.product?._id || item.product || item._id;
    return id === product._id;
  });

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await dispatch(addToCart({ product, quantity: 1 })).unwrap();
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWish) return;

    try {
      setLoadingWish(true);
      await dispatch(toggleWishlist(product._id)).unwrap();
      setWishlistFeedbackKey(Date.now());
    } catch {
      // Unauthenticated visitors can continue browsing without an unhandled rejection.
    } finally {
      setLoadingWish(false);
    }
  };

  const enableHoverMotion = hasFinePointer && !reduceMotion;
  const handlePointerMove = (event) => {
    if (!enableHoverMotion) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetPointerDepth = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <motion.article
      className="rigora-panel rigora-panel-interactive rigora-product-card group overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerDepth}
      whileHover={enableHoverMotion ? { y: -3 } : undefined}
      transition={withReducedMotion(reduceMotion, transitions.fast)}
      style={
        enableHoverMotion
          ? { rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }
          : undefined
      }
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          <ProductBadges product={product} />
          {product.images?.[0] ? (
            <img
              src={imageUrl(product.images[0])}
              alt={product.name}
              onError={useImageFallback}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-600">
              Rigora
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="rigora-kicker">{product.brand?.name || 'Rigora'}</p>

          <h3 className="mt-2 line-clamp-2 min-h-11 font-semibold text-zinc-100">
            {product.name}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <span className="font-semibold text-white">{money(product.price)}</span>

            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-zinc-500 line-through">
                {money(product.compareAtPrice)}
              </span>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <AnimatedAddToCartButton
              onAdd={handleAddToCart}
              disabled={product.stock <= 0}
              className="rigora-primary-action flex-1 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              idleLabel="Add to Cart"
              outOfStockLabel="Out of Stock"
            />

            <motion.button
              type="button"
              onClick={handleWishlist}
              disabled={loadingWish}
              key={wishlistFeedbackKey}
              initial={{ scale: 1 }}
              animate={
                reduceMotion || wishlistFeedbackKey === null
                  ? { scale: 1 }
                  : { scale: [1, 1.15, 1] }
              }
              transition={withReducedMotion(reduceMotion, springs.confirmation)}
              className={`rigora-control border px-4 py-2 text-lg transition ${
                isWishlisted
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-white/10 hover:border-red-400 hover:text-red-400'
              }`}
            >
              {loadingWish ? '...' : isWishlisted ? '♥' : '♡'}
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
