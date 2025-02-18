/*
  # Fix Profile Settings and Storage Issues V2

  1. Storage
    - Ensure storage bucket exists and is public
    - Update storage policies for better access control

  2. Profiles
    - Add missing columns if not exist
    - Update RLS policies
*/

-- Ensure storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('user_assets', 'user_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Avatar access control" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Authenticated users can manage their own avatars"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'user_assets' AND
  (storage.foldername(name))[1] = 'avatars'
);

-- Update profiles policies
DROP POLICY IF EXISTS "Users can update their own profile fields" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);