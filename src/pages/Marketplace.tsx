import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, Map, Info, Home as HomeIcon, SlidersHorizontal as SlidersHorizontalIcon } from 'lucide-react';
import { FiltersSidebar } from '../components/FiltersSidebar';
import { PropertyCard } from '../components/PropertyCard';
import { MapMock } from '../components/MapMock';
import { useAppContext } from '../context/AppContext';
import { usePropertyFilters } from '../hooks/usePropertyFilters';

export const Marketplace: React.FC<{ initialCategory?: string }> = ({ initialCategory = 'residential' }) => {
  const { user, handleSaveToggle } = useAppContext();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleListingsCount, setVisibleListingsCount] = useState(6);

  const filters = usePropertyFilters(searchParams.get('category') || initialCategory);

  // usePropertyFilters only reads its initial-category argument once (on
  // mount), so re-sync whenever the ?category= query param changes — e.g.
  // navigating here again via the categories dropdown while already on
  // /marketplace won't remount the component, just update the URL.
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== filters.activeCategory) {
      filters.setActiveCategory(categoryParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Contextual Header */}
      {filters.activeCategory === 'residential' && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Residential Marketplace</h2>
            <p className="text-xs text-gray-500 font-medium">Houses, apartments, and styled studios in Kampala, Entebbe, and more.</p>
          </div>
          <div className="flex bg-stone-100 p-1 rounded-lg border border-stone-200 w-fit shrink-0">
            {[
              { label: 'All Listings', value: 'all' },
              { label: 'For Sale', value: 'buy' },
              { label: 'To Rent', value: 'rent' }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => filters.setResidentialToggle(opt.value as any)}
                className={`px-4 py-1.5 text-xs font-black uppercase rounded-md tracking-wider transition-all cursor-pointer ${
                  filters.residentialToggle === opt.value
                    ? 'bg-[#000000] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filters.activeCategory === 'commercial' && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-1">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Commercial Property</h2>
          <p className="text-xs text-gray-500 font-medium">Browse verified office buildings, premium retail stalls, and storage warehouses.</p>
        </div>
      )}

      {filters.activeCategory === 'short-stay' && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Short-stay & Furnished Rentals</h2>
            <p className="text-xs text-gray-500 font-medium">Serviced penthouses, Airbnb-style rooms, and nightly vacation stays.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase">Check-In Date</label>
              <input
                type="date"
                value={filters.checkInDate}
                onChange={(e) => filters.setCheckInDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#000000]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase">Check-Out Date</label>
              <input
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => filters.setCheckOutDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#000000]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase">Guests Limit</label>
              <select
                value={filters.guestsCount}
                onChange={(e) => filters.setGuestsCount(e.target.value === 'any' ? 'any' : Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#000000]"
              >
                <option value="any">Any Capacity</option>
                <option value="1">1 Guest</option>
                <option value="2">2+ Guests</option>
                <option value="3">3+ Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  filters.setCheckInDate('');
                  filters.setCheckOutDate('');
                  filters.setGuestsCount('any');
                }}
                className="w-full py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold uppercase tracking-wider rounded-md text-xs cursor-pointer text-center"
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>
      )}

      {filters.searchQuery.trim() !== '' && (
        <div className="bg-gray-50 border border-gray-100 text-xs py-2.5 px-4 rounded-md text-gray-700 flex items-center justify-between">
          <p className="font-medium">
            Showing results for search term: &quot;<strong className="text-[#000000]">{filters.searchQuery}</strong>&quot; inside <strong className="text-gray-900">{filters.selectedDistrict === 'all' ? 'All Uganda' : filters.selectedDistrict}</strong>
          </p>
          <button onClick={filters.handleResetFilters} className="text-[10px] font-black uppercase text-[#000000] tracking-wider underline cursor-pointer">Clear search</button>
        </div>
      )}

      {/* Filter / Sort Layout toolbar strip */}
      <div className="bg-white border border-gray-200 rounded-lg p-3.5 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-md text-xs uppercase tracking-wider cursor-pointer"
          >
            <SlidersHorizontalIcon className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
            Catalog Index: <span className="text-gray-900 font-black">{filters.sortedProperties.length} Properties</span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#000000] shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              title="Display List Grid"
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'map' ? 'bg-white text-[#000000] shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              title="Display Vector Street Map"
            >
              <Map className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <span className="hidden sm:inline font-bold text-gray-400 uppercase text-[10px]">Sort By</span>
            <select
              value={filters.sortBy}
              onChange={(e) => filters.setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 rounded-md py-1.5 px-2.5 font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#000000] cursor-pointer"
            >
              <option value="newest">Just Listed First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="views">Most Popular Views</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <FiltersSidebar
          filters={{
            type: filters.activeCategory as any,
            propertyType: filters.propertyTypeFilter,
            currency: filters.currencyFilter,
            maxPrice: filters.maxPriceFilter,
            beds: filters.bedsFilter,
            district: filters.selectedDistrict,
            verifiedOnly: filters.verifiedOnlyFilter,
            searchQuery: filters.searchQuery
          }}
          onChange={(updated) => {
            if (updated.type) filters.setActiveCategory(updated.type as any);
            if (updated.propertyType) filters.setPropertyTypeFilter(updated.propertyType as any);
            if (updated.currency) filters.setCurrencyFilter(updated.currency as any);
            if (updated.maxPrice !== undefined) filters.setMaxPriceFilter(updated.maxPrice);
            if (updated.beds) filters.setBedsFilter(updated.beds as any);
            if (updated.district) filters.setSelectedDistrict(updated.district as any);
            if (updated.verifiedOnly !== undefined) filters.setVerifiedOnlyFilter(updated.verifiedOnly);
          }}
          onReset={filters.handleResetFilters}
          resultsCount={filters.sortedProperties.length}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        <div className="flex-1 space-y-6">
          {viewMode === 'map' ? (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 border border-gray-100 text-gray-900 text-xs rounded-lg flex items-center space-x-2">
                <Info className="w-4 h-4 text-gray-700 shrink-0" />
                <p className="font-semibold">Drag the map around, zoom in, and click property pins to reveal price overlays.</p>
              </div>
              <MapMock 
                properties={filters.sortedProperties} 
                onPropertyClick={() => {}} 
              />
            </div>
          ) : (
            <>
              {filters.propertiesLoading ? (
                <div className="p-16 text-center bg-white border border-gray-200 rounded-lg space-y-3 shadow-xs">
                  <HomeIcon className="w-12 h-12 text-gray-300 mx-auto animate-pulse" />
                  <h4 className="text-base font-black text-gray-800">Loading listings…</h4>
                </div>
              ) : filters.propertiesError ? (
                <div className="p-16 text-center bg-white border border-red-200 rounded-lg space-y-3 shadow-xs">
                  <Info className="w-12 h-12 text-red-400 mx-auto" />
                  <h4 className="text-base font-black text-gray-800">Couldn't load listings</h4>
                  <p className="text-xs text-red-500 max-w-md mx-auto leading-relaxed font-mono">{filters.propertiesError}</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly in .env.local, then restart the dev server.
                  </p>
                </div>
              ) : filters.sortedProperties.length === 0 ? (
                <div className="p-16 text-center bg-white border border-gray-200 rounded-lg space-y-3 shadow-xs">
                  <HomeIcon className="w-12 h-12 text-gray-300 mx-auto" />
                  <h4 className="text-base font-black text-gray-800">No properties match your current filters</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Try expanding your budget parameters, switching between UGX and USD currencies, or choosing &quot;All Uganda&quot; district options.
                  </p>
                  <button 
                    onClick={filters.handleResetFilters}
                    className="px-4 py-2 bg-[#000000] hover:bg-[#262626] text-white font-black text-xs uppercase tracking-wider rounded-md shadow-md cursor-pointer transition-all mt-2"
                  >
                    Reset Search Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filters.sortedProperties.slice(0, visibleListingsCount).map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      isSaved={user ? user.savedPropertyIds.includes(prop.id) : false}
                      onSaveToggle={handleSaveToggle}
                      onClick={(id) => { window.location.href = `/property/${id}`; }}
                      onAgencyClick={(agencyId) => { window.location.href = `/agency/${agencyId}`; }}
                    />
                  ))}
                </div>
              )}

              {filters.sortedProperties.length > visibleListingsCount && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setVisibleListingsCount(prev => prev + 6)}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold hover:border-[#000000] hover:text-[#000000] text-xs uppercase tracking-wider rounded-md shadow-xs transition-all cursor-pointer"
                  >
                    Load more items
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
