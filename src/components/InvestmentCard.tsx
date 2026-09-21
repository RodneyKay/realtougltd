/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Percent, TrendingUp, DollarSign, Calendar, Users, MapPin, Building, ShieldCheck } from 'lucide-react';
import { InvestmentOpportunity, Property } from '../types';
import { useAppData } from '../context/DataContext';
import { formatPrice } from './PropertyCard';

interface InvestmentCardProps {
  opportunity: InvestmentOpportunity;
  onClick: (oppId: string) => void;
  onExpressInterest: (oppId: string, e: React.MouseEvent) => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  opportunity,
  onClick,
  onExpressInterest
}) => {
  const { properties, agencies } = useAppData();
  const property = properties.find((p) => p.id === opportunity.propertyId);
  const agency = property ? agencies.find((a) => a.id === property.agencyId) : null;

  if (!property) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'off-plan':
        return 'Off-Plan development';
      case 'land':
        return 'Land Speculation';
      case 'fractional':
        return 'Fractional / Co-Own';
      case 'rental-yield':
        return 'Rental Income Yield';
      default:
        return 'High-ROI Investment';
    }
  };

  return (
    <div 
      onClick={() => onClick(opportunity.id)}
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer text-black"
      id={`investment-card-${opportunity.id}`}
    >
      {/* Upper section with ROI callout */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img 
          src={property.images[0]} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Merchandising overlay: Projected ROI */}
        <div className="absolute top-3 left-3 bg-black text-white font-black px-2.5 py-1 rounded-sm text-xs flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{opportunity.projectedRoi}% Projected ROI</span>
        </div>

        {/* Investment type badge */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <span className="bg-white/95 text-black border border-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
            {getTypeLabel(opportunity.opportunityType)}
          </span>
          {property.verified && (
            <span className="bg-black text-white border border-black text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              Verified Project
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          {/* Title */}
          <h4 className="text-sm font-bold text-black group-hover:text-gray-600 transition-colors line-clamp-2 leading-tight">
            {property.title}
          </h4>

          {/* Location and Developer name */}
          <div className="flex flex-col space-y-1 text-xs text-gray-500">
            {agency && (
              <div className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-semibold text-gray-600">{agency.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        {/* ROI and Min Investment section */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Min Capital</span>
            <span className="text-sm font-black text-black">
              {formatPrice(opportunity.minInvestment, opportunity.minInvestmentCurrency)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Est. Exit</span>
            <span className="text-xs font-black text-gray-700 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {opportunity.completionDate}
            </span>
          </div>
        </div>

        {/* Funding progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] font-semibold text-gray-700">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              {opportunity.investorsCount} Investors
            </span>
            <span>{opportunity.fundingProgressPct}% Co-funded</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black rounded-full" 
              style={{ width: `${opportunity.fundingProgressPct}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Target: {opportunity.targetFunding}</span>
            <span>{100 - opportunity.fundingProgressPct}% Left</span>
          </div>
        </div>

        {/* Click CTA info */}
        <div className="pt-1.5 flex items-center justify-between border-t border-gray-200">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Public Offering</span>
          <button
            onClick={(e) => {
              onExpressInterest(opportunity.id, e);
            }}
            className="px-3 py-1 bg-black hover:bg-gray-800 text-white font-black rounded-xs text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Express Interest
          </button>
        </div>
      </div>
    </div>
  );
};
