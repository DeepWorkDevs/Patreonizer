import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft, CheckCircle2, TrendingUp, DollarSign, Users } from 'lucide-react';

export default function Analytics() {
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
          <h1>Understanding Your Analytics</h1>
          
          <h2>Key Metrics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Revenue Metrics</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Monthly recurring revenue</li>
                <li>Average pledge amount</li>
                <li>Lifetime value</li>
                <li>Revenue growth rate</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Patron Metrics</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Total active patrons</li>
                <li>New patron growth</li>
                <li>Churn rate</li>
                <li>Patron retention</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Growth Metrics</h3>
              <ul className="text-zinc-400 space-y-2">
                <li>Month-over-month growth</li>
                <li>Conversion rates</li>
                <li>Tier distribution</li>
                <li>Engagement trends</li>
              </ul>
            </div>
          </div>

          <h2>Reading Your Analytics</h2>
          <p>
            Patronizer provides comprehensive analytics that help you understand your Patreon page's performance. Here's how to interpret key metrics:
          </p>

          <h3>Revenue Analytics</h3>
          <ul>
            <li>
              <strong>Monthly Recurring Revenue (MRR):</strong> The total amount you earn from your patrons each month
            </li>
            <li>
              <strong>Average Pledge Amount:</strong> The average monthly contribution per patron
            </li>
            <li>
              <strong>Revenue Growth:</strong> Month-over-month change in your total revenue
            </li>
            <li>
              <strong>Projected Annual Revenue:</strong> Estimated yearly earnings based on current trends
            </li>
          </ul>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Pro Tip
            </h3>
            <p className="mb-0">
              Focus on your MRR trend line rather than daily fluctuations. This gives you a better picture of your page's long-term health.
            </p>
          </div>

          <h3>Patron Analytics</h3>
          <ul>
            <li>
              <strong>Active Patrons:</strong> Current number of paying supporters
            </li>
            <li>
              <strong>Patron Growth Rate:</strong> Rate at which you're gaining new patrons
            </li>
            <li>
              <strong>Churn Rate:</strong> Percentage of patrons who cancel their pledges
            </li>
            <li>
              <strong>Retention Rate:</strong> How long patrons typically support you
            </li>
          </ul>

          <h3>Growth Analytics</h3>
          <ul>
            <li>
              <strong>Conversion Rate:</strong> Percentage of visitors who become patrons
            </li>
            <li>
              <strong>Tier Distribution:</strong> How your patrons are spread across different tiers
            </li>
            <li>
              <strong>Engagement Metrics:</strong> How patrons interact with your content
            </li>
          </ul>

          <h2>Using Analytics for Growth</h2>
          <p>
            Here's how to use your analytics to grow your Patreon page:
          </p>
          <ol>
            <li>
              <strong>Identify Trends:</strong> Look for patterns in patron behavior and revenue changes
            </li>
            <li>
              <strong>Optimize Tiers:</strong> Use tier distribution data to adjust your rewards
            </li>
            <li>
              <strong>Reduce Churn:</strong> Monitor why patrons leave and address common issues
            </li>
            <li>
              <strong>Track Growth:</strong> Set goals based on your growth metrics
            </li>
          </ol>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 my-8">
            <h3 className="mt-0 flex items-center gap-2 text-[#f45d48]">
              <CheckCircle2 className="w-5 h-5" />
              Next Steps
            </h3>
            <p className="mb-0">
              Now that you understand your analytics, learn how to:
            </p>
            <ul className="mb-0">
              <li>
                <Link to="/docs/reports" className="text-[#f45d48]">
                  Generate Custom Reports
                </Link>
              </li>
              <li>
                <Link to="/docs/metrics" className="text-[#f45d48]">
                  Set Up Custom Metrics
                </Link>
              </li>
              <li>
                <Link to="/docs/forecasting" className="text-[#f45d48]">
                  Use Revenue Forecasting
                </Link>
              </li>
            </ul>
          </div>

          <h2>Need Help?</h2>
          <p>
            If you need assistance understanding your analytics:
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
              Schedule a{' '}
              <Link to="/support/consultation" className="text-[#f45d48]">
                consultation call
              </Link>
              {' '}with our analytics experts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}