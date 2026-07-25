import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { login } from '../store/authSlice';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  const submit = async (values) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result))
      navigate(location.state?.from?.pathname || '/profile');
  };
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your Rigora account.">
      <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
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
          disabled={isLoading}
          className="w-full rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-60"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-400">
        <Link className="text-cyan-300 hover:underline" to="/forgot-password">
          Forgot password?
        </Link>{' '}
        · New to Rigora?{' '}
        <Link className="text-cyan-300 hover:underline" to="/register">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
