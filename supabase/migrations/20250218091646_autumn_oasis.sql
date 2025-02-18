/*
  # Comprehensive Patreon Data Schema

  1. New Tables
    - `patreon_campaigns` - Stores campaign/creator page data
    - `patreon_tiers` - Stores tier/reward level data
    - `patreon_patrons` - Stores patron information
    - `patreon_memberships` - Stores patron pledge/membership data

  2. Changes
    - Added foreign key relationships between all tables
    - Added indexes for common query patterns
    - Added RLS policies for data access

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
*/

-- Campaign Data
CREATE TABLE IF NOT EXISTS public.patreon_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.patreon_pages(id) ON DELETE CASCADE,
  patreon_id text UNIQUE NOT NULL,
  creation_name text NOT NULL,
  summary text,
  currency text DEFAULT 'USD',
  pledge_url text,
  patron_count integer DEFAULT 0,
  pledge_sum bigint DEFAULT 0, -- in cents
  earnings_visibility text,
  is_monthly boolean DEFAULT true,
  is_charge_upfront boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sync_at timestamptz DEFAULT now()
);

-- Tier Data
CREATE TABLE IF NOT EXISTS public.patreon_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.patreon_campaigns(id) ON DELETE CASCADE,
  patreon_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  amount_cents bigint NOT NULL,
  patron_count integer DEFAULT 0,
  discord_role_ids text[],
  benefits jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Patron Data
CREATE TABLE IF NOT EXISTS public.patreon_patrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patreon_id text UNIQUE NOT NULL,
  full_name text,
  email text,
  image_url text,
  url text,
  social_connections jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sync_at timestamptz DEFAULT now()
);

-- Membership/Pledge Data
CREATE TABLE IF NOT EXISTS public.patreon_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.patreon_campaigns(id) ON DELETE CASCADE,
  patron_id uuid REFERENCES public.patreon_patrons(id) ON DELETE CASCADE,
  patreon_id text UNIQUE NOT NULL,
  status text NOT NULL,
  last_charge_date timestamptz,
  last_charge_status text,
  lifetime_support_cents bigint DEFAULT 0,
  currently_entitled_tiers uuid[] DEFAULT '{}',
  pledge_relationship_start timestamptz,
  next_charge_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patreon_campaigns_page_id ON public.patreon_campaigns(page_id);
CREATE INDEX IF NOT EXISTS idx_patreon_tiers_campaign_id ON public.patreon_tiers(campaign_id);
CREATE INDEX IF NOT EXISTS idx_patreon_memberships_campaign_id ON public.patreon_memberships(campaign_id);
CREATE INDEX IF NOT EXISTS idx_patreon_memberships_patron_id ON public.patreon_memberships(patron_id);
CREATE INDEX IF NOT EXISTS idx_patreon_campaigns_patreon_id ON public.patreon_campaigns(patreon_id);
CREATE INDEX IF NOT EXISTS idx_patreon_patrons_patreon_id ON public.patreon_patrons(patreon_id);

-- Enable Row Level Security
ALTER TABLE public.patreon_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patreon_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patreon_patrons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patreon_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patreon_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.patreon_campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_pages
      WHERE id = patreon_campaigns.page_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for patreon_tiers
CREATE POLICY "Users can view their campaign tiers"
  ON public.patreon_tiers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_campaigns
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE patreon_campaigns.id = patreon_tiers.campaign_id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- RLS Policies for patreon_patrons
CREATE POLICY "Users can view their campaign patrons"
  ON public.patreon_patrons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_memberships
      JOIN public.patreon_campaigns ON patreon_memberships.campaign_id = patreon_campaigns.id
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE patreon_memberships.patron_id = patreon_patrons.id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- RLS Policies for patreon_memberships
CREATE POLICY "Users can view their campaign memberships"
  ON public.patreon_memberships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_campaigns
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE patreon_campaigns.id = patreon_memberships.campaign_id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- Add trigger functions to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at triggers for all tables
CREATE TRIGGER set_timestamp_patreon_campaigns
  BEFORE UPDATE ON public.patreon_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_patreon_tiers
  BEFORE UPDATE ON public.patreon_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_patreon_patrons
  BEFORE UPDATE ON public.patreon_patrons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_timestamp_patreon_memberships
  BEFORE UPDATE ON public.patreon_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();