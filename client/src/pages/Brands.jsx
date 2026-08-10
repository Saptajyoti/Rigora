import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { imageUrl, useImageFallback } from '../lib/catalog';
import { useCatalogResources } from '../hooks/useCatalog';
import PageIntro from '../components/PageIntro';

export default function Brands() {
  const { brands, loading } = useCatalogResources();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PageIntro
          eyebrow="Partners"
          title="Trusted brands"
          description="Browse the hardware makers behind dependable performance."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-zinc-500">Loading brands…</p>
          ) : (
            brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/products?brand=${brand._id}`}
                className="rigora-panel rigora-panel-interactive p-6"
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
