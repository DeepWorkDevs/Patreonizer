import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft, MessageSquare, Mail, FileText, ExternalLink } from 'lucide-react';

export default function Support() {
  const supportCategories = [
    {
      title: 'Getting Started',
      description: 'Learn how to set up your account and connect your Patreon page',
      articles: [
        { title: 'Creating your account', link: '/docs/getting-started#creating-your-account' },
        { title: 'Connecting your Patreon page', link: '/docs/getting-started#connecting-your-patreon-page' },
        { title: 'Understanding your dashboard', link: '/docs/getting-started#understanding-your-dashboard' }
      ]
    },
    {
      title: 'Analytics & Reporting',
      description: 'Learn how to use our analytics tools and generate reports',
      articles: [
        { title: 'Reading your analytics', link: '/docs/analytics#reading-your-analytics' },
        { title: 'Generating custom reports', link: '/docs/analytics#using-analytics-for-growth' },
        { title: 'Understanding metrics', link: '/docs/analytics#key-metrics-overview' }
      ]
    },
    {
      title: 'Account Management',
      description: 'Manage your account settings and preferences',
      articles: [
        { title: 'Updating your profile', link: '/docs/account-management#updating-your-profile' },
        { title: 'Managing notifications', link: '/docs/account-management#managing-notifications' },
        { title: 'Security settings', link: '/docs/account-management#security-settings' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
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
            to="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Find answers in our documentation, or get in touch with our support team.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Link
            to="/contact"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#f45d48] transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#f45d48] transition-colors">
              Contact Support
            </h3>
            <p className="text-zinc-400">
              Get in touch with our support team for personalized help
            </p>
          </Link>

          <a
            href="mailto:support@patronizer.io"
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#f45d48] transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#f45d48] transition-colors">
              Email Us
            </h3>
            <p className="text-zinc-400">
              Send us an email at support@patronizer.io
            </p>
          </a>

          <div
            className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-[#f45d48] transition-colors"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-[#f45d48] transition-colors">
              Documentation
            </h3>
            <p className="text-zinc-400">
              Browse our comprehensive documentation below
            </p>
          </div>
        </div>

        {/* Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {supportCategories.map((category, index) => (
            <div
              key={index}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
              <p className="text-zinc-400 mb-6">{category.description}</p>
              <ul className="space-y-3">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <Link
                      to={article.link}
                      className="flex items-center gap-2 text-[#f45d48] hover:text-[#f17c67] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}