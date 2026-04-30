import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Grader from './pages/Grader';
import Auth from './pages/Auth';
import Portfolio from './pages/Portfolio';
import ROI from './pages/ROI';
import Sealed from './pages/Sealed';
import Sets from './pages/Sets';
import SetIntel from './pages/SetIntel';
import './App.css';

function PrivateRoute({ children, session, loading }) {
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050507', color: '#f0f0f8' }}>
      Loading...
    </div>
  );
  return session ? children : <Navigate to="/auth" />;
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050507', color: '#f0f0f8' }}>
      Loading...
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing session={session} />} />
        <Route path="/auth" element={session ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={<PrivateRoute session={session} loading={loading}><Dashboard session={session} /></PrivateRoute>} />
        <Route path="/grade" element={<PrivateRoute session={session} loading={loading}><Grader session={session} /></PrivateRoute>} />
        <Route path="/portfolio" element={<PrivateRoute session={session} loading={loading}><Portfolio session={session} /></PrivateRoute>} />
        <Route path="/roi" element={<PrivateRoute session={session} loading={loading}><ROI session={session} /></PrivateRoute>} />
        <Route path="/sealed" element={<PrivateRoute session={session} loading={loading}><Sealed session={session} /></PrivateRoute>} />
        <Route path="/sets" element={<PrivateRoute session={session} loading={loading}><Sets session={session} /></PrivateRoute>} />
        <Route path="/sets" element={<PrivateRoute session={session} loading={loading}><SetIntel session={session} /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
