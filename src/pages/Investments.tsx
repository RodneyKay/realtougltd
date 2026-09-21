import React from 'react';
import { TrendingUp } from 'lucide-react';
import { investmentOpportunities } from '../data'; // no `investment_opportunities` table in Supabase yet — still mock
import { InvestmentCard } from '../components/InvestmentCard';
import { useAppContext } from '../context/AppContext';
import { useAppData } from '../context/DataContext';
import { usePropertyFilters } from '../hooks/usePropertyFilters';

export const Investments: React.FC = () => {
  const { triggerContactAgency } = useAppContext();
  const { properties, agencies } = useAppData();
  const filters = usePropertyFilters('invest');

  return (
    <div className="space-y-6">
      <div className="bg-white text-black border border-gray-200 rounded-lg p-6 md:p-8 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-gray-100 font-black text-9xl pointer-events-none tracking-tighter">
          ROI
        </div>
        <div className="max-w-2xl space-y-3.5 relative z-10">
          <span className="bg-gray-100 border border-gray-300 text-gray-700 font-bold px-2.5 py-1 rounded-sm text-xs uppercase tracking-wider inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Pre-vetted Real Estate Asset Pool
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight leading-tight">
            East Africa Wealth & Co-funded Investments
          </h1>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
            Maximize capital performance through managed off-plan development options and shared land Speculation. Minimal investment hurdles, Escrow protected distributions, and fully verified title deeds.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 relative z-10 text-center md:text-left">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Average Yield</span>
            <span className="text-lg font-black text-black">14.9% p.a.</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Funding Secured</span>
            <span className="text-lg font-black text-black">UGX 4.5 Billion</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Active Projects</span>
            <span className="text-lg font-black text-black">3 Verified</span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase">Escrow Trustees</span>
            <span className="text-lg font-black text-black">DFCU & Stanbic</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-xs">
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'All Investments', value: 'all' },
            { label: 'Off-Plan Projects', value: 'off-plan' },
            { label: 'Fractional Hotel Co-owns', value: 'fractional' },
            { label: 'Land Speculation', value: 'land' }
          ].map((chip) => (
            <button
              key={chip.value}
              onClick={() => filters.setInvestmentTypeFilter(chip.value as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                filters.investmentTypeFilter === chip.value
                  ? 'bg-black text-white font-black'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 font-bold uppercase">
          Available opportunities: <span className="text-gray-800 font-black">{filters.filteredInvestments.length} Offers</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="investments-catalog">
        {filters.filteredInvestments.map((opp) => (
          <InvestmentCard
            key={opp.id}
            opportunity={opp}
            onClick={(oppId) => {
              const oppDetail = investmentOpportunities.find(o => o.id === oppId);
              if (oppDetail) {
                window.location.href = `/property/${oppDetail.propertyId}`;
              }
            }}
            onExpressInterest={(oppId, e) => {
              e.stopPropagation();
              const oppDetail = investmentOpportunities.find(o => o.id === oppId);
              const prop = properties.find(p => p.id === oppDetail?.propertyId);
              const agency = prop ? agencies.find(a => a.id === prop.agencyId) : null;
              if (agency && oppDetail) triggerContactAgency(agency, prop, oppDetail, 'investment');
            }}
          />
        ))}
      </div>
    </div>
  );
};
