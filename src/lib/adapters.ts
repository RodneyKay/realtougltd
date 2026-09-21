import type { Database } from './database.types';
import type { Property, Agency } from '../types';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type AgencyRow = Database['public']['Tables']['agencies']['Row'];

/**
 * The DB schema and the app's existing `Property`/`Agency` types don't line
 * up 1:1. These adapters bridge the gap so the rest of the app (PropertyCard,
 * filters, etc.) doesn't need to change yet. Known lossy/approximate bits are
 * flagged inline — worth revisiting once real data is flowing.
 */

function mapCategoryToType(category: ListingRow['category']): Property['type'] {
  if (category === 'For Sale') return 'buy';
  if (category === 'For Rent' || category === 'Short-Stay') return 'rent';
  if (category === 'Commercial') return 'buy'; // ⚠️ approximation — DB has no buy/rent split for commercial
  return 'buy';
}

function mapStatus(status: ListingRow['status']): Property['status'] {
  switch (status) {
    case 'active':
      return 'available';
    case 'pending':
      return 'reserved';
    case 'sold':
    case 'rented':
      return 'sold';
    default:
      return 'available';
  }
}

export function listingToProperty(row: ListingRow): Property {
  return {
    id: row.id,
    title: row.title,
    type: mapCategoryToType(row.category),
    price: row.nightly_price ?? row.price,
    currency: row.currency === 'USD' ? 'USD' : 'UGX',
    location: row.location,
    district: row.location.split(',').pop()?.trim() ?? row.location, // ⚠️ best-effort; DB has no dedicated district column
    lat: row.latitude ?? 0,
    lng: row.longitude ?? 0,
    beds: row.bedrooms,
    baths: row.bathrooms,
    sizeSqm: row.area_sqft, // ⚠️ DB stores sqft, app expects sqm — no unit conversion applied yet
    plotSize: null, // not modeled in DB
    images: row.images ?? [],
    description: row.description ?? '',
    amenities: row.amenities ?? [],
    agencyId: row.agency_id ?? '',
    agentId: row.agent_id,
    status: mapStatus(row.status),
    verified: row.verified ?? false,
    label: row.featured ? 'Featured' : undefined,
    views: row.view_count ?? 0,
    isShortStay: row.category === 'Short-Stay',
    pricePeriod: row.nightly_price ? 'night' : undefined,
    isCommercial: row.category === 'Commercial',
  };
}

export function agencyRowToAgency(row: AgencyRow): Agency {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? '',
    bannerUrl: row.cover_url ?? '',
    bio: row.description ?? '',
    verified: row.verified ?? false,
    phone: row.phone ?? '',
    whatsapp: row.phone ?? '', // ⚠️ DB has no separate WhatsApp number field
    email: row.email ?? '',
    listingsCount: 0, // computed separately — see fetchAgencies() in api.ts
  };
}
