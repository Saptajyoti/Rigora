import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import RigoraLogo from './RigoraLogo';
import { getMotionVariants } from '../motion/variants';

export default function AuthLayout({ title, subtitle, children }) {
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <motion.section
        variants={variants.fadeUp}
        initial="hidden"
        animate="visible"
        className="rigora-glass relative w-full max-w-md rounded-2xl p-7 shadow-2xl shadow-black/30 sm:p-9"
      >
        <Link className="mb-7 inline-block text-cyan-300" to="/" aria-label="Rigora home">
          <RigoraLogo />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>}
        {children}
      </motion.section>
    </main>
  );
}
