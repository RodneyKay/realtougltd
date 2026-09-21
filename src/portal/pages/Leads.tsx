import React, { useEffect, useState } from 'react';
import { Plus, Users2, ListChecks, CheckCircle2, Clock } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchAgencyClients,
  createClient,
  updateClientStage,
  fetchAgencyFollowUps,
  createFollowUp,
  completeFollowUp,
  PortalClient,
  PortalFollowUp,
} from '../lib/portalApi';
import { PortalModal, portalInputClass, portalLabelClass } from '../components/PortalModal';
import { FormError } from '../components/PlanUsage';
import type { ClientStage } from '../../lib/database.types';

const stages: ClientStage[] = ['new', 'contacted', 'qualified', 'viewing', 'negotiating', 'closed_won', 'closed_lost'];

const stagePill: Record<ClientStage, string> = {
  new: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  viewing: 'bg-amber-100 text-amber-700',
  negotiating: 'bg-orange-100 text-orange-700',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-red-100 text-red-500',
};

export const PortalLeads: React.FC = () => {
  const { agency, profile } = usePortalAuth();
  const [clients, setClients] = useState<PortalClient[]>([]);
  const [followUps, setFollowUps] = useState<PortalFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDue, setFollowUpDue] = useState('');

  const load = () => {
    if (!agency) return;
    setLoading(true);
    Promise.all([fetchAgencyClients(agency.id), fetchAgencyFollowUps(agency.id)])
      .then(([c, f]) => {
        setClients(c);
        setFollowUps(f);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [agency]);

  const resetClientForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBudgetMin('');
    setBudgetMax('');
    setPreferredLocation('');
    setNotes('');
    setError(null);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !name) return;
    setSaving(true);
    setError(null);
    try {
      await createClient({
        agencyId: agency.id,
        agentId: profile.id,
        name,
        email,
        phone,
        source: 'Manual entry',
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        preferredLocation,
        propertyType: '',
        notes,
      });
      setShowClientForm(false);
      resetClientForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleStageChange = async (id: string, stage: ClientStage) => {
    await updateClientStage(id, stage);
    load();
  };

  const handleCreateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !profile || !showFollowUpForm || !followUpTitle || !followUpDue) return;
    setSaving(true);
    setError(null);
    try {
      await createFollowUp({
        agencyId: agency.id,
        clientId: showFollowUpForm,
        assignedTo: profile.id,
        title: followUpTitle,
        dueAt: new Date(followUpDue).toISOString(),
        notes: '',
      });
      setShowFollowUpForm(null);
      setFollowUpTitle('');
      setFollowUpDue('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add follow-up.');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteFollowUp = async (id: string) => {
    await completeFollowUp(id);
    load();
  };

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Unknown';
  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Leads</h1>
          <p className="text-xs text-gray-500 mt-1">Track buyers and renters through your pipeline.</p>
        </div>
        <button
          onClick={() => setShowClientForm(true)}
          className="flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Clients table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Pipeline</h2>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-xs text-gray-400 animate-pulse">Loading…</p>
          ) : clients.length === 0 ? (
            <p className="px-5 py-10 text-xs text-gray-400 text-center">No leads yet — add your first one.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-2.5">Name</th>
                  <th className="px-5 py-2.5">Budget</th>
                  <th className="px-5 py-2.5">Stage</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((c) => (
                  <tr key={c.id} className="text-xs">
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.email || c.phone || '—'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.budget_min || c.budget_max
                        ? `$${(c.budget_min ?? 0).toLocaleString()} – $${(c.budget_max ?? 0).toLocaleString()}`
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={c.stage}
                        onChange={(e) => handleStageChange(c.id, e.target.value as ClientStage)}
                        className={`text-[10px] font-bold capitalize rounded-full px-2 py-1 border-0 cursor-pointer ${stagePill[c.stage]}`}
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setShowFollowUpForm(c.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-gray-800 cursor-pointer"
                      >
                        + Follow-up
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Follow-ups */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-gray-900">Follow-ups</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingFollowUps.length === 0 ? (
              <p className="px-5 py-6 text-xs text-gray-400">Nothing due — you're all caught up.</p>
            ) : (
              pendingFollowUps.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-start gap-2">
                  <button onClick={() => handleCompleteFollowUp(f.id)} className="mt-0.5 text-gray-300 hover:text-emerald-500 cursor-pointer shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{f.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{clientName(f.client_id)}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" /> {new Date(f.due_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showClientForm && (
        <PortalModal title="Add Lead" onClose={() => setShowClientForm(false)}>
          <form onSubmit={handleCreateClient} className="space-y-3">
            <div className="space-y-1">
              <label className={portalLabelClass}>Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={portalInputClass} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={portalInputClass} />
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={portalInputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={portalLabelClass}>Budget Min</label>
                <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className={portalInputClass} />
              </div>
              <div className="space-y-1">
                <label className={portalLabelClass}>Budget Max</label>
                <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className={portalInputClass} />
              </div>
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Preferred Location</label>
              <input value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} className={portalInputClass} />
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={portalInputClass} />
            </div>
            <FormError message={error} />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Adding…' : 'Add Lead'}
            </button>
          </form>
        </PortalModal>
      )}

      {showFollowUpForm && (
        <PortalModal title={`Follow-up · ${clientName(showFollowUpForm)}`} onClose={() => setShowFollowUpForm(null)}>
          <form onSubmit={handleCreateFollowUp} className="space-y-3">
            <div className="space-y-1">
              <label className={portalLabelClass}>Title</label>
              <input
                value={followUpTitle}
                onChange={(e) => setFollowUpTitle(e.target.value)}
                className={portalInputClass}
                placeholder="Call to confirm viewing time"
                required
              />
            </div>
            <div className="space-y-1">
              <label className={portalLabelClass}>Due</label>
              <input type="datetime-local" value={followUpDue} onChange={(e) => setFollowUpDue(e.target.value)} className={portalInputClass} required />
            </div>
            <FormError message={error} />
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white text-xs font-bold rounded-md transition-colors cursor-pointer"
            >
              {saving ? 'Adding…' : 'Add Follow-up'}
            </button>
          </form>
        </PortalModal>
      )}
    </div>
  );
};
