import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Dashboard.css';

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const navItems = [
    { icon: '◈', label: 'Card Grader', path: '/grade', active: false },
    { icon: '▣', label: 'Portfolio', path: '/portfolio', active: false },
    { icon: '◎', label: 'ROI Calculator', path: '/roi' },
    { icon: '▲', label: 'Market Prices', path: '/market', soon: true },
    { icon: '◉', label: 'Sealed Analysis', path: '/sealed' },
    { icon: '◐', label: 'Set Intelligence', path: '/sets' },
  ];

  const quickActions = [
    { icon: '◈', title: 'Grade a Card', desc: 'Upload a photo for instant PSA grade prediction', path: '/grade' },
    { icon: '▣', title: 'Portfolio', desc: 'Track your collection value in real time', path: '/portfolio' },
    { icon: '◎', title: 'ROI Calculator', desc: 'Should you grade this card? Find out instantly', soon: true },
    { icon: '◉', title: 'Sealed Analysis', desc: 'Open or hold your sealed product?', soon: true },
  ];

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          HUMN <span>IQ</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`}
              onClick={() => !item.soon && navigate(item.path)}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.soon && <span className="sidebar-soon">Soon</span>}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-plan">
            <div className="plan-tier">Free Plan</div>
            <div className="plan-desc">3 grades remaining</div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '10px' }}>
              Upgrade to Pro
            </button>
            <button onClick={handleLogout} style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '10px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Welcome back{session?.user?.user_metadata?.full_name ? `, ${session.user.user_metadata.full_name.split(' ')[0]}` : ''}</p>
          </div>
          <div className="dash-user">
            {session?.user?.user_metadata?.avatar_url
              ? <img src={session.user.user_metadata.avatar_url} alt="avatar" className="dash-avatar" />
              : <div className="dash-avatar-initial">{session?.user?.email?.[0]?.toUpperCase() || '?'}</div>
            }
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Portfolio Value', value: '$0.00', change: '+0%', up: true },
            { label: 'Cards Tracked', value: '0', change: '0 this week', up: true },
            { label: 'Grades Run', value: '0', change: '3 remaining free', up: true },
            { label: 'Avg Grade', value: '—', change: 'No data yet', up: true },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="dash-section">
          <div className="dash-section-title">Quick Actions</div>
          <div className="actions-grid">
            {quickActions.map((item, i) => (
              <div key={i} className={`action-card ${item.soon ? 'coming-soon' : ''}`}
                onClick={() => !item.soon && navigate(item.path)}>
                <div className="action-icon">{item.icon}</div>
                <div className="action-title">{item.title}</div>
                <div className="action-desc">{item.desc}</div>
                {item.soon
                  ? <div className="action-badge">Coming Soon</div>
                  : <div className="action-arrow">→</div>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="dash-section">
          <div className="dash-section-title">Recent Grades</div>
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p>No grades yet</p>
            <p className="empty-sub">Grade your first card to see results here</p>
            <button className="btn-primary" onClick={() => navigate('/grade')} style={{ marginTop: '16px' }}>
              Grade a Card
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
