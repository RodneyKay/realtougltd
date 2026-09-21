/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, MapPin, Bed, Bath, Maximize2, ShieldCheck, Eye } from 'lucide-react';
import { Property, Agency } from '../types';
import { useAppData } from '../context/DataContext';

interface PropertyCardProps {
  property: Property;
  isSaved: boolean;
  onSaveToggle: (id: string, e: React.MouseEvent) => void;
  onClick: (id: string) => void;
  onAgencyClick?: (agencyId: string, e: React.MouseEvent) => void;
}

export const formatPrice = (price: number, currency: 'UGX' | 'USD'): string => {
  const formatted = new Intl.NumberFormat('en-US').format(price);
  if (currency === 'USD') {
    return `$${formatted}`;
  }
  return `UGX ${formatted}`;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved,
  onSaveToggle,
  onClick,
  onAgencyClick
}) => {
  const { agencies } = useAppData();
  const agency = agencies.find((a) => a.id === property.agencyId);

  // Label background and colors based on value
  const getCalmLabel = (label: string, isLand: boolean): string => {
    const lowercase = label.toLowerCase();
    if (lowercase.includes('deal') || lowercase.includes('hot')) {
      return 'Verified';
    }
    if (lowercase.includes('reduced') || lowercase.includes('price')) {
      return isLand ? 'Titled land' : 'Verified';
    }
    if (lowercase.includes('new')) {
      return 'New listing';
    }
    if (lowercase.includes('off-plan')) {
      return 'Off-plan';
    }
    return 'Verified';
  };

  const getLabelStyles = (calmLabel: string) => {
    switch (calmLabel.toLowerCase()) {
      case 'new listing':
        return 'bg-[#000000] text-white border border-[#262626]';
      case 'titled land':
        return 'bg-gray-800 text-white border border-gray-700';
      case 'off-plan':
        return 'bg-stone-100 text-stone-800 border border-stone-300';
      case 'verified':
      default:
        return 'bg-gray-900 text-white border border-gray-800';
    }
  };

  const isLand = property.beds === null && property.baths === null;
  const calmLabel = property.label ? getCalmLabel(property.label, isLand) : '';

  return (
    <div 
      onClick={() => onClick(property.id)}
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
      id={`property-card-${property.id}`}
    >
      {/* Upper Media Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {calmLabel && (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm ${getLabelStyles(calmLabel)}`}>
              {calmLabel}
            </span>
          )}
          {property.verified && !calmLabel.toLowerCase().includes('verified') && (
            <span className="bg-gray-900 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm flex items-center gap-1 border border-gray-800">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Icon */}
        <button 
          onClick={(e) => onSaveToggle(property.id, e)}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 hover:scale-110 z-10 ${isSaved ? 'bg-gray-50 text-gray-700' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
          aria-label="Save property"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Rent/Buy/Invest Flag */}
        <div className="absolute bottom-2 left-2">
          <span className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
            property.isShortStay
              ? 'bg-purple-50 text-purple-800 border border-purple-200'
              : property.type === 'buy' 
                ? 'bg-stone-50 text-[#000000] border border-[#000000]/20' 
                : property.type === 'rent'
                  ? 'bg-gray-50 text-gray-900 border border-gray-200'
                  : 'bg-stone-100 text-stone-950 border border-stone-200'
          }`}>
            {property.isShortStay ? 'Short-stay' : `For ${property.type}`}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          {/* Price - Bold, primary focus like Jumia products */}
          <div className="flex items-baseline justify-between">
            <span className="text-base font-extrabold text-gray-950 leading-tight">
              {formatPrice(property.price, property.currency)}
            </span>
            {property.type === 'rent' && (
              <span className="text-xs text-gray-500 font-medium">/ {property.pricePeriod || (property.isShortStay ? 'night' : 'month')}</span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#000000] transition-colors">
            {property.title}
          </h4>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-[11px] gap-0.5 pt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Specifications Strip */}
        <div className="grid grid-cols-3 gap-1 py-1.5 border-t border-b border-gray-100 text-[10px] text-gray-600 font-bold">
          {property.beds !== null ? (
            <div className="flex items-center gap-1 justify-center">
              <Bed className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{property.beds} Beds</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-center text-gray-400 font-medium">
              <span>Land Plot</span>
            </div>
          )}

          {property.baths !== null ? (
            <div className="flex items-center gap-1 justify-center">
              <Bath className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{property.baths} Baths</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-center text-gray-400 font-medium">
              <span>N/A</span>
            </div>
          )}

          <div className="flex items-center gap-1 justify-center">
            <Maximize2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {property.sizeSqm ? `${property.sizeSqm}m²` : property.plotSize || 'Titled'}
            </span>
          </div>
        </div>

        {/* Agency storefront line */}
        {agency && (
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <div 
              onClick={(e) => {
                if (onAgencyClick) {
                  onAgencyClick(agency.id, e);
                }
              }}
              className="flex items-center space-x-1.5 hover:text-[#000000] group-hover:underline max-w-[70%]"
            >
              <img 
                src={agency.logoUrl} 
                alt={agency.name} 
                className="w-4 h-4 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
              />
              <span className="truncate font-semibold text-gray-700">{agency.name}</span>
            </div>
            
            <div className="flex items-center text-gray-400 text-[10px] space-x-0.5">
              <Eye className="w-3 h-3" />
              <span>{property.views}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
