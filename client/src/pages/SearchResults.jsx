import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import SiteHeader from '../components/SiteHeader';
import PageIntro from '../components/PageIntro';
import { useProducts } from '../hooks/useCatalog';

export default function SearchResults() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [term, setTerm] = useState(query);
  const { products, loading, error } = useProducts({
    search: query,
    limit: 24,
    page: 1,
    sort: 'newest',
  });
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <PageIntro
          eyebrow="Catalog search"
          title="Search Rigora"
          description="Find components by model, brand, or category."
        />
        <div className="mt-6 max-w-xl">
          <SearchBar
            value={term}
            onChange={setTerm}
            onSubmit={(event) => {
              event.preventDefault();
              setParams({ q: term.trim() });
            }}
          />
        </div>
        {query && (
          <p className="mt-7 text-zinc-400">
            Results for <span className="text-white">“{query}”</span>
          </p>
        )}
        {error ? (
          <p className="mt-8 text-rose-300">{error}</p>
        ) : (
          <div className="mt-6">
            <ProductGrid products={products} loading={loading} />
          </div>
        )}
      </main>
    </>
  );
}
