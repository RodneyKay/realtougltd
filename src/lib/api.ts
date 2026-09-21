import { supabase } from './supabaseClient';
import { listingToProperty, agencyRowToAgency } from './adapters';
import type { Property, Agency, ContactRecord } from '../types';
import type { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export async function signUpWithEmail(details: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: details.email,
    password: details.password,
    options: { data: { name: details.name, phone: details.phone, role: 'user' } },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(listingToProperty);
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).maybeSingle();

  if (error) throw error;
  return data ? listingToProperty(data) : null;
}

export async function fetchAgencies(): Promise<Agency[]> {
  const { data: agencyRows, error } = await supabase.from('agencies').select('*');
  if (error) throw error;
  if (!agencyRows) return [];

  // listingsCount isn't stored on the agency row — count active listings per agency.
  const { data: counts, error: countError } = await supabase
    .from('listings')
    .select('agency_id')
    .eq('status', 'active');
  if (countError) throw countError;

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (!row.agency_id) continue;
    countMap.set(row.agency_id, (countMap.get(row.agency_id) ?? 0) + 1);
  }

  return agencyRows.map((row) => ({
    ...agencyRowToAgency(row),
    listingsCount: countMap.get(row.id) ?? 0,
  }));
}

export async function fetchAgencyById(id: string): Promise<Agency | null> {
  const { data, error } = await supabase.from('agencies').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { count } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', id)
    .eq('status', 'active');

  return { ...agencyRowToAgency(data), listingsCount: count ?? 0 };
}

export async function createViewingRequest(details: {
  listingId: string;
  buyerId: string;
  agentId: string;
  scheduledAt: string; // ISO timestamp
  notes: string;
}): Promise<void> {
  const { error } = await supabase.from('viewing_requests').insert({
    listing_id: details.listingId,
    buyer_id: details.buyerId,
    agent_id: details.agentId,
    scheduled_at: details.scheduledAt,
    notes: details.notes,
  });
  if (error) throw error;
}

export async function fetchFavoriteListingIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('listing_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.listing_id);
}

export async function toggleFavorite(userId: string, listingId: string, isSaved: boolean): Promise<void> {
  if (isSaved) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId });
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// Enquiries (buyer -> agency)
// ---------------------------------------------------------------------------

type EnquiryRow = Database['public']['Tables']['enquiries']['Row'];

const enquiryRowToContactRecord = (row: EnquiryRow): ContactRecord => ({
  id: row.id,
  propertyId: row.listing_id ?? undefined,
  propertyName: row.listing_title ?? undefined,
  agencyId: row.agency_id,
  agencyName: row.agency_name ?? 'Agency',
  type: row.kind,
  date: row.created_at.replace('T', ' ').substring(0, 16),
  message: row.message ?? '',
  name: row.name,
  email: row.email ?? '',
  phone: row.phone ?? '',
});

/** Sends an enquiry / viewing request / investment interest to the agency's inbox. Requires a signed-in buyer. */
export async function submitEnquiry(details: {
  kind: 'enquiry' | 'viewing' | 'investment';
  name: string;
  email: string;
  phone: string;
  message: string;
  listingId?: string;
  agencyId?: string;
  scheduledAt?: string;
}): Promise<string> {
  const { data, error } = await supabase.rpc('submit_enquiry', {
    p_kind: details.kind,
    p_name: details.name,
    p_email: details.email,
    p_phone: details.phone,
    p_message: details.message,
    p_listing_id: details.listingId ?? null,
    p_agency_id: details.agencyId ?? null,
    p_scheduled_at: details.scheduledAt ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** The buyer's own enquiry history (persisted, unlike the old browser-only list). */
export async function fetchMyEnquiries(userId: string): Promise<ContactRecord[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(enquiryRowToContactRecord);
}
