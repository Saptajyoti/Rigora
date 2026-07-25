import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';

import { imageUrl, money } from '../lib/catalog';
import { addToCart, toggleWishlist } from '../store/storeSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  const wishlist = useSelector((state) => state.store.wishlist?.products || []);

  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWish, setLoadingWish] = useState(false);

  const isWishlisted = wishlist.some((item) => {
    const id = item.product?._id || item.product || item._id;
    return id === product._id;
  });

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingCart) return;

    try {
      setLoadingCart(true);
      await dispatch(addToCart({ product, quantity: 1 })).unwrap();
    } finally {
      setLoadingCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingWish) return;

    try {
      setLoadingWish(true);
      await dispatch(toggleWishlist(product._id)).unwrap();
    } catch {
      // Unauthenticated visitors can continue browsing without an unhandled rejection.
    } finally {
      setLoadingWish(false);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:border-cyan-300/35"
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950">
          {product.images?.[0] ? (
            <img
              src={imageUrl(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-zinc-600">
              Rigora
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-widest text-cyan-300">
            {product.brand?.name || 'Rigora'}
          </p>

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
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={loadingCart || product.stock <= 0}
              className="flex-1 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingCart
                ? 'Adding...'
                : product.stock > 0
                  ? 'Add to Cart'
                  : 'Out of Stock'}
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              disabled={loadingWish}
              className={`rounded-xl border px-4 py-2 text-lg transition ${
                isWishlisted
                  ? 'border-red-500 bg-red-500/20 text-red-400'
                  : 'border-white/10 hover:border-red-400 hover:text-red-400'
              }`}
            >
              {loadingWish ? '...' : isWishlisted ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
