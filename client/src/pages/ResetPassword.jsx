import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { api } from '../lib/api';
import { fetchCurrentUser } from '../store/authSlice';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [state, setState] = useState({ loading: false, error: '' });
  const submit = async ({ password }) => {
    setState({ loading: true, error: '' });
    try {
      await api.post('/auth/reset-password', { token, password });
      await dispatch(fetchCurrentUser());
      navigate('/profile');
    } catch (error) {
      setState({
        loading: false,
        error: error.response?.data?.message || 'Unable to reset your password.',
      });
    }
  };
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Use at least eight characters and keep it unique."
    >
      <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <FormField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          {...register('password', {
            required: 'Password is required.',
            minLength: { value: 8, message: 'Use at least 8 characters.' },
          })}
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          {...register('confirmPassword', {
            required: 'Confirm your password.',
            validate: (value) => value === watch('password') || 'Passwords do not match.',
          })}
        />
        {state.error && <p className="text-sm text-rose-300">{state.error}</p>}
        <button
          disabled={state.loading}
          className="w-full rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-60"
        >
          {state.loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
}
