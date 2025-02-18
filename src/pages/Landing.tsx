import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Palmtree, 
  BarChart3, 
  Users, 
  TrendingUp, 
  Bell, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Comprehensive Analytics',
      description: 'Get detailed insights into your Patreon performance with beautiful, interactive charts and metrics.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Patron Management',
      description: 'Track and manage your patrons effectively with detailed profiles and engagement history.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Growth Insights',
      description: 'Understand your growth trends and identify opportunities to expand your patron base.'
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Real-time Notifications',
      description: 'Stay informed with instant notifications about new patrons, pledges, and important events.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Multi-page Support',
      description: 'Manage multiple Patreon pages from a single dashboard with unified analytics.'
    }
  ];

  const benefits = [
    'Real-time analytics dashboard',
    'Patron engagement tracking',
    'Revenue forecasting',
    'Growth trend analysis',
    'Multi-tier management',
    'Automated reporting'
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#f45d48]/20 via-black to-black pointer-events-none" />

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-40">
          <div className="text-center">
            {/* Logo and Title */}
            <div className="inline-flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-2xl flex items-center justify-center shadow-lg shadow-[#f45d48]/20 transform hover:scale-105 transition-transform">
                <Palmtree className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl sm:text-7xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Patronizer
              </h1>
            </div>
            
            {/* Tagline */}
            <div className="relative max-w-3xl mx-auto mb-16">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#f45d48]/20 to-[#f17c67]/20 rounded-lg blur-lg opacity-50" />
              <p className="relative text-xl sm:text-3xl text-zinc-300 font-medium leading-relaxed">
                The ultimate analytics dashboard for Patreon creators.
                <span className="block mt-2 text-zinc-400 font-normal">
                  Understand your audience, track growth, and make data-driven decisions.
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-[#f45d48]/20"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-900/50 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-zinc-800/50 transition-all transform hover:scale-105 border border-zinc-800"
              >
                Sign In
              </Link>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-zinc-800/50 hover:border-[#f45d48]/50 transition-colors group"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#f45d48] group-hover:scale-110 transition-transform" />
                  <span className="text-sm sm:text-base text-zinc-300 font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-gradient-to-b from-zinc-900/50 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything you need to grow your Patreon
            </h2>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              Powerful tools and insights to help you understand and grow your creator business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-black border border-zinc-800 rounded-xl p-6 hover:border-[#f45d48] transition-colors relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#f45d48]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center text-white mb-4 shadow-lg shadow-[#f45d48]/20 group-hover:shadow-[#f45d48]/30 transition-shadow">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#f45d48] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center hover:border-[#f45d48] transition-colors">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f45d48] to-[#f17c67] mb-2">10k+</div>
              <div className="text-zinc-400 font-medium">Active Creators</div>
            </div>
            <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center hover:border-[#f45d48] transition-colors">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f45d48] to-[#f17c67] mb-2">$2M+</div>
              <div className="text-zinc-400 font-medium">Monthly Revenue Tracked</div>
            </div>
            <div className="group bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center hover:border-[#f45d48] transition-colors">
              <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#f45d48] to-[#f17c67] mb-2">500k+</div>
              <div className="text-zinc-400 font-medium">Patrons Analyzed</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-gradient-to-b from-black to-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to grow your Patreon?
          </h2>
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who use Patronizer to understand and grow their audience. Start your journey today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#f45d48]/20"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center shadow-lg shadow-[#f45d48]/20">
                <Palmtree className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Patronizer</span>
            </div>
            <div className="flex items-center gap-8 text-zinc-400">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/support" className="hover:text-white transition-colors">Support</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="text-zinc-500">
              © 2025 Patronizer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}