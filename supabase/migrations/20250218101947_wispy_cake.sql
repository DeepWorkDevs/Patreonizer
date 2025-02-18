/*
  # Fix Table Drop Migration

  1. Changes
    - Drop RLS policies before dropping tables
    - Ensure proper cleanup order
    - Handle dependencies correctly
*/

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can view their campaign patrons" ON public.patreon_patrons;
DROP POLICY IF EXISTS "Users can view their campaign memberships" ON public.patreon_memberships;

-- Drop tables in correct order
DROP TABLE IF EXISTS public.membership_tiers CASCADE;
DROP TABLE IF EXISTS public.patreon_memberships CASCADE;
DROP TABLE IF EXISTS public.patreon_patrons CASCADE;

-- Ensure patron_tiers exists
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