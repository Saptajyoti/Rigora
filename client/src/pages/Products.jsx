import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import PageIntro from '../components/PageIntro';
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
        <PageIntro
          eyebrow="Catalog"
          title="Engineered to perform."
          description="Search and compare carefully selected components for your next build."
          action={
            <SearchBar
              value={term}
              onChange={setTerm}
              onSubmit={(event) => {
                event.preventDefault();
                setFilters({ ...filters, search: term, page: 1 });
              }}
            />
          }
        />
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
