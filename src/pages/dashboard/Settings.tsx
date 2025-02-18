import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Camera, Loader2, Save, LogOut, Trash2, AlertTriangle, Users } from 'lucide-react';
import { signOut } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface PatreonPage {
  id: string;
  name: string;
  created_at: string;
  patreon_campaigns: Array<{
    image_url: string | null;
    image_small_url: string | null;
  }>;
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-zinc-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const user = useStore(state => state.user);
  const [profile, setProfile] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });
  const [patreonPages, setPatreonPages] = useState<PatreonPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
    loadPatreonPages();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        displayName: data.display_name || '',
        bio: data.bio || '',
        avatarUrl: data.avatar_url || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatreonPages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patreon_pages')
        .select(`
          id,
          name,
          created_at,
          patreon_campaigns (
            image_url,
            image_small_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatreonPages(data);
    } catch (err) {
      console.error('Error loading Patreon pages:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: profile.displayName.trim(),
          bio: profile.bio.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      // Reset messages
      setError(null);
      setSuccessMessage(null);
      setIsSaving(true);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
        throw new Error('Invalid file type. Please use JPG, PNG, or GIF');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filePath = `avatars/${user.id}/${timestamp}.${fileExt}`;

      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user_assets')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // If successful, update local state
      setProfile(prev => ({ ...prev, avatarUrl: publicUrl }));
      setSuccessMessage('Profile picture updated successfully');

      // Clean up old avatar if it exists
      if (profile.avatarUrl) {
        const oldPath = new URL(profile.avatarUrl).pathname.split('/').slice(-2).join('/');
        await supabase.storage
          .from('user_assets')
          .remove([`avatars/${oldPath}`]);
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    setPageToDelete(pageId);
    setShowDeleteModal(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;

    try {
      setIsSaving(true);
      const { error } = await supabase.rpc('soft_delete_patreon_page', {
        page_id: pageToDelete
      });

      if (error) throw error;

      setPatreonPages(prev => prev.filter(page => page.id !== pageToDelete));
      setSuccessMessage('Patreon page removed successfully');
    } catch (err) {
      console.error('Error removing Patreon page:', err);
      setError('Failed to remove Patreon page');
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setPageToDelete(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    // Validate passwords
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError(null);

      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setSuccessMessage('Password updated successfully');
      setShowPasswordModal(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Account Settings</h1>

      {/* Profile Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-zinc-800 overflow-hidden">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                placeholder="Enter your display name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48] min-h-[100px]"
              placeholder="Tell us about yourself"
            />
          </div>

          {error && (
            <div className="text-[#f45d48] text-sm">{error}</div>
          )}
          
          {successMessage && (
            <div className="text-emerald-500 text-sm">{successMessage}</div>
          )}

          <div className="flex items-center justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Password</h2>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Change Password
        </button>
      </div>

      {/* Connected Pages */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Connected Patreon Pages</h2>
        <div className="space-y-4">
          {patreonPages.length === 0 ? (
            <p className="text-zinc-400">No Patreon pages connected</p>
          ) : (
            patreonPages.map(page => (
              <div
                key={page.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {page.patreon_campaigns?.[0]?.image_small_url ? (
                      <img
                        src={page.patreon_campaigns[0].image_small_url}
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    ) : page.patreon_campaigns?.[0]?.image_url ? (
                      <img
                        src={page.patreon_campaigns[0].image_url}
                        alt={page.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f45d48] to-[#f17c67]">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{page.name}</h3>
                    <p className="text-sm text-zinc-400">
                      Connected {new Date(page.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePage(page.id)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
        <button
          onClick={handleSignOut}
          className="px-6 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#f45d48]"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="text-red-400 text-sm">{passwordError}</div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswords({ current: '', new: '', confirm: '' });
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-gradient-to-r from-[#f45d48] to-[#f17c67] text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isChangingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Remove Patreon Page"
        message="Are you sure you want to remove this Patreon page? This action cannot be undone."
        onConfirm={confirmDeletePage}
        onCancel={() => {
          setShowDeleteModal(false);
          setPageToDelete(null);
        }}
        isLoading={isSaving}
      />
    </div>
  );
}