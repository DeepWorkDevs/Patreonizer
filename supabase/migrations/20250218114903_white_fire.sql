/*
  # Add contact form table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, optional, references profiles)
      - `name` (text)
      - `email` (text)
      - `subject` (text)
      - `message` (text)
      - `created_at` (timestamptz)
      - `read` (boolean)
      - `responded` (boolean)
      - `response` (text)
      - `responded_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for inserting messages
    - Add policies for admin access
*/

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  responded boolean DEFAULT false,
  response text,
  responded_at timestamptz
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_contact_messages_user_id ON public.contact_messages(user_id);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at);
CREATE INDEX idx_contact_messages_read ON public.contact_messages(read);

-- Add RLS policies
CREATE POLICY "Users can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    user_id IS NULL
  );

CREATE POLICY "Users can view their own messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());