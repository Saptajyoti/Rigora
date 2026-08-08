import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';
import { imageUrl, money, useImageFallback } from '../lib/catalog';
export default function CartItem({ item, onUpdate, onRemove }) {
  const product = item.product;
  return (
    <article className="flex gap-4 border-b border-white/10 py-5">
      <div className="h-20 w-20 overflow-hidden rounded-lg bg-zinc-900">
        {product.images?.[0] && (
          <img
            src={imageUrl(product.images[0])}
            alt=""
            onError={useImageFallback}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/products/${product.slug}`} className="font-semibold">
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-zinc-400">{money(product.price)}</p>
        <div className="mt-3 flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            max={product.stock}
            onChange={(quantity) => onUpdate(item._id, quantity)}
          />
          <button onClick={() => onRemove(item._id)} className="text-sm text-rose-300">
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
