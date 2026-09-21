import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, Building2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { usePortalAuth } from '../context/PortalAuthContext';
import { fetchInvitePreview, InvitePreview } from '../lib/portalApi';
import type { AgencyBusinessType } from '../../lib/database.types';

const businessTypes: { value: AgencyBusinessType; label: string; blurb: string }[] = [
  { value: 'agency', label: 'Agency', blurb: 'Brokers listings for clients' },
  { value: 'developer', label: 'Developer', blurb: 'Sells or leases own projects' },
];

export const PortalRegister: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') ?? undefined;
  const { register, error, clearError, needsEmailConfirmation } = usePortalAuth();

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);

  const [businessType, setBusinessType] = useState<AgencyBusinessType>('agency');
  const [agencyName, setAgencyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) return;
    fetchInvitePreview(inviteToken)
      .then((result) => {
        if (!result || result.status !== 'pending') {
          setInviteError('This invite link is invalid or has already been used.');
          return;
        }
        setInvite(result);
        setEmail(result.email);
      })
      .catch(() => setInviteError('This invite link is invalid or has already been used.'))
      .finally(() => setInviteLoading(false));
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!contactName || !email || !password || (!inviteToken && !agencyName)) {
      setLocalError(
        inviteToken
          ? 'Fill in your name, email, and password.'
          : 'Fill in your name, agency/developer name, email, and password.'
      );
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ contactName, email, phone, password, agencyName, businessType, city }, inviteToken);
      navigate('/portal/dashboard', { replace: true });
    } catch {
      // error surfaced via context; needsEmailConfirmation handled below
    } finally {
      setSubmitting(false);
    }
  };

  if (needsEmailConfirmation) {
    return (
      <AuthLayout
        eyebrow="Almost there"
        title="Confirm your email"
        subtitle="One more step before your console is ready."
      >
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center space-y-3">
          <MailCheck className="w-8 h-8 text-black mx-auto" />
          <p className="text-sm font-bold text-gray-900">Check your inbox</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            We sent a confirmation link to <span className="font-bold text-gray-700">{email}</span>. Once confirmed,
            sign in and we'll finish setting up {agencyName || 'your agency'}.
          </p>
          <Link
            to="/portal/login"
            className="inline-block w-full py-2.5 px-4 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-md transition-all cursor-pointer"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (inviteToken && inviteLoading) {
    return (
      <AuthLayout eyebrow="One moment" title="Checking your invite…" subtitle="">
        <p className="text-xs text-gray-400 text-center animate-pulse">Loading invite details…</p>
      </AuthLayout>
    );
  }

  if (inviteToken && inviteError) {
    return (
      <AuthLayout eyebrow="Invite" title="Invite link unavailable" subtitle={inviteError}>
        <Link
          to="/portal/register"
          className="inline-block w-full text-center py-2.5 px-4 bg-black hover:bg-gray-800 text-white text-sm font-bold rounded-md transition-all cursor-pointer"
        >
          Register a New Agency Instead
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow={invite ? 'You’re invited' : 'Get started'}
      title={invite ? `Join ${invite.agency_name}` : 'Register your account'}
      subtitle={
        invite
          ? `You've been invited as ${invite.role.replace('_', ' ')}. Set your name and password to join.`
          : 'Create the account that owns your storefront, listings, and team.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!invite && (
          <>
            {/* Business type selector — signature control for the portal's one real branch point */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setBusinessType(t.value)}
                    className={`relative text-left p-3 rounded-md border transition-all cursor-pointer ${
                      businessType === t.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {businessType === t.value && (
                      <CheckCircle2 className="w-3.5 h-3.5 absolute top-2.5 right-2.5 text-white" />
                    )}
                    <p className="text-xs font-bold">{t.label}</p>
                    <p className={`text-[10px] mt-0.5 ${businessType === t.value ? 'text-white/60' : 'text-gray-400'}`}>
                      {t.blurb}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                {businessType === 'developer' ? 'Development / Company Name' : 'Agency Name'}
              </label>
              <input
                type="text"
                required
                placeholder={businessType === 'developer' ? 'e.g. Kololo Heights Developers' : 'e.g. Kampala Prime Properties'}
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
              />
            </div>
          </>
        )}

        {invite && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2.5">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <p className="text-xs text-emerald-800">
              Joining <span className="font-bold">{invite.agency_name}</span> as{' '}
              <span className="font-bold capitalize">{invite.role.replace('_', ' ')}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Your Full Name</label>
            <input
              type="text"
              required
              placeholder="Ronald Kayonde"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">City</label>
            <input
              type="text"
              placeholder="Kampala"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!!invite}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-300"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Work Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!invite}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Phone</label>
          <input
            type="tel"
            placeholder="+256 701 555 555"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Confirm Password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
        </div>

        {(localError || error) && <p className="text-xs text-red-600 font-medium">{localError || error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-black hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-md shadow-xs transition-all cursor-pointer"
        >
          {submitting ? 'Creating account…' : invite ? 'Join Agency' : 'Create Account'}
        </button>

        <p className="text-[10px] text-center text-gray-400">
          By continuing you agree to Realto's{' '}
          <Link to="/terms" className="underline hover:text-gray-600">Terms</Link> and{' '}
          <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>. Verification (KYC)
          happens after you sign in.
        </p>
      </form>

      <p className="text-xs text-center text-gray-500">
        Already registered?{' '}
        <Link to="/portal/login" className="font-bold text-black hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};
