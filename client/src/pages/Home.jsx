import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';

function ProductRow({ title, filter }) {
  const [state, setState] = useState({ products: [], loading: true });
  useEffect(() => {
    api
      .get('/products', { params: { ...filter, limit: 4 } })
      .then(({ data }) => setState({ products: data.products, loading: false }))
      .catch(() => setState({ products: [], loading: false }));
  }, [filter]);
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Link to="/products" className="text-sm text-cyan-300">
          View all
        </Link>
      </div>
      <ProductGrid products={state.products} loading={state.loading} />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background px-6 py-14 text-foreground">
        <motion.section
          className="rigora-grid mx-auto grid max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[.03] to-violet-500/10 lg:grid-cols-[1.05fr_.95fr]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative z-10 px-6 py-14 text-center sm:px-12 lg:flex lg:flex-col lg:justify-center lg:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-300">
              Rigora performance lab
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Engineered to perform.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 lg:text-lg">
              Precision-picked PC hardware for the build you have in mind and the
              performance you expect.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950"
                to="/products"
              >
                Explore hardware
              </Link>
              <Link
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold"
                to="/register"
              >
                Create account
              </Link>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden lg:min-h-0">
            <img
              src="/rigora-hero.png"
              alt="High-end custom gaming PC with cyan lighting"
              className="absolute inset-0 h-full w-full object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r" />
          </div>
        </motion.section>
        <div className="mx-auto max-w-7xl">
          <ProductRow title="Featured builds" filter={{ featured: true }} />
          <ProductRow title="New arrivals" filter={{ newArrival: true }} />
          <ProductRow title="Best sellers" filter={{ bestSeller: true }} />
        </div>
      </main>
    </>
  );
}
