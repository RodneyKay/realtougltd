import React, { useEffect, useState } from 'react';
import { fetchEarlyAccessOffers, formatUgx, EarlyAccessOffer } from '../portal/lib/portalApi';

const audienceLabel: Record<EarlyAccessOffer['audience'], string> = {
  agency: 'For agencies',
  developer: 'For developers',
  any: 'For agencies & developers',
};

/** Founding-member packages. Renders nothing until an offer is switched on in the database. */
export const EarlyAccessBanner: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [offers, setOffers] = useState<EarlyAccessOffer[]>([]);

  useEffect(() => {
    fetchEarlyAccessOffers()
      .then(setOffers)
      .catch(() => setOffers([]));
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      <div className="text-center space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Limited early access</p>
        <h3 className="text-xl font-black text-gray-900 uppercase">Founding member packages</h3>
        <p className="text-sm text-gray-500">
          Full access to everything on REALTO for 12 months. After that, choose a paid plan or carry on with Free.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {offers.map((o) => {
          const taken = o.slot_cap - o.slots_left;
          const full = o.slots_left <= 0;
          return (
            <div key={o.code} className="bg-white border-2 border-black rounded-lg p-5 space-y-3 flex flex-col">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{audienceLabel[o.audience]}</p>
                <p className="text-2xl font-black text-gray-900 tabular-nums">
                  {formatUgx(o.price_ugx)}
                  <span className="text-xs font-medium text-gray-400"> / {o.duration_months} months</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-black rounded-full" style={{ width: `${Math.min(100, (taken / o.slot_cap) * 100)}%` }} />
                </div>
                <p className="text-[11px] font-bold text-gray-600 tabular-nums">
                  {full ? 'All spots taken' : `${o.slots_left} of ${o.slot_cap} spots left`}
                </p>
              </div>

              <button
                onClick={onGetStarted}
                disabled={full}
                className="mt-auto w-full py-2.5 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {full ? 'Sold out' : 'Claim your spot'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
