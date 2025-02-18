import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface PatreonPage {
  id: string;
  name: string;
  client_id: string;
  client_secret: string;
  created_at: string;
}

export interface User extends SupabaseUser {
  patreonPages: PatreonPage[];
}

// Patreon API Types
export interface PatreonCampaign {
  id: string;
  type: 'campaign';
  attributes: {
    summary: string;
    creation_name: string;
    pay_per_name: string;
    one_liner: string;
    main_video_embed: string;
    main_video_url: string;
    image_url: string;
    image_small_url: string;
    created_at: string;
    published_at: string;
    pledge_url: string;
    patron_count: number;
    discord_server_id: string;
    google_analytics_id: string;
    earnings_visibility: string;
    is_monthly: boolean;
    is_charge_upfront: boolean;
  };
  relationships?: {
    tiers: {
      data: Array<{ id: string; type: 'tier' }>;
    };
    benefits: {
      data: Array<{ id: string; type: 'benefit' }>;
    };
  };
}

export interface PatreonTier {
  id: string;
  type: 'tier';
  attributes: {
    title: string;
    description: string;
    amount_cents: number;
    patron_count: number;
    discord_role_ids: string[];
    benefits: any[];
  };
}

export interface PatreonPledge {
  id: string;
  type: 'pledge';
  attributes: {
    amount_cents: number;
    created_at: string;
    declined_since: string | null;
    patron_pays_fees: boolean;
    pledge_cap_cents: number;
    status: 'active' | 'declined' | 'deleted';
  };
  relationships: {
    patron: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface PatreonUser {
  id: string;
  type: 'user';
  attributes: {
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    is_email_verified: boolean;
    vanity: string;
    about: string;
    image_url: string;
    thumb_url: string;
    created: string;
    url: string;
    like_count: number;
    hide_pledges: boolean;
    social_connections: Record<string, any>;
  };
}

export interface PatreonMember {
  id: string;
  type: 'member';
  attributes: {
    patron_status: string;
    last_charge_date: string | null;
    last_charge_status: string | null;
    lifetime_support_cents: number;
    currently_entitled_amount_cents: number;
    pledge_relationship_start: string;
    next_charge_date: string | null;
  };
  relationships: {
    user: {
      data: PatreonUser;
      attributes?: PatreonUser['attributes'];
    };
    currently_entitled_tiers: {
      data: Array<{ id: string; type: 'tier' }>;
    };
  };
}

export interface PatreonStats {
  totalRevenue: number;
  activePatrons: number;
  averagePledge: number;
  retentionRate: number;
  recentActivity: Array<{
    type: 'new_patron';
    patron: PatreonUser;
    amount: number;
    timestamp: string;
  }>;
  topPatrons: Array<{
    patron: PatreonUser;
    pledge: {
      attributes: {
        amount_cents: number;
      };
    };
    pledgeMonths: number;
  }>;
}