import {
  CheckCircle2,
  Cpu,
  LoaderCircle,
  ShieldCheck,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { imageUrl, money, useImageFallback } from '../lib/catalog';
import { getMotionVariants } from '../motion/variants';

const purposes = [
  { value: 'gaming', label: 'Gaming', description: 'Prioritises graphics performance.' },
  {
    value: 'creator',
    label: 'Creator',
    description: 'Balances render speed and storage.',
  },
  {
    value: 'workstation',
    label: 'Workstation',
    description: 'Prioritises CPU and memory capacity.',
  },
  { value: 'balanced', label: 'Balanced', description: 'A capable all-round PC.' },
];

const compatibilityLabels = {
  cpuMotherboard: 'CPU and motherboard socket',
  memoryMotherboard: 'Memory and motherboard type',
  coolerCpu: 'Cooler and CPU socket',
  powerHeadroom: 'PSU safety headroom',
};

function BuildSkeleton() {
  return (
    <div className="space-y-5" aria-label="Generating build recommendation">
      <div className="rigora-panel p-5">
        <div className="rigora-product-skeleton h-4 w-32 rounded" />
        <div className="rigora-product-skeleton mt-4 h-9 w-48 rounded" />
        <div className="rigora-product-skeleton mt-5 h-2 w-full rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rigora-panel flex gap-4 p-4">
            <div className="rigora-product-skeleton h-20 w-20 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3 py-1">
              <div className="rigora-product-skeleton h-3 w-1/3 rounded" />
              <div className="rigora-product-skeleton h-5 w-5/6 rounded" />
              <div className="rigora-product-skeleton h-4 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuildSummary({ build, variants, reduceMotion }) {
  const usedBudget =
    build.budget > 0 ? Math.min((build.total / build.budget) * 100, 100) : 0;
  const conflicts = Object.entries(build.compatibility || {})
    .filter(([, isCompatible]) => !isCompatible)
    .map(([key]) => compatibilityLabels[key] || key);
  const ready = build.compatible && build.withinBudget;

  return (
    <motion.aside
      className="rigora-glass rigora-floating-surface space-y-5 p-5 lg:sticky lg:top-28"
      variants={variants.scaleIn}
      initial="hidden"
      animate="visible"
      layout={!reduceMotion}
    >
      {ready ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/5 p-3">
          <CheckCircle2 className="mt-0.5 text-emerald-300" size={19} />
          <div>
            <p className="font-semibold text-emerald-200">Build Ready</p>
            <p className="mt-1 text-sm text-zinc-400">
              Compatible components, {money(build.total)} total.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-400/5 p-3">
          <TriangleAlert className="mt-0.5 text-rose-300" size={19} />
          <div>
            <p className="font-semibold text-rose-200">Build needs attention</p>
            <p className="mt-1 text-sm text-zinc-400">
              {conflicts.length
                ? conflicts.join(', ')
                : 'This build is outside its budget.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">Build total</p>
          <AnimatePresence initial={false} mode="wait">
            <motion.p
              key={build.total}
              className="mt-1 text-2xl font-semibold"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.01 : 0.18 }}
            >
              {money(build.total)}
            </motion.p>
          </AnimatePresence>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Budget remaining
          </p>
          <p
            className={`mt-1 text-2xl font-semibold ${build.withinBudget ? 'text-emerald-300' : 'text-rose-300'}`}
          >
            {money(Math.abs(build.remaining))}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Power estimate
          </p>
          <p className="mt-1 text-2xl font-semibold">{build.estimatedWattage}W</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs text-zinc-400">
          <span>Budget used</span>
          <span>{Math.round(usedBudget)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={`h-full rounded-full ${build.withinBudget ? 'bg-cyan-300' : 'bg-rose-400'}`}
            initial={false}
            animate={{ width: `${usedBudget}%` }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="rigora-kicker">Build manifest</p>
        <motion.ul
          className="mt-3 space-y-2"
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {build.items.map((product) => (
            <motion.li
              key={product._id}
              variants={variants.staggerItem}
              layout={!reduceMotion}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {product.category?.name || 'Component'}
                </span>
                <span className="block truncate text-xs text-zinc-500">
                  {product.name}
                </span>
              </span>
              <span className="shrink-0 font-medium">{money(product.price)}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.aside>
  );
}

export default function BuildPlanner() {
  const [budget, setBudget] = useState('0');
  const [purpose, setPurpose] = useState('gaming');
  const [state, setState] = useState({ build: null, loading: false, error: '' });
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  const createBuild = async (event) => {
    event.preventDefault();
    setState({ build: null, loading: true, error: '' });

    try {
      const { data } = await api.post('/recommendations/pc-build', {
        budget: Number(budget),
        purpose,
      });
      setState({ build: data.build, loading: false, error: '' });
    } catch (error) {
      setState({
        build: null,
        loading: false,
        error: error.response?.data?.message || 'Unable to create a build right now.',
      });
    }
  };

  const { build, loading, error } = state;
  const buildKey = build ? build.items.map((item) => item._id).join('-') : 'empty';

  return (
    <>
      <SiteHeader />
      <main className="bg-background px-5 py-10 text-foreground sm:py-14">
        <section className="rigora-grid rigora-panel rigora-panel-raised mx-auto max-w-7xl overflow-hidden p-6 sm:p-10">
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-300">
              Rigora build planner
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
              Build around your budget.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
              A deterministic recommendation engine that selects compatible, in-stock
              hardware from the Rigora catalog. No AI services are used.
            </p>
          </div>
        </section>

        <div className="mx-auto mt-8 grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]">
          <form
            onSubmit={createBuild}
            className="rigora-panel h-fit p-6 lg:sticky lg:top-28"
          >
            <label className="block text-sm font-semibold" htmlFor="build-budget">
              Budget in INR
            </label>
            <input
              id="build-budget"
              type="number"
              min="25000"
              max="500000"
              step="1000"
              value={budget}
              onFocus={() => {
                if (budget === '0') setBudget('');
              }}
              onChange={(event) => {
                const value = event.target.value;

                if (value === '' || Number(value) >= 0) setBudget(value);
              }}
              onBlur={() => {
                if (budget === '') setBudget('0');
              }}
              className="input mt-2 w-full"
              required
            />
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold">Primary use</legend>
              <div className="mt-3 space-y-2">
                {purposes.map((option) => (
                  <label
                    key={option.value}
                    className={`rigora-control block cursor-pointer border p-3 transition ${
                      purpose === option.value
                        ? 'border-cyan-300 bg-cyan-300/10'
                        : 'border-white/10 hover:border-cyan-300/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={option.value}
                      checked={purpose === option.value}
                      onChange={() => setPurpose(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-zinc-400">
                      {option.description}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              type="submit"
              disabled={loading}
              className="rigora-primary-action mt-6 flex w-full items-center justify-center gap-2 px-4 py-3 text-sm disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Cpu size={18} />
              )}
              {loading ? 'Building recommendation...' : 'Create my build'}
            </button>
          </form>

          <section aria-live="polite">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="build-error"
                  className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-rose-200"
                  variants={variants.scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {error}
                </motion.div>
              )}
              {!build && !loading && !error && (
                <motion.div
                  key="build-empty"
                  className="rigora-grid rigora-panel border-dashed p-10 text-center"
                  variants={variants.scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Cpu className="relative z-10 mx-auto text-cyan-300" size={40} />
                  <h2 className="relative z-10 mt-4 text-xl font-semibold">
                    Your build will appear here
                  </h2>
                  <p className="relative z-10 mt-2 text-zinc-400">
                    Set a budget and primary use to generate a compatible PC
                    configuration.
                  </p>
                </motion.div>
              )}
              {loading && (
                <motion.div
                  key="build-loading"
                  variants={variants.fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <BuildSkeleton />
                </motion.div>
              )}
              {build && (
                <motion.div
                  key={buildKey}
                  className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"
                  variants={variants.fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="order-2 space-y-5 xl:order-1">
                    <div className="flex flex-wrap gap-3 text-sm">
                      {build.compatible && (
                        <span className="inline-flex items-center gap-2 text-emerald-300">
                          <CheckCircle2 size={17} /> Compatible build checks passed
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2 text-cyan-300">
                        <Zap size={17} /> {build.powerSupplyWattage}W PSU with safety
                        headroom
                      </span>
                      <span className="inline-flex items-center gap-2 text-violet-500">
                        <ShieldCheck size={17} /> In-stock catalog items only
                      </span>
                    </div>
                    <motion.div
                      className="grid gap-4 md:grid-cols-2"
                      variants={variants.staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {build.items.map((product) => (
                        <motion.div
                          key={product._id}
                          variants={variants.staggerItem}
                          layout={!reduceMotion}
                        >
                          <Link
                            to={`/products/${product.slug}`}
                            className="rigora-panel rigora-panel-interactive group flex gap-4 p-4"
                          >
                            <img
                              src={imageUrl(product.images?.[0])}
                              onError={useImageFallback}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-widest text-cyan-300">
                                {product.category?.name}
                              </p>
                              <h2 className="mt-1 font-semibold group-hover:text-cyan-300">
                                {product.name}
                              </h2>
                              <p className="mt-2 font-semibold">{money(product.price)}</p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                  <div className="order-1 xl:order-2">
                    <BuildSummary
                      build={build}
                      variants={variants}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </>
  );
}
