import { motion, useReducedMotion } from 'framer-motion';
import { LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import RigoraLogo from '../components/RigoraLogo';
import { getMotionVariants } from '../motion/variants';
import { adminLogin } from '../store/authSlice';

export default function AdminLogin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const { isLoading, error } = useSelector((state) => state.auth);

  const submit = async (values) => {
    const result = await dispatch(adminLogin(values));
    if (adminLogin.fulfilled.match(result)) {
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    }
  };

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div className="absolute -left-32 top-8 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <motion.section
        variants={variants.fadeUp}
        initial="hidden"
        animate="visible"
        className="rigora-glass rigora-floating-surface relative w-full max-w-md rounded-2xl p-7 shadow-2xl shadow-black/30 sm:p-9"
      >
        <Link className="inline-block text-cyan-300" to="/" aria-label="Rigora home">
          <RigoraLogo />
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
            <LockKeyhole size={19} aria-hidden="true" />
          </span>
          <div>
            <p className="rigora-kicker">Admin console</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Authorized Access
            </h1>
          </div>
        </div>
        <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@rigora.in"
            error={errors.email}
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
            })}
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password', { required: 'Password is required.' })}
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="rigora-primary-action mt-2 w-full py-3 disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in to Admin'}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-zinc-500">
          Protected administrative environment
        </p>
      </motion.section>
    </main>
  );
}
