import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading }) {
  if (loading)
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-[.72] animate-pulse rounded-2xl bg-white/5"
          />
        ))}
      </div>
    );
  if (!products.length)
    return (
      <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-zinc-400">
        No hardware matches your filters.
      </p>
    );
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
