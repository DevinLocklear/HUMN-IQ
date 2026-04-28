import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Portfolio.css';

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6', 'BGS 10', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5'];

export default function Portfolio({ session }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  async function fetchMarketValue(cardName) {
    if (!cardName || cardName.length < 3) return;
    setFetchingPrice(true);
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cardName)}"&pageSize=1`);
      const data = await res.json();
      const card = data?.data?.[0];
      if (card?.tcgplayer?.prices) {
        const prices = card.tcgplayer.prices;
        const market = prices.holofoil?.market || prices.normal?.market || prices.reverseHolofoil?.market || prices['1stEditionHolofoil']?.market;
        if (market) {
          setForm(f => ({ ...f, current_value: market.toFixed(2) }));
        }
      }
    } catch (e) {}
    setFetchingPrice(false);
  }
  const [form, setForm] = useState({
    card_name: '',
    set_name: '',
    condition: 'Raw',
    purchase_price: '',
    current_value: '',
    quantity: 1,
    notes: '',
  });

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCards() {
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Portfolio fetch error:', error);
    }
    setCards(data || []);
    setLoading(false);
  }

  async function addCard(e) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('portfolio').insert({
      user_id: session.user.id,
      card_name: form.card_name,
      set_name: form.set_name || null,
      condition: form.condition,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      current_value: form.current_value ? parseFloat(form.current_value) : null,
      quantity: parseInt(form.quantity) || 1,
      notes: form.notes || null,
    });

    if (!error) {
      setForm({ card_name: '', set_name: '', condition: 'Raw', purchase_price: '', current_value: '', quantity: 1, notes: '' });
      setShowAdd(false);
      fetchCards();
    }
    setSaving(false);
  }

  async function deleteCard(id) {
    await supabase.from('portfolio').delete().eq('id', id);
    fetchCards();
  }

  // Stats
  const totalValue = cards.reduce((sum, c) => sum + ((c.current_value || 0) * c.quantity), 0);
  const totalCost = cards.reduce((sum, c) => sum + ((c.purchase_price || 0) * c.quantity), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(1) : 0;

  return (
    <div className="portfolio">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="https://i.imgur.com/ywgtHOK.png" alt="HUMN IQ" style={{ width: 28, height: 28, objectFit: 'contain' }} />
          HUMN <span>IQ</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '◈', label: 'Card Grader', path: '/grade' },
            { icon: '▣', label: 'Portfolio', path: '/portfolio', active: true },
            { icon: '◎', label: 'ROI Calculator', path: '/roi' },
            { icon: '▲', label: 'Market Prices', path: '/market' },
            { icon: '◉', label: 'Sealed Analysis', path: '/sealed' },
            { icon: '◐', label: 'Set Intelligence', path: '/sets' },
          ].map((item, i) => (
            <div key={i} className={`sidebar-item ${item.active ? 'active' : ''}`} onClick={() => item.path === '/grade' || item.path === '/portfolio' ? navigate(item.path) : null}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.path !== '/grade' && item.path !== '/portfolio' && <span className="sidebar-soon">Soon</span>}
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

      {/* Main */}
      <main className="portfolio-main">
        <div className="portfolio-header">
          <div>
            <h1 className="portfolio-title">Portfolio</h1>
            <p className="portfolio-sub">{cards.length} cards tracked</p>
          </div>

        </div>

        {/* Stats */}
        <div className="portfolio-stats">
          <div className="pstat">
            <div className="pstat-label">Total Value</div>
            <div className="pstat-value">${totalValue.toFixed(2)}</div>
          </div>
          <div className="pstat">
            <div className="pstat-label">Total Cost</div>
            <div className="pstat-value">${totalCost.toFixed(2)}</div>
          </div>
          <div className="pstat">
            <div className="pstat-label">Total Gain/Loss</div>
            <div className={`pstat-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}
            </div>
          </div>
          <div className="pstat">
            <div className="pstat-label">Return</div>
            <div className={`pstat-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
              {totalGain >= 0 ? '+' : ''}{gainPercent}%
            </div>
          </div>
        </div>

        {/* Add Card Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Card</h2>
                <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <form className="add-form" onSubmit={addCard}>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Card Name *</label>
                    <input className="field-input" placeholder="e.g. Charizard ex" value={form.card_name} onChange={e => setForm({...form, card_name: e.target.value})} onBlur={e => fetchMarketValue(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label className="field-label">Set</label>
                    <input className="field-input" placeholder="e.g. Prismatic Evolutions" value={form.set_name} onChange={e => setForm({...form, set_name: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Condition</label>
                    <select className="field-input" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Quantity</label>
                    <input className="field-input" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Purchase Price ($)</label>
                    <input className="field-input" type="number" step="0.01" placeholder="0.00" value={form.purchase_price} onChange={e => setForm({...form, purchase_price: e.target.value})} />
                  </div>
                  <div className="field">
                    <label className="field-label">Current Value ($) {fetchingPrice && <span style={{color:'var(--pink)',fontSize:11}}>Fetching...</span>}</label>
                    <input className="field-input" type="number" step="0.01" placeholder={fetchingPrice ? "Fetching market price..." : "0.00"} value={form.current_value} onChange={e => setForm({...form, current_value: e.target.value})} />
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Notes</label>
                  <input className="field-input" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Card'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cards Table */}
        {loading ? (
          <div className="portfolio-empty"><div className="loading-spinner" /></div>
        ) : cards.length === 0 ? (
          <div className="portfolio-empty">
            <div className="empty-icon">▣</div>
            <p>No cards in your portfolio yet</p>
            <p className="empty-sub">Add your first card to start tracking your collection value</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ marginTop: 16 }}>+ Add Your First Card</button>
          </div>
        ) : (
          <div className="cards-list">
            {cards.map(card => {
              const cost = Number(card.purchase_price || 0) * card.quantity;
              const value = Number(card.current_value || 0) * card.quantity;
              const gain = value - cost;
              const gainPct = cost > 0 ? ((gain / cost) * 100).toFixed(0) : null;
              return (
                <div key={card.id} className="card-row">
                  <div className="card-row-main">
                    <div className="card-row-name">{card.card_name}</div>
                    {card.set_name && <div className="card-row-set">{card.set_name}</div>}
                  </div>
                  <div className="card-row-badge">{card.condition}</div>
                  <div className="card-row-stat">
                    <div className="card-row-label">Qty</div>
                    <div className="card-row-value">{card.quantity}</div>
                  </div>
                  <div className="card-row-stat">
                    <div className="card-row-label">Cost</div>
                    <div className="card-row-value">{card.purchase_price ? `$${cost.toFixed(2)}` : '—'}</div>
                  </div>
                  <div className="card-row-stat">
                    <div className="card-row-label">Value</div>
                    <div className="card-row-value">{card.current_value ? `$${value.toFixed(2)}` : '—'}</div>
                  </div>
                  <div className="card-row-stat">
                    <div className="card-row-label">Gain/Loss</div>
                    <div className={`card-row-value ${gain > 0 ? 'positive' : gain < 0 ? 'negative' : ''}`}>
                      {card.purchase_price && card.current_value ? `${gain >= 0 ? '+' : ''}$${gain.toFixed(2)}${gainPct ? ` (${gainPct}%)` : ''}` : '—'}
                    </div>
                  </div>
                  <button className="delete-btn" onClick={() => deleteCard(card.id)}>✕</button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
