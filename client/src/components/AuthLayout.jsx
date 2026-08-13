import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RigoraLogo from './RigoraLogo';
import { getMotionVariants } from '../motion/variants';

export default function AuthLayout({ title, subtitle, children, aside }) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      {aside ? (
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1fr]">
          <motion.aside
            variants={variants.fadeUp}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden border-b border-white/10 bg-zinc-950/35 p-7 sm:p-10 lg:border-b-0 lg:border-r"
          >
            <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="relative">{aside}</div>
          </motion.aside>
          <motion.section
            variants={variants.fadeUp}
            initial="hidden"
            animate="visible"
            className="rigora-glass relative p-7 sm:p-10"
          >
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
            )}
            {children}
          </motion.section>
        </div>
      ) : (
        <motion.section
          variants={variants.fadeUp}
          initial="hidden"
          animate="visible"
          className="rigora-glass relative w-full max-w-md rounded-2xl p-7 shadow-2xl shadow-black/30 sm:p-9"
        >
          <Link
            className="mb-7 inline-block text-cyan-300"
            to="/"
            aria-label="Rigora home"
          >
            <RigoraLogo />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>}
          {children}
        </motion.section>
      )}
    </main>
  );
}
