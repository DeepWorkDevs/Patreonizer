import { supabase } from './supabase';
import type {
  PatreonCampaign,
  PatreonPledge,
  PatreonUser,
  PatreonStats,
  PatreonTier
} from '../types';

const PATREON_API_V2 = 'https://www.patreon.com/api/oauth2/v2';
const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '.functions.supabase.co') ?? '';

export class PatreonAPI {
  private clientId: string;
  private clientSecret: string;
  private pageId?: string;
  private accessToken: string | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(clientId: string, clientSecret: string, pageId?: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.pageId = pageId;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No authenticated session found');
      }

      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/get-patreon-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get access token');
      }

      const data = await response.json();
      if (!data.access_token) {
        throw new Error('Invalid token response from Patreon');
      }

      this.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      this.accessToken = null;
      throw error instanceof Error ? error : new Error('Failed to get access token');
    }
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${PATREON_API_V2}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        throw new Error('No authenticated session found');
      }

      const accessToken = await this.getAccessToken();

      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/patreon-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`
        },
        body: JSON.stringify({
          url: url.toString(),
          accessToken
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to fetch from Patreon API';
        
        // Clear access token on auth errors
        if (response.status === 401) {
          this.accessToken = null;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('Empty response from Patreon API');
      }

      this.retryCount = 0; // Reset retry count on success
      return data;
    } catch (error) {
      // Implement retry logic for network errors
      if (this.retryCount < this.maxRetries && error instanceof Error && error.message.includes('Failed to fetch')) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount)); // Exponential backoff
        return this.fetch(endpoint, params);
      }

      this.retryCount = 0; // Reset retry count after max retries
      throw error instanceof Error ? error : new Error('Failed to fetch from Patreon API');
    }
  }

  private async fetchAllPages<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T[]> {
    let items: T[] = [];
    let nextUrl: string | null = `${endpoint}?${new URLSearchParams(params)}`;

    while (nextUrl) {
      try {
        const response = await this.fetch<{
          data: T[];
          links?: { next?: string };
        }>(nextUrl);

        if (!response.data) {
          throw new Error('Invalid response format: missing data array');
        }

        items = items.concat(response.data);
        nextUrl = response.links?.next || null;
      } catch (error) {
        console.error('Error fetching page:', error);
        break; // Stop on error but return what we have
      }
    }

    return items;
  }

  async validateCredentials(): Promise<void> {
    try {
      await this.getAccessToken();
      
      const response = await this.fetch<{ data: PatreonCampaign[] }>(
        '/campaigns',
        {
          'fields[campaign]': 'creation_name'
        }
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from Patreon API');
      }

      if (response.data.length === 0) {
        throw new Error('No campaigns found for this Patreon account');
      }
    } catch (error) {
      this.accessToken = null; // Clear token on validation failure
      throw error;
    }
  }

  async getCampaign(): Promise<PatreonCampaign> {
    const response = await this.fetch<{ data: PatreonCampaign[] }>(
      '/campaigns',
      {
        'include': 'tiers,benefits',
        'fields[campaign]': 'summary,creation_name,pay_per_name,one_liner,main_video_embed,main_video_url,image_url,image_small_url,created_at,published_at,pledge_url,patron_count,discord_server_id,google_analytics_id,earnings_visibility,is_monthly,is_charge_upfront'
      }
    );

    if (!response.data?.[0]) {
      throw new Error('No campaign found');
    }

    return response.data[0];
  }

  async getStats(campaignId: string): Promise<PatreonStats> {
    try {
      const [campaign, members] = await Promise.all([
        this.fetch<{ data: PatreonCampaign }>(
          `/campaigns/${campaignId}`,
          {
            'fields[campaign]': 'patron_count'
          }
        ),
        this.fetchAllPages<PatreonMember>(
          `/campaigns/${campaignId}/members`,
          {
            'include': 'user,currently_entitled_tiers',
            'fields[member]': 'patron_status,lifetime_support_cents,currently_entitled_amount_cents,pledge_relationship_start',
            'fields[user]': 'full_name,email,image_url,thumb_url,url'
          }
        )
      ]);

      if (!campaign.data) {
        throw new Error('Campaign not found');
      }

      const activeMembers = members.filter(m => m.attributes?.patron_status === 'active_patron');
      const totalRevenue = activeMembers.reduce((sum, m) => sum + (m.attributes?.currently_entitled_amount_cents || 0), 0) / 100;
      const patronCount = campaign.data.attributes.patron_count || 0;
      const averagePledge = patronCount > 0 ? totalRevenue / patronCount : 0;
      const retentionRate = members.length > 0 ? (activeMembers.length / members.length) * 100 : 0;

      const recentActivity = members
        .filter(m => m.relationships?.user?.data && m.attributes?.pledge_relationship_start)
        .sort((a, b) => {
          const dateA = new Date(a.attributes.pledge_relationship_start || 0);
          const dateB = new Date(b.attributes.pledge_relationship_start || 0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 10)
        .map(member => ({
          type: 'new_patron' as const,
          patron: member.relationships.user.data,
          amount: (member.attributes?.currently_entitled_amount_cents || 0) / 100,
          timestamp: member.attributes.pledge_relationship_start
        }));

      const topPatrons = activeMembers
        .filter(m => m.relationships?.user?.data)
        .sort((a, b) => (b.attributes?.currently_entitled_amount_cents || 0) - (a.attributes?.currently_entitled_amount_cents || 0))
        .slice(0, 10)
        .map(member => {
          const pledgeDate = new Date(member.attributes?.pledge_relationship_start || 0);
          const pledgeMonths = Math.floor(
            (new Date().getTime() - pledgeDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          
          return {
            patron: member.relationships.user.data,
            pledge: {
              attributes: {
                amount_cents: member.attributes?.currently_entitled_amount_cents || 0
              }
            },
            pledgeMonths
          };
        });

      return {
        totalRevenue,
        activePatrons: patronCount,
        averagePledge,
        retentionRate,
        recentActivity,
        topPatrons
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch campaign stats');
    }
  }

  async syncCampaign(): Promise<void> {
    if (!this.pageId) {
      throw new Error('Page ID is required for syncing campaign data');
    }

    const campaign = await this.getCampaign();

    // Store campaign in database
    const { error: campaignError } = await supabase
      .from('patreon_campaigns')
      .upsert({
        page_id: this.pageId,
        patreon_id: campaign.id,
        creation_name: campaign.attributes.creation_name,
        summary: campaign.attributes.summary,
        pledge_url: campaign.attributes.pledge_url,
        patron_count: campaign.attributes.patron_count,
        earnings_visibility: campaign.attributes.earnings_visibility,
        is_monthly: campaign.attributes.is_monthly,
        is_charge_upfront: campaign.attributes.is_charge_upfront,
        image_url: campaign.attributes.image_url,
        image_small_url: campaign.attributes.image_small_url,
        last_sync_at: new Date().toISOString()
      });

    if (campaignError) {
      throw new Error('Failed to store campaign data');
    }

    await Promise.all([
      this.syncTiers(campaign.id),
      this.syncPatrons(campaign.id)
    ]);
  }

  private async syncTiers(campaignId: string): Promise<void> {
    const tiers = await this.fetchAllPages<PatreonTier>(
      `/campaigns/${campaignId}/tiers`,
      {
        'fields[tier]': 'title,description,amount_cents,patron_count,discord_role_ids,benefits'
      }
    );

    for (const tier of tiers) {
      const { error: tierError } = await supabase
        .from('patreon_tiers')
        .upsert({
          campaign_id: campaignId,
          patreon_id: tier.id,
          title: tier.attributes.title,
          description: tier.attributes.description,
          amount_cents: tier.attributes.amount_cents,
          patron_count: tier.attributes.patron_count,
          discord_role_ids: tier.attributes.discord_role_ids,
          benefits: tier.attributes.benefits
        });

      if (tierError) {
        throw new Error('Failed to store tier data');
      }
    }
  }

  private async syncPatrons(campaignId: string): Promise<void> {
    const members = await this.fetchAllPages(
      `/campaigns/${campaignId}/members`,
      {
        'page[size]': '100',
        'include': 'user,currently_entitled_tiers',
        'fields[member]': 'patron_status,last_charge_date,last_charge_status,lifetime_support_cents,currently_entitled_amount_cents,pledge_relationship_start,next_charge_date',
        'fields[user]': 'full_name,email,image_url,url,social_connections'
      }
    );

    for (const member of members) {
      if (!member.relationships?.user?.data) {
        continue;
      }

      const { data: patron, error: patronError } = await supabase
        .from('patrons')
        .upsert({
          campaign_id: campaignId,
          patreon_id: member.relationships.user.data.id,
          full_name: member.relationships.user.attributes?.full_name,
          email: member.relationships.user.attributes?.email,
          image_url: member.relationships.user.attributes?.image_url,
          url: member.relationships.user.attributes?.url,
          social_connections: member.relationships.user.attributes?.social_connections,
          status: member.attributes?.patron_status,
          last_charge_date: member.attributes?.last_charge_date,
          last_charge_status: member.attributes?.last_charge_status,
          lifetime_support_cents: member.attributes?.lifetime_support_cents,
          pledge_relationship_start: member.attributes?.pledge_relationship_start,
          next_charge_date: member.attributes?.next_charge_date,
          last_sync_at: new Date().toISOString()
        })
        .select()
        .single();

      if (patronError || !patron) {
        continue;
      }

      // Sync patron tiers
      const tierIds = member.relationships?.currently_entitled_tiers?.data?.map(tier => tier.id) || [];
      for (const tierId of tierIds) {
        const { data: tier } = await supabase
          .from('patreon_tiers')
          .select('id')
          .eq('patreon_id', tierId)
          .single();

        if (tier) {
          await supabase
            .from('patron_tiers')
            .upsert({
              patron_id: patron.id,
              tier_id: tier.id
            });
        }
      }
    }
  }
}