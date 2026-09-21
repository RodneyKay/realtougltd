import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { usePortalAuth } from '../context/PortalAuthContext';

export const PortalLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = usePortalAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    if (!email || !password) {
      setLocalError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate('/portal/dashboard', { replace: true });
    } catch {
      // error state already surfaced via context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your console"
      subtitle="For registered agencies, developers, and their team members."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Email Address</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Password</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        {(localError || error) && <p className="text-xs text-red-600 font-medium">{localError || error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-md shadow-xs transition-all cursor-pointer"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500">
        New to Realto?{' '}
        <Link to="/portal/register" className="font-bold text-black hover:underline">
          Register your agency or development
        </Link>
      </p>

      <p className="text-[11px] text-center text-gray-400">
        Looking to buy or rent instead?{' '}
        <Link to="/" className="underline hover:text-gray-600">
          Go to the marketplace
        </Link>
      </p>
    </AuthLayout>
  );
};
