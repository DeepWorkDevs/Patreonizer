/*
  # Fix test data migration with proper UUIDs

  1. Changes
    - Use proper UUIDs for tier IDs instead of strings
    - Store tier UUIDs in an array for membership references
    - Maintain all existing test data structure

  2. Security
    - Maintains RLS policies
    - Only inserts data for authenticated users
*/

-- Function to insert test data for a specific user
CREATE OR REPLACE FUNCTION insert_test_data(user_id uuid)
RETURNS void AS $$
DECLARE
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
    'Test Creator Page',
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
    'test_campaign_1',
    'Test Creator',
    'Creating awesome content for testing purposes',
    'https://www.patreon.com/testcreator',
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
      'Basic Tier',
      'Access to exclusive posts and behind-the-scenes content',
      500, -- $5.00
      15,
      '[{"title": "Exclusive Posts"}, {"title": "Behind the Scenes"}]'
    ),
    (
      tier_ids[2],
      campaign_id,
      'tier_2',
      'Premium Tier',
      'Everything in Basic plus early access and monthly Q&A',
      1000, -- $10.00
      7,
      '[{"title": "Early Access"}, {"title": "Monthly Q&A"}, {"title": "Exclusive Posts"}, {"title": "Behind the Scenes"}]'
    ),
    (
      tier_ids[3],
      campaign_id,
      'tier_3',
      'Ultimate Tier',
      'All previous benefits plus custom content and direct support',
      2500, -- $25.00
      3,
      '[{"title": "Custom Content"}, {"title": "Direct Support"}, {"title": "Early Access"}, {"title": "Monthly Q&A"}, {"title": "Exclusive Posts"}, {"title": "Behind the Scenes"}]'
    );

  -- Insert test patrons
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
        'Test Patron ' || i,
        'patron' || i || '@example.com',
        'https://i.pravatar.cc/150?u=' || i,
        'https://www.patreon.com/user?u=' || i,
        '{}'::jsonb
      )
      RETURNING id
    )
    SELECT array_append(patron_ids, id) INTO patron_ids
    FROM new_patron;
  END LOOP;

  -- Insert test memberships
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
      'paid',
      (random() * 10000)::bigint,
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

-- Insert test data for the current user
DO $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get the first user from profiles table
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    PERFORM insert_test_data(test_user_id);
  END IF;
END $$;