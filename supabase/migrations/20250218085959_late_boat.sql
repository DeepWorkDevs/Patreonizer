/*
  # Fix Profile Settings and Storage Issues

  1. Storage
    - Enable public access for user_assets bucket
    - Update storage policies for better access control

  2. Profiles
    - Add missing RLS policies for profile updates
*/

-- Enable public access for user_assets bucket
UPDATE storage.buckets
SET public = true
WHERE id = 'user_assets';

-- Ensure proper RLS policies for profiles
CREATE POLICY "Users can update their own profile fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update storage policies to be more permissive
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatar is publicly accessible" ON storage.objects;

CREATE POLICY "Avatar access control"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'user_assets' AND
  (auth.uid()::text = (storage.foldername(name))[2] OR
   auth.role() = 'authenticated')
)
WITH CHECK (
  bucket_id = 'user_assets' AND
  auth.uid()::text = (storage.foldername(name))[2]
);