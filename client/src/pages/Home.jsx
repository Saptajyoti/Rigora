import { Cpu, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import RigoraLogo from '../components/RigoraLogo';
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
      <div className="mb-5 flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <p className="rigora-kicker">Catalog selection</p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        </div>
        <Link to="/products" className="text-sm font-medium text-cyan-300">
          View catalog
        </Link>
      </div>
      <ProductGrid products={state.products} loading={state.loading} />
    </section>
  );
}

const assuranceItems = [
  { label: 'Compatibility checked', detail: 'Build-ready parts', Icon: Cpu },
  { label: 'Secure checkout', detail: 'Protected payments', Icon: ShieldCheck },
  { label: 'Fast dispatch', detail: 'India-wide delivery', Icon: Truck },
  { label: 'Expert support', detail: 'Hardware guidance', Icon: Headphones },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background px-6 py-14 text-foreground">
        <motion.section
          className="rigora-grid rigora-glass rigora-hero-glass mx-auto grid max-w-7xl overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_.95fr]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative z-10 px-6 py-14 text-center sm:px-12 lg:flex lg:flex-col lg:justify-center lg:text-left">
            <div className="rigora-glass inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
              <RigoraLogo compact className="[&>svg]:h-4 [&>svg]:w-4" />
              Performance lab
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Performance, precisely built.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 lg:text-lg">
              Precision-picked PC hardware for the build you have in mind and the
              performance you expect.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link className="rigora-primary-action px-5 py-3 text-sm" to="/products">
                Explore hardware
              </Link>
              <Link
                className="rigora-control border border-white/15 px-5 py-3 text-sm font-semibold"
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
            <div className="rigora-hero-image-overlay absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="rigora-glass absolute bottom-6 right-6 z-10 max-w-52 rounded-xl p-4 text-left">
              <p className="rigora-kicker">Rigora standard</p>
              <p className="mt-2 text-sm font-semibold">
                Compatible. In stock. Ready to build.
              </p>
            </div>
          </div>
          <div className="rigora-glass relative z-10 col-span-full mx-6 mb-6 grid divide-y divide-white/10 overflow-hidden rounded-xl sm:mx-10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {assuranceItems.map(({ label, detail, Icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <Icon className="shrink-0 text-cyan-300" size={20} />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-zinc-400">{detail}</p>
                </div>
              </div>
            ))}
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
