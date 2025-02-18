import { create } from 'zustand';
import { supabase } from './lib/supabase';
import { PatreonAPI } from './lib/patreon';
import type { User } from '@supabase/supabase-js';
import type { PatreonPage, PatreonStats } from './types';

interface AppState {
  user: User | null;
  currentPage: PatreonPage | null;
  stats: PatreonStats | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setCurrentPage: (page: PatreonPage | null) => void;
  addPatreonPage: (page: Omit<PatreonPage, 'id' | 'createdAt'>) => Promise<void>;
  removePatreonPage: (pageId: string) => Promise<void>;
  fetchPatreonPages: () => Promise<void>;
  fetchStats: (page: PatreonPage) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  currentPage: null,
  stats: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  setCurrentPage: (page) => set({ currentPage: page, stats: null }),
  
  addPatreonPage: async (page) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');

    try {
      // Validate API credentials first
      const api = new PatreonAPI(page.clientId, page.clientSecret);
      await api.validateCredentials();

      // Insert the page
      const { data: pageData, error: pageError } = await supabase
        .from('patreon_pages')
        .insert([{
          user_id: user.id,
          name: page.name,
          client_id: page.clientId,
          client_secret: page.clientSecret,
          access_token: '', // Will be set by the API client
          deleted: false
        }])
        .select()
        .single();

      if (pageError) throw pageError;
      if (!pageData) throw new Error('Failed to create Patreon page');

      // Initialize the PatreonAPI and sync data
      const pageApi = new PatreonAPI(pageData.client_id, pageData.client_secret, pageData.id);
      await pageApi.syncCampaign();

      // Refresh the pages list
      await get().fetchPatreonPages();
    } catch (error) {
      console.error('Error adding Patreon page:', error);
      throw error instanceof Error 
        ? error 
        : new Error('Failed to add Patreon page. Please check your credentials and try again.');
    }
  },

  removePatreonPage: async (pageId) => {
    try {
      const { error } = await supabase
        .from('patreon_pages')
        .update({ deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', pageId);

      if (error) throw error;
      await get().fetchPatreonPages();
    } catch (error) {
      console.error('Error removing Patreon page:', error);
      throw error instanceof Error ? error : new Error('Failed to remove Patreon page');
    }
  },

  fetchPatreonPages: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patreon_pages')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data.length > 0 && !get().currentPage) {
        set({ currentPage: data[0] });
      }
    } catch (error) {
      console.error('Error fetching Patreon pages:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch Patreon pages');
    }
  },

  fetchStats: async (page) => {
    set({ isLoading: true, error: null, stats: null });
    try {
      const api = new PatreonAPI(page.client_id, page.client_secret, page.id);
      const campaign = await api.getCampaign();
      const stats = await api.getStats(campaign.id);
      set({ stats, isLoading: false, error: null });
    } catch (error) {
      console.error('Error fetching stats:', error);
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch stats. Please check your Patreon credentials and try again.',
        isLoading: false,
        stats: null
      });
    }
  },
}));