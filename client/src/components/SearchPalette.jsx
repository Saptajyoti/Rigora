import { ArrowRight, Clock3, Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { imageUrl, money, useImageFallback } from '../lib/catalog';
import { getMotionVariants } from '../motion/variants';

const recentSearchesKey = 'rigora_recent_searches';

const readRecentSearches = () => {
  try {
    const searches = JSON.parse(localStorage.getItem(recentSearchesKey) || '[]');
    return Array.isArray(searches)
      ? searches.filter((search) => typeof search === 'string')
      : [];
  } catch {
    return [];
  }
};

const saveRecentSearch = (term) => {
  try {
    const searches = readRecentSearches().filter((search) => search !== term);
    localStorage.setItem(
      recentSearchesKey,
      JSON.stringify([term, ...searches].slice(0, 5)),
    );
  } catch {
    // Search history is an optional local convenience.
  }
};

function ResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="rigora-product-skeleton h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="rigora-product-skeleton h-3 w-4/5 rounded" />
        <div className="rigora-product-skeleton h-2.5 w-2/5 rounded" />
      </div>
    </div>
  );
}

export default function SearchPalette({ open, onClose, categories = [] }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const inputRef = useRef(null);
  const focusTimerRef = useRef(null);
  const [term, setTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const matchingCategories = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    if (normalizedTerm.length < 2) return [];

    return categories
      .filter((category) => category.name.toLowerCase().includes(normalizedTerm))
      .slice(0, 3);
  }, [categories, term]);

  const results = useMemo(
    () => [
      ...products.map((product) => ({ type: 'product', value: product })),
      ...matchingCategories.map((category) => ({ type: 'category', value: category })),
    ],
    [matchingCategories, products],
  );

  useEffect(() => {
    if (!open) return undefined;

    setTerm('');
    setProducts([]);
    setActiveIndex(-1);
    setRecentSearches(readRecentSearches());

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    focusTimerRef.current = window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current);
    };
  }, [onClose, open]);

  useEffect(() => {
    const query = term.trim();
    if (!open || query.length < 2) {
      setProducts([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    const requestTimer = window.setTimeout(() => {
      setLoading(true);
      api
        .get('/products', {
          params: { search: query, limit: 6, page: 1, sort: 'newest' },
        })
        .then(({ data }) => {
          if (active) setProducts(data.products || []);
        })
        .catch(() => {
          if (active) setProducts([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 240);

    return () => {
      active = false;
      window.clearTimeout(requestTimer);
    };
  }, [open, term]);

  const submitSearch = (query = term) => {
    const normalizedTerm = query.trim();
    if (!normalizedTerm) return;

    saveRecentSearch(normalizedTerm);
    onClose();
    navigate(`/search?q=${encodeURIComponent(normalizedTerm)}`);
  };

  const openResult = (result) => {
    if (result.type === 'product') {
      onClose();
      navigate(`/products/${result.value.slug}`);
      return;
    }

    onClose();
    navigate(`/products?category=${result.value._id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    }

    if (event.key === 'ArrowUp' && results.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) openResult(results[activeIndex]);
      else submitSearch();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/65 p-3 pt-[10vh] sm:p-6 sm:pt-[12vh]"
          variants={variants.fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Search Rigora catalog"
            className="rigora-glass rigora-floating-surface w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl shadow-black/35"
            variants={variants.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center border-b border-white/10 px-4">
              <Search size={20} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search hardware, brands, and categories"
                aria-autocomplete="list"
                aria-controls="rigora-search-results"
                aria-activedescendant={
                  activeIndex >= 0 ? `rigora-search-result-${activeIndex}` : undefined
                }
                className="min-w-0 flex-1 bg-transparent px-3 py-5 text-base outline-none placeholder:text-zinc-500"
              />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Close search"
              >
                <X size={19} />
              </button>
            </div>
            <div
              id="rigora-search-results"
              className="max-h-[60vh] overflow-y-auto p-2"
              role="listbox"
            >
              {loading && (
                <div className="space-y-1 py-1">
                  <ResultSkeleton />
                  <ResultSkeleton />
                  <ResultSkeleton />
                </div>
              )}
              {!loading && term.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-400">
                  No matching hardware found.
                </p>
              )}
              {!loading && results.length > 0 && (
                <div className="space-y-1 py-1">
                  {results.map((result, index) => {
                    const isActive = activeIndex === index;
                    const item = result.value;
                    return (
                      <button
                        key={`${result.type}-${item._id}`}
                        id={`rigora-search-result-${index}`}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => openResult(result)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                          isActive ? 'bg-cyan-300/10 text-white' : 'hover:bg-white/5'
                        }`}
                      >
                        {result.type === 'product' ? (
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                            {item.images?.[0] && (
                              <img
                                src={imageUrl(item.images[0])}
                                alt=""
                                onError={useImageFallback}
                                decoding="async"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-xs font-semibold text-cyan-300">
                            CAT
                          </div>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-zinc-400">
                            {result.type === 'product'
                              ? [item.brand?.name, item.category?.name]
                                  .filter(Boolean)
                                  .join(' / ')
                              : 'Browse this category'}
                          </span>
                        </span>
                        {result.type === 'product' && (
                          <span className="shrink-0 text-sm font-medium">
                            {money(item.price)}
                          </span>
                        )}
                        {result.type === 'category' && (
                          <ArrowRight size={16} className="text-cyan-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              {!loading && !term.trim() && recentSearches.length > 0 && (
                <div className="p-2">
                  <p className="rigora-kicker mb-2">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        type="button"
                        onClick={() => submitSearch(search)}
                        className="rigora-control inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:border-cyan-300/50"
                      >
                        <Clock3 size={14} />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!loading && !term.trim() && recentSearches.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-500">
                  Start typing to search the Rigora catalog.
                </p>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
