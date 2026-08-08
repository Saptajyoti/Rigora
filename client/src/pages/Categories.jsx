import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { imageUrl, useImageFallback } from '../lib/catalog';
import { useCatalogResources } from '../hooks/useCatalog';

export default function Categories() {
  const { categories, loading } = useCatalogResources();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs uppercase tracking-[.25em] text-cyan-300">Explore</p>
        <h1 className="mt-2 text-3xl font-semibold">Component categories</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-zinc-500">Loading categories…</p>
          ) : (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="aspect-[16/8] bg-zinc-900">
                  {category.image && (
                    <img
                      src={imageUrl(category.image)}
                      alt=""
                      onError={useImageFallback}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold">{category.name}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{category.description}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
