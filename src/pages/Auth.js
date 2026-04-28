import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login or signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-bg">
        <div className="auth-glow-1" />
        <div className="auth-glow-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" className="auth-logo-img" />
          HUMN <span>IQ</span>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p className="auth-sub">{mode === 'login' ? 'Sign in to your HUMN IQ account' : 'Start grading smarter today'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="field-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="field-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>Don't have an account? <span onClick={() => setMode('signup')}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setMode('login')}>Sign in</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
