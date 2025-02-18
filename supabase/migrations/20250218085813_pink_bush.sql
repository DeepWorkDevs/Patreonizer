/*
  # Add Profile Fields

  1. Changes to Profiles Table
    - Add `display_name` (text, nullable)
    - Add `avatar_url` (text, nullable)
    - Add `bio` (text, nullable)

  2. Storage
    - Enable storage policy for user avatars
*/

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text;

-- Create storage policy for avatars
INSERT INTO storage.buckets (id, name)
VALUES ('user_assets', 'user_assets')
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Avatar is publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user_assets' AND (storage.foldername(name))[1] = 'avatars');