/**
 * Hand-written subset of the Supabase schema, covering only the tables the
 * frontend currently uses (listings, agencies, profiles, favorites).
 *
 * The project has 20+ tables (contracts, commissions, KYC, chat, ads, etc.)
 * that aren't modeled here yet. Once `Supabase:generate_typescript_types` is
 * approved/available, run it and replace this file with the full generated
 * output for accuracy.
 */

export type PropertyCategory = 'For Rent' | 'For Sale' | 'Commercial' | 'Short-Stay';
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'rented' | 'archived';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';
export type EnquiryKind = 'enquiry' | 'viewing' | 'investment';
export type EnquiryStatus = 'new' | 'contacted' | 'closed';
export type PlanChangeStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';

/** Shape returned by the `agency_plan_overview` RPC. */
export interface PlanOverview {
  plan: { code: SubscriptionTier; name: string; price_ugx_monthly: number | null } | null;
  status: SubscriptionStatus | null;
  /** true once the paid term ended (+7 days grace): limits fall back to the Free plan */
  expired: boolean;
  trial_ends_at: string | null;
  current_period_end: string | null;
  grace_until: string | null;
  /** limit keys -> { unlimited, max }, flag keys -> { enabled } */
  entitlements: Record<string, { unlimited?: boolean; max?: number | null; enabled?: boolean }>;
  /** current usage for the limits the database enforces */
  usage: { max_users: number; max_properties: number; max_crm_contacts: number };
  pending_change: { requested_tier: SubscriptionTier; created_at: string } | null;
  early_access: { name: string; expires_at: string } | null;
}

/** An open early-access package, as returned by `early_access_offers_public`. */
export interface EarlyAccessOffer {
  code: string;
  name: string;
  description: string | null;
  price_ugx: number;
  duration_months: number;
  audience: 'agency' | 'developer' | 'any';
  slot_cap: number;
  slots_left: number;
}
export type KycStatus = 'not_submitted' | 'pending' | 'under_review' | 'approved' | 'rejected';
export type UserRole = 'user' | 'agent' | 'admin';
export type AgencyBusinessType = 'agency' | 'developer';
export type AgencyMemberRole = 'owner' | 'agency_admin' | 'agent' | 'accountant' | 'hr';
export type AgencyInviteRole = 'agency_admin' | 'agent' | 'accountant' | 'hr';
export type AgencyInviteStatus = 'pending' | 'accepted' | 'revoked';
export type ClientStage = 'new' | 'contacted' | 'qualified' | 'viewing' | 'negotiating' | 'closed_won' | 'closed_lost';
export type FollowUpStatus = 'pending' | 'done' | 'snoozed';
export type AdPlacement =
  | 'homepage'
  | 'search'
  | 'category'
  | 'social_standard'
  | 'social_premium'
  | 'priority_ranking'
  | 'verified_spotlight'
  | 'lead_alerts'
  | 'social_autopost';
export type AdType = 'banner' | 'social' | 'premium_feature';
export type AdPricingUnit = 'per_day' | 'per_week' | 'per_month' | 'flat';
export type AdStatus = 'pending_payment' | 'paid' | 'scheduled' | 'active' | 'completed' | 'rejected' | 'cancelled' | 'refunded';
export type PromotionStatus = 'pending' | 'approved' | 'rejected';

export interface Database {
  public: {
    Tables: {
      listings: {
        Relationships: [];
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          nightly_price: number | null;
          location: string;
          latitude: number | null;
          longitude: number | null;
          category: PropertyCategory;
          type: string;
          status: ListingStatus | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqft: number | null;
          verified: boolean | null;
          featured: boolean | null;
          images: string[] | null;
          video_url: string | null;
          virtual_tour_url: string | null;
          floor_plan_url: string | null;
          agent_id: string | null;
          agency_id: string | null;
          amenities: string[] | null;
          availability: 'Available' | 'Booked' | 'Limited' | null;
          view_count: number | null;
          save_count: number | null;
          created_at: string | null;
          updated_at: string | null;
          moderation_notes: string | null;
          currency: 'UGX' | 'USD';
        };
        Insert: Partial<Database['public']['Tables']['listings']['Row']> & {
          title: string;
          price: number;
          location: string;
          category: PropertyCategory;
          type: string;
        };
        Update: Partial<Database['public']['Tables']['listings']['Row']>;
      };
      agencies: {
        Relationships: [];
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          cover_url: string | null;
          description: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          address: string | null;
          city: string | null;
          verified: boolean | null;
          subscription_tier: SubscriptionTier | null;
          owner_id: string;
          created_at: string | null;
          kyc_status: KycStatus;
          business_type: AgencyBusinessType;
        };
        Insert: Partial<Database['public']['Tables']['agencies']['Row']> & {
          name: string;
          owner_id: string;
        };
        Update: Partial<Database['public']['Tables']['agencies']['Row']>;
      };
      agency_members: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          user_id: string;
          role: AgencyMemberRole | null;
          joined_at: string | null;
        };
        Insert: {
          id?: string;
          agency_id: string;
          user_id: string;
          role?: AgencyMemberRole | null;
          joined_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['agency_members']['Row']>;
      };
      agency_invites: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          email: string;
          role: AgencyInviteRole;
          invited_by: string;
          token: string;
          status: AgencyInviteStatus;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          agency_id: string;
          email: string;
          role?: AgencyInviteRole;
          invited_by: string;
          token?: string;
          status?: AgencyInviteStatus;
          created_at?: string;
          accepted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['agency_invites']['Row']>;
      };
      agency_kyc_submissions: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          submitted_by: string;
          business_registration_number: string;
          tin_number: string | null;
          registration_certificate_url: string;
          owner_id_document_url: string;
          proof_of_address_url: string | null;
          additional_notes: string | null;
          status: KycStatus;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          submitted_by: string;
          business_registration_number: string;
          tin_number?: string | null;
          registration_certificate_url: string;
          owner_id_document_url: string;
          proof_of_address_url?: string | null;
          additional_notes?: string | null;
          status?: KycStatus;
        };
        Update: Partial<Database['public']['Tables']['agency_kyc_submissions']['Row']>;
      };
      clients: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          agent_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          source: string | null;
          stage: ClientStage;
          budget_min: number | null;
          budget_max: number | null;
          preferred_location: string | null;
          property_type: string | null;
          linked_listing_id: string | null;
          tags: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          ad_id: string | null;
        };
        Insert: {
          id?: string;
          agency_id: string;
          agent_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          stage?: ClientStage;
          budget_min?: number | null;
          budget_max?: number | null;
          preferred_location?: string | null;
          property_type?: string | null;
          linked_listing_id?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['clients']['Row']>;
      };
      follow_ups: {
        Relationships: [];
        Row: {
          id: string;
          client_id: string;
          agency_id: string;
          assigned_to: string;
          title: string;
          due_at: string;
          status: FollowUpStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          agency_id: string;
          assigned_to: string;
          title: string;
          due_at: string;
          status?: FollowUpStatus;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['follow_ups']['Row']>;
      };
      ad_rate_card: {
        Relationships: [];
        Row: {
          id: string;
          placement: AdPlacement;
          label: string;
          price_ugx: number;
          unit: AdPricingUnit;
          active: boolean;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ad_rate_card']['Row']>;
        Update: Partial<Database['public']['Tables']['ad_rate_card']['Row']>;
      };
      ads: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          agent_id: string;
          listing_id: string | null;
          type: AdType;
          placement: AdPlacement;
          title: string;
          image_url: string | null;
          caption: string | null;
          link_url: string | null;
          start_date: string | null;
          end_date: string | null;
          cost_ugx: number;
          status: AdStatus;
          payment_method: string | null;
          payment_reference: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          agent_id: string;
          listing_id?: string | null;
          type: AdType;
          placement: AdPlacement;
          title: string;
          image_url?: string | null;
          caption?: string | null;
          link_url?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          cost_ugx: number;
          status?: AdStatus;
          payment_method?: string | null;
          payment_reference?: string | null;
        };
        Update: Partial<Database['public']['Tables']['ads']['Row']>;
      };
      promotion_requests: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          agent_id: string;
          listing_id: string;
          status: PromotionStatus;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          agent_id: string;
          listing_id: string;
          status?: PromotionStatus;
          message?: string | null;
        };
        Update: Partial<Database['public']['Tables']['promotion_requests']['Row']>;
      };
      subscription_plans: {
        Relationships: [];
        Row: {
          tier: SubscriptionTier;
          name: string;
          price_ugx_monthly: number;
          max_listings: number | null;
          max_team_members: number | null;
          max_featured_listings: number;
          description: string | null;
          sort_order: number;
          max_crm_contacts: number | null;
          crm_pipeline_enabled: boolean;
        };
        Insert: Partial<Database['public']['Tables']['subscription_plans']['Row']> & {
          tier: SubscriptionTier;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['subscription_plans']['Row']>;
      };
      plans: {
        Relationships: [];
        Row: {
          id: string;
          code: SubscriptionTier;
          name: string;
          price_ugx_monthly: number | null;
          is_public: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['plans']['Row']> & { code: SubscriptionTier; name: string };
        Update: Partial<Database['public']['Tables']['plans']['Row']>;
      };
      plan_entitlements: {
        Relationships: [];
        Row: {
          plan_id: string;
          key: string;
          limit_value: number | null;
          enabled: boolean;
        };
        Insert: Partial<Database['public']['Tables']['plan_entitlements']['Row']> & { plan_id: string; key: string };
        Update: Partial<Database['public']['Tables']['plan_entitlements']['Row']>;
      };
      subscription_change_requests: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          current_tier: SubscriptionTier;
          requested_tier: SubscriptionTier;
          status: PlanChangeStatus;
          requested_by: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['subscription_change_requests']['Row']> & {
          agency_id: string;
          current_tier: SubscriptionTier;
          requested_tier: SubscriptionTier;
          requested_by: string;
        };
        Update: Partial<Database['public']['Tables']['subscription_change_requests']['Row']>;
      };
      enquiries: {
        Relationships: [];
        Row: {
          id: string;
          agency_id: string;
          listing_id: string | null;
          agent_id: string | null;
          buyer_id: string | null;
          kind: EnquiryKind;
          name: string;
          email: string | null;
          phone: string | null;
          message: string | null;
          scheduled_at: string | null;
          listing_title: string | null;
          agency_name: string | null;
          status: EnquiryStatus;
          client_id: string | null;
          created_at: string;
        };
        // Rows are created through the submit_enquiry() function; direct inserts are blocked by RLS.
        Insert: Partial<Database['public']['Tables']['enquiries']['Row']>;
        Update: { status?: EnquiryStatus; client_id?: string | null };
      };
      profiles: {
        Relationships: [];
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole | null;
          verified: boolean | null;
          created_at: string | null;
          suspended: boolean;
          suspended_reason: string | null;
          suspended_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          email: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      favorites: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['favorites']['Row']>;
      };
      viewing_requests: {
        Relationships: [];
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          agent_id: string;
          scheduled_at: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          agent_id: string;
          scheduled_at: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['viewing_requests']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      early_access_offers_public: {
        Args: Record<string, never>;
        Returns: EarlyAccessOffer[];
      };
      submit_enquiry: {
        Args: {
          p_kind: EnquiryKind;
          p_name: string;
          p_email: string;
          p_phone: string;
          p_message: string;
          p_listing_id?: string | null;
          p_agency_id?: string | null;
          p_scheduled_at?: string | null;
        };
        Returns: string;
      };
      agency_plan_overview: {
        Args: { p_agency: string };
        Returns: PlanOverview;
      };
      get_invite_by_token: {
        Args: { p_token: string };
        Returns: { agency_name: string; email: string; role: string; status: string }[];
      };
    };
    Enums: {
      property_category: PropertyCategory;
      listing_status: ListingStatus;
      subscription_tier: SubscriptionTier;
      kyc_status: KycStatus;
      user_role: UserRole;
      agency_business_type: AgencyBusinessType;
    };
    CompositeTypes: Record<string, never>;
  };
}
