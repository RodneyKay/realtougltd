import { useState, useMemo } from 'react';
import { investmentOpportunities } from '../data'; // no `investment_opportunities` table in Supabase yet — still mock
import { useAppData } from '../context/DataContext';

export function usePropertyFilters(initialCategory: string = 'residential') {
  const { properties, agencies, loading: propertiesLoading, error: propertiesError } = useAppData();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  
  const [residentialToggle, setResidentialToggle] = useState<'all' | 'buy' | 'rent'>('all');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestsCount, setGuestsCount] = useState<number | 'any'>('any');
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | 'Kampala' | 'Wakiso' | 'Entebbe' | 'Jinja'>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'Apartment' | 'House' | 'Studio' | 'Land' | 'New Developments' | 'Commercial'>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(1500000000); // 1.5 Billion UGX as default upper limit
  const [currencyFilter, setCurrencyFilter] = useState<'UGX' | 'USD'>('UGX');
  const [bedsFilter, setBedsFilter] = useState<'any' | number>('any');
  const [verifiedOnlyFilter, setVerifiedOnlyFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'views'>('newest');

  const [investmentTypeFilter, setInvestmentTypeFilter] = useState<'all' | 'off-plan' | 'land' | 'fractional' | 'rental-yield'>('all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDistrict('all');
    setPropertyTypeFilter('all');
    setCurrencyFilter('UGX');
    setMaxPriceFilter(1500000000);
    setBedsFilter('any');
    setVerifiedOnlyFilter(false);
    setSortBy('newest');
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // 1. Category Level Filtering
      if (activeCategory === 'residential') {
        if (prop.isCommercial) return false;
        if (prop.isShortStay) return false;
        if (residentialToggle === 'buy' && prop.type !== 'buy') return false;
        if (residentialToggle === 'rent' && prop.type !== 'rent') return false;
      } else if (activeCategory === 'commercial') {
        if (!prop.isCommercial) return false;
      } else if (activeCategory === 'short-stay') {
        if (!prop.isShortStay) return false;
        if (guestsCount !== 'any') {
          if (prop.beds && prop.beds < guestsCount) return false;
        }
      } else {
        if (activeCategory === 'buy' && prop.type !== 'buy') return false;
        if (activeCategory === 'rent' && prop.type !== 'rent') return false;
        if (activeCategory === 'invest' && prop.type !== 'invest') return false;
      }

      // 2. Global Search query matching
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prop.title.toLowerCase().includes(query);
        const matchesLocation = prop.location.toLowerCase().includes(query);
        const matchesDesc = prop.description.toLowerCase().includes(query);
        const agencyName = agencies.find(a => a.id === prop.agencyId)?.name.toLowerCase() || '';
        const matchesAgency = agencyName.includes(query);
        
        if (!matchesTitle && !matchesLocation && !matchesDesc && !matchesAgency) {
          return false;
        }
      }

      // 3. District location filter
      if (selectedDistrict !== 'all' && prop.district !== selectedDistrict) return false;

      // 4. Property category type
      if (propertyTypeFilter !== 'all') {
        const pFilter = propertyTypeFilter.toLowerCase();
        if (pFilter === 'apartment') {
          const isApt = prop.title.toLowerCase().indexOf('apartment') !== -1 || 
                        prop.title.toLowerCase().indexOf('penthouse') !== -1 || 
                        prop.title.toLowerCase().indexOf('loft') !== -1 ||
                        (prop.beds !== null && !prop.isCommercial && prop.title.toLowerCase().indexOf('mansion') === -1 && prop.title.toLowerCase().indexOf('house') === -1);
          if (!isApt) return false;
        } else if (pFilter === 'house') {
          const isHouse = prop.title.toLowerCase().indexOf('house') !== -1 || 
                          prop.title.toLowerCase().indexOf('mansion') !== -1 || 
                          prop.title.toLowerCase().indexOf('cottage') !== -1 ||
                          prop.title.toLowerCase().indexOf('villa') !== -1;
          if (!isHouse) return false;
        } else if (pFilter === 'studio') {
          const isStudio = prop.title.toLowerCase().indexOf('studio') !== -1 || 
                           prop.title.toLowerCase().indexOf('loft') !== -1 || 
                           prop.title.toLowerCase().indexOf('1 bedroom') !== -1;
          if (!isStudio) return false;
        } else if (pFilter === 'land') {
          if (prop.beds !== null) return false;
        } else if (pFilter === 'new developments' || pFilter === 'new development') {
          const isNew = prop.label?.toLowerCase() === 'off-plan' || 
                        prop.label?.toLowerCase() === 'new' || 
                        prop.title.toLowerCase().indexOf('off-plan') !== -1 || 
                        prop.title.toLowerCase().indexOf('development') !== -1;
          if (!isNew) return false;
        } else if (pFilter === 'commercial') {
          if (!prop.isCommercial) return false;
        }
      }

      // 5. Currency Check
      if (prop.currency !== currencyFilter) return false;

      // 6. Max budget price check
      if (prop.price > maxPriceFilter) return false;

      // 7. Bedrooms configuration
      if (bedsFilter !== 'any' && propertyTypeFilter !== 'Land' && !prop.isCommercial) {
        if (prop.beds === null) return false;
        if (prop.beds < bedsFilter) return false;
      }

      // 8. Verified check
      if (verifiedOnlyFilter && !prop.verified) return false;

      return true;
    });
  }, [properties, agencies, activeCategory, residentialToggle, searchQuery, selectedDistrict, propertyTypeFilter, currencyFilter, maxPriceFilter, bedsFilter, verifiedOnlyFilter, guestsCount]);

  const sortedProperties = useMemo(() => {
    return [...filteredProperties].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'views') return b.views - a.views;
      return b.id.localeCompare(a.id);
    });
  }, [filteredProperties, sortBy]);

  const filteredInvestments = useMemo(() => {
    return investmentOpportunities.filter((opp) => {
      if (investmentTypeFilter !== 'all' && opp.opportunityType !== investmentTypeFilter) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const prop = properties.find((p) => p.id === opp.propertyId);
        const agencyName = agencies.find(a => a.id === prop?.agencyId)?.name.toLowerCase() || '';
        
        if (prop) {
          const matchesTitle = prop.title.toLowerCase().includes(query);
          const matchesLocation = prop.location.toLowerCase().includes(query);
          if (!matchesTitle && !matchesLocation && !agencyName.includes(query)) return false;
        } else {
          return false;
        }
      }

      return true;
    });
  }, [investmentTypeFilter, searchQuery, properties, agencies]);

  return {
    propertiesLoading, propertiesError,
    activeCategory, setActiveCategory,
    residentialToggle, setResidentialToggle,
    checkInDate, setCheckInDate,
    checkOutDate, setCheckOutDate,
    guestsCount, setGuestsCount,
    searchQuery, setSearchQuery,
    selectedDistrict, setSelectedDistrict,
    propertyTypeFilter, setPropertyTypeFilter,
    maxPriceFilter, setMaxPriceFilter,
    currencyFilter, setCurrencyFilter,
    bedsFilter, setBedsFilter,
    verifiedOnlyFilter, setVerifiedOnlyFilter,
    sortBy, setSortBy,
    investmentTypeFilter, setInvestmentTypeFilter,
    handleResetFilters,
    filteredProperties,
    sortedProperties,
    filteredInvestments
  };
}
