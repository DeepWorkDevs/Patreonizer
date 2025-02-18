/*
  # Add image URL to campaigns

  1. Changes
    - Add image_url column to patreon_campaigns table
    - Add image_small_url column to patreon_campaigns table

  2. Notes
    - These columns store the campaign's main image URLs from Patreon
    - Both columns are nullable since not all campaigns may have images
*/

-- Add image columns to campaigns table
ALTER TABLE public.patreon_campaigns
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_small_url text;