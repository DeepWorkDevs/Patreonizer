import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function GettingStarted() {
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
          <h1>Getting Started with Patronizer</h1>
          
          <h2>Creating Your Account</h2>
          <p>
            Getting started with Patronizer is quick and easy. Follow these steps to create your account:
          </p>
          <ol>
            <li>Click the "Get Started" button on the homepage</li>
            <li>Enter your email address and create a secure password</li>
            <li>Verify your email address by clicking the link sent to your inbox</li>
            <li>Complete your profile by adding your name and optional profile picture</li>
          </ol>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Pro Tip
            </h3>
            <p className="mb-0">
              Choose a strong password that's at least 12 characters long and includes a mix of letters, numbers, and symbols.
            </p>
          </div>

          <h2>Connecting Your Patreon Page</h2>
          <p>
            To connect your Patreon page to Patronizer, you'll need to:
          </p>
          <ol>
            <li>Log in to your Patreon account</li>
            <li>Create a client in the Patreon Developer Portal</li>
            <li>Copy your Client ID and Client Secret</li>
            <li>Enter these credentials in Patronizer</li>
          </ol>

          <h3>Detailed Steps for Creating a Patreon Client</h3>
          <ol>
            <li>
              Visit the <a href="https://www.patreon.com/portal/registration/oauth-client" target="_blank" rel="noopener noreferrer" className="text-[#f45d48]">Patreon Developer Portal</a>
            </li>
            <li>Click "Create Client"</li>
            <li>
              Fill in the required information:
              <ul>
                <li>Name: "Patronizer"</li>
                <li>Description: "Analytics dashboard for Patreon creators"</li>
                <li>Redirect URI: The URL provided in your Patronizer setup</li>
              </ul>
            </li>
            <li>Save your client and securely store the Client ID and Client Secret</li>
          </ol>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Important
            </h3>
            <p className="mb-0">
              Never share your Client Secret with anyone. If your credentials are compromised, immediately generate new ones in the Patreon Developer Portal.
            </p>
          </div>

          <h2>Understanding Your Dashboard</h2>
          <p>
            Your Patronizer dashboard provides comprehensive analytics for your Patreon page:
          </p>
          <ul>
            <li>
              <strong>Overview:</strong> See key metrics like total patrons, monthly revenue, and growth trends
            </li>
            <li>
              <strong>Patron Management:</strong> View and manage your patron list with detailed profiles
            </li>
            <li>
              <strong>Analytics:</strong> Deep dive into your page's performance with interactive charts
            </li>
            <li>
              <strong>Reports:</strong> Generate custom reports for specific time periods
            </li>
          </ul>

          <h3>Customizing Your Dashboard</h3>
          <p>
            You can customize your dashboard by:
          </p>
          <ul>
            <li>Selecting your preferred date range for data display</li>
            <li>Choosing which metrics to show in your overview</li>
            <li>Setting up custom notifications for important events</li>
            <li>Creating saved views for frequently accessed reports</li>
          </ul>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Next Steps
            </h3>
            <p className="mb-0">
              Once you've set up your account and connected your Patreon page, explore our guides on:
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
              <li>
                <Link to="/docs/notifications" className="text-[#f45d48]">
                  Setting Up Notifications
                </Link>
              </li>
            </ul>
          </div>

          <h2>Need Help?</h2>
          <p>
            If you need assistance at any point:
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