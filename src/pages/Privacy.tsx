import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1">
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
              to="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-zinc-400 text-lg mb-8">Last updated: February 18, 2025</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    Welcome to Patronizer ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                    This privacy policy will inform you about how we look after your personal data when you visit our website and tell you
                    about your privacy rights and how the law protects you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Data We Collect</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 mb-4">We collect several different types of information for various purposes:</p>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Personal identification information (Name, email address)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Patreon account information and analytics data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Usage data and website analytics
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Communication preferences
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 mb-4">We use your data to:</p>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Provide and maintain our service
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Notify you about changes to our service
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Provide customer support
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Monitor the usage of our service
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Detect, prevent and address technical issues
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Data Storage and Security</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    Your data is stored securely using industry-standard encryption and security measures. We use Supabase
                    for our database needs, which provides enterprise-grade security features.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      The right to access your personal data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      The right to correct your personal data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      The right to erase your personal data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      The right to restrict processing of your personal data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      The right to data portability
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300">
                    If you have any questions about this Privacy Policy, please{' '}
                    <Link to="/contact" className="text-[#f45d48] hover:text-[#f17c67]">
                      contact us
                    </Link>.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}