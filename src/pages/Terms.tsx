import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function Terms() {
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
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-zinc-400 text-lg mb-8">Last updated: February 18, 2025</p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    By accessing or using Patronizer, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                    If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 mb-4">
                    Permission is granted to temporarily access and use Patronizer for personal, non-commercial transitory viewing only.
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Modify or copy the materials
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Use the materials for any commercial purpose
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Attempt to decompile or reverse engineer any software contained in Patronizer
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Remove any copyright or other proprietary notations from the materials
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#f45d48]">•</span>
                      Transfer the materials to another person or "mirror" the materials on any other server
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Account Terms</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    You are responsible for maintaining the security of your account and password. Patronizer cannot and will not be liable
                    for any loss or damage from your failure to comply with this security obligation.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Service Terms</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    You may not use Patronizer for any illegal or unauthorized purpose. You must not, in the use of the Service, violate
                    any laws in your jurisdiction (including but not limited to copyright laws).
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Limitations</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    In no event shall Patronizer or its suppliers be liable for any damages (including, without limitation, damages for
                    loss of data or profit, or due to business interruption) arising out of the use or inability to use Patronizer.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Changes to Terms</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material
                    we will try to provide at least 30 days' notice prior to any new terms taking effect.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Contact Us</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <p className="text-zinc-300">
                    If you have any questions about these Terms, please{' '}
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