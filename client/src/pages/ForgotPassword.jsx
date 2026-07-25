import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [state, setState] = useState({ loading: false, message: '', error: '' });
  const submit = async ({ email }) => {
    setState({ loading: true, message: '', error: '' });
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setState({ loading: false, message: data.message, error: '' });
    } catch (error) {
      setState({
        loading: false,
        message: '',
        error: error.response?.data?.message || 'Unable to request a reset link.',
      });
    }
  };
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we’ll send a secure reset link."
    >
      <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)} noValidate>
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
        {state.message && <p className="text-sm text-emerald-300">{state.message}</p>}
        {state.error && <p className="text-sm text-rose-300">{state.error}</p>}
        <button
          disabled={state.loading}
          className="w-full rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-60"
        >
          {state.loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm">
        <Link className="text-cyan-300 hover:underline" to="/login">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
