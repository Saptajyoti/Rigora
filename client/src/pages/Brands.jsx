import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { imageUrl, useImageFallback } from '../lib/catalog';
import { useCatalogResources } from '../hooks/useCatalog';

export default function Brands() {
  const { brands, loading } = useCatalogResources();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs uppercase tracking-[.25em] text-cyan-300">Partners</p>
        <h1 className="mt-2 text-3xl font-semibold">Trusted brands</h1>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-zinc-500">Loading brands…</p>
          ) : (
            brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/products?brand=${brand._id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-300/40"
              >
                {brand.logo && (
                  <img
                    src={imageUrl(brand.logo)}
                    alt={`${brand.name} logo`}
                    onError={useImageFallback}
                    className="mb-5 h-10 max-w-32 object-contain object-left"
                  />
                )}
                <h2 className="font-semibold">{brand.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">{brand.description}</p>
              </Link>
            ))
          )}
        </div>
      </main>
    </>
  );
}
