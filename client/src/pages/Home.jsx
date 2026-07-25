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
      <main className="bg-[#07090f] px-6 py-14 text-zinc-100">
        <motion.section
          className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[.03] to-violet-500/10 px-6 py-20 text-center sm:px-12"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Welcome to Rigora
            <span className="mt-6 block text-base font-normal text-zinc-400">
              Premium gaming hardware, precisely curated.
            </span>
            <span className="mt-8 flex justify-center gap-3">
              <Link
                className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-zinc-950"
                to="/login"
              >
                Sign in
              </Link>
              <Link
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold"
                to="/register"
              >
                Create account
              </Link>
            </span>
          </h1>
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
