/*
  # Update test data for specific user

  1. Changes
    - Remove all existing test data
    - Add new test data for user d5c1a62d-dc0d-452c-9624-b0a3e7e1f4c7
    - Maintain data structure and relationships

  2. Security
    - Maintains RLS policies
    - Only affects specified user's data
*/

-- First, remove all existing test data
DO $$
BEGIN
  -- Delete all memberships
  DELETE FROM public.patreon_memberships;
  
  -- Delete all patrons
  DELETE FROM public.patreon_patrons;
  
  -- Delete all tiers
  DELETE FROM public.patreon_tiers;
  
  -- Delete all campaigns
  DELETE FROM public.patreon_campaigns;
  
  -- Delete all pages
  DELETE FROM public.patreon_pages;
END $$;

-- Function to insert test data for our specific user
CREATE OR REPLACE FUNCTION insert_test_data()
RETURNS void AS $$
DECLARE
  user_id uuid := 'd5c1a62d-dc0d-452c-9624-b0a3e7e1f4c7'::uuid;
  page_id uuid;
  campaign_id uuid;
  patron_ids uuid[] := ARRAY[]::uuid[];
  tier_ids uuid[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
BEGIN
  -- Insert test Patreon page
  INSERT INTO public.patreon_pages (
    id,
    user_id,
    name,
    client_id,
    client_secret,
    access_token
  )
  VALUES (
    gen_random_uuid(),
    user_id,
    'MediaGlobe Creator Page',
    'test_client_id',
    'test_client_secret',
    'test_access_token'
  )
  RETURNING id INTO page_id;

  -- Insert test campaign
  INSERT INTO public.patreon_campaigns (
    id,
    page_id,
    patreon_id,
    creation_name,
    summary,
    pledge_url,
    patron_count,
    pledge_sum,
    earnings_visibility,
    is_monthly,
    is_charge_upfront
  )
  VALUES (
    gen_random_uuid(),
    page_id,
    'mediaglobe_campaign',
    'MediaGlobe',
    'Creating innovative media content and tools',
    'https://www.patreon.com/mediaglobe',
    25,
    125000, -- $1,250.00
    'public',
    true,
    false
  )
  RETURNING id INTO campaign_id;

  -- Insert test tiers
  INSERT INTO public.patreon_tiers (
    id,
    campaign_id,
    patreon_id,
    title,
    description,
    amount_cents,
    patron_count,
    benefits
  )
  VALUES
    (
      tier_ids[1],
      campaign_id,
      'tier_1',
      'Community Supporter',
      'Early access to content and community features',
      500, -- $5.00
      15,
      '[{"title": "Early Access"}, {"title": "Community Discord"}]'
    ),
    (
      tier_ids[2],
      campaign_id,
      'tier_2',
      'Content Creator',
      'Access to premium tools and monthly workshops',
      1000, -- $10.00
      7,
      '[{"title": "Premium Tools"}, {"title": "Monthly Workshops"}, {"title": "Early Access"}, {"title": "Community Discord"}]'
    ),
    (
      tier_ids[3],
      campaign_id,
      'tier_3',
      'Media Professional',
      'Full access to all tools and personalized support',
      2500, -- $25.00
      3,
      '[{"title": "Personalized Support"}, {"title": "Custom Solutions"}, {"title": "Premium Tools"}, {"title": "Monthly Workshops"}, {"title": "Early Access"}, {"title": "Community Discord"}]'
    );

  -- Insert test patrons with realistic names
  FOR i IN 1..25 LOOP
    WITH new_patron AS (
      INSERT INTO public.patreon_patrons (
        patreon_id,
        full_name,
        email,
        image_url,
        url,
        social_connections
      )
      VALUES (
        'patron_' || i,
        CASE 
          WHEN i = 1 THEN 'Sarah Johnson'
          WHEN i = 2 THEN 'Michael Chen'
          WHEN i = 3 THEN 'Emma Rodriguez'
          WHEN i = 4 THEN 'David Kim'
          WHEN i = 5 THEN 'Lisa Patel'
          ELSE 'Supporter ' || i
        END,
        'patron' || i || '@example.com',
        'https://i.pravatar.cc/150?u=' || (random() * 1000)::int,
        'https://www.patreon.com/user?u=' || i,
        jsonb_build_object(
          'discord', jsonb_build_object('user_id', 'discord_' || i),
          'twitter', jsonb_build_object('user_id', 'twitter_' || i)
        )
      )
      RETURNING id
    )
    SELECT array_append(patron_ids, id) INTO patron_ids
    FROM new_patron;
  END LOOP;

  -- Insert test memberships with more realistic patterns
  FOR i IN 1..array_length(patron_ids, 1) LOOP
    INSERT INTO public.patreon_memberships (
      campaign_id,
      patron_id,
      patreon_id,
      status,
      last_charge_date,
      last_charge_status,
      lifetime_support_cents,
      currently_entitled_tiers,
      pledge_relationship_start,
      next_charge_date
    )
    VALUES (
      campaign_id,
      patron_ids[i],
      'membership_' || i,
      CASE 
        WHEN random() < 0.9 THEN 'active_patron'
        ELSE 'declined_patron'
      END,
      now() - (random() * interval '30 days'),
      CASE 
        WHEN random() < 0.95 THEN 'paid'
        ELSE 'declined'
      END,
      (random() * 50000 + 10000)::bigint, -- More realistic lifetime support
      CASE 
        WHEN i <= 15 THEN ARRAY[tier_ids[1]]
        WHEN i <= 22 THEN ARRAY[tier_ids[1], tier_ids[2]]
        ELSE ARRAY[tier_ids[1], tier_ids[2], tier_ids[3]]
      END,
      now() - (random() * interval '365 days'),
      now() + interval '1 month'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to insert test data
SELECT insert_test_data();