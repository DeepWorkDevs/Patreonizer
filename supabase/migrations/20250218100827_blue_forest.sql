/*
  # Fix Membership-Tiers Relationship

  1. Changes
    - Add membership_tiers junction table to properly handle many-to-many relationship
    - Migrate existing tier data from currently_entitled_tiers array
    - Update RLS policies for the new table

  2. Security
    - Enable RLS on membership_tiers table
    - Add appropriate policies for authenticated users
*/

-- Create membership_tiers junction table
CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid REFERENCES public.patreon_memberships(id) ON DELETE CASCADE,
  tier_id uuid REFERENCES public.patreon_tiers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(membership_id, tier_id)
);

-- Enable RLS
ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
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

-- Create index for better query performance
CREATE INDEX idx_membership_tiers_membership_id ON public.membership_tiers(membership_id);
CREATE INDEX idx_membership_tiers_tier_id ON public.membership_tiers(tier_id);

-- Migrate existing data
DO $$
DECLARE
  m RECORD;
  t uuid;
BEGIN
  FOR m IN SELECT id, currently_entitled_tiers FROM public.patreon_memberships WHERE currently_entitled_tiers IS NOT NULL
  LOOP
    FOREACH t IN ARRAY m.currently_entitled_tiers
    LOOP
      INSERT INTO public.membership_tiers (membership_id, tier_id)
      VALUES (m.id, t)
      ON CONFLICT (membership_id, tier_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;