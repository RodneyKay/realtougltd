import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone, Sparkles, Plus, X as XIcon, Wallet, Star, Zap, Crown } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchAdRateCard,
  fetchAgencyAds,
  createAd,
  cancelAd,
  fetchAgencyPromotions,
  createPromotionRequest,
  deletePromotionRequest,
  fetchAgencyListingsFull,
  PortalRateCardItem,
  PortalAd,
  PortalPromotionRequest,
  PortalListing,
} from '../lib/portalApi';
import { PortalModal, portalInputClass, portalLabelClass } from '../components/PortalModal';
import type { AdStatus, PromotionStatus } from '../../lib/database.types';

const placementLabel: Record<string, string> = {
  homepage: 'Homepage Banner',
  search: 'Search Results',
  category: 'Category Page',
  social_standard: 'Social — Standard',
  social_premium: 'Social — Premium',
  priority_ranking: 'Priority Search Ranking',
  verified_spotlight: 'Verified Agency Spotlight',
  lead_alerts: 'Instant Lead Alerts',
  social_autopost: 'Auto-Post to Social',
};

const premiumFeaturePlacements = new Set(['priority_ranking', 'verified_spotlight', 'lead_alerts', 'social_autopost']);
const bannerPlacements = ['homepage', 'search', 'category'];

const unitLabel: Record<string, string> = { per_day: 'Daily', per_week: 'Weekly', per_month: 'Monthly', flat: 'One-time' };

const adStatusPill: Record<AdStatus, string> = {
  pending_payment: 'bg-amber-100 text-amber-700',
  paid: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-indigo-100 text-indigo-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-400',
  refunded: 'bg-gray-100 text-gray-400',
};

const promoStatusPill: Record<PromotionStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-600',
};

const formatUgx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;
const formatDay = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const placementBlurb: Record<string, string> = {
  homepage: 'Top of the marketplace homepage',
  search: 'Highlighted in search results',
  category: 'Highlighted on category pages',
};

const columns: { unit: 'per_day' | 'per_week' | 'per_month'; label: string; days: number }[] = [
  { unit: 'per_day', label: 'Daily', days: 1 },
  { unit: 'per_week', label: 'Weekly', days: 7 },
  { unit: 'per_month', label: 'Monthly', days: 30 },
];

const durationDays = (unit: string, customDays: number) => {
  if (unit === 'per_day') return customDays;
  if (unit === 'per_week') return 7;
  if (unit === 'per_month') return 30;
  return 0; // flat / one-time — no end date
};

export const PortalMarketing: React.FC = () => {
  const { agency, profile } = usePortalAuth();
  const [rateCard, setRateCard] = useState<PortalRateCardItem[]>([]);
  const [ads, setAds] = useState<PortalAd[]>([]);
  const [promotions, setPromotions] = useState<PortalPromotionRequest[]>([]);
  const [listings, setListings] = useState<PortalListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBoostForm, setShowBoostForm] = useState<'boost' | 'feature' | null>(null);
  const [boostListingId, setBoostListingId] = useState('');
  const [rateCardId, setRateCardId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [customDays, setCustomDays] = useState(3);
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [paymentReference, setPaymentReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoListingId, setPromoListingId] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  const activeListings = useMemo(() => listings.filter((l) => l.status === 'active'), [listings]);
  const selectedRate = rateCard.find((r) => r.id === rateCardId);
  const isPremiumFeature = selectedRate ? premiumFeaturePlacements.has(selectedRate.placement) : false;
  const days = selectedRate ? durationDays(selectedRate.unit, customDays) : 0;
  const computedCost = selectedRate ? (selectedRate.unit === 'per_day' ? selectedRate.price_ugx * Math.max(customDays, 1) : selectedRate.price_ugx) : 0;

  const bannerRateCard = rateCard.filter((r) => bannerPlacements.includes(r.placement));
  const socialRateCard = rateCard.filter((r) => r.placement === 'social_standard' || r.placement === 'social_premium');
  const premiumRateCard = rateCard.filter((r) => premiumFeaturePlacements.has(r.placement));
  const hasSavings = bannerPlacements.some((placement) => {
    const items = bannerRateCard.filter((r) => r.placement === placement);
    const daily = items.find((r) => r.unit === 'per_day');
    return !!daily && items.some((r) => {
      const c = columns.find((col) => col.unit === r.unit);
      return !!c && c.days > 1 && r.price_ugx < daily.price_ugx * c.days;
    });
  });

  const load = () => {
    if (!agency) return;
    setLoading(true);
    Promise.all([fetchAdRateCard(), fetchAgencyAds(agency.id), fetchAgencyPromotions(agency.id), fetchAgencyListingsFull(agency.id)])
      .then(([rc, a, p, l]) => {
        setRateCard(rc);
        setAds(a);
        setPromotions(p);
        setListings(l);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [agency]);

  const openBoostForm = (mode: 'boost' | 'feature', presetRateId?: string) => {
    setShowBoostForm(mode);
    setRateCardId(presetRateId ?? '');
    setBoostListingId('');
    setStartDate('');
    setCustomDays(3);
    setPaymentMethod('Mobile Money');
    setPaymentReference('');
    setError(null);
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !selectedRate || !startDate) {
      setError('Pick a placement and a start date.');
      return;
    }
    if (!isPremiumFeature && !boostListingId) {
      setError('Pick a listing to boost.');
      return;
    }
    if (!paymentReference) {
      setError('Enter your payment reference so we can match it to your payment.');
      return;
    }

    const listing = boostListingId ? listings.find((l) => l.id === boostListingId) : null;
    const endDate = days > 0 ? new Date(new Date(startDate).getTime() + days * 86400000).toISOString().slice(0, 10) : null;
    const title = isPremiumFeature ? `${placementLabel[selectedRate.placement]} — ${agency.name}` : listing?.title ?? 'Untitled';

    setSaving(true);
    setError(null);
    try {
      await createAd({
        agencyId: agency.id,
        agentId: profile.id,
        listingId: isPremiumFeature ? null : boostListingId,
        title,
        rateCard: selectedRate,
        startDate,
        endDate,
        costUgx: computedCost,
        paymentMethod,
        paymentReference,
      });
      setShowBoostForm(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAd = async (id: string) => {
    if (!confirm('Cancel this request?')) return;
    await cancelAd(id);
    load();
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !promoListingId) return;
    setSaving(true);
    setError(null);
    try {
      await createPromotionRequest(agency.id, profile.id, promoListingId, promoMessage);
      setShowPromoForm(false);
      setPromoListingId('');
      setPromoMessage('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    await deletePromotionRequest(id);
    load();
  };

  const listingTitle = (id: string | null) => listings.find((l) => l.id === id)?.title ?? '—';

  type MarketingTab = 'placements' | 'campaigns' | 'featured' | 'premium';
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab: MarketingTab =
    requestedTab === 'campaigns' || requestedTab === 'featured' || (requestedTab === 'premium' && premiumRateCard.length > 0)
      ? requestedTab
      : 'placements';
  const goToTab = (t: MarketingTab) => setSearchParams(t === 'placements' ? {} : { tab: t }, { replace: true });
  const tabs: { key: MarketingTab; label: string; count?: number }[] = [
    { key: 'placements', label: 'Placements' },
    { key: 'campaigns', label: 'My campaigns', count: ads.length },
    { key: 'featured', label: 'Featured requests', count: promotions.length },
    ...(premiumRateCard.length > 0 ? [{ key: 'premium' as MarketingTab, label: 'Premium features' }] : []),
  ];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Marketing</h1>
        <p className="text-xs text-gray-500 mt-1">Get more visibility for your listings on the marketplace and social channels.</p>
      </div>

      {activeListings.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs text-amber-800">You need at least one active listing before you can boost or feature it.</p>
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => goToTab(t.key)}
            className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-[10px] tabular-nums text-gray-400">{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'placements' && (
        <>
      {/* Listing boosts: placement x duration */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-black text-gray-900">Boost a listing</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Choose where your listing appears and for how long.
              {hasSavings ? ' Longer bookings cost less per day.' : ''}
            </p>
          </div>
          <p className="text-[11px] text-gray-400">Prices in UGX</p>
        </div>

        <div className="hidden sm:grid sm:grid-cols-[1.3fr_1fr_1fr_1fr] gap-3 px-5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">
          <span>Placement</span>
          {columns.map((c) => (
            <span key={c.unit}>{c.label}</span>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {bannerPlacements.map((placement) => {
            const items = bannerRateCard.filter((r) => r.placement === placement);
            const daily = items.find((r) => r.unit === 'per_day');
            return (
              <div key={placement} className="grid sm:grid-cols-[1.3fr_1fr_1fr_1fr] gap-x-3 gap-y-3 px-5 py-4 items-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">{placementLabel[placement]}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{placementBlurb[placement]}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:contents">
                  {columns.map((c) => {
                    const item = items.find((r) => r.unit === c.unit);
                    if (!item) return <div key={c.unit} className="hidden sm:block" />;
                    const save = daily && c.days > 1 ? Math.round((1 - item.price_ugx / (daily.price_ugx * c.days)) * 100) : 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => openBoostForm('boost', item.id)}
                        disabled={activeListings.length === 0}
                        className="relative w-full text-left rounded-lg border border-gray-200 bg-white px-3.5 py-3 hover:border-gray-900 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:shadow-none cursor-pointer"
                      >
                        <span className="sm:hidden block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{c.label}</span>
                        <span className="block text-sm font-black text-gray-900 tabular-nums">{formatUgx(item.price_ugx)}</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5 tabular-nums">
                          {c.days === 1 ? 'per day' : `≈ ${formatUgx(Math.round(item.price_ugx / c.days))} / day`}
                        </span>
                        {save > 0 && (
                          <span className="absolute -top-2 right-2 text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                            Save {save}%
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {socialRateCard.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Social promotion</p>
              <p className="text-[11px] text-gray-400">One-time fee</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialRateCard.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openBoostForm('boost', r.id)}
                  disabled={activeListings.length === 0}
                  className="flex items-center justify-between gap-3 w-full text-left rounded-lg border border-gray-200 bg-white px-3.5 py-3 hover:border-gray-900 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:shadow-none cursor-pointer"
                >
                  <span className="text-sm font-bold text-gray-900">{placementLabel[r.placement].replace('Social — ', '')}</span>
                  <span className="text-sm font-black text-gray-900 tabular-nums">{formatUgx(r.price_ugx)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {tab === 'campaigns' && (
        <>
      {/* My boost campaigns */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-black text-gray-900">My Campaigns</h2>
        </div>
        {loading ? (
          <p className="px-5 py-8 text-xs text-gray-400 animate-pulse">Loading…</p>
        ) : ads.length === 0 ? (
          <p className="px-5 py-10 text-xs text-gray-400 text-center">No campaigns yet — pick a placement above to get started.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-2.5">Item</th>
                <th className="px-5 py-2.5">Placement</th>
                <th className="px-5 py-2.5">Dates</th>
                <th className="px-5 py-2.5">Cost</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ads.map((ad) => (
                <tr key={ad.id} className="text-xs">
                  <td className="px-5 py-3 font-bold text-gray-800 max-w-[180px] truncate">{ad.title}</td>
                  <td className="px-5 py-3 text-gray-500">{placementLabel[ad.placement] ?? ad.placement}</td>
                  <td className="px-5 py-3 text-gray-400">
                    {ad.start_date ? formatDay(ad.start_date) : '—'}
                    {ad.end_date ? ` – ${formatDay(ad.end_date)}` : ''}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{formatUgx(ad.cost_ugx)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${adStatusPill[ad.status]}`}>
                      {ad.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {ad.status === 'pending_payment' && (
                      <button onClick={() => handleCancelAd(ad.id)} className="text-gray-300 hover:text-red-500 cursor-pointer">
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
        </>
      )}

      {tab === 'premium' && (
        <>
      {/* Premium features */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white">Premium Features</h2>
        </div>
        <p className="text-[11px] text-white/50 mb-4">Agency-wide upgrades, billed monthly — not tied to a single listing.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {premiumRateCard.map((r) => (
            <button
              key={r.id}
              onClick={() => openBoostForm('feature', r.id)}
              className="text-left px-4 py-3.5 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-xs font-bold text-white">{r.label}</p>
                </div>
                <p className="text-sm font-black text-emerald-400 shrink-0">{formatUgx(r.price_ugx)}<span className="text-[10px] text-white/40">/mo</span></p>
              </div>
            </button>
          ))}
        </div>
      </div>
        </>
      )}

      {tab === 'featured' && (
        <>
      {/* Featured listing requests */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Featured Listing Requests</h2>
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Free</span>
          </div>
          {activeListings.length > 0 && (
            <button
              onClick={() => setShowPromoForm(true)}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Request Feature
            </button>
          )}
        </div>
        {loading ? (
          <p className="px-5 py-8 text-xs text-gray-400 animate-pulse">Loading…</p>
        ) : promotions.length === 0 ? (
          <p className="px-5 py-10 text-xs text-gray-400 text-center">No requests yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {promotions.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{listingTitle(p.listing_id)}</p>
                  {p.message && <p className="text-[10px] text-gray-400 truncate">{p.message}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize shrink-0 ${promoStatusPill[p.status]}`}>
                  {p.status}
                </span>
                {p.status === 'pending' && (
                  <button onClick={() => handleDeletePromotion(p.id)} className="text-gray-300 hover:text-red-500 cursor-pointer shrink-0">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {showBoostForm && (
        <PortalModal title={isPremiumFeature ? 'Subscribe to Premium Feature' : 'Boost a Listing'} onClose={() => setShowBoostForm(null)}>
          <form onSubmit={handleCreateAd} className="space-y-3">
            <div className="space-y-1">
              <label className={portalLabelClass}>Placement</label>
              <select value={rateCardId} onChange={(e) => setRateCardId(e.target.value)} className={portalInputClass} required>
                <option value="">Select…</option>
                {rateCard.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} — {formatUgx(r.price_ugx)} {r.unit !== 'flat' ? `/ ${unitLabel[r.unit].toLowerCase()}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {!isPremiumFeature && (
              <div className="space-y-1">
                <label className={portalLabelClass}>Listing</label>
                <select value={boostListingId} onChange={(e) => setBoostListingId(e.target.value)} className={portalInputClass} required>
                  <option value="">Select a listing…</option>
                  {activeListings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isPremiumFeature && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2.5">
                <Crown className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-[11px] text-emerald-800">
                  This applies agency-wide across all your listings — no specific listing needed.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={portalInputClass} required />
              </div>
              {selectedRate?.unit === 'per_day' && (
                <div className="space-y-1">
                  <label className={portalLabelClass}>Days</label>
                  <input type="number" min={1} value={customDays} onChange={(e) => setCustomDays(Number(e.target.value))} className={portalInputClass} />
                </div>
              )}
              {(selectedRate?.unit === 'per_week' || selectedRate?.unit === 'per_month') && (
                <div className="space-y-1">
                  <label className={portalLabelClass}>Duration</label>
                  <input value={selectedRate.unit === 'per_week' ? '7 days' : '30 days'} disabled className={`${portalInputClass} bg-gray-50 text-gray-400`} />
                </div>
              )}
            </div>

            {selectedRate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800">Total cost</span>
                <span className="text-sm font-black text-emerald-900">{formatUgx(computedCost)}</span>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5 space-y-1">
              <p className="text-[11px] font-bold text-gray-700">Payment instructions</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Send payment via Mobile Money to <span className="font-bold">0770 000 000</span> (Realto Ltd), or bank transfer to
                the details on your invoice, then enter your reference below.
                {isPremiumFeature && ' Monthly features renew by submitting a new request each month — there is no auto-billing yet.'}
                {' '}Our team activates your request once payment is confirmed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={portalInputClass}>
                  <option>Mobile Money</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Payment Reference</label>
                <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className={portalInputClass} placeholder="e.g. MM240110.1234" />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-60 text-white text-xs font-bold rounded-md transition-opacity cursor-pointer"
            >
              {saving ? 'Submitting…' : isPremiumFeature ? 'Subscribe' : 'Submit Boost Request'}
            </button>
          </form>
        </PortalModal>
      )}

      {showPromoForm && (
        <PortalModal title="Request Featured Placement" onClose={() => setShowPromoForm(false)}>
          <form onSubmit={handleCreatePromotion} className="space-y-3">
            <div className="space-y-1">
              <label className={portalLabelClass}>Listing</label>
              <select value={promoListingId} onChange={(e) => setPromoListingId(e.target.value)} className={portalInputClass} required>
                <option value="">Select a listing…</option>
                {activeListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Why should we feature this? (optional)</label>
              <textarea value={promoMessage} onChange={(e) => setPromoMessage(e.target.value)} rows={3} className={portalInputClass} />
            </div>
            <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
              <Sparkles className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-gray-500">
                Featured requests are free and reviewed by our team based on listing quality and current availability —
                no payment needed.
              </p>
            </div>
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </PortalModal>
      )}
    </div>
  );
};
