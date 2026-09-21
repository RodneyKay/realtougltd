import React from 'react';
import { Link } from 'react-router-dom';
import { isPlanLimitError, PlanOverview } from '../lib/portalApi';

type LimitKey = 'max_users' | 'max_properties' | 'max_crm_contacts';

/** Resolves a usage/limit pair for one enforced limit. */
export function limitFor(overview: PlanOverview | null, key: LimitKey) {
  const ent = overview?.entitlements?.[key];
  return {
    used: overview?.usage?.[key] ?? 0,
    unlimited: !!ent?.unlimited,
    max: ent?.max ?? 0,
    known: !!overview && !!ent,
  };
}

const barColor = (pct: number) => (pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500');

export const UsageMeter: React.FC<{ label: string; used: number; max: number; unlimited: boolean; noun?: string }> = ({
  label,
  used,
  max,
  unlimited,
  noun,
}) => {
  const pct = unlimited || max <= 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500 tabular-nums">
          {unlimited
            ? `${used} used · Unlimited`
            : max <= 0
              ? 'Not included in your plan'
              : `${used} of ${max}${noun ? ` ${noun}` : ''}`}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor(pct)}`} style={{ width: `${unlimited ? 0 : pct}%` }} />
      </div>
    </div>
  );
};

/** Compact "3 of 5 listings" pill for page headers; links to the plan page. */
export const UsageChip: React.FC<{ overview: PlanOverview | null; limit: LimitKey; noun: string }> = ({
  overview,
  limit,
  noun,
}) => {
  const { used, max, unlimited, known } = limitFor(overview, limit);
  if (!known || unlimited) return null;
  const full = used >= max;
  return (
    <Link
      to="/portal/billing"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums transition-colors ${
        full ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title="View plan and usage"
    >
      {used} of {max} {noun}
    </Link>
  );
};

/** Renders a form error; plan-limit errors get an upgrade path instead of a bare red line. */
export const FormError: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  if (isPlanLimitError(message)) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-2.5 space-y-1.5">
        <p className="text-xs text-amber-900">{message}</p>
        <Link to="/portal/billing" className="text-xs font-bold text-amber-900 underline underline-offset-2">
          Compare plans
        </Link>
      </div>
    );
  }
  return <p className="text-xs text-red-600 font-medium">{message}</p>;
};
