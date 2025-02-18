import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Palmtree,
  LayoutDashboard,
  Users,
  Settings,
  Plus,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import AddPatreonPageModal from './AddPatreonPageModal';

const menuItems = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Patrons', path: '/dashboard/patrons' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const [showAddPageModal, setShowAddPageModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center">
                  <Palmtree className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Patronizer</span>
              </div>
              {/* Mobile Close Button */}
              {isMobileMenuOpen && (
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 px-2 py-4">
            <button
              onClick={() => {
                setShowAddPageModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-[#f45d48] to-[#f17c67] rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Patreon Page
            </button>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              <Link
                to="/support"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <Users className="w-5 h-5" />
                Support
              </Link>
            </nav>
          </div>

          <div className="p-4 border-t border-zinc-800">
            <button className="w-full px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {showAddPageModal && (
        <AddPatreonPageModal onClose={() => setShowAddPageModal(false)} />
      )}
    </>
  );
}