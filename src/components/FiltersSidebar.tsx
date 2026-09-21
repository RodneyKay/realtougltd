/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, SlidersHorizontal, CheckSquare, Square, RotateCcw, ShieldCheck } from 'lucide-react';

interface FiltersState {
  type: string;
  propertyType: 'all' | 'Apartment' | 'House' | 'Studio' | 'Land' | 'New Developments' | 'Commercial';
  currency: 'UGX' | 'USD';
  maxPrice: number;
  beds: 'any' | number;
  district: 'all' | 'Kampala' | 'Wakiso' | 'Entebbe' | 'Jinja';
  verifiedOnly: boolean;
  searchQuery: string;
}

interface FiltersSidebarProps {
  filters: FiltersState;
  onChange: (updatedFilters: Partial<FiltersState>) => void;
  onReset: () => void;
  resultsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  filters,
  onChange,
  onReset,
  resultsCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const districts = ['all', 'Kampala', 'Wakiso', 'Entebbe', 'Jinja'];
  const propertyTypes = ['all', 'Apartment', 'House', 'Studio', 'Land', 'New Developments', 'Commercial'];
  const bedsOptions: Array<'any' | number> = ['any', 1, 2, 3, 4, 5];

  // Max price limits based on currency choice to keep slider relative
  const maxPriceLimit = filters.currency === 'USD' ? 600000 : 1500000000;
  const priceStep = filters.currency === 'USD' ? 10000 : 25000000;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ maxPrice: Number(e.target.value) });
  };

  const handleCurrencyChange = (curr: 'UGX' | 'USD') => {
    // When currency changes, reset maxPrice to relative default
    const relativePrice = curr === 'USD' ? 600000 : 1500000000;
    onChange({ currency: curr, maxPrice: relativePrice });
  };

  const formatPriceLabel = (val: number, curr: 'UGX' | 'USD') => {
    if (curr === 'USD') {
      return `$${new Intl.NumberFormat('en-US').format(val)}`;
    }
    // For UGX let's make it concise (e.g. 1.2 Billion or 350 Million)
    if (val >= 1000000000) {
      return `UGX ${(val / 1000000000).toFixed(1)}B`;
    }
    if (val >= 1000000) {
      return `UGX ${(val / 1000000).toFixed(0)}M`;
    }
    return `UGX ${new Intl.NumberFormat('en-US').format(val)}`;
  };

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-1.5 text-gray-800">
          <SlidersHorizontal className="w-4.5 h-4.5 text-[#000000]" />
          <h3 className="text-sm font-black uppercase tracking-wider">Refine Listings</h3>
        </div>
        <button 
          onClick={onReset}
          className="text-xs font-semibold text-gray-400 hover:text-[#000000] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Transaction Type Filter */}
      {!['residential', 'commercial', 'short-stay', 'agencies'].includes(filters.type) && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">I Want To</label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-lg">
            {(['all', 'buy', 'rent', 'invest'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onChange({ type: t })}
                className={`py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                  filters.type === t 
                    ? 'bg-white text-[#000000] shadow-xs font-black' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* District / Location Selector */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Location / District</label>
        <select
          value={filters.district}
          onChange={(e) => onChange({ district: e.target.value as any })}
          className="w-full text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-md py-2 px-2.5 focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d === 'all' ? '🇺🇬 All Uganda' : d}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type Choice */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Property Category</label>
        <div className="flex flex-wrap gap-1.5">
          {propertyTypes.map((pt) => (
            <button
              key={pt}
              onClick={() => onChange({ propertyType: pt as any })}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                filters.propertyType === pt
                  ? 'bg-gray-50 text-[#000000] border-[#000000] font-black'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {pt === 'all' ? 'All Types' : pt}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Switch & Price Slider */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Max Budget Price</label>
          {/* Currency Toggle */}
          <div className="flex border border-gray-200 rounded-md overflow-hidden text-[9px] font-bold">
            <button
              onClick={() => handleCurrencyChange('UGX')}
              className={`px-2 py-0.5 ${filters.currency === 'UGX' ? 'bg-[#000000] text-white' : 'bg-gray-50 text-gray-600'}`}
            >
              UGX
            </button>
            <button
              onClick={() => handleCurrencyChange('USD')}
              className={`px-2 py-0.5 ${filters.currency === 'USD' ? 'bg-[#000000] text-white' : 'bg-gray-50 text-gray-600'}`}
            >
              USD
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            type="range"
            min={filters.currency === 'USD' ? 5000 : 10000000}
            max={maxPriceLimit}
            step={priceStep}
            value={filters.maxPrice}
            onChange={handlePriceChange}
            className="w-full accent-[#000000] cursor-pointer"
          />
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-700">
            <span>Min</span>
            <span className="text-xs font-black text-[#000000] bg-gray-50 px-2 py-0.5 rounded-sm border border-gray-100">
              Under {formatPriceLabel(filters.maxPrice, filters.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Bedrooms selector */}
      {filters.propertyType !== 'Land' && filters.type !== 'short-stay' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Bedrooms</label>
          <div className="grid grid-cols-6 gap-1 p-1 bg-gray-50 border border-gray-100 rounded-md">
            {bedsOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ beds: opt })}
                className={`py-1 text-xs font-bold rounded-md transition-all ${
                  filters.beds === opt
                    ? 'bg-white text-[#000000] shadow-xs border border-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {opt === 'any' ? 'Any' : `${opt}+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Verified Agency Checkbox */}
      <div 
        onClick={() => onChange({ verifiedOnly: !filters.verifiedOnly })}
        className="flex items-center space-x-2.5 p-3.5 bg-gray-50/50 border border-gray-100/60 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <button className="text-[#000000]">
          {filters.verifiedOnly ? (
            <span className="text-gray-700">
              <CheckSquare className="w-5 h-5 fill-current text-white stroke-gray-700 stroke-2" />
            </span>
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-gray-900 flex items-center gap-0.5">
            <ShieldCheck className="w-4 h-4 text-gray-700" />
            Verified Agencies Only
          </p>
          <p className="text-[10px] text-gray-800 leading-tight">Filters out unvetted landlords and independent land agents.</p>
        </div>
      </div>

      {/* Counter label */}
      <div className="pt-2">
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide text-center">
          Matching items: <span className="text-gray-700 font-black">{resultsCount} listings</span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden lg:block w-72 bg-white border border-gray-200 rounded-lg p-4 h-fit sticky top-24 shadow-xs">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Overlay) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/65 backdrop-blur-xs">
          <div className="w-80 max-w-[85vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl animate-slide-in overflow-y-auto">
            <div>
              <div className="flex justify-end mb-2">
                <button 
                  onClick={onCloseMobile}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
