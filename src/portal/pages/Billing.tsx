import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { useAgencyPlan } from '../hooks/useAgencyPlan';
import { UsageMeter, limitFor } from '../components/PlanUsage';
import { PortalModal, portalInputClass, portalLabelClass } from '../components/PortalModal';
import {
  fetchPlanCatalog,
  fetchEarlyAccessOffers,
  requestPlanChange,
  formatUgx,
  PlanCatalogItem,
  EarlyAccessOffer,
  tierLabel,
} from '../lib/portalApi';
import type { SubscriptionTier } from '../../lib/database.types';

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

const formatPrice = (p: PlanCatalogItem) =>
  p.priceUgxMonthly === null ? 'Custom' : p.priceUgxMonthly === 0 ? 'Free' : `UGX ${p.priceUgxMonthly.toLocaleString('en-US')}`;

const limitText = (v: number | null | undefined, noun: string) =>
  v === undefined ? null : v === null ? `Unlimited ${noun}` : `${v} ${noun}`;

const planSummary = (p: PlanCatalogItem) =>
  [
    limitText(p.limits.max_properties, 'active listings'),
    limitText(p.limits.max_users, p.limits.max_users === 1 ? 'team seat' : 'team seats'),
    limitText(p.limits.max_photos_per_listing, 'photos per listing'),
  ]
    .filter(Boolean)
    .join(' · ');

export const PortalBilling: React.FC = () => {
  const { agency, profile, role } = usePortalAuth();
  const { overview, loading, error, refresh } = useAgencyPlan(agency?.id);
  const [catalog, setCatalog] = useState<PlanCatalogItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [target, setTarget] = useState<PlanCatalogItem | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requested, setRequested] = useState<string | null>(null);
  const [offers, setOffers] = useState<EarlyAccessOffer[]>([]);
  const [earlyTarget, setEarlyTarget] = useState<EarlyAccessOffer | null>(null);
  const [earlyRequested, setEarlyRequested] = useState(false);

  // The database only lets the agency owner file plan change requests.
  const canManage = role === 'owner';

  useEffect(() => {
    fetchEarlyAccessOffers()
      .then(setOffers)
      .catch(() => setOffers([]));
    fetchPlanCatalog()
      .then(setCatalog)
      .catch((err) => setCatalogError(err instanceof Error ? err.message : 'Could not load plans.'));
  }, []);

  const currentCode = overview?.plan?.code ?? null;
  const current = catalog.find((p) => p.code === currentCode) ?? null;
  const pending = overview?.pending_change ?? null;
  const status = overview?.status ?? null;

  const listings = limitFor(overview, 'max_properties');
  const seats = limitFor(overview, 'max_users');
  const contacts = limitFor(overview, 'max_crm_contacts');
  const photoCap = overview?.entitlements?.max_photos_per_listing;

  const earlyAccess = overview?.early_access ?? null;
  const earlyDaysLeft = earlyAccess
    ? Math.ceil((new Date(earlyAccess.expires_at).getTime() - Date.now()) / 86_400_000)
    : null;
  const eligibleOffers = earlyAccess
    ? []
    : offers.filter((o) => o.slots_left > 0 && (o.audience === 'any' || o.audience === agency?.business_type));

  const submitEarlyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !earlyTarget) return;
    setSaving(true);
    setRequestError(null);
    try {
      await requestPlanChange({
        agencyId: agency.id,
        currentTier: (agency.subscription_tier ?? 'free') as SubscriptionTier,
        requestedTier: 'business',
        requestedBy: profile.id,
        notes: `EARLY ACCESS (${earlyTarget.code}, ${formatUgx(earlyTarget.price_ugx)}). ${notes}`.trim(),
      });
      setEarlyRequested(true);
      setEarlyTarget(null);
      setNotes('');
      refresh();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !target) return;
    setSaving(true);
    setRequestError(null);
    try {
      await requestPlanChange({
        agencyId: agency.id,
        currentTier: (agency.subscription_tier ?? 'free') as SubscriptionTier,
        requestedTier: target.code,
        requestedBy: profile.id,
        notes,
      });
      setRequested(target.name);
      setTarget(null);
      setNotes('');
      refresh();
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  };

  /** Heads-up shown when a plan's limits are below what the agency uses today. */
  const overUseWarning = (p: PlanCatalogItem) => {
    const notes: string[] = [];
    const maxListings = p.limits.max_properties;
    const maxSeats = p.limits.max_users;
    if (maxListings !== undefined && maxListings !== null && listings.used > maxListings)
      notes.push(`You have ${listings.used} active listings. You'd keep them, but couldn't add more until you're under ${maxListings}.`);
    if (maxSeats !== undefined && maxSeats !== null && seats.used > maxSeats)
      notes.push(`You use ${seats.used} team seats. Existing members stay, but no one new can join until you're under ${maxSeats}.`);
    return notes;
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Plan &amp; usage</h1>
        <p className="text-xs text-gray-500 mt-1">See what {agency?.name} can do on its current plan and how much of it you're using.</p>
      </div>

      {requested && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900">
            Your request to move to {requested} was sent. Our team will confirm it and arrange payment — there is no automatic
            billing yet.
          </p>
        </div>
      )}

      {earlyRequested && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-900">
            Your early access request was sent. Our team will confirm your spot and arrange payment, and your access starts
            on the day it is activated.
          </p>
        </div>
      )}

      {overview?.expired && (
        <div className="flex items-start gap-2 rounded-lg px-4 py-3 border bg-amber-50 border-amber-200 text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            Your plan ended on {formatDate(overview.current_period_end)}, so your account is now on Free limits. Your
            listings, leads and team are safe, but you can't add more than the Free plan allows until you choose a plan.
          </p>
        </div>
      )}

      {earlyAccess && !overview?.expired && (
        <div className="flex items-start gap-3 bg-gray-900 text-white rounded-xl px-5 py-4">
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-black">{earlyAccess.name}</p>
            <p className="text-xs text-white/70">
              Full access until {formatDate(earlyAccess.expires_at)}
              {earlyDaysLeft !== null && earlyDaysLeft > 0 ? ` (${earlyDaysLeft} days left)` : ''}.
              {earlyDaysLeft !== null && earlyDaysLeft <= 30
                ? ' Choose a plan below before it ends to keep your limits, or you will move to Free.'
                : ''}
            </p>
          </div>
        </div>
      )}

      {eligibleOffers.length > 0 && (
        <div className="space-y-3">
          {eligibleOffers.map((o) => (
            <div key={o.code} className="flex items-center gap-4 border-2 border-gray-900 rounded-xl px-5 py-4 bg-white flex-wrap">
              <Sparkles className="w-4 h-4 text-gray-900 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-gray-900">{o.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {formatUgx(o.price_ugx)} for {o.duration_months} months of full access · {o.slots_left} of {o.slot_cap} spots left
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRequestError(null);
                  setEarlyTarget(o);
                }}
                disabled={!canManage || !!pending}
                title={pending ? 'You already have a request waiting for approval' : undefined}
                className="text-xs font-bold px-4 py-2 rounded-md bg-gray-900 hover:bg-black text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Claim early access
              </button>
            </div>
          ))}
        </div>
      )}

      {(status === 'past_due' || status === 'canceled' || (!loading && overview && !overview.plan)) && (
        <div
          className={`flex items-start gap-2 rounded-lg px-4 py-3 border ${
            status === 'past_due' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-xs">
            {status === 'past_due'
              ? `Your payment is overdue. Everything keeps working${
                  overview?.grace_until ? ` until ${formatDate(overview.grace_until)}` : ' for a short grace period'
                }, after which your account becomes read-only.`
              : "Your account has no active plan, so it's read-only. Your data is safe, but you can't add listings, team members or contacts until a plan is active."}
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <section className="bg-white border border-gray-100 rounded-xl shadow-xs">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] text-gray-400">Current plan</p>
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              {loading ? '…' : overview?.plan?.name ?? (currentCode ? tierLabel[currentCode] : 'No plan')}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-900">
              {current ? formatPrice(current) : overview?.plan?.price_ugx_monthly === 0 ? 'Free' : ''}
              {current && current.priceUgxMonthly ? <span className="text-[11px] font-medium text-gray-400"> / month</span> : null}
            </p>
            <p className="text-[11px] text-gray-400">
              {status === 'trialing' && overview?.trial_ends_at
                ? `Trial ends ${formatDate(overview.trial_ends_at)}`
                : overview?.current_period_end
                  ? `Renews ${formatDate(overview.current_period_end)}`
                  : null}
            </p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          <UsageMeter label="Active listings" used={listings.used} max={listings.max} unlimited={listings.unlimited} />
          <UsageMeter label="Team seats" used={seats.used} max={seats.max} unlimited={seats.unlimited} />
          <UsageMeter label="CRM contacts" used={contacts.used} max={contacts.max} unlimited={contacts.unlimited} />
          {photoCap && (
            <p className="text-[11px] text-gray-500">
              Each listing can have {photoCap.unlimited ? 'unlimited' : `up to ${photoCap.max}`} photos. Sold, rented and archived
              listings don't count toward your listing limit.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-100 rounded-xl shadow-xs">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-black text-gray-900">Change plan</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {canManage
              ? 'Send a request and our team will confirm it and arrange payment (Mobile Money or bank transfer).'
              : 'Only the agency owner can request a plan change.'}
          </p>
        </div>

        {catalogError && <p className="px-5 py-4 text-xs text-red-600 font-medium">{catalogError}</p>}
        {!catalogError && catalog.length === 0 && <p className="px-5 py-6 text-xs text-gray-400 animate-pulse">Loading plans…</p>}

        <div className="divide-y divide-gray-50">
          {catalog.map((p) => {
            const isCurrent = p.code === currentCode;
            const isPendingTarget = pending?.requested_tier === p.code;
            const upgrade = current ? p.sortOrder > current.sortOrder : true;
            const warnings = !isCurrent && !upgrade ? overUseWarning(p) : [];
            return (
              <div key={p.code} className="flex items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-gray-900">{p.name}</p>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Current</span>
                    )}
                    {isPendingTarget && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Requested
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{planSummary(p) || 'Tailored to your organisation'}</p>
                  {warnings.map((w) => (
                    <p key={w} className="text-[11px] text-amber-700 mt-1">
                      {w}
                    </p>
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-700 tabular-nums shrink-0 hidden sm:block">{formatPrice(p)}</p>
                <div className="w-36 shrink-0 flex justify-end">
                  {isCurrent ? null : (
                    <button
                      type="button"
                      onClick={() => {
                        setRequestError(null);
                        setTarget(p);
                      }}
                      disabled={!canManage || !!pending}
                      title={pending ? 'You already have a plan change request waiting for approval' : undefined}
                      className="text-xs font-bold px-3 py-2 rounded-md bg-gray-900 hover:bg-black text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isPendingTarget ? 'Request sent' : upgrade ? 'Request upgrade' : 'Request downgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {earlyTarget && (
        <PortalModal title={earlyTarget.name} onClose={() => setEarlyTarget(null)}>
          <form onSubmit={submitEarlyRequest} className="space-y-3">
            <p className="text-xs text-gray-600">
              {formatUgx(earlyTarget.price_ugx)} for {earlyTarget.duration_months} months of full access, starting the day our team
              activates it. Nothing changes until your payment is confirmed.
            </p>
            <div className="space-y-1">
              <label className={portalLabelClass}>Note for our team (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={portalInputClass}
                placeholder="For example, your Mobile Money number or how you'd like to pay."
              />
            </div>
            {requestError && <p className="text-xs text-red-600 font-medium">{requestError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Sending request…' : 'Send request'}
            </button>
          </form>
        </PortalModal>
      )}

      {target && (
        <PortalModal title={`Request ${target.name}`} onClose={() => setTarget(null)}>
          <form onSubmit={submitRequest} className="space-y-3">
            <p className="text-xs text-gray-600">
              You're asking to move from <span className="font-bold">{current?.name ?? 'your current plan'}</span> to{' '}
              <span className="font-bold">{target.name}</span> ({formatPrice(target)}
              {target.priceUgxMonthly ? ' / month' : ''}). Nothing changes until our team confirms it.
            </p>
            <div className="space-y-1">
              <label className={portalLabelClass}>Note for our team (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={portalInputClass}
                placeholder="For example, when you'd like it to start or how you'll pay."
              />
            </div>
            {requestError && <p className="text-xs text-red-600 font-medium">{requestError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Sending request…' : 'Send request'}
            </button>
          </form>
        </PortalModal>
      )}
    </div>
  );
};
