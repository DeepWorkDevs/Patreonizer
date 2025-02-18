import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from './dashboard/Overview';
import Patrons from './dashboard/Patrons';
import Settings from './dashboard/Settings';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      
      <div className="flex-1 w-full">
        <Header />
        
        <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patrons" element={<Patrons />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}