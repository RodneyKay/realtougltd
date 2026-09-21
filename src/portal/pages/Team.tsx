import React, { useEffect, useState } from 'react';
import { Plus, Mail, X as XIcon, Users2 } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { fetchAgencyTeam, fetchAgencyInvites, inviteTeamMember, revokeInvite, TeamMember, PortalInvite } from '../lib/portalApi';
import { PortalModal, portalInputClass, portalLabelClass } from '../components/PortalModal';
import { useAgencyPlan } from '../hooks/useAgencyPlan';
import { UsageChip, FormError } from '../components/PlanUsage';
import type { AgencyInviteRole } from '../../lib/database.types';

const inviteRoles: AgencyInviteRole[] = ['agent', 'agency_admin', 'accountant', 'hr'];

export const PortalTeam: React.FC = () => {
  const { agency, profile, role } = usePortalAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<PortalInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AgencyInviteRole>('agent');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = role === 'owner' || role === 'agency_admin';
  const { overview, refresh: refreshPlan } = useAgencyPlan(agency?.id);

  const load = () => {
    if (!agency) return;
    setLoading(true);
    Promise.all([fetchAgencyTeam(agency), fetchAgencyInvites(agency.id)])
      .then(([t, i]) => {
        setTeam(t);
        setInvites(i.filter((inv) => inv.status === 'pending'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [agency]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !email) return;
    setSaving(true);
    setError(null);
    try {
      await inviteTeamMember(agency.id, profile.id, email, inviteRole);
      setShowInvite(false);
      setEmail('');
      setInviteRole('agent');
      load();
      refreshPlan();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id: string) => {
    await revokeInvite(id);
    load();
    refreshPlan();
  };

  const inviteLink = (token: string) => `${window.location.origin}/portal/register?invite=${token}`;

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Team</h1>
          <p className="text-xs text-gray-500 mt-1">Manage who has access to {agency?.name}'s dashboard.</p>
          <div className="mt-2">
            <UsageChip overview={overview} limit="max_users" noun="seats" />
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Invite Member
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-xs">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users2 className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-black text-gray-900">Active Members</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <p className="px-5 py-6 text-xs text-gray-400 animate-pulse">Loading…</p>
          ) : (
            team.map((m) => (
              <div key={m.userId} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {(m.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{m.name ?? 'Unnamed'}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                  {m.role.replace('_', ' ')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {invites.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Pending Invites</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-800 truncate">{inv.email}</p>
                  <p className="text-[10px] text-gray-400 truncate">{inviteLink(inv.token)}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-2 py-1 rounded-full capitalize shrink-0">
                  {inv.role.replace('_', ' ')}
                </span>
                {canManage && (
                  <button onClick={() => handleRevoke(inv.id)} className="text-gray-300 hover:text-red-500 cursor-pointer shrink-0">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showInvite && (
        <PortalModal title="Invite Team Member" onClose={() => setShowInvite(false)}>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="space-y-1">
              <label className={portalLabelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={portalInputClass} required />
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as AgencyInviteRole)} className={portalInputClass}>
                {inviteRoles.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-gray-400">
              We'll generate an invite link — send it to them yourself for now, since email delivery isn't wired up
              yet. They'll join your agency automatically when they register through it.
            </p>
            <FormError message={error} />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Creating invite…' : 'Create Invite Link'}
            </button>
          </form>
        </PortalModal>
      )}
    </div>
  );
};
