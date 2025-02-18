-- Insert test data for a second Patreon page
DO $$
DECLARE
  test_user_id uuid;
  page_id uuid;
  campaign_id uuid;
  tier_ids uuid[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
  patron_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  -- Get the first user from profiles table
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Insert second Patreon page
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
      test_user_id,
      'TechTutorials Pro',
      'test_client_id_2',
      'test_client_secret_2',
      'test_access_token_2'
    )
    RETURNING id INTO page_id;

    -- Insert campaign with higher stats
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
      is_charge_upfront,
      image_url,
      image_small_url
    )
    VALUES (
      gen_random_uuid(),
      page_id,
      'techtutorials_campaign',
      'TechTutorials Pro',
      'Premium programming tutorials and courses',
      'https://www.patreon.com/techtutorialspro',
      150, -- Much higher patron count
      750000, -- $7,500.00 - Much higher revenue
      'public',
      true,
      true,
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&h=200&fit=crop'
    )
    RETURNING id INTO campaign_id;

    -- Insert premium tiers
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
        'tier_premium_1',
        'Code Explorer',
        'Access to all basic tutorials and monthly coding challenges',
        1500, -- $15.00
        80,
        '[{"title": "Basic Tutorials"}, {"title": "Monthly Challenges"}, {"title": "Community Discord"}]'
      ),
      (
        tier_ids[2],
        campaign_id,
        'tier_premium_2',
        'Tech Master',
        'Full course access, priority support, and exclusive workshops',
        5000, -- $50.00
        45,
        '[{"title": "Full Course Access"}, {"title": "Priority Support"}, {"title": "Exclusive Workshops"}, {"title": "Basic Tutorials"}, {"title": "Monthly Challenges"}]'
      ),
      (
        tier_ids[3],
        campaign_id,
        'tier_premium_3',
        'Enterprise Pro',
        'Team licenses, custom training, and consulting sessions',
        10000, -- $100.00
        25,
        '[{"title": "Team Licenses"}, {"title": "Custom Training"}, {"title": "Consulting Sessions"}, {"title": "Full Course Access"}, {"title": "Priority Support"}]'
      );

    -- Insert test patrons with more varied data
    FOR i IN 1..150 LOOP
      WITH new_patron AS (
        INSERT INTO public.patrons (
          campaign_id,
          patreon_id,
          full_name,
          email,
          image_url,
          url,
          social_connections,
          status,
          last_charge_date,
          last_charge_status,
          lifetime_support_cents,
          pledge_relationship_start,
          next_charge_date
        )
        VALUES (
          campaign_id,
          'patron_premium_' || i,
          CASE 
            WHEN i <= 5 THEN 'Enterprise Client ' || i
            WHEN i <= 50 THEN 'Professional Developer ' || i
            ELSE 'Student Developer ' || i
          END,
          'premium_patron' || i || '@example.com',
          'https://i.pravatar.cc/150?u=' || (1000 + i),
          'https://www.patreon.com/user?u=' || (1000 + i),
          jsonb_build_object(
            'discord', jsonb_build_object('user_id', 'discord_premium_' || i),
            'github', jsonb_build_object('user_id', 'github_' || i)
          ),
          CASE 
            WHEN random() < 0.95 THEN 'active_patron'
            ELSE 'declined_patron'
          END,
          now() - (random() * interval '60 days'),
          'paid',
          (random() * 100000 + 50000)::bigint,
          now() - (random() * interval '365 days'),
          now() + interval '1 month'
        )
        RETURNING id
      )
      SELECT array_append(patron_ids, id) INTO patron_ids
      FROM new_patron;
    END LOOP;

    -- Insert patron tiers with varied distribution
    FOR i IN 1..array_length(patron_ids, 1) LOOP
      INSERT INTO public.patron_tiers (patron_id, tier_id)
      VALUES (
        patron_ids[i],
        CASE 
          WHEN i <= 25 THEN tier_ids[3]  -- 25 Enterprise Pro members
          WHEN i <= 70 THEN tier_ids[2]  -- 45 Tech Masters
          ELSE tier_ids[1]               -- 80 Code Explorers
        END
      );
    END LOOP;
  END IF;
END $$;