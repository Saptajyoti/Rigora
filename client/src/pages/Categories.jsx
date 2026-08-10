import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { imageUrl, useImageFallback } from '../lib/catalog';
import { useCatalogResources } from '../hooks/useCatalog';
import PageIntro from '../components/PageIntro';

export default function Categories() {
  const { categories, loading } = useCatalogResources();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PageIntro
          eyebrow="Explore"
          title="Component categories"
          description="Start with the part that defines your next system."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-zinc-500">Loading categories…</p>
          ) : (
            categories.map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="rigora-panel rigora-panel-interactive group overflow-hidden"
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
