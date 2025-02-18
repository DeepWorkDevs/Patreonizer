import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft, CheckCircle2, Shield, Bell, User } from 'lucide-react';

export default function AccountManagement() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center">
              <Palmtree className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Patronizer</span>
          </Link>
          <Link
            to="/support"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Support
          </Link>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <h1>Account Management</h1>

          <h2>Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Information</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Display name</li>
                <li>Profile picture</li>
                <li>Bio</li>
                <li>Contact details</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Notifications</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Email preferences</li>
                <li>Alert settings</li>
                <li>Custom triggers</li>
                <li>Digest frequency</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Password management</li>
                <li>Two-factor auth</li>
                <li>Login history</li>
                <li>Connected devices</li>
              </ul>
            </div>
          </div>

          <h2>Updating Your Profile</h2>
          <p>
            Keep your profile information up to date to ensure smooth communication and account management:
          </p>
          <ol>
            <li>Navigate to Settings in your dashboard</li>
            <li>Click on "Profile" in the left sidebar</li>
            <li>Update your information as needed</li>
            <li>Click "Save Changes" to apply updates</li>
          </ol>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Pro Tip
            </h3>
            <p className="mb-0">
              Add a professional profile picture and bio to make your account more recognizable and build trust with your patrons.
            </p>
          </div>

          <h2>Managing Notifications</h2>
          <p>
            Customize your notification preferences to stay informed about important events:
          </p>
          <ul>
            <li>
              <strong>Email Notifications:</strong> Choose which updates you receive via email
            </li>
            <li>
              <strong>Alert Settings:</strong> Set up custom alerts for specific events
            </li>
            <li>
              <strong>Digest Frequency:</strong> Choose how often you receive summary reports
            </li>
          </ul>

          <h3>Setting Up Custom Alerts</h3>
          <p>
            Create custom alerts for:
          </p>
          <ul>
            <li>New patron signups</li>
            <li>Pledge cancellations</li>
            <li>Revenue milestones</li>
            <li>Engagement metrics</li>
          </ul>

          <h2>Security Settings</h2>
          <p>
            Protect your account with these security features:
          </p>
          <ul>
            <li>
              <strong>Password Management:</strong> Regularly update your password and ensure it's strong
            </li>
            <li>
              <strong>Two-Factor Authentication:</strong> Add an extra layer of security to your account
            </li>
            <li>
              <strong>Login History:</strong> Monitor recent account access
            </li>
            <li>
              <strong>Connected Devices:</strong> Manage devices with access to your account
            </li>
          </ul>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Important
            </h3>
            <p className="mb-0">
              Enable two-factor authentication for enhanced account security. This helps protect your account even if your password is compromised.
            </p>
          </div>

          <h2>Connected Patreon Pages</h2>
          <p>
            Manage your connected Patreon pages:
          </p>
          <ul>
            <li>Add new Patreon pages</li>
            <li>Update API credentials</li>
            <li>Remove connected pages</li>
            <li>View sync status</li>
          </ul>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Next Steps
            </h3>
            <p className="mb-0">
              After setting up your account preferences, learn about:
            </p>
            <ul className="mb-0">
              <li>
                <Link to="/docs/analytics" className="text-[#f45d48]">
                  Reading Your Analytics
                </Link>
              </li>
              <li>
                <Link to="/docs/reports" className="text-[#f45d48]">
                  Generating Custom Reports
                </Link>
              </li>
            </ul>
          </div>

          <h2>Need Help?</h2>
          <p>
            If you need assistance with account management:
          </p>
          <ul>
            <li>
              <Link to="/contact" className="text-[#f45d48]">Contact our support team</Link>
            </li>
            <li>
              Email us at{' '}
              <a href="mailto:support@patronizer.io" className="text-[#f45d48]">
                support@patronizer.io
              </a>
            </li>
            <li>
              Check our{' '}
              <Link to="/support" className="text-[#f45d48]">
                Support Center
              </Link>
              {' '}for more guides
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}