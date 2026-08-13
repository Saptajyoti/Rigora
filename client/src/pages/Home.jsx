import { ArrowUpRight, Cpu, Headphones, ShieldCheck, Truck } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import RigoraLogo from '../components/RigoraLogo';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { getMotionVariants } from '../motion/variants';
import { springs, transitions } from '../motion/transitions';
import { headingViewportOptions, viewportOptions } from '../motion/variants';
import { useCatalogResources } from '../hooks/useCatalog';
import useFinePointer from '../hooks/useFinePointer';

function ProductRow({ title, filter }) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const [state, setState] = useState({ products: [], loading: true });
  useEffect(() => {
    api
      .get('/products', { params: { ...filter, limit: 4 } })
      .then(({ data }) => setState({ products: data.products, loading: false }))
      .catch(() => setState({ products: [], loading: false }));
  }, [filter]);
  return (
    <section className="mt-14">
      <motion.div
        className="mb-5 flex items-end justify-between border-b border-white/10 pb-4"
        variants={variants.staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={headingViewportOptions}
      >
        <div>
          <motion.p variants={variants.staggerItem} className="rigora-kicker">
            Catalog selection
          </motion.p>
          <motion.h2
            variants={variants.staggerItem}
            className="mt-2 text-2xl font-semibold"
          >
            {title}
          </motion.h2>
        </div>
        <motion.div variants={variants.staggerItem}>
          <Link to="/products" className="text-sm font-medium text-cyan-300">
            View catalog
          </Link>
        </motion.div>
      </motion.div>
      <ProductGrid products={state.products} loading={state.loading} animateOnView />
    </section>
  );
}

function CategoryRail() {
  const { categories, loading } = useCatalogResources();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  return (
    <section className="mx-auto mt-14 max-w-7xl">
      <motion.div
        className="flex items-end justify-between border-b border-white/10 pb-4"
        variants={variants.staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={headingViewportOptions}
      >
        <div>
          <motion.p variants={variants.staggerItem} className="rigora-kicker">
            Shop by component
          </motion.p>
          <motion.h2
            variants={variants.staggerItem}
            className="mt-2 text-2xl font-semibold"
          >
            Start with the hardware that defines your build.
          </motion.h2>
        </div>
        <motion.div variants={variants.staggerItem}>
          <Link to="/categories" className="text-sm font-medium text-cyan-300">
            All categories
          </Link>
        </motion.div>
      </motion.div>
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rigora-panel h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          variants={variants.staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
        >
          {categories.slice(0, 6).map((category) => (
            <motion.div key={category._id} variants={variants.staggerItem}>
              <Link
                to={`/products?category=${category._id}`}
                className="rigora-arrow-link rigora-panel rigora-panel-interactive group flex min-h-32 flex-col justify-between p-4"
              >
                <p className="rigora-kicker">Component</p>
                <div className="flex items-end justify-between gap-3">
                  <h3 className="font-semibold">{category.name}</h3>
                  <ArrowUpRight className="shrink-0 text-cyan-300" size={18} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
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
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const heroRef = useRef(null);
  const hasFinePointer = useFinePointer();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const depthX = useSpring(useTransform(pointerX, [-0.5, 0.5], [-10, 10]), springs.depth);
  const depthY = useSpring(useTransform(pointerY, [-0.5, 0.5], [-8, 8]), springs.depth);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.97]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -12]);
  const railOpacity = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 0.82]);

  const handlePointerMove = (event) => {
    if (reduceMotion || !hasFinePointer) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const resetPointerDepth = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-background px-6 py-14 text-foreground">
        <motion.section
          ref={heroRef}
          className="rigora-grid rigora-glass rigora-hero-glass mx-auto grid max-w-7xl overflow-hidden rounded-3xl lg:grid-cols-[1.05fr_.95fr]"
          initial="hidden"
          animate="visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointerDepth}
        >
          <motion.div
            className="relative z-10 px-6 py-14 text-center sm:px-12 lg:flex lg:flex-col lg:justify-center lg:text-left"
            variants={variants.staggerContainer}
            style={{ y: contentY }}
          >
            <motion.div
              variants={variants.fadeDown}
              className="rigora-glass inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300"
            >
              <RigoraLogo compact className="[&>svg]:h-4 [&>svg]:w-4" />
              Performance lab
            </motion.div>
            <motion.h1
              variants={variants.fadeUp}
              className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl"
            >
              Performance, precisely built.
            </motion.h1>
            <motion.p
              variants={variants.fadeUp}
              className="mt-6 max-w-xl text-base leading-7 text-zinc-400 lg:text-lg"
            >
              Precision-picked PC hardware for the build you have in mind and the
              performance you expect.
            </motion.p>
            <motion.div
              variants={variants.fadeUp}
              className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link className="rigora-primary-action px-5 py-3 text-sm" to="/products">
                Explore hardware
              </Link>
              <Link
                className="rigora-control border border-white/15 px-5 py-3 text-sm font-semibold"
                to="/register"
              >
                Create account
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative min-h-80 overflow-hidden lg:min-h-0"
            variants={variants.heroMedia}
            transition={{ ...transitions.page, delay: 0.14 }}
          >
            <motion.img
              src="/rigora-hero.png"
              alt="High-end custom gaming PC with cyan lighting"
              className="absolute inset-0 h-full w-full object-cover object-right"
              style={{
                scale: imageScale,
                x: reduceMotion || !hasFinePointer ? 0 : depthX,
                y: reduceMotion || !hasFinePointer ? 0 : depthY,
              }}
            />
            <div className="rigora-hero-image-overlay absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r" />
            <motion.div
              className="rigora-glass rigora-floating-surface absolute bottom-6 right-6 z-10 max-w-52 rounded-xl p-4 text-left"
              variants={variants.fadeUp}
              transition={{ ...transitions.standard, delay: 0.3 }}
            >
              <p className="rigora-kicker">Rigora standard</p>
              <p className="mt-2 text-sm font-semibold">
                Compatible. In stock. Ready to build.
              </p>
            </motion.div>
          </motion.div>
          <motion.div
            className="rigora-glass relative z-10 col-span-full mx-6 mb-6 grid divide-y divide-white/10 overflow-hidden rounded-xl sm:mx-10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4"
            variants={variants.staggerContainer}
            transition={{
              delayChildren: reduceMotion ? 0 : 0.42,
              staggerChildren: reduceMotion ? 0 : 0.05,
            }}
            style={{ opacity: railOpacity }}
          >
            {assuranceItems.map(({ label, detail, Icon }) => (
              <motion.div
                key={label}
                variants={variants.staggerItem}
                className="flex items-center gap-3 px-4 py-3"
              >
                <Icon className="shrink-0 text-cyan-300" size={20} />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-zinc-400">{detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
        <CategoryRail />
        <div className="mx-auto max-w-7xl">
          <ProductRow title="Featured builds" filter={{ featured: true }} />
          <ProductRow title="New arrivals" filter={{ newArrival: true }} />
          <ProductRow title="Best sellers" filter={{ bestSeller: true }} />
        </div>
      </main>
    </>
  );
}
