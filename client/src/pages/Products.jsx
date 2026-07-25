import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import SiteHeader from '../components/SiteHeader';
import { useCatalogResources, useProducts } from '../hooks/useCatalog';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    sort: 'newest',
    search: '',
    page: 1,
    limit: 12,
  });
  const { categories, brands } = useCatalogResources();
  const { products, pagination, loading, error } = useProducts(filters);
  const [term, setTerm] = useState('');
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[.25em] text-cyan-300">Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold">Engineered to perform.</h1>
          </div>
          <SearchBar
            value={term}
            onChange={setTerm}
            onSubmit={(event) => {
              event.preventDefault();
              setFilters({ ...filters, search: term, page: 1 });
            }}
          />
        </div>
        <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={setFilters}
          />
          <section>
            {error && <p className="mb-4 text-rose-300">{error}</p>}
            <ProductGrid products={products} loading={loading} />
            <Pagination
              pagination={pagination}
              onChange={(page) => setFilters({ ...filters, page })}
            />
          </section>
        </div>
      </main>
    </>
  );
}
