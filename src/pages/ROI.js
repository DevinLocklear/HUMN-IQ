import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './ROI.css';

const GRADING_COSTS = {
  PSA: [
    { label: 'Value ($25)', cost: 25 },
    { label: 'Regular ($50)', cost: 50 },
    { label: 'Express ($150)', cost: 150 },
    { label: 'Super Express ($300)', cost: 300 },
  ],
  BGS: [
    { label: 'Economy ($22)', cost: 22 },
    { label: 'Standard ($30)', cost: 30 },
    { label: 'Express ($75)', cost: 75 },
  ],
  CGC: [
    { label: 'Economy ($15)', cost: 15 },
    { label: 'Standard ($25)', cost: 25 },
    { label: 'Express ($75)', cost: 75 },
  ],
};

const GRADE_MULTIPLIERS = {
  PSA: { 10: 4.5, 9: 2.2, 8: 1.4, 7: 1.0, 6: 0.8 },
  BGS: { 10: 6.0, 9.5: 3.5, 9: 2.0, 8.5: 1.3, 8: 1.0 },
  CGC: { 10: 4.0, 9.5: 3.0, 9: 1.8, 8.5: 1.2, 8: 0.9 },
};

export default function ROI({ session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    card_name: '',
    raw_price: '',
    pulled_from_pack: false,
    predicted_grade: '9',
    grading_company: 'PSA',
    grading_tier: 0,
    quantity: 1,
    shipping: 15,
  });
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  async function searchCards(query) {
    if (!query || query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}*&pageSize=8&orderBy=-set.releaseDate`);
      const data = await res.json();
      setSearchResults(data?.data || []);
    } catch (e) { setSearchResults([]); }
    setSearching(false);
  }

  function handleCardNameChange(e) {
    const val = e.target.value;
    setForm(f => ({ ...f, card_name: val }));
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!val || val.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => searchCards(val), 500);
    setSearchTimeout(t);
  }

  function selectCard(card) {
    const prices = card.tcgplayer?.prices;
    const market = prices?.holofoil?.market || prices?.normal?.market || prices?.reverseHolofoil?.market || null;
    setForm(f => ({
      ...f,
      card_name: card.name,
      raw_price: market ? market.toFixed(2) : f.raw_price,
    }));
    setSearchResults([]);
  }

  function calculate() {
    const rawPriceEach = parseFloat(form.raw_price) || 0;
    const rawCostEach = form.pulled_from_pack ? 0 : rawPriceEach; // cost basis is 0 if pulled from pack
    const gradingCostEach = GRADING_COSTS[form.grading_company][form.grading_tier].cost;
    const shipping = parseFloat(form.shipping) || 15;
    const qty = parseInt(form.quantity) || 1;
    const grade = parseFloat(form.predicted_grade);
    const multiplier = GRADE_MULTIPLIERS[form.grading_company][grade] || 1;

    // Per card
    const gradedValueEach = rawPriceEach * multiplier;

    // Total for all cards
    const totalRaw = rawCostEach * qty;
    const totalGrading = gradingCostEach * qty;
    const totalCost = totalRaw + totalGrading + shipping;
    const totalGradedValue = gradedValueEach * qty;
    const profit = totalGradedValue - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    const worthSubmitting = profit > 0 && roi > 15;

    setResult({
      rawPrice: totalRaw,
      rawPriceEach,
      gradedValue: totalGradedValue,
      gradingCost: totalGrading,
      shipping,
      totalCost,
      profit,
      roi,
      worthSubmitting,
      multiplier,
      qty,
      gradingCostEach,
      gradedValueEach,
    });
  }

  const grades = Object.keys(GRADE_MULTIPLIERS[form.grading_company]);

  return (
    <div className="roi-page">
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
            { icon: '◎', label: 'ROI Calculator', path: '/roi', active: true },
            { icon: '▲', label: 'Market Prices', path: '/market', soon: true },
            { icon: '◉', label: 'Sealed Analysis', path: '/sealed', soon: true },
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

      <main className="roi-main">
        <div className="roi-header">
          <div>
            <h1 className="roi-title">ROI Calculator</h1>
            <p className="roi-sub">Find out if grading your card is worth it before you spend the money</p>
          </div>
        </div>

        <div className="roi-content">
          {/* Inputs */}
          <div className="roi-inputs">
            <div className="roi-section-label">Card Details</div>

            <div className="field" style={{ position: 'relative' }}>
              <label className="field-label">Card Name {searching && <span style={{ color: 'var(--pink)', fontSize: 11 }}>Searching...</span>}</label>
              <input className="field-input" placeholder="e.g. Charizard ex" value={form.card_name} onChange={handleCardNameChange} onBlur={() => setTimeout(() => setSearchResults([]), 200)} autoComplete="off" />
              {searchResults.length > 0 && (
                <div className="card-search-dropdown">
                  {searchResults.map(card => {
                    const prices = card.tcgplayer?.prices;
                    const market = prices?.holofoil?.market || prices?.normal?.market || null;
                    return (
                      <div key={card.id} className="card-search-result" onClick={() => selectCard(card)}>
                        <img src={card.images?.small} alt={card.name} className="card-search-img" />
                        <div className="card-search-info">
                          <div className="card-search-name">{card.name}</div>
                          <div className="card-search-set">{card.set?.name} · #{card.number}</div>
                          {market && <div className="card-search-price">${market.toFixed(2)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pulled-toggle" onClick={() => setForm(f => ({ ...f, pulled_from_pack: !f.pulled_from_pack }))}>
              <div className={`toggle-switch ${form.pulled_from_pack ? 'on' : ''}`}><div className="toggle-knob" /></div>
              <span>Pulled from pack (cost = $0)</span>
            </div>

            <div className="roi-row">
              <div className="field">
                <label className="field-label">Raw Price ($)</label>
                <input className="field-input" type="number" step="0.01" placeholder={form.pulled_from_pack ? "Pulled from pack" : "0.00"} value={form.raw_price} disabled={form.pulled_from_pack} onChange={e => setForm(f => ({ ...f, raw_price: e.target.value }))} style={form.pulled_from_pack ? { opacity: 0.4 } : {}} />
              </div>
              <div className="field">
                <label className="field-label">Quantity</label>
                <input className="field-input" type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
              </div>
            </div>

            <div className="roi-section-label" style={{ marginTop: 8 }}>Grading Details</div>

            <div className="roi-row">
              <div className="field">
                <label className="field-label">Grading Company</label>
                <select className="field-input" value={form.grading_company} onChange={e => setForm(f => ({ ...f, grading_company: e.target.value, grading_tier: 0, predicted_grade: Object.keys(GRADE_MULTIPLIERS[e.target.value])[1] }))}>
                  <option>PSA</option>
                  <option>BGS</option>
                  <option>CGC</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Grading Tier</label>
                <select className="field-input" value={form.grading_tier} onChange={e => setForm(f => ({ ...f, grading_tier: parseInt(e.target.value) }))}>
                  {GRADING_COSTS[form.grading_company].map((tier, i) => (
                    <option key={i} value={i}>{tier.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="roi-row">
              <div className="field">
                <label className="field-label">Predicted Grade</label>
                <select className="field-input" value={form.predicted_grade} onChange={e => setForm(f => ({ ...f, predicted_grade: e.target.value }))}>
                  {grades.map(g => <option key={g} value={g}>{form.grading_company} {g}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Shipping ($)</label>
                <input className="field-input" type="number" step="0.01" value={form.shipping} onChange={e => setForm(f => ({ ...f, shipping: e.target.value }))} />
              </div>
            </div>

            <button className="btn-primary" onClick={calculate} style={{ width: '100%', padding: '16px', marginTop: 8 }}>
              Calculate ROI
            </button>
          </div>

          {/* Results */}
          <div className="roi-results">
            {result ? (
              <>
                <div className={`roi-verdict ${result.worthSubmitting ? 'yes' : 'no'}`}>
                  <div className="verdict-icon">{result.worthSubmitting ? '✓' : '✗'}</div>
                  <div>
                    <div className="verdict-title">{result.worthSubmitting ? 'Worth Submitting' : 'Not Recommended'}</div>
                    <div className="verdict-sub">
                      {result.worthSubmitting
                        ? `Expected ${result.roi.toFixed(0)}% ROI after all fees`
                        : `You'd lose $${Math.abs(result.profit).toFixed(2)} after grading fees`}
                    </div>
                  </div>
                </div>

                <div className="roi-breakdown">
                  <div className="roi-section-label">Breakdown</div>
                  <div className="breakdown-grid">
                    <div className="breakdown-item">
                      <div className="breakdown-label">Raw Value</div>
                      <div className="breakdown-value">{form.pulled_from_pack ? 'Pack Pull' : `$${result.rawPrice.toFixed(2)}`}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Grading Cost</div>
                      <div className="breakdown-value negative">-${result.gradingCost.toFixed(2)}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Shipping</div>
                      <div className="breakdown-value negative">-${result.shipping}</div>
                    </div>
                    <div className="breakdown-item">
                      <div className="breakdown-label">Total Cost</div>
                      <div className="breakdown-value">-${result.totalCost.toFixed(2)}</div>
                    </div>
                    <div className="breakdown-item highlight">
                      <div className="breakdown-label">Graded Value</div>
                      <div className="breakdown-value positive">${result.gradedValue.toFixed(2)}</div>
                    </div>
                    <div className="breakdown-item highlight">
                      <div className="breakdown-label">Net Profit {result.qty > 1 ? `(×${result.qty})` : ''}</div>
                      <div className={`breakdown-value ${result.profit >= 0 ? 'positive' : 'negative'}`}>
                        {result.profit >= 0 ? '+' : ''}${result.profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="roi-metric">
                  <div className="roi-section-label">ROI</div>
                  <div className="roi-bar-container">
                    <div className="roi-bar">
                      <div
                        className={`roi-bar-fill ${result.roi >= 0 ? 'positive' : 'negative'}`}
                        style={{ width: `${Math.min(Math.abs(result.roi), 100)}%` }}
                      />
                    </div>
                    <div className={`roi-percent ${result.roi >= 0 ? 'positive' : 'negative'}`}>
                      {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="roi-breakdown">
                  <div className="roi-section-label">Grade Value Estimates</div>
                  <div className="grade-estimates">
                    {Object.entries(GRADE_MULTIPLIERS[form.grading_company]).map(([grade, mult]) => {
                      const val = result.rawPriceEach * mult * result.qty;
                      const prof = val - result.totalCost;
                      return (
                        <div key={grade} className={`grade-estimate-row ${parseFloat(grade) === parseFloat(form.predicted_grade) ? 'active' : ''}`}>
                          <div className="grade-estimate-grade">{form.grading_company} {grade}</div>
                          <div className="grade-estimate-value">${val.toFixed(2)}</div>
                          <div className={`grade-estimate-profit ${prof >= 0 ? 'positive' : 'negative'}`}>
                            {prof >= 0 ? '+' : ''}${prof.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="roi-empty">
                <div className="roi-empty-icon">◎</div>
                <p>Enter your card details to calculate ROI</p>
                <div className="roi-tips">
                  <div className="roi-tip">Enter the card name to auto-fill raw price</div>
                  <div className="roi-tip">Use AI Card Grader to get your predicted grade</div>
                  <div className="roi-tip">Compare all grade outcomes at once</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
