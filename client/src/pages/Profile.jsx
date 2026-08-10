import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { api } from '../lib/api';
import { logout, updateProfile } from '../store/authSlice';
import { useState } from 'react';

export default function Profile() {
  const { user, isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [passwordState, setPasswordState] = useState({
    loading: false,
    message: '',
    error: '',
  });
  const profile = useForm({
    values: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
    },
  });
  const password = useForm();
  const submitProfile = (values) => dispatch(updateProfile(values));
  const submitPassword = async (values) => {
    setPasswordState({ loading: true, message: '', error: '' });
    try {
      await api.put('/auth/change-password', values);
      password.reset();
      setPasswordState({
        loading: false,
        message: 'Password updated successfully.',
        error: '',
      });
    } catch (err) {
      setPasswordState({
        loading: false,
        message: '',
        error: err.response?.data?.message || 'Unable to update password.',
      });
    }
  };
  return (
    <AuthLayout title="Your profile" subtitle="Keep your Rigora account details current.">
      <div className="mt-7 space-y-8">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={profile.handleSubmit(submitProfile)}
          noValidate
        >
          <FormField
            label="First name"
            name="firstName"
            error={profile.formState.errors.firstName}
            {...profile.register('firstName', { required: 'First name is required.' })}
          />
          <FormField
            label="Last name"
            name="lastName"
            error={profile.formState.errors.lastName}
            {...profile.register('lastName', { required: 'Last name is required.' })}
          />
          <FormField
            label="Username"
            name="username"
            error={profile.formState.errors.username}
            {...profile.register('username', {
              required: 'Username is required.',
              minLength: { value: 3, message: 'Use at least 3 characters.' },
            })}
          />
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            error={profile.formState.errors.phone}
            {...profile.register('phone')}
          />
          <div className="sm:col-span-2">
            <FormField
              label="Email"
              name="email"
              type="email"
              error={profile.formState.errors.email}
              {...profile.register('email', { required: 'Email is required.' })}
            />
          </div>
          <div className="sm:col-span-2">
            <FormField
              label="Avatar URL (optional)"
              name="avatar"
              type="url"
              error={profile.formState.errors.avatar}
              {...profile.register('avatar', {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'Enter a valid URL.',
                },
              })}
            />
          </div>
          {error && <p className="sm:col-span-2 text-sm text-rose-300">{error}</p>}
          <button
            disabled={isLoading}
            className="rigora-primary-action sm:col-span-2 py-3 disabled:opacity-60"
          >
            {isLoading ? 'Saving…' : 'Save profile'}
          </button>
        </form>
        <form
          className="border-t border-white/10 pt-7"
          onSubmit={password.handleSubmit(submitPassword)}
          noValidate
        >
          <h2 className="text-lg font-semibold">Password</h2>
          <div className="mt-4 space-y-4">
            <FormField
              label="Current password"
              name="currentPassword"
              type="password"
              error={password.formState.errors.currentPassword}
              {...password.register('currentPassword', {
                required: 'Current password is required.',
              })}
            />
            <FormField
              label="New password"
              name="newPassword"
              type="password"
              error={password.formState.errors.newPassword}
              {...password.register('newPassword', {
                required: 'New password is required.',
                minLength: { value: 8, message: 'Use at least 8 characters.' },
              })}
            />
            {passwordState.error && (
              <p className="text-sm text-rose-300">{passwordState.error}</p>
            )}
            {passwordState.message && (
              <p className="text-sm text-emerald-300">{passwordState.message}</p>
            )}
            <button
              disabled={passwordState.loading}
              className="rigora-control border border-white/15 px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {passwordState.loading ? 'Updating…' : 'Change password'}
            </button>
          </div>
        </form>
        <div className="flex justify-between border-t border-white/10 pt-6 text-sm">
          <Link className="text-zinc-400 hover:text-white" to="/">
            Back home
          </Link>
          <button
            className="text-rose-300 hover:text-rose-200"
            onClick={() => dispatch(logout())}
          >
            Sign out
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
