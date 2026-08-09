import { CheckCircle2, Cpu, LoaderCircle, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { imageUrl, money, useImageFallback } from '../lib/catalog';

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

export default function BuildPlanner() {
  const [budget, setBudget] = useState('0');
  const [purpose, setPurpose] = useState('gaming');
  const [state, setState] = useState({ build: null, loading: false, error: '' });

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

  return (
    <>
      <SiteHeader />
      <main className="bg-background px-5 py-10 text-foreground sm:py-14">
        <section className="rigora-grid mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-white/[.03] to-violet-500/10 p-6 sm:p-10">
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
            className="h-fit rounded-2xl border border-white/10 bg-white/[0.045] p-6"
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
                    className={`block cursor-pointer rounded-xl border p-3 transition ${
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400 disabled:opacity-60"
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
            {error && (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5 text-rose-200">
                {error}
              </div>
            )}
            {!build && !loading && !error && (
              <div className="rigora-grid rounded-2xl border border-dashed border-white/15 p-10 text-center">
                <Cpu className="relative z-10 mx-auto text-cyan-300" size={40} />
                <h2 className="relative z-10 mt-4 text-xl font-semibold">
                  Your build will appear here
                </h2>
                <p className="relative z-10 mt-2 text-zinc-400">
                  Set a budget and primary use to generate a compatible PC configuration.
                </p>
              </div>
            )}
            {loading && (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl bg-white/5"
                  />
                ))}
              </div>
            )}
            {build && (
              <div className="space-y-5">
                <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-zinc-400">
                      Build total
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{money(build.total)}</p>
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
                    <p className="mt-1 text-2xl font-semibold">
                      {build.estimatedWattage}W
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={17} /> Compatible socket, memory, and cooling
                  </span>
                  <span className="inline-flex items-center gap-2 text-cyan-300">
                    <Zap size={17} /> {build.powerSupplyWattage}W PSU with safety headroom
                  </span>
                  <span className="inline-flex items-center gap-2 text-violet-500">
                    <ShieldCheck size={17} /> In-stock catalog items only
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {build.items.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product.slug}`}
                      className="group flex gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-cyan-300/40"
                    >
                      <img
                        src={imageUrl(product.images?.[0])}
                        onError={useImageFallback}
                        alt=""
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
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
