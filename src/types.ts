/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Property {
  id: string;
  title: string;
  type: 'buy' | 'rent' | 'invest';
  price: number;
  currency: 'UGX' | 'USD';
  location: string;
  district: string; // e.g., "Kampala", "Wakiso", "Entebbe", "Jinja"
  lat: number;
  lng: number;
  beds: number | null;
  baths: number | null;
  sizeSqm: number | null;
  plotSize: string | null; // e.g., "50x100 ft", "1 Acre"
  images: string[];
  description: string;
  amenities: string[];
  agencyId: string;
  agentId: string | null;
  status: 'available' | 'reserved' | 'sold' | 'funded';
  verified: boolean;
  label?: string; // Jumia-style badges: "Flash Deal", "Price Reduced", "New", "Off-Plan", "Hot Deal"
  views: number;
  isShortStay?: boolean;
  pricePeriod?: 'night' | 'week' | 'month';
  isCommercial?: boolean;
}

export interface Agency {
  id: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  bio: string;
  verified: boolean;
  phone: string;
  whatsapp: string;
  email: string;
  listingsCount: number;
}

export interface InvestmentOpportunity {
  id: string;
  propertyId: string; // References the underlying property details
  projectedRoi: number; // e.g., 14 means 14% p.a.
  minInvestment: number;
  minInvestmentCurrency: 'UGX' | 'USD';
  fundingProgressPct: number; // 0 to 100
  completionDate: string; // e.g., "Dec 2027"
  opportunityType: 'off-plan' | 'land' | 'fractional' | 'rental-yield';
  investorsCount: number;
  targetFunding: string; // e.g., "$500,000" or "UGX 2.5 Billion"
}

export interface ContactRecord {
  id: string;
  propertyId?: string;
  propertyName?: string;
  investmentId?: string;
  investmentName?: string;
  agencyId: string;
  agencyName: string;
  type: 'viewing' | 'enquiry' | 'investment';
  date: string;
  message: string;
  name: string;
  email: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  savedPropertyIds: string[];
  contactHistory: ContactRecord[];
}
