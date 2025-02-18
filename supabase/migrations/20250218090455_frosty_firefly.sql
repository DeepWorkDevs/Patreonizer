/*
  # Complete Database Schema Fix

  1. Tables
    - Ensure all tables exist with correct columns
    - Set up proper relations and constraints
    - Add performance indexes

  2. Security
    - Enable RLS on all tables
    - Set up comprehensive security policies
    - Configure storage bucket for avatars
*/

-- Drop existing tables to ensure clean slate
DROP TABLE IF EXISTS public.patreon_pages;
DROP TABLE IF EXISTS public.profiles;

-- Recreate profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recreate patreon_pages table
CREATE TABLE public.patreon_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  client_id text NOT NULL,
  client_secret text NOT NULL,
  access_token text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_patreon_pages_user_id ON public.patreon_pages(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patreon_pages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Patreon pages policies
CREATE POLICY "Users can read own Patreon pages"
  ON public.patreon_pages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create Patreon pages"
  ON public.patreon_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own Patreon pages"
  ON public.patreon_pages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own Patreon pages"
  ON public.patreon_pages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Set up storage for avatars
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

-- Storage policies
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

CREATE POLICY "Public can view avatars"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'user_assets' AND
    (storage.foldername(name))[1] = 'avatars'
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();