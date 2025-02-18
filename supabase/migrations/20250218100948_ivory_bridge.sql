/*
  # Fix Membership-Tiers Relationship

  1. Changes
    - Drop and recreate membership_tiers table with proper constraints
    - Add RLS policies and indexes
    - Migrate existing data correctly

  2. Security
    - Enable RLS on membership_tiers table
    - Add appropriate policies for authenticated users
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.membership_tiers;

-- Create membership_tiers junction table
CREATE TABLE public.membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid REFERENCES public.patreon_memberships(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.patreon_tiers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(membership_id, tier_id)
);

-- Enable RLS
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their campaign membership tiers"
  ON public.membership_tiers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patreon_memberships
      JOIN public.patreon_campaigns ON patreon_memberships.campaign_id = patreon_campaigns.id
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE membership_tiers.membership_id = patreon_memberships.id
      AND patreon_pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert membership tiers for their campaigns"
  ON public.membership_tiers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patreon_memberships
      JOIN public.patreon_campaigns ON patreon_memberships.campaign_id = patreon_campaigns.id
      JOIN public.patreon_pages ON patreon_campaigns.page_id = patreon_pages.id
      WHERE membership_tiers.membership_id = patreon_memberships.id
      AND patreon_pages.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_membership_tiers_membership_id ON public.membership_tiers(membership_id);
CREATE INDEX idx_membership_tiers_tier_id ON public.membership_tiers(tier_id);

-- Migrate existing data
DO $$
DECLARE
  m RECORD;
  t uuid;
BEGIN
  FOR m IN 
    SELECT 
      pm.id as membership_id,
      pt.id as tier_id
    FROM public.patreon_memberships pm
    CROSS JOIN UNNEST(pm.currently_entitled_tiers) as tier_id
    JOIN public.patreon_tiers pt ON pt.patreon_id = tier_id::text
  LOOP
    INSERT INTO public.membership_tiers (membership_id, tier_id)
    VALUES (m.membership_id, m.tier_id)
    ON CONFLICT (membership_id, tier_id) DO NOTHING;
  END LOOP;
END $$;