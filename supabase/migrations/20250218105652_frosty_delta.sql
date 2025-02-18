/*
  # Add soft delete support for Patreon pages

  1. Changes
    - Add `deleted_at` column to patreon_pages table
    - Add `deleted` column for quick filtering
    - Update RLS policies to exclude deleted pages
    - Add function to soft delete pages

  2. Security
    - Only authenticated users can soft delete their own pages
    - Deleted pages are excluded from all queries by default
*/

-- Add soft delete columns
ALTER TABLE public.patreon_pages
ADD COLUMN deleted boolean DEFAULT false,
ADD COLUMN deleted_at timestamptz;

-- Create function to soft delete pages
CREATE OR REPLACE FUNCTION soft_delete_patreon_page(page_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.patreon_pages
  SET 
    deleted = true,
    deleted_at = now()
  WHERE id = page_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing RLS policies to exclude deleted pages
DROP POLICY IF EXISTS "Users can read own Patreon pages" ON public.patreon_pages;
CREATE POLICY "Users can read own Patreon pages"
  ON public.patreon_pages
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND (deleted = false OR deleted IS NULL)
  );