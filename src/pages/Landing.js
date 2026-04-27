import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '◈', title: 'AI Card Grader', desc: 'Upload a photo and get an instant PSA grade prediction with centering, corners, edges and surface breakdown.' },
  { icon: '◎', title: 'Grading ROI Calculator', desc: 'Know exactly which cards are worth submitting before spending $25+ on grading fees.' },
  { icon: '▲', title: 'Market Intelligence', desc: 'Real-time prices from eBay and TCGPlayer. Know what your cards are actually worth right now.' },
  { icon: '◉', title: 'Sealed Product Analysis', desc: 'Open or hold? AI-powered recommendations based on historical price trends and print run data.' },
  { icon: '▣', title: 'Portfolio Tracker', desc: 'Track your entire collection — raw, graded, sealed — with live market value updated daily.' },
  { icon: '◐', title: 'Set Intelligence', desc: 'When a new set drops, know which cards to invest in before the market catches up.' },
];

const steps = [
  { num: '01', title: 'Upload Your Card', desc: 'Take a clear photo of your Pokemon card — front facing, good lighting, flat surface. Drop it into HUMN IQ and let the AI go to work.' },
  { num: '02', title: 'Get Your Grade Analysis', desc: 'Our AI analyzes centering, corners, edges, and surface condition — the same four criteria PSA uses — and returns a predicted grade in seconds.' },
  { num: '03', title: 'See Your ROI', desc: 'HUMN IQ checks current PSA pop reports, raw vs graded price spreads, and grading costs to tell you whether submitting is actually worth it.' },
  { num: '04', title: 'Track Your Portfolio', desc: 'Add cards to your portfolio and watch your total collection value update in real time as the market moves.' },
  { num: '05', title: 'Invest Smarter', desc: 'Get set intelligence alerts when new releases drop — know which cards to invest in early before the market catches up.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  return (
    <div className="landing">
      <nav className="nav">
        <div className="nav-logo">
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" className="nav-logo-img" />
          HUMN <span className="nav-iq">IQ</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>Get Started</button>
      </nav>

      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid" />
          <div className="hero-glow-1" />
          <div className="hero-glow-2" />
          <div className="hero-glow-3" />
        </div>
        <div className="hero-content">
          <div className="tag">Pokemon TCG Intelligence Platform</div>
          <h1 className="hero-title">
            Make smarter decisions<br />on every <span className="prism-text">card.</span>
          </h1>
          <p className="hero-sub">
            AI-powered grading, market intelligence, and portfolio tracking
            built specifically for serious Pokemon TCG collectors and investors.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/grade')}>Grade a Card Free</button>
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>View Dashboard</button>
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

      <section className="how-it-works" id="how">
        <div className="section-header">
          <div className="tag">How It Works</div>
          <h2 className="section-title">From photo to profit in seconds</h2>
          <p className="section-sub">HUMN IQ turns your card collection into actionable intelligence.</p>
        </div>
        <div className="steps">
          {steps.map((step, i) => (
            <div key={i} className="step">
              <div className="step-num">{step.num}</div>
              <div className="step-content">
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
            <button className="btn-ghost" onClick={() => navigate('/dashboard')}>Get Started Free</button>
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
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>Start Pro</button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" className="footer-logo-img" />
          HUMN <span>IQ</span>
        </div>
        <p className="footer-sub">AI-powered Pokemon TCG intelligence</p>
        <div className="footer-links">
          <a href="https://x.com/UseHUMN" target="_blank" rel="noreferrer">x.com/UseHUMN</a>
          <a href="https://humnbot.com" target="_blank" rel="noreferrer">humnbot.com</a>
        </div>
      </footer>
    </div>
  );
}
