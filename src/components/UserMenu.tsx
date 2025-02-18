import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Plus, LifeBuoy, LogOut } from 'lucide-react';
import { signOut } from '../lib/auth';

interface Props {
  displayName: string | null;
  avatarUrl: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPage: () => void;
}

export default function UserMenu({ displayName, avatarUrl, isOpen, onOpenChange, onAddPage }: Props) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#f45d48] to-[#f17c67] overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName || 'Profile'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
          <div className="p-2 border-b border-zinc-800">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-white truncate">
                {displayName || 'User'}
              </p>
            </div>
          </div>

          <div className="p-2 space-y-1">
            <Link
              to="/dashboard/settings"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                onAddPage();
                onOpenChange(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Patreon Page
            </button>
            <a
              href="mailto:support@patronizer.com"
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LifeBuoy className="w-4 h-4" />
              Get Support
            </a>
          </div>

          <div className="p-2 border-t border-zinc-800">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}