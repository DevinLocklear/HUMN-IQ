import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Dashboard.css';

const stats = [
  { label: 'Portfolio Value', value: '$0.00', change: '+0%', up: true },
  { label: 'Cards Tracked', value: '0', change: '0 this week', up: true },
  { label: 'Grades Run', value: '0', change: '0 remaining', up: true },
  { label: 'Avg Grade', value: '—', change: 'No data yet', up: true },
];

const navItems = [
  { icon: '◈', label: 'Card Grader', path: '/grade', active: false },
  { icon: '▣', label: 'Portfolio', path: '/portfolio', active: false },
  { icon: '◎', label: 'ROI Calculator', path: '/roi', active: false },
  { icon: '▲', label: 'Market Prices', path: '/market', active: false },
  { icon: '◉', label: 'Sealed Analysis', path: '/sealed', active: false },
  { icon: '◐', label: 'Set Intelligence', path: '/sets', active: false },
];

export default function Dashboard({ session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="dashboard">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          HUMN <span>IQ</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <div
              key={i}
              className={`sidebar-item ${item.active ? 'active' : ''}`}
              onClick={() => (item.path === '/grade' || item.path === '/portfolio') ? navigate(item.path) : null}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.path !== '/grade' && <span className="sidebar-soon">Soon</span>}
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
        <header className="dash-header">
          <div>
            <h1 className="dash-title">Dashboard</h1>
            <p className="dash-sub">Welcome to HUMN IQ</p>
          </div>

        </header>

        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="section-label">Quick Actions</div>
          <div className="actions-grid">
            <div className="action-card" onClick={() => navigate('/grade')}>
              <div className="action-icon">◈</div>
              <div className="action-title">Grade a Card</div>
              <div className="action-desc">Upload a photo for instant PSA grade prediction</div>
              <div className="action-arrow">→</div>
            </div>
            <div className="action-card coming-soon">
              <div className="action-icon">▣</div>
              <div className="action-title">Add to Portfolio</div>
              <div className="action-desc">Track your collection value in real time</div>
              <div className="action-badge">Coming Soon</div>
            </div>
            <div className="action-card coming-soon">
              <div className="action-icon">◎</div>
              <div className="action-title">ROI Calculator</div>
              <div className="action-desc">Should you grade this card? Find out instantly</div>
              <div className="action-badge">Coming Soon</div>
            </div>
            <div className="action-card coming-soon">
              <div className="action-icon">◉</div>
              <div className="action-title">Sealed Analysis</div>
              <div className="action-desc">Open or hold your sealed product?</div>
              <div className="action-badge">Coming Soon</div>
            </div>
          </div>
        </div>

        {/* Recent Grades */}
        <div className="recent-section">
          <div className="section-label">Recent Grades</div>
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
