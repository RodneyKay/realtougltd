import React, { useEffect, useState } from 'react';
import { Building2, Eye, Heart, CheckCircle2, Users2, Sparkles } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { fetchAgencyDashboardStats, fetchAgencyTeam, DashboardStats, TeamMember } from '../lib/portalApi';
import { MiniBarChart } from '../components/MiniBarChart';

const statusPill: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  draft: 'bg-gray-100 text-gray-600',
  sold: 'bg-gray-900 text-white',
  rented: 'bg-gray-900 text-white',
  archived: 'bg-gray-100 text-gray-400',
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const PortalDashboard: React.FC = () => {
  const { agency, profile, role } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agency) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchAgencyDashboardStats(agency.id), fetchAgencyTeam(agency)])
      .then(([s, t]) => {
        if (cancelled) return;
        setStats(s);
        setTeam(t);
      })
      .catch(() => {
        if (!cancelled) {
          setStats({ totalListings: 0, activeListings: 0, totalViews: 0, totalSaves: 0, topListings: [], recentListings: [] });
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [agency]);

  if (!agency) return null;

  const firstName = profile?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {greeting()}, {firstName}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Stay on top of {agency.name}'s listings, verification, and performance.
        </p>
      </div>

      {agency.kyc_status === 'not_submitted' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-amber-800">
            Submit business registration and title-deed documents to unlock the verified badge on your storefront.
          </p>
          <button
            className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-md transition-colors cursor-not-allowed"
            disabled
          >
            Start verification — coming soon
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total Listings</p>
          <p className="text-2xl font-black text-gray-900">{loading ? '—' : stats?.totalListings ?? 0}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active Listings</p>
          <p className="text-2xl font-black text-gray-900">{loading ? '—' : stats?.activeListings ?? 0}</p>
        </div>

        {/* Hero mint-gradient card */}
        <div className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-xl p-4 space-y-2 shadow-lg shadow-emerald-200 text-white">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-wide">Total Views</p>
          <p className="text-2xl font-black">{loading ? '—' : (stats?.totalViews ?? 0).toLocaleString()}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total Saves</p>
          <p className="text-2xl font-black text-gray-900">{loading ? '—' : (stats?.totalSaves ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top performing listings chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <h2 className="text-sm font-black text-gray-900 mb-1">Top Performing Listings</h2>
          <p className="text-[11px] text-gray-400 mb-4">Ranked by views, across your published listings.</p>
          {loading ? (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400 animate-pulse">Loading…</div>
          ) : (
            <MiniBarChart
              data={(stats?.topListings ?? []).map((l) => ({ label: l.title, value: l.view_count ?? 0 }))}
              emptyLabel="Publish your first listing to see performance here"
            />
          )}
        </div>

        {/* Team card */}
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Users2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Team</h2>
          </div>
          <div className="space-y-3">
            {team.map((m) => (
              <div key={m.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {(m.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{m.name ?? 'Unnamed'}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{m.role.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
            {!loading && team.length === 0 && <p className="text-xs text-gray-400">No team members yet.</p>}
          </div>
        </div>
      </div>

      {/* Recent listings table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900">Recent Listings</h2>
        </div>
        {!loading && (stats?.recentListings.length ?? 0) === 0 ? (
          <div className="px-5 py-10 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-400">No listings yet — publishing tools are coming in the next phase.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-2.5">Title</th>
                <th className="px-5 py-2.5">Category</th>
                <th className="px-5 py-2.5">Price</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recentListings ?? []).map((l) => (
                <tr key={l.id} className="text-xs">
                  <td className="px-5 py-3 font-bold text-gray-800">{l.title}</td>
                  <td className="px-5 py-3 text-gray-500">{l.category}</td>
                  <td className="px-5 py-3 text-gray-500">${l.price.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusPill[l.status ?? 'draft']}`}>
                      {l.status ?? 'draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {l.created_at ? new Date(l.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-[11px] text-gray-400 text-center">
        Signed in as {profile?.name} {role ? `(${role.replace('_', ' ')})` : ''} · Contracts, commissions, and
        billing are coming in the next phase.
      </p>
    </div>
  );
};
