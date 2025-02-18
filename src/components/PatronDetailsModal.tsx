import React from 'react';
import { X, ExternalLink, Calendar, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Patron {
  id: string;
  full_name: string;
  email: string;
  image_url: string;
  status: string;
  pledge_relationship_start: string;
  lifetime_support_cents: number;
  url: string;
  social_connections: Record<string, any>;
  campaign: {
    creation_name: string;
    image_url: string | null;
    image_small_url: string | null;
  };
  patron_tiers: Array<{
    tier: {
      title: string;
      amount_cents: number;
      description: string;
      benefits: Array<{ title: string }>;
    };
  }>;
}

interface Props {
  patron: Patron;
  onClose: () => void;
}

export default function PatronDetailsModal({ patron, onClose }: Props) {
  const currentTier = patron.patron_tiers[0]?.tier;
  const monthlySupport = currentTier?.amount_cents ? currentTier.amount_cents / 100 : 0;
  const lifetimeSupport = patron.lifetime_support_cents / 100;
  const joinDate = new Date(patron.pledge_relationship_start);
  const monthsSupporting = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={patron.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patron.full_name)}&background=f45d48&color=fff`}
              alt={patron.full_name}
              className="w-12 h-12 rounded-xl bg-zinc-800"
            />
            <div>
              <h2 className="text-xl font-semibold text-white">{patron.full_name}</h2>
              <p className="text-zinc-400">{patron.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {format(joinDate, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {monthsSupporting} months
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Monthly Support</span>
              </div>
              <p className="text-lg font-semibold text-white">
                ${monthlySupport.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                per month
              </p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 text-zinc-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Lifetime Support</span>
              </div>
              <p className="text-lg font-semibold text-white">
                ${lifetimeSupport.toFixed(2)}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                total contribution
              </p>
            </div>
          </div>

          {/* Membership Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Membership Details</h3>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                  {patron.campaign.image_small_url ? (
                    <img
                      src={patron.campaign.image_small_url}
                      alt={patron.campaign.creation_name}
                      className="w-full h-full object-cover"
                    />
                  ) : patron.campaign.image_url ? (
                    <img
                      src={patron.campaign.image_url}
                      alt={patron.campaign.creation_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f45d48] to-[#f17c67]">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-white">{patron.campaign.creation_name}</h4>
                  <p className="text-sm text-zinc-400">Patreon Page</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-2">Current Tier</p>
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{currentTier?.title}</h5>
                      <span className="text-[#f45d48] font-medium">
                        ${(currentTier?.amount_cents || 0) / 100}/month
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">{currentTier?.description}</p>
                    {currentTier?.benefits && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-400">Benefits:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {currentTier.benefits.map((benefit, index) => (
                            <div
                              key={index}
                              className="text-sm text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded-lg"
                            >
                              {benefit.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-2">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                    patron.status === 'active_patron'
                      ? 'bg-emerald-400/10 text-emerald-400'
                      : 'bg-red-400/10 text-red-400'
                  }`}>
                    {patron.status === 'active_patron' ? 'Active' : 'Declined'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* External Links */}
          {(patron.url || Object.keys(patron.social_connections || {}).length > 0) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
              <div className="space-y-2">
                {patron.url && (
                  <a
                    href={patron.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#f45d48] hover:text-[#f17c67] bg-zinc-800/50 px-4 py-3 rounded-lg"
                  >
                    View Patreon Profile
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {Object.entries(patron.social_connections || {}).map(([platform, data]) => (
                  <div
                    key={platform}
                    className="flex items-center gap-2 text-zinc-400 bg-zinc-800/50 px-4 py-3 rounded-lg"
                  >
                    <span className="capitalize">{platform}</span>
                    <span className="text-sm text-zinc-500">
                      {(data as any).user_id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}