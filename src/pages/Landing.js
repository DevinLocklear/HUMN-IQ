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

const faqs = [
  { q: 'How accurate is the AI card grader?', a: 'Our AI analyzes the same four criteria PSA uses — centering, corners, edges, and surface. Accuracy improves with high-quality photos and good lighting.' },
  { q: 'How many grades do I get on the free plan?', a: 'Free users get 3 AI grades per month. Pro users get unlimited grades.' },
  { q: 'What cards does HUMN IQ support?', a: 'All Pokemon TCG cards — English and Japanese, vintage and modern, raw and graded.' },
  { q: 'How is the estimated value calculated?', a: 'We pull real sold listing data from eBay and TCGPlayer to give you accurate current market values.' },
  { q: 'Can I cancel anytime?', a: 'Yes — cancel anytime with no penalties. Your data stays accessible for 30 days after cancellation.' },
];

export default function Landing({ session }) {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" className="nav-logo-img" />
            HUMN <span className="nav-iq">IQ</span>
          </div>
          <div className="nav-links">
            <a href="#how">How It Works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <button className="btn-hero" onClick={() => navigate(session ? '/dashboard' : '/auth')}>
            {session ? 'Dashboard' : 'Get Started'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            Pokemon TCG Intelligence Platform
          </div>
          <h1 className="hero-title">
            AI GRADING.<br />
            <span className="hero-title-accent">SMARTER</span><br />
            COLLECTING.
          </h1>
          <p className="hero-sub">
            Know the grade before you submit. Know the value before you sell.
            The intelligence platform built for serious Pokemon collectors.
          </p>
          <div className="hero-actions">
            <button className="btn-hero" onClick={() => navigate(session ? '/grade' : '/auth')}>
              Grade a Card Free
            </button>
            <button className="btn-hero-ghost" onClick={() => navigate(session ? '/dashboard' : '/auth')}>
              View Dashboard
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-stack">
            <div className="hero-card card-3">
              <img src="https://images.pokemontcg.io/sv3pt5/18_hires.png" alt="Pokemon Card" className="hero-card-img" />
            </div>
            <div className="hero-card card-2">
              <img src="https://images.pokemontcg.io/sv2/245_hires.png" alt="Pokemon Card" className="hero-card-img" />
            </div>
            <div className="hero-card card-1">
              <div className="hero-card-glow" />
              <img src="https://images.pokemontcg.io/sv3pt5/191_hires.png" alt="Pokemon Card" className="hero-card-img" />
              <div className="hero-card-label">PSA 10</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how">
        <div className="section-eyebrow">
          <span className="section-eyebrow-text">How It Works</span>
          <div className="section-eyebrow-line" />
        </div>
        <h2 className="section-heading">FROM PHOTO TO PROFIT IN SECONDS</h2>
        <div className="steps-row">
          {[
            { num: '1', title: 'Upload Your Card', desc: 'Take a clear photo and drop it into HUMN IQ.' },
            { num: '2', title: 'Get Your Grade', desc: 'AI analyzes centering, corners, edges and surface.' },
            { num: '3', title: 'See Your ROI', desc: 'Know if submitting is worth it before you spend.' },
          ].map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-num">{step.num}</div>
              <div className="step-divider" />
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Showcase */}
      <section className="showcase">
        <div className="section-eyebrow">
          <span className="section-eyebrow-text">What You Get</span>
          <div className="section-eyebrow-line" />
        </div>
        <h2 className="section-heading">INSTANT GRADE ANALYSIS</h2>
        <div className="showcase-grid">
          {[
            { label: 'Centering', value: '9/10', note: '55/45 L/R · 52/48 T/B' },
            { label: 'Corners', value: '8/10', note: 'Minor wear top-right' },
            { label: 'Edges', value: '9/10', note: 'Clean, minimal whitening' },
            { label: 'Surface', value: '8/10', note: 'Light scratch near center' },
          ].map((item, i) => (
            <div key={i} className="showcase-card">
              <div className="showcase-label">{item.label}</div>
              <div className="showcase-value">{item.value}</div>
              <div className="showcase-note">{item.note}</div>
              <div className="showcase-bar">
                <div className="showcase-fill" style={{ width: `${parseInt(item.value) * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="showcase-result">
          <div className="showcase-grade">PSA 8</div>
          <div className="showcase-rec">✓ Worth Submitting — Strong candidate for PSA 8-9</div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-eyebrow">
          <span className="section-eyebrow-text">Features</span>
          <div className="section-eyebrow-line" />
        </div>
        <h2 className="section-heading">EVERYTHING A SERIOUS COLLECTOR NEEDS</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing" id="pricing">
        <div className="section-eyebrow">
          <span className="section-eyebrow-text">Pricing</span>
          <div className="section-eyebrow-line" />
        </div>
        <h2 className="section-heading">SIMPLE PRICING</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <div className="pricing-tier">Free</div>
            <div className="pricing-price">$0<span>/mo</span></div>
            <ul className="pricing-features">
              <li>3 AI card grades per month</li>
              <li>Basic portfolio tracking</li>
              <li>Market price lookup</li>
            </ul>
            <button className="btn-hero-ghost" onClick={() => navigate('/auth')}>Get Started Free</button>
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
            <button className="btn-hero" onClick={() => navigate('/auth')}>Start Pro</button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="section-eyebrow">
          <span className="section-eyebrow-text">FAQ</span>
          <div className="section-eyebrow-line" />
        </div>
        <h2 className="section-heading">COMMON QUESTIONS</h2>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                <span>{faq.q}</span>
                <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2 className="cta-title">READY TO COLLECT SMARTER?</h2>
        <p className="cta-sub">Join collectors who grade smarter and invest better with HUMN IQ.</p>
        <button className="btn-hero" onClick={() => navigate(session ? '/dashboard' : '/auth')}>
          Start For Free
        </button>
      </section>

      {/* Footer */}
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
