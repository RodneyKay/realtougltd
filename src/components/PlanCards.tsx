import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { fetchPlanCatalog, PlanCatalogItem } from '../portal/lib/portalApi';
import type { SubscriptionTier } from '../lib/database.types';

const blurbs: Record<SubscriptionTier, string> = {
  free: 'Try REALTO with your first listings',
  starter: 'For individual agents and small agencies',
  pro: 'For established agencies with a team',
  business: 'For large agencies and developers',
  enterprise: 'For large developers & portfolios',
};

/** Feature lines come from the live plan limits so the public page can't drift from what is enforced. */
const featuresFor = (p: PlanCatalogItem): string[] => {
  const lines: string[] = [];
  const listings = p.limits.max_properties;
  const seats = p.limits.max_users;
  const photos = p.limits.max_photos_per_listing;
  if (listings !== undefined) lines.push(listings === null ? 'Unlimited active listings' : `Up to ${listings} active listings`);
  if (seats !== undefined) lines.push(seats === null ? 'Unlimited team seats' : seats === 1 ? '1 team seat' : `${seats} team seats`);
  if (photos !== undefined) lines.push(photos === null ? 'Unlimited photos per listing' : `${photos} photos per listing`);
  if (p.code === 'enterprise') lines.push('Dedicated account support', 'Custom integrations');
  return lines;
};

export const PlanCards: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [plans, setPlans] = useState<PlanCatalogItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchPlanCatalog()
      .then(setPlans)
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  if (!plans) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg h-44 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {plans.map((p) => (
        <div key={p.code} className="bg-white border border-gray-200 rounded-lg p-5 space-y-3 shadow-xs flex flex-col">
          <div>
            <h4 className="text-sm font-black text-gray-900 uppercase">{p.name}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">{blurbs[p.code]}</p>
          </div>
          <ul className="space-y-1.5 flex-1">
            {featuresFor(p).map((f) => (
              <li key={f} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                <Check className="w-3 h-3 text-black shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <button
            onClick={onGetStarted}
            className="w-full py-2 bg-black text-white text-[11px] font-bold rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      ))}
    </div>
  );
};
