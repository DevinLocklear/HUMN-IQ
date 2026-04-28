import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Grader from './pages/Grader';
import Auth from './pages/Auth';
import Portfolio from './pages/Portfolio';
import './App.css';

function PrivateRoute({ children, session }) {
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
        <Route path="/dashboard" element={<PrivateRoute session={session}><Dashboard session={session} /></PrivateRoute>} />
        <Route path="/grade" element={<PrivateRoute session={session}><Grader session={session} /></PrivateRoute>} />
        <Route path="/portfolio" element={<PrivateRoute session={session}><Portfolio session={session} /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
