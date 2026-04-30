import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabase';
import './Sealed.css';

const SEALED_PRODUCTS = [
  { name: 'Prismatic Evolutions Elite Trainer Box', retail: 49.99, set: 'Prismatic Evolutions', type: 'ETB' },
  { name: 'Prismatic Evolutions Booster Box', retail: 143.64, set: 'Prismatic Evolutions', type: 'Booster Box' },
  { name: 'Prismatic Evolutions Booster Bundle', retail: 29.99, set: 'Prismatic Evolutions', type: 'Bundle' },
  { name: 'Surging Sparks Elite Trainer Box', retail: 49.99, set: 'Surging Sparks', type: 'ETB' },
  { name: 'Surging Sparks Booster Box', retail: 143.64, set: 'Surging Sparks', type: 'Booster Box' },
  { name: 'Stellar Crown Elite Trainer Box', retail: 49.99, set: 'Stellar Crown', type: 'ETB' },
  { name: 'Stellar Crown Booster Box', retail: 143.64, set: 'Stellar Crown', type: 'Booster Box' },
  { name: 'Twilight Masquerade Elite Trainer Box', retail: 49.99, set: 'Twilight Masquerade', type: 'ETB' },
  { name: 'Temporal Forces Elite Trainer Box', retail: 49.99, set: 'Temporal Forces', type: 'ETB' },
  { name: 'Paradox Rift Elite Trainer Box', retail: 49.99, set: 'Paradox Rift', type: 'ETB' },
  { name: 'Obsidian Flames Elite Trainer Box', retail: 49.99, set: 'Obsidian Flames', type: 'ETB' },
  { name: 'Paldea Evolved Elite Trainer Box', retail: 49.99, set: 'Paldea Evolved', type: 'ETB' },
  { name: 'Scarlet & Violet Base Set Booster Box', retail: 143.64, set: 'Scarlet & Violet', type: 'Booster Box' },
  { name: 'Crown Zenith Elite Trainer Box', retail: 49.99, set: 'Crown Zenith', type: 'ETB' },
  { name: 'Silver Tempest Elite Trainer Box', retail: 49.99, set: 'Silver Tempest', type: 'ETB' },
  { name: 'Evolving Skies Elite Trainer Box', retail: 49.99, set: 'Evolving Skies', type: 'ETB' },
  { name: 'Celebrations Ultra Premium Collection', retail: 99.99, set: 'Celebrations', type: 'UPC' },
  { name: 'Shining Fates Elite Trainer Box', retail: 49.99, set: 'Shining Fates', type: 'ETB' },
  { name: 'Mega Evolutions Ascended Heroes ETB', retail: 49.99, set: 'Mega Evolutions', type: 'ETB' },
].sort((a, b) => a.name.localeCompare(b.name));

// Simulated price history multipliers (in production this would come from eBay API)
function generatePriceHistory(retail, currentMultiplier) {
  const months = ['6mo ago', '5mo ago', '4mo ago', '3mo ago', '2mo ago', '1mo ago', 'Now'];
  return months.map((month, i) => {
    const progress = i / (months.length - 1);
    const mult = 1 + (currentMultiplier - 1) * progress + (Math.random() * 0.1 - 0.05);
    return { month, price: parseFloat((retail * mult).toFixed(2)) };
  });
}

export default function Sealed({ session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [currentPrice, setCurrentPrice] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  function handleSearch(e) {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    setAnalysis(null);
    if (val.length < 2) { setSuggestions([]); return; }
    const matches = SEALED_PRODUCTS.filter(p => p.name.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
    setSuggestions(matches);
  }

  function selectProduct(product) {
    setSelected(product);
    setQuery(product.name);
    setSuggestions([]);
  }

  function analyze() {
    if (!selected) return;
    setAnalyzing(true);

    const market = parseFloat(currentPrice) || selected.retail;
    const hasMarketPrice = !!market;
    const retail = selected.retail;
    const multiplier = market / retail;
    const priceHistory = generatePriceHistory(retail, multiplier);

    // Analysis logic
    const premiumPct = ((market - retail) / retail) * 100;
    const trending = multiplier > 1.3;
    const goodValue = multiplier < 1.15;
    

    let recommendation = 'HOLD';
    let recommendationReason = '';
    let score = 50;

    if (multiplier >= 1.5) {
      recommendation = 'SELL';
      recommendationReason = `Trading at ${premiumPct.toFixed(0)}% above retail — strong sell opportunity before market corrects.`;
      score = 20;
    } else if (multiplier >= 1.2) {
      recommendation = 'HOLD';
      recommendationReason = `At ${premiumPct.toFixed(0)}% premium, the product has appreciated but may continue to rise. Hold unless you need liquidity.`;
      score = 50;
    } else if (multiplier < 0.95) {
      recommendation = 'BUY';
      recommendationReason = `Trading below retail — strong buying opportunity if you believe in long term appreciation.`;
      score = 85;
    } else {
      recommendation = 'OPEN';
      recommendationReason = `Near retail price with limited appreciation. Opening gives you a chance at chase cards worth more than the box.`;
      score = 40;
    }

    // Booster box pack math
    const packsPerBox = selected.type === 'Booster Box' ? 36 : selected.type === 'ETB' ? 9 : 6;
    const costPerPack = market / packsPerBox;

    setTimeout(() => {
      setAnalysis({
        market: market,
        hasMarketPrice,
        retail,
        multiplier,
        premiumPct,
        recommendation,
        recommendationReason,
        score,
        priceHistory,
        packsPerBox,
        costPerPack,
        trending,
        goodValue,
      });
      setAnalyzing(false);
    }, 600);
  }

  const recColor = analysis?.recommendation === 'SELL' ? 'var(--red)'
    : analysis?.recommendation === 'BUY' ? 'var(--green)'
    : analysis?.recommendation === 'OPEN' ? 'var(--orange)'
    : 'var(--pink)';

  return (
    <div className="sealed-page">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          HUMN <span>IQ</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '◈', label: 'Card Grader', path: '/grade' },
            { icon: '▣', label: 'Portfolio', path: '/portfolio' },
            { icon: '◎', label: 'ROI Calculator', path: '/roi' },
            { icon: '▲', label: 'Market Prices', path: '/market', soon: true },
            { icon: '◉', label: 'Sealed Analysis', path: '/sealed', active: true },
            { icon: '◐', label: 'Set Intelligence', path: '/sets', soon: true },
          ].map((item, i) => (
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
            <button className="btn-primary" style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '10px' }}>Upgrade to Pro</button>
            <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} style={{ width: '100%', marginTop: '8px', fontSize: '12px', padding: '10px', background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}>Sign Out</button>
          </div>
        </div>
      </aside>

      <main className="sealed-main">
        <div className="sealed-header">
          <div>
            <h1 className="sealed-title">Sealed Analysis</h1>
            <p className="sealed-sub">Open or hold? Get an AI-powered recommendation based on market data.</p>
          </div>
        </div>

        <div className="sealed-content">
          {/* Search */}
          <div className="sealed-search-panel">
            <div className="sealed-section-label">Select Product</div>
            <div className="field" style={{ position: 'relative' }}>
              <label className="field-label">Product Name</label>
              <input className="field-input" placeholder="e.g. Prismatic Evolutions ETB" value={query} onChange={handleSearch} onBlur={() => setTimeout(() => setSuggestions([]), 200)} autoComplete="off" />
              {suggestions.length > 0 && (
                <div className="sealed-dropdown">
                  {suggestions.map((p, i) => (
                    <div key={i} className="sealed-suggestion" onClick={() => selectProduct(p)}>
                      <div className="sealed-suggestion-name">{p.name}</div>
                      <div className="sealed-suggestion-meta">{p.type} · Retail ${p.retail}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <>
                <div className="selected-product">
                  <div className="selected-info">
                    <div className="selected-name">{selected.name}</div>
                    <div className="selected-meta">{selected.type} · {selected.set}</div>
                  </div>
                  <div className="selected-retail">
                    <div className="selected-retail-label">MSRP</div>
                    <div className="selected-retail-price">${selected.retail}</div>
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Current Market Price ($)</label>
                  <input className="field-input" type="number" step="0.01" placeholder={`Retail: $${selected.retail}`} value={currentPrice} onChange={e => setCurrentPrice(e.target.value)} />
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Leave blank to use retail price</div>
                </div>

                <button className="btn-primary" onClick={analyze} disabled={analyzing} style={{ width: '100%', padding: '14px' }}>
                  {analyzing ? 'Analyzing...' : 'Analyze Product'}
                </button>
              </>
            )}

            {!selected && (
              <div className="sealed-tips">
                <div className="sealed-tip">◉ Search for any sealed Pokemon product</div>
                <div className="sealed-tip">◉ Enter the current market price for accuracy</div>
                <div className="sealed-tip">◉ Get an open or hold recommendation</div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="sealed-results">
            {analysis ? (
              <>
                {/* Recommendation */}
                <div className="sealed-verdict" style={{ borderColor: recColor, background: `${recColor}10` }}>
                  <div className="sealed-verdict-rec" style={{ color: recColor }}>{analysis.recommendation}</div>
                  <div>
                    <div className="sealed-verdict-title" style={{ color: recColor }}>
                      {analysis.recommendation === 'SELL' ? 'Time to Sell' :
                       analysis.recommendation === 'BUY' ? 'Buy More' :
                       analysis.recommendation === 'OPEN' ? 'Open It' : 'Hold Sealed'}
                    </div>
                    <div className="sealed-verdict-reason">{analysis.recommendationReason}</div>
                  </div>
                </div>

                {/* Price stats */}
                <div className="sealed-stats">
                  <div className="sealed-stat">
                    <div className="sealed-stat-label">Market Price</div>
                    <div className="sealed-stat-value">{analysis.hasMarketPrice ? `$${analysis.market.toFixed(2)}` : <span style={{color:'var(--text-dim)',fontSize:14}}>Not entered</span>}</div>
                  </div>
                  <div className="sealed-stat">
                    <div className="sealed-stat-label">Retail Price</div>
                    <div className="sealed-stat-value">${analysis.retail.toFixed(2)}</div>
                  </div>
                  <div className="sealed-stat">
                    <div className="sealed-stat-label">Premium</div>
                    <div className={`sealed-stat-value ${analysis.premiumPct > 0 ? 'positive' : 'negative'}`}>
                      {analysis.hasMarketPrice ? `${analysis.premiumPct >= 0 ? '+' : ''}${analysis.premiumPct.toFixed(1)}%` : '—'}
                    </div>
                  </div>
                  <div className="sealed-stat">
                    <div className="sealed-stat-label">vs Retail</div>
                    <div className={`sealed-stat-value ${analysis.multiplier >= 1 ? 'positive' : 'negative'}`}>
                      {analysis.hasMarketPrice ? `${analysis.multiplier.toFixed(2)}x` : '—'}
                    </div>
                  </div>
                </div>

                {/* Price chart */}
                <div className="sealed-chart-box">
                  <div className="sealed-section-label">Price Trend (6 months)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={analysis.priceHistory} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="sealedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff2d8a" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ff2d8a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: '#6b6b8a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#6b6b8a', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip
                        contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 0 }}
                        formatter={v => [`$${v}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke="#ff2d8a" strokeWidth={2} fill="url(#sealedGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Pack math */}
                <div className="sealed-pack-math">
                  <div className="sealed-section-label">Pack Math</div>
                  <div className="pack-math-grid">
                    <div className="pack-math-item">
                      <div className="pack-math-label">Packs Included</div>
                      <div className="pack-math-value">{analysis.packsPerBox}</div>
                    </div>
                    <div className="pack-math-item">
                      <div className="pack-math-label">Cost Per Pack</div>
                      <div className="pack-math-value">${analysis.costPerPack.toFixed(2)}</div>
                    </div>
                    <div className="pack-math-item">
                      <div className="pack-math-label">Break Even Per Pack</div>
                      <div className="pack-math-value">${(analysis.market / analysis.packsPerBox).toFixed(2)}</div>
                    </div>
                    <div className="pack-math-item">
                      <div className="pack-math-label">Market vs Retail</div>
                      <div className={`pack-math-value ${analysis.multiplier >= 1 ? 'positive' : 'negative'}`}>
                        {analysis.multiplier >= 1 ? '+' : ''}{((analysis.multiplier - 1) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="sealed-empty">
                <div className="sealed-empty-icon">◉</div>
                <p>Search for a sealed product to get your analysis</p>
                <div className="sealed-empty-tips">
                  <div className="tip">Recommendation: Open, Hold, Buy, or Sell</div>
                  <div className="tip">6-month price trend chart</div>
                  <div className="tip">Pack math and break even analysis</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
