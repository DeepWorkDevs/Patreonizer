/*
  # Fix Profile Settings and Storage Issues V3

  1. Storage
    - Ensure storage bucket exists and is public
    - Simplify storage policies for better access
    - Add missing storage bucket configuration

  2. Profiles
    - Update RLS policies for better access control
*/

-- Ensure storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user_assets',
  'user_assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];

-- Drop and recreate storage policies with simpler rules
DROP POLICY IF EXISTS "Authenticated users can manage their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Allow authenticated users to manage their avatars
CREATE POLICY "Users can manage their avatars"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars'
)
WITH CHECK (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Ensure profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);