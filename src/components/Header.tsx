import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';
import AddPatreonPageModal from './AddPatreonPageModal';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
}

export default function Header() {
  const user = useStore(state => state.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddPageModal, setShowAddPageModal] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    }

    loadProfile();
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-20 h-16 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Search - Hidden on mobile by default */}
          <div className="hidden md:block flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48] transition-colors"
              />
            </div>
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <div className="flex items-center gap-3">
              {profile?.display_name && (
                <span className="text-sm font-medium text-white hidden sm:block">
                  {profile.display_name}
                </span>
              )}
              <UserMenu
                displayName={profile?.display_name}
                avatarUrl={profile?.avatar_url}
                isOpen={showUserMenu}
                onOpenChange={setShowUserMenu}
                onAddPage={() => setShowAddPageModal(true)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        {showSearch && (
          <div className="md:hidden px-4 py-2 border-b border-zinc-800 bg-zinc-900">
            <div className="relative">
              <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-zinc-800 text-white rounded-lg pl-10 pr-4 py-2 border border-zinc-700 focus:outline-none focus:border-[#f45d48] transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {showAddPageModal && (
        <AddPatreonPageModal onClose={() => setShowAddPageModal(false)} />
      )}
    </>
  );
}