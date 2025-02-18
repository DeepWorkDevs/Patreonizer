import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { getCurrentUser, onAuthStateChange } from './lib/auth';
import Landing from './pages/Landing';
import Welcome from './pages/Welcome';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import Contact from './pages/Contact';
import GettingStarted from './pages/docs/GettingStarted';
import Analytics from './pages/docs/Analytics';
import AccountManagement from './pages/docs/AccountManagement';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(state => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const setUser = useStore(state => state.setUser);
  const fetchPatreonPages = useStore(state => state.fetchPatreonPages);

  useEffect(() => {
    // Check for existing session
    getCurrentUser().then(setUser);

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await fetchPatreonPages();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, fetchPatreonPages]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Welcome />} />
        <Route path="/signup" element={<Welcome isSignUp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/docs/getting-started" element={<GettingStarted />} />
        <Route path="/docs/analytics" element={<Analytics />} />
        <Route path="/docs/account-management" element={<AccountManagement />} />
        <Route path="/setup" element={
          <PrivateRoute>
            <Setup />
          </PrivateRoute>
        } />
        <Route path="/dashboard/*" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;