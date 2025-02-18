/*
  # Fix Patrons Schema

  1. New Tables
    - `patrons`
      - Combined table for patron data and membership information
      - Includes all fields from both `patreon_patrons` and `patreon_memberships`
    - `patron_tiers`
      - Junction table for patron-tier relationships
      - Links patrons to their entitled tiers

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to view their campaign data

  3. Changes
    - Drop old tables after successful data migration
    - Create appropriate indexes for performance
*/

-- Create new combined patrons table
CREATE TABLE IF NOT EXISTS public.patrons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.patreon_campaigns(id) ON DELETE CASCADE,
  patreon_id text UNIQUE NOT NULL,
  full_name text,
  email text,
  image_url text,
  url text,
  social_connections jsonb DEFAULT '{}',
  status text NOT NULL,
  last_charge_date timestamptz,
  last_charge_status text,
  lifetime_support_cents bigint DEFAULT 0,
  pledge_relationship_start timestamptz,
  next_charge_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sync_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patrons ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their campaign patrons"
  ON public.patrons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_campaigns
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE patrons.campaign_id = patreon_campaigns.id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patrons_campaign_id ON public.patrons(campaign_id);
CREATE INDEX IF NOT EXISTS idx_patrons_patreon_id ON public.patrons(patreon_id);
CREATE INDEX IF NOT EXISTS idx_patrons_status ON public.patrons(status);
CREATE INDEX IF NOT EXISTS idx_patrons_email ON public.patrons(email);

-- Create patron_tiers junction table
CREATE TABLE IF NOT EXISTS public.patron_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id uuid REFERENCES public.patrons(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.patreon_tiers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patron_id, tier_id)
);

-- Enable RLS
ALTER TABLE public.patron_tiers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their patron tiers"
  ON public.patron_tiers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patrons
      JOIN public.patreon_campaigns ON patrons.campaign_id = patreon_campaigns.id
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE patron_tiers.patron_id = patrons.id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patron_tiers_patron_id ON public.patron_tiers(patron_id);
CREATE INDEX IF NOT EXISTS idx_patron_tiers_tier_id ON public.patron_tiers(tier_id);

-- Migrate existing data if old tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patreon_memberships') THEN
    -- Migrate patron data
    INSERT INTO public.patrons (
      campaign_id,
      patreon_id,
      full_name,
      email,
      image_url,
      url,
      social_connections,
      status,
      last_charge_date,
      last_charge_status,
      lifetime_support_cents,
      pledge_relationship_start,
      next_charge_date,
      created_at,
      updated_at,
      last_sync_at
    )
    SELECT
      m.campaign_id,
      p.patreon_id,
      p.full_name,
      p.email,
      p.image_url,
      p.url,
      p.social_connections,
      m.status,
      m.last_charge_date,
      m.last_charge_status,
      m.lifetime_support_cents,
      m.pledge_relationship_start,
      m.next_charge_date,
      LEAST(p.created_at, m.created_at),
      GREATEST(p.updated_at, m.updated_at),
      GREATEST(p.last_sync_at, m.last_sync_at)
    FROM public.patreon_memberships m
    JOIN public.patreon_patrons p ON m.patron_id = p.id
    ON CONFLICT (patreon_id) DO NOTHING;

    -- Migrate tier relationships
    INSERT INTO public.patron_tiers (patron_id, tier_id)
    SELECT DISTINCT
      p.id as patron_id,
      t.id as tier_id
    FROM public.patrons p
    JOIN public.patreon_memberships m ON m.patreon_id = p.patreon_id
    CROSS JOIN UNNEST(m.currently_entitled_tiers) as tier_uuid
    JOIN public.patreon_tiers t ON t.id = tier_uuid::uuid
    ON CONFLICT (patron_id, tier_id) DO NOTHING;

    -- Drop old tables
    DROP TABLE IF EXISTS public.membership_tiers;
    DROP TABLE IF EXISTS public.patreon_memberships;
    DROP TABLE IF EXISTS public.patreon_patrons;
  END IF;
END $$;