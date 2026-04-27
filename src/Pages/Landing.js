import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  {
    icon: '◈',
    title: 'AI Card Grader',
    desc: 'Upload a photo and get an instant PSA grade prediction with centering, corners, edges and surface analysis.',
  },
  {
    icon: '◎',
    title: 'Grading ROI Calculator',
    desc: 'Know exactly which cards are worth submitting before spending $25+ on grading fees.',
  },
  {
    icon: '▲',
    title: 'Market Intelligence',
    desc: 'Real-time prices from eBay and TCGPlayer. Know what your cards are actually worth right now.',
  },
  {
    icon: '◉',
    title: 'Sealed Product Analysis',
    desc: 'Open or hold? AI-powered recommendations based on historical price trends and print run data.',
  },
  {
    icon: '▣',
    title: 'Portfolio Tracker',
    desc: 'Track your entire collection — raw, graded, sealed — with live market value updated daily.',
  },
  {
    icon: '◐',
    title: 'Set Intelligence',
    desc: 'When a new set drops, know which cards to invest in before the market catches up.',
  },
];

const comparisons = [
  { feature: 'Portfolio Tracking', collectr: true, humn: true },
  { feature: 'Real-time Pricing', collectr: true, humn: true },
  { feature: 'AI Card Grading', collectr: false, humn: true },
  { feature: 'PSA Grade Prediction', collectr: false, humn: true },
  { feature: 'Grading ROI Calculator', collectr: false, humn: true },
  { feature: 'PSA Pop Report Analysis', collectr: false, humn: true },
  { feature: 'Sealed Product Analysis', collectr: false, humn: true },
  { feature: 'Open or Hold Recommendation', collectr: false, humn: true },
  { feature: 'Set Investment Intelligence', collectr: false, humn: true },
  { feature: 'Japanese Card Support', collectr: false, humn: true },
  { feature: 'BGS / CGC Grading Support', collectr: false, humn: true },
  { feature: 'Price Alerts', collectr: false, humn: true },
  { feature: 'Ads', collectr: false, humn: false },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo">
          HUMN <span className="nav-iq">IQ</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#compare">Compare</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow" />
        </div>
        <div className="hero-content">
          <div className="tag">Pokemon TCG Intelligence Platform</div>
          <h1 className="hero-title">
            Make smarter decisions<br />
            on every <span className="hero-accent">card.</span>
          </h1>
          <p className="hero-sub">
            AI-powered grading, market intelligence, and portfolio tracking
            built specifically for serious Pokemon TCG collectors and investors.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/grade')}>
              Grade a Card Free
            </button>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">PSA</span>
              <span className="hero-stat-label">Grade Prediction</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">AI</span>
              <span className="hero-stat-label">Powered Analysis</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">Live</span>
              <span className="hero-stat-label">Market Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-header">
          <div className="tag">Features</div>
          <h2 className="section-title">Everything a serious collector needs</h2>
          <p className="section-sub">No other tool gives you this complete picture in one place.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className={`feature-card ${hoveredFeature === i ? 'active' : ''}`}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="compare" id="compare">
        <div className="section-header">
          <div className="tag">Comparison</div>
          <h2 className="section-title">HUMN IQ vs Collectr</h2>
          <p className="section-sub">We built what Collectr is missing.</p>
        </div>
        <div className="compare-table">
          <div className="compare-header">
            <div className="compare-feature-col">Feature</div>
            <div className="compare-col">Collectr</div>
            <div className="compare-col humn-col">HUMN IQ</div>
          </div>
          {comparisons.map((row, i) => (
            <div key={i} className="compare-row">
              <div className="compare-feature-col">{row.feature}</div>
              <div className="compare-col">
                {row.collectr ? <span className="check">✓</span> : <span className="cross">✗</span>}
              </div>
              <div className="compare-col humn-col">
                {row.humn ? <span className="check accent">✓</span> : <span className="cross">✗</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="section-header">
          <div className="tag">Pricing</div>
          <h2 className="section-title">Simple pricing</h2>
          <p className="section-sub">One plan. Everything included.</p>
        </div>
        <div className="pricing-cards">
          <div className="pricing-card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">$0<span>/mo</span></div>
            <ul className="pricing-features">
              <li>3 AI card grades per month</li>
              <li>Basic portfolio tracking</li>
              <li>Market price lookup</li>
            </ul>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
              Get Started Free
            </button>
          </div>
          <div className="pricing-card featured">
            <div className="pricing-badge">Most Popular</div>
            <div className="pricing-tier">HUMN IQ Pro</div>
            <div className="pricing-price">$7.99<span>/mo</span></div>
            <ul className="pricing-features">
              <li>Unlimited AI card grading</li>
              <li>Full portfolio tracker</li>
              <li>Grading ROI calculator</li>
              <li>Sealed product analysis</li>
              <li>Set investment intelligence</li>
              <li>Price alerts</li>
              <li>PSA pop report analysis</li>
              <li>Priority support</li>
            </ul>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Start Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">HUMN <span>IQ</span></div>
        <p className="footer-sub">AI-powered Pokemon TCG intelligence</p>
        <div className="footer-links">
          <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">x.com/UseHUMN</a>
          <a href="https://humnbot.com" target="_blank" rel="noreferrer">humnbot.com</a>
        </div>
      </footer>
    </div>
  );
}
