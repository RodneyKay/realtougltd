import React, { useEffect, useMemo, useState } from 'react';
import { Inbox, Phone, Mail, MessageCircle, CalendarClock, UserPlus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchAgencyEnquiries,
  updateEnquiryStatus,
  convertEnquiryToLead,
  PortalEnquiry,
} from '../lib/portalApi';
import { FormError } from '../components/PlanUsage';
import type { EnquiryKind, EnquiryStatus } from '../../lib/database.types';

type Tab = EnquiryStatus | 'all';

const tabs: { key: Tab; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

const kindLabel: Record<EnquiryKind, string> = {
  enquiry: 'Enquiry',
  viewing: 'Viewing request',
  investment: 'Investment interest',
};

const kindPill: Record<EnquiryKind, string> = {
  enquiry: 'bg-gray-100 text-gray-600',
  viewing: 'bg-emerald-100 text-emerald-700',
  investment: 'bg-amber-100 text-amber-700',
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Uganda numbers are often written 07xx…; wa.me needs the country code. */
const whatsappUrl = (phone: string, text: string) => {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `256${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

interface InboxProps {
  /** show only one kind (used by the Viewings page) */
  only?: EnquiryKind;
}

const PortalInbox: React.FC<InboxProps> = ({ only }) => {
  const isViewings = only === 'viewing';
  const { agency, profile } = usePortalAuth();
  const [enquiries, setEnquiries] = useState<PortalEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('new');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!agency) return;
    fetchAgencyEnquiries(agency.id)
      .then((rows) => {
        setEnquiries(only ? rows.filter((r) => r.kind === only) : rows);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load enquiries.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [agency]);

  const counts = useMemo(
    () => ({
      new: enquiries.filter((e) => e.status === 'new').length,
      contacted: enquiries.filter((e) => e.status === 'contacted').length,
      closed: enquiries.filter((e) => e.status === 'closed').length,
      all: enquiries.length,
    }),
    [enquiries]
  );

  const filtered = tab === 'all' ? enquiries : enquiries.filter((e) => e.status === tab);
  // Viewings: soonest first, so the next appointment is at the top.
  const visible = isViewings
    ? [...filtered].sort((a, b) => (a.scheduled_at ?? a.created_at).localeCompare(b.scheduled_at ?? b.created_at))
    : filtered;
  const tabLabel = (t: { key: Tab; label: string }) => (isViewings && t.key === 'contacted' ? 'Confirmed' : t.label);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusyId(null);
    }
  };

  const actionBtn =
    'text-[11px] font-bold px-3 py-1.5 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer';

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{isViewings ? 'Viewings' : 'Enquiries'}</h1>
        <p className="text-xs text-gray-500 mt-1">
          {isViewings
            ? `Viewing requests sent to ${agency?.name} from the marketplace, soonest first.`
            : `Messages, viewing requests and investment interest sent to ${agency?.name} from the marketplace.`}
        </p>
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer ${
              tab === t.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {tabLabel(t)}
            <span className="ml-1.5 text-[10px] tabular-nums text-gray-400">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <FormError message={error} />

      {loading ? (
        <div className="py-10 text-center text-xs text-gray-400 animate-pulse">Loading enquiries…</div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-xs px-5 py-14 text-center space-y-2">
          <Inbox className="w-6 h-6 text-gray-300 mx-auto" />
          <p className="text-xs text-gray-400">
            {tab === 'new'
              ? isViewings
                ? "No new viewing requests. They'll appear here when buyers book a viewing."
                : "You're all caught up. New enquiries will appear here."
              : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((e) => {
            const busy = busyId === e.id;
            const greeting = `Hello ${e.name}, this is ${agency?.name ?? 'the agency'} on Realto${
              e.listing_title ? ` about "${e.listing_title}"` : ''
            }.`;
            return (
              <article key={e.id} className="bg-white border border-gray-100 rounded-xl shadow-xs p-5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-gray-900">{e.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${kindPill[e.kind]}`}>{kindLabel[e.kind]}</span>
                      {e.status === 'new' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-white">New</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatWhen(e.created_at)}
                      {e.listing_title ? ` · ${e.listing_title}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {e.phone && (
                      <>
                        <a href={`tel:${e.phone}`} className={`${actionBtn} inline-flex items-center gap-1.5`}>
                          <Phone className="w-3 h-3" /> Call
                        </a>
                        <a
                          href={whatsappUrl(e.phone, greeting)}
                          target="_blank"
                          rel="noreferrer"
                          className={`${actionBtn} inline-flex items-center gap-1.5`}
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      </>
                    )}
                    {e.email && (
                      <a href={`mailto:${e.email}`} className={`${actionBtn} inline-flex items-center gap-1.5`}>
                        <Mail className="w-3 h-3" /> Email
                      </a>
                    )}
                  </div>
                </div>

                {e.scheduled_at && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Wants to view: {new Date(e.scheduled_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}

                {e.message && <p className="text-xs text-gray-600 whitespace-pre-wrap">{e.message}</p>}

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {e.status !== 'contacted' && e.status !== 'closed' && (
                    <button disabled={busy} onClick={() => run(e.id, () => updateEnquiryStatus(e.id, 'contacted'))} className={actionBtn}>
                      {isViewings ? 'Mark confirmed' : 'Mark contacted'}
                    </button>
                  )}
                  {e.status !== 'closed' ? (
                    <button disabled={busy} onClick={() => run(e.id, () => updateEnquiryStatus(e.id, 'closed'))} className={actionBtn}>
                      Close
                    </button>
                  ) : (
                    <button disabled={busy} onClick={() => run(e.id, () => updateEnquiryStatus(e.id, 'new'))} className={actionBtn}>
                      Reopen
                    </button>
                  )}
                  {e.client_id ? (
                    <Link to="/portal/leads" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 px-2">
                      <Check className="w-3 h-3" /> In your leads
                    </Link>
                  ) : (
                    <button
                      disabled={busy || !profile}
                      onClick={() => profile && run(e.id, () => convertEnquiryToLead(e, profile.id))}
                      className={`${actionBtn} inline-flex items-center gap-1.5`}
                    >
                      <UserPlus className="w-3 h-3" /> Add to leads
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PortalEnquiries: React.FC = () => <PortalInbox />;
export const PortalViewings: React.FC = () => <PortalInbox only="viewing" />;
