import { supabase } from '../../lib/supabaseClient';
import type {
  Database,
  AgencyBusinessType,
  AgencyMemberRole,
  AgencyInviteRole,
  ClientStage,
  FollowUpStatus,
  PropertyCategory,
  ListingStatus,
  SubscriptionTier,
  PlanOverview,
  EarlyAccessOffer,
  EnquiryStatus,
} from '../../lib/database.types';

export type PortalProfile = Database['public']['Tables']['profiles']['Row'];
export type PortalAgency = Database['public']['Tables']['agencies']['Row'];
export type PortalMembership = Database['public']['Tables']['agency_members']['Row'];
export type PortalInvite = Database['public']['Tables']['agency_invites']['Row'];
export type PortalKyc = Database['public']['Tables']['agency_kyc_submissions']['Row'];
export type PortalClient = Database['public']['Tables']['clients']['Row'];
export type PortalEnquiry = Database['public']['Tables']['enquiries']['Row'];
export type PortalFollowUp = Database['public']['Tables']['follow_ups']['Row'];
export type PortalRateCardItem = Database['public']['Tables']['ad_rate_card']['Row'];
export type PortalAd = Database['public']['Tables']['ads']['Row'];
export type PortalPromotionRequest = Database['public']['Tables']['promotion_requests']['Row'];

export interface RegisterAgencyDetails {
  contactName: string;
  email: string;
  phone: string;
  password: string;
  agencyName: string;
  businessType: AgencyBusinessType;
  city: string;
}

/**
 * Creates the auth user (role: 'agent' via the `handle_new_user` trigger,
 * which reads `raw_user_meta_data.role`), then either:
 *  - accepts a pending team invite (joins an existing agency), if `inviteToken` is set, or
 *  - creates a brand-new agency record and an 'owner' membership row.
 * If email confirmation is required by the project's auth settings, there
 * will be no active session yet — in that case we stop after signUp and
 * surface a "check your email" state, since RLS requires an authenticated
 * `auth.uid()` to write these rows.
 */
export async function registerAgency(
  details: RegisterAgencyDetails,
  inviteToken?: string
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: details.email,
    password: details.password,
    options: {
      data: { name: details.contactName, phone: details.phone, role: 'agent' },
    },
  });
  if (signUpError) throw signUpError;

  const userId = signUpData.user?.id;
  if (!userId) throw new Error('Registration did not return a user.');

  if (!signUpData.session) {
    // Email confirmation is required before we can write agency rows under RLS.
    return { needsEmailConfirmation: true };
  }

  if (inviteToken) {
    await acceptAgencyInvite(inviteToken, userId);
  } else {
    await createAgencyForUser(userId, details);
  }
  return { needsEmailConfirmation: false };
}

export async function acceptAgencyInvite(token: string, userId: string): Promise<void> {
  const { data: invite, error: inviteError } = await supabase
    .from('agency_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .maybeSingle();
  if (inviteError) throw inviteError;
  if (!invite) throw new Error('This invite link is invalid or has already been used.');

  const { error: memberError } = await supabase
    .from('agency_members')
    .insert({ agency_id: invite.agency_id, user_id: userId, role: invite.role });
  if (memberError) throw memberError;

  await supabase.from('agency_invites').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invite.id);
}

async function createAgencyForUser(userId: string, details: RegisterAgencyDetails): Promise<void> {
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({
      name: details.agencyName,
      owner_id: userId,
      email: details.email,
      phone: details.phone,
      city: details.city || null,
      business_type: details.businessType,
    })
    .select()
    .single();
  if (agencyError) throw agencyError;

  const { error: memberError } = await supabase.from('agency_members').insert({
    agency_id: agency.id,
    user_id: userId,
    role: 'owner',
  });
  if (memberError) throw memberError;
}

/**
 * Call after a signUp that returned no session, once the user has confirmed
 * their email and comes back to sign in for the first time — finishes
 * provisioning the agency if it wasn't created yet.
 */
export async function completeAgencyProvisioningIfNeeded(userId: string, details: RegisterAgencyDetails): Promise<void> {
  const existing = await fetchAgencyMembershipForUser(userId);
  if (existing) return;
  await createAgencyForUser(userId, details);
}

export type PortalListing = Database['public']['Tables']['listings']['Row'];

export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalSaves: number;
  topListings: Pick<PortalListing, 'id' | 'title' | 'view_count' | 'save_count'>[];
  recentListings: Pick<PortalListing, 'id' | 'title' | 'category' | 'price' | 'status' | 'created_at'>[];
}

export async function fetchAgencyDashboardStats(agencyId: string): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, category, price, status, view_count, save_count, created_at')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const listings = data ?? [];
  const totalViews = listings.reduce((sum, l) => sum + (l.view_count ?? 0), 0);
  const totalSaves = listings.reduce((sum, l) => sum + (l.save_count ?? 0), 0);
  const activeListings = listings.filter((l) => l.status === 'active').length;

  const topListings = [...listings]
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0))
    .slice(0, 5)
    .map((l) => ({ id: l.id, title: l.title, view_count: l.view_count, save_count: l.save_count }));

  const recentListings = listings.slice(0, 5).map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category,
    price: l.price,
    status: l.status,
    created_at: l.created_at,
  }));

  return { totalListings: listings.length, activeListings, totalViews, totalSaves, topListings, recentListings };
}

export interface TeamMember {
  userId: string;
  name: string | null;
  role: AgencyMemberRole | 'owner';
}

export async function fetchAgencyTeam(agency: PortalAgency): Promise<TeamMember[]> {
  const { data: members, error: membersError } = await supabase
    .from('agency_members')
    .select('user_id, role')
    .eq('agency_id', agency.id);
  if (membersError) throw membersError;

  const userIds = new Set<string>([agency.owner_id, ...(members ?? []).map((m) => m.user_id)]);
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', Array.from(userIds));
  if (profilesError) throw profilesError;

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  const roleByUser = new Map((members ?? []).map((m) => [m.user_id, m.role]));

  return Array.from(userIds).map((id) => ({
    userId: id,
    name: nameById.get(id) ?? null,
    role: id === agency.owner_id ? 'owner' : roleByUser.get(id) ?? 'agent',
  }));
}

export async function signInAgency(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutPortal() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchPortalProfile(userId: string): Promise<PortalProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Resolves the agency this user belongs to — either as owner (checked first,
 * since an owner may not yet have a matching agency_members row in edge
 * cases) or as a team member — along with their role in that agency.
 */
export async function fetchAgencyMembershipForUser(
  userId: string
): Promise<{ agency: PortalAgency; role: AgencyMemberRole | null } | null> {
  const { data: ownedAgency, error: ownedError } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();
  if (ownedError) throw ownedError;
  if (ownedAgency) return { agency: ownedAgency, role: 'owner' };

  const { data: membership, error: membershipError } = await supabase
    .from('agency_members')
    .select('role, agency_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) return null;

  const { data: memberAgency, error: memberAgencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', membership.agency_id)
    .maybeSingle();
  if (memberAgencyError) throw memberAgencyError;
  if (!memberAgency) return null;

  return { agency: memberAgency, role: membership.role };
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export async function fetchAgencyListingsFull(agencyId: string): Promise<PortalListing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface CreateListingInput {
  title: string;
  description: string;
  price: number;
  location: string;
  category: PropertyCategory;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  currency: 'UGX' | 'USD';
  images: string[];
  agencyId: string;
  agentId: string;
}

export async function createListing(input: CreateListingInput): Promise<PortalListing> {
  const { data, error } = await supabase
    .from('listings')
    .insert({
      title: input.title,
      description: input.description || null,
      price: input.price,
      location: input.location,
      category: input.category,
      type: input.type,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqft: input.area_sqft,
      currency: input.currency,
      images: input.images,
      agency_id: input.agencyId,
      agent_id: input.agentId,
      status: 'draft',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export interface UpdateListingInput {
  title: string;
  description: string;
  price: number;
  currency: 'UGX' | 'USD';
  location: string;
  category: PropertyCategory;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  images: string[];
}

export async function updateListing(id: string, input: UpdateListingInput): Promise<PortalListing> {
  const { data, error } = await supabase
    .from('listings')
    .update({
      title: input.title,
      description: input.description || null,
      price: input.price,
      currency: input.currency,
      location: input.location,
      category: input.category,
      type: input.type,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      area_sqft: input.area_sqft,
      images: input.images,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

const LISTING_BUCKET = 'listing-images';

/** Uploads one (already compressed) photo into the user's own folder and returns its public URL. */
export async function uploadListingImage(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(LISTING_BUCKET)
    .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return supabase.storage.from(LISTING_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Best-effort cleanup of a photo uploaded in this session; never throws. */
export async function removeListingImage(url: string): Promise<void> {
  const marker = `/${LISTING_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + marker.length).split('?')[0]);
  await supabase.storage.from(LISTING_BUCKET).remove([path]).catch(() => undefined);
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<void> {
  const { error } = await supabase.from('listings').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// KYC / Verification
// ---------------------------------------------------------------------------

export async function fetchLatestKycSubmission(agencyId: string): Promise<PortalKyc | null> {
  const { data, error } = await supabase
    .from('agency_kyc_submissions')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface SubmitKycInput {
  agencyId: string;
  submittedBy: string;
  businessRegistrationNumber: string;
  tinNumber: string;
  registrationCertificateUrl: string;
  ownerIdDocumentUrl: string;
  proofOfAddressUrl: string;
  additionalNotes: string;
}

export async function submitKyc(input: SubmitKycInput): Promise<PortalKyc> {
  const { data, error } = await supabase
    .from('agency_kyc_submissions')
    .insert({
      agency_id: input.agencyId,
      submitted_by: input.submittedBy,
      business_registration_number: input.businessRegistrationNumber,
      tin_number: input.tinNumber || null,
      registration_certificate_url: input.registrationCertificateUrl,
      owner_id_document_url: input.ownerIdDocumentUrl,
      proof_of_address_url: input.proofOfAddressUrl || null,
      additional_notes: input.additionalNotes || null,
    })
    .select()
    .single();
  if (error) throw error;

  // Reflect the pending state on the agency row immediately for the dashboard badge.
  await supabase.from('agencies').update({ kyc_status: 'pending' }).eq('id', input.agencyId);

  return data;
}

// ---------------------------------------------------------------------------
// Team & invites
// ---------------------------------------------------------------------------

export async function fetchAgencyInvites(agencyId: string): Promise<PortalInvite[]> {
  const { data, error } = await supabase
    .from('agency_invites')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function inviteTeamMember(agencyId: string, invitedBy: string, email: string, role: AgencyInviteRole): Promise<PortalInvite> {
  const { data, error } = await supabase
    .from('agency_invites')
    .insert({ agency_id: agencyId, email: email.toLowerCase().trim(), role, invited_by: invitedBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function revokeInvite(id: string): Promise<void> {
  const { error } = await supabase.from('agency_invites').update({ status: 'revoked' }).eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// CRM — clients (leads) & follow-ups
// ---------------------------------------------------------------------------

export async function fetchAgencyClients(agencyId: string): Promise<PortalClient[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface CreateClientInput {
  agencyId: string;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredLocation: string;
  propertyType: string;
  notes: string;
  linkedListingId?: string | null;
}

export async function createClient(input: CreateClientInput): Promise<PortalClient> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      agency_id: input.agencyId,
      agent_id: input.agentId,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      source: input.source || null,
      budget_min: input.budgetMin,
      budget_max: input.budgetMax,
      preferred_location: input.preferredLocation || null,
      property_type: input.propertyType || null,
      notes: input.notes || null,
      linked_listing_id: input.linkedListingId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateClientStage(id: string, stage: ClientStage): Promise<void> {
  const { error } = await supabase.from('clients').update({ stage }).eq('id', id);
  if (error) throw error;
}

export async function fetchAgencyFollowUps(agencyId: string): Promise<PortalFollowUp[]> {
  const { data, error } = await supabase
    .from('follow_ups')
    .select('*')
    .eq('agency_id', agencyId)
    .order('due_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export interface CreateFollowUpInput {
  agencyId: string;
  clientId: string;
  assignedTo: string;
  title: string;
  dueAt: string;
  notes: string;
}

export async function createFollowUp(input: CreateFollowUpInput): Promise<PortalFollowUp> {
  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      agency_id: input.agencyId,
      client_id: input.clientId,
      assigned_to: input.assignedTo,
      title: input.title,
      due_at: input.dueAt,
      notes: input.notes || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeFollowUp(id: string): Promise<void> {
  const { error } = await supabase.from('follow_ups').update({ status: 'done' }).eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Public invite lookup (unauthenticated) — narrow RPC, not a table select
// ---------------------------------------------------------------------------

export interface InvitePreview {
  agency_name: string;
  email: string;
  role: string;
  status: string;
}

export async function fetchInvitePreview(token: string): Promise<InvitePreview | null> {
  const { data, error } = await supabase.rpc('get_invite_by_token', { p_token: token });
  if (error) throw error;
  const rows = (data ?? []) as InvitePreview[];
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Marketing — paid boosts (ads) & free featured-listing requests (promotions)
// ---------------------------------------------------------------------------

export async function fetchAdRateCard(): Promise<PortalRateCardItem[]> {
  const { data, error } = await supabase.from('ad_rate_card').select('*').eq('active', true).order('price_ugx');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAgencyAds(agencyId: string): Promise<PortalAd[]> {
  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

const premiumFeaturePlacements = new Set(['priority_ranking', 'verified_spotlight', 'lead_alerts', 'social_autopost']);
const socialPlacements = new Set(['social_standard', 'social_premium']);

export interface CreateAdInput {
  agencyId: string;
  agentId: string;
  listingId: string | null;
  title: string;
  rateCard: PortalRateCardItem;
  startDate: string;
  endDate: string | null;
  costUgx: number;
  paymentMethod: string;
  paymentReference: string;
}

export async function createAd(input: CreateAdInput): Promise<PortalAd> {
  const type = premiumFeaturePlacements.has(input.rateCard.placement)
    ? 'premium_feature'
    : socialPlacements.has(input.rateCard.placement)
      ? 'social'
      : 'banner';
  const { data, error } = await supabase
    .from('ads')
    .insert({
      agency_id: input.agencyId,
      agent_id: input.agentId,
      listing_id: input.listingId,
      type,
      placement: input.rateCard.placement,
      title: input.title,
      start_date: input.startDate || null,
      end_date: input.endDate,
      cost_ugx: input.costUgx,
      payment_method: input.paymentMethod || null,
      payment_reference: input.paymentReference || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelAd(id: string): Promise<void> {
  const { error } = await supabase.from('ads').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw error;
}

export async function fetchAgencyPromotions(agencyId: string): Promise<PortalPromotionRequest[]> {
  const { data, error } = await supabase
    .from('promotion_requests')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPromotionRequest(agencyId: string, agentId: string, listingId: string, message: string): Promise<PortalPromotionRequest> {
  const { data, error } = await supabase
    .from('promotion_requests')
    .insert({ agency_id: agencyId, agent_id: agentId, listing_id: listingId, message: message || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePromotionRequest(id: string): Promise<void> {
  const { error } = await supabase.from('promotion_requests').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Plans, limits & usage
// ---------------------------------------------------------------------------

export type { PlanOverview, EarlyAccessOffer };

export const tierLabel: Record<SubscriptionTier, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Professional',
  business: 'Business',
  enterprise: 'Enterprise',
};

export interface PlanCatalogItem {
  code: SubscriptionTier;
  name: string;
  priceUgxMonthly: number | null;
  sortOrder: number;
  /** null = unlimited. Only limit keys (max_*, storage_mb) appear here. */
  limits: Record<string, number | null>;
}

const isLimitKey = (key: string) => key.startsWith('max_') || key === 'storage_mb';

/** Public plan list with their limits (readable without signing in). */
export async function fetchPlanCatalog(): Promise<PlanCatalogItem[]> {
  const [plansRes, entRes] = await Promise.all([
    supabase.from('plans').select('*').eq('is_public', true).order('sort_order', { ascending: true }),
    supabase.from('plan_entitlements').select('plan_id, key, limit_value'),
  ]);
  if (plansRes.error) throw plansRes.error;
  if (entRes.error) throw entRes.error;

  return (plansRes.data ?? []).map((p) => {
    const limits: Record<string, number | null> = {};
    (entRes.data ?? [])
      .filter((e) => e.plan_id === p.id && isLimitKey(e.key))
      .forEach((e) => {
        limits[e.key] = e.limit_value;
      });
    return { code: p.code, name: p.name, priceUgxMonthly: p.price_ugx_monthly, sortOrder: p.sort_order, limits };
  });
}

/** Plan, subscription status, effective limits and current usage for one agency. */
export async function fetchPlanOverview(agencyId: string): Promise<PlanOverview> {
  const { data, error } = await supabase.rpc('agency_plan_overview', { p_agency: agencyId });
  if (error) throw error;
  return data as PlanOverview;
}

/** Plan changes are approved by our team (no automatic billing yet). */
export async function requestPlanChange(input: {
  agencyId: string;
  currentTier: SubscriptionTier;
  requestedTier: SubscriptionTier;
  requestedBy: string;
  notes?: string;
}): Promise<void> {
  const { error } = await supabase.from('subscription_change_requests').insert({
    agency_id: input.agencyId,
    current_tier: input.currentTier,
    requested_tier: input.requestedTier,
    requested_by: input.requestedBy,
    notes: input.notes?.trim() || null,
  });
  if (error) throw error;
}

/** Limit errors raised by the database start with this prefix. */
export const isPlanLimitError = (message: string | null | undefined): boolean =>
  !!message && message.startsWith('Plan limit reached');

// ---------------------------------------------------------------------------
// Enquiries inbox (buyer enquiries, viewing requests, investment interest)
// ---------------------------------------------------------------------------

export async function fetchAgencyEnquiries(agencyId: string): Promise<PortalEnquiry[]> {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  return data ?? [];
}

export async function fetchNewEnquiryCount(agencyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('status', 'new');
  if (error) throw error;
  return count ?? 0;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus): Promise<void> {
  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) throw error;
  window.dispatchEvent(new Event('realto:enquiries-changed'));
}

/** Copies the buyer's details into the CRM as a new lead and links it back to the enquiry. */
export async function convertEnquiryToLead(enquiry: PortalEnquiry, agentId: string): Promise<void> {
  const client = await createClient({
    agencyId: enquiry.agency_id,
    agentId,
    name: enquiry.name,
    email: enquiry.email ?? '',
    phone: enquiry.phone ?? '',
    source: 'Marketplace enquiry',
    budgetMin: null,
    budgetMax: null,
    preferredLocation: '',
    propertyType: '',
    notes: [enquiry.listing_title ? `Re: ${enquiry.listing_title}` : null, enquiry.message].filter(Boolean).join('\n'),
    linkedListingId: enquiry.listing_id,
  });
  const { error } = await supabase
    .from('enquiries')
    .update({ client_id: client.id, status: enquiry.status === 'new' ? 'contacted' : enquiry.status })
    .eq('id', enquiry.id);
  if (error) throw error;
  window.dispatchEvent(new Event('realto:enquiries-changed'));
}

/** Open early-access packages with live spots-left counts (public; empty until you switch an offer on). */
export async function fetchEarlyAccessOffers(): Promise<EarlyAccessOffer[]> {
  const { data, error } = await supabase.rpc('early_access_offers_public');
  if (error) throw error;
  return (data ?? []) as EarlyAccessOffer[];
}

export const formatUgx = (n: number) => `UGX ${n.toLocaleString('en-US')}`;
