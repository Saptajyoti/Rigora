import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { register as registerAccount } from '../store/authSlice';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const submit = async (values) => {
    const result = await dispatch(registerAccount(values));
    if (registerAccount.fulfilled.match(result)) navigate('/profile');
  };
  return (
    <AuthLayout
      title="Build your account"
      subtitle="Get access to your Rigora profile and order experience."
    >
      <form
        className="mt-7 grid gap-4 sm:grid-cols-2"
        onSubmit={handleSubmit(submit)}
        noValidate
      >
        <FormField
          label="First name"
          name="firstName"
          autoComplete="given-name"
          error={errors.firstName}
          {...register('firstName', { required: 'First name is required.' })}
        />
        <FormField
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          error={errors.lastName}
          {...register('lastName', { required: 'Last name is required.' })}
        />
        <FormField
          label="Username"
          name="username"
          autoComplete="username"
          error={errors.username}
          {...register('username', {
            required: 'Username is required.',
            minLength: { value: 3, message: 'Use at least 3 characters.' },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Letters, numbers, underscores only.',
            },
          })}
        />
        <FormField
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          error={errors.phone}
          {...register('phone')}
        />
        <div className="sm:col-span-2">
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={errors.email}
            {...register('email', {
              required: 'Email is required.',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email.' },
            })}
          />
        </div>
        <div className="sm:col-span-2">
          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
            {...register('password', {
              required: 'Password is required.',
              minLength: { value: 8, message: 'Use at least 8 characters.' },
            })}
          />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-rose-300">{error}</p>}
        <button
          disabled={isLoading}
          className="sm:col-span-2 w-full rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-60"
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-zinc-400">
        Already a member?{' '}
        <Link className="text-cyan-300 hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
