import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { imageUrl, money } from '../lib/catalog';
import { addToCart, toggleWishlist } from '../store/storeSlice';

export default function WishlistCard({ product }) {
  const dispatch = useDispatch();
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.04]">
      <Link to={`/products/${product.slug}`}>
        <div className="aspect-square bg-zinc-900">
          {product.images?.[0] && (
            <img
              src={imageUrl(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.slug}`} className="font-semibold">
          {product.name}
        </Link>
        <p className="mt-2 text-sm text-cyan-300">{money(product.price)}</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => dispatch(addToCart({ product }))}
            disabled={product.stock < 1}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-300 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            <ShoppingCart size={16} /> Add
          </button>
          <button
            aria-label={`Remove ${product.name} from wishlist`}
            onClick={() => dispatch(toggleWishlist(product._id))}
            className="rounded-lg border border-rose-400/40 px-3 text-rose-300"
          >
            <Heart size={17} fill="currentColor" />
          </button>
        </div>
      </div>
    </article>
  );
}
