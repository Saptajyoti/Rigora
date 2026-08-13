import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import PageIntro from '../components/PageIntro';
import ProductGrid from '../components/ProductGrid';
import SearchBar from '../components/SearchBar';
import SiteHeader from '../components/SiteHeader';
import { useCatalogResources, useProducts } from '../hooks/useCatalog';
import { springs, withReducedMotion } from '../motion/transitions';
import { getMotionVariants } from '../motion/variants';

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
  const { products, pagination, loading, error, dataKey } = useProducts(filters);
  const [term, setTerm] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    setMobileFiltersOpen(false);
  };

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
        <div className="mb-4 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="rigora-control inline-flex items-center gap-2 border border-white/10 px-4 py-2 text-sm font-medium"
            aria-haspopup="dialog"
            aria-expanded={mobileFiltersOpen}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>
        <div className="grid gap-7 lg:grid-cols-[260px_1fr]">
          <FilterSidebar
            categories={categories}
            brands={brands}
            filters={filters}
            onChange={updateFilters}
            className="hidden lg:block"
          />
          <section>
            {error && <p className="mb-4 text-rose-300">{error}</p>}
            <ProductGrid products={products} loading={loading} resultKey={dataKey} />
            <Pagination
              pagination={pagination}
              onChange={(page) => updateFilters({ ...filters, page })}
            />
          </section>
        </div>
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/55 p-4 lg:hidden"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants.fadeIn}
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                className="ml-auto h-full w-full max-w-sm overflow-y-auto"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
                transition={withReducedMotion(reduceMotion, springs.drawer)}
                role="dialog"
                aria-modal="true"
                aria-label="Product filters"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-lg p-2 text-zinc-300 hover:bg-white/5"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar
                  categories={categories}
                  brands={brands}
                  filters={filters}
                  onChange={updateFilters}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
