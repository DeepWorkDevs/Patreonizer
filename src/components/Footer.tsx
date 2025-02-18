import React from 'react';
import { Link } from 'react-router-dom';
import { Palmtree } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 border-t border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center shadow-lg shadow-[#f45d48]/20">
              <Palmtree className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Patronizer</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-400">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/support" className="hover:text-white transition-colors">Support</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Patronizer. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}