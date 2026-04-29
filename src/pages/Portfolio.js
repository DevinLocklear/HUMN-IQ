import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabase';
import './Portfolio.css';

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'PSA 8', 'PSA 7', 'PSA 6', 'BGS 10', 'BGS 9.5', 'BGS 9', 'CGC 10', 'CGC 9.5'];

export default function Portfolio({ session }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const SEALED_PRODUCTS = [
    'Prismatic Evolutions Elite Trainer Box',
    'Prismatic Evolutions Booster Bundle',
    'Prismatic Evolutions Booster Box',
    'Surging Sparks Elite Trainer Box',
    'Surging Sparks Booster Box',
    'Stellar Crown Elite Trainer Box',
    'Stellar Crown Booster Box',
    'Twilight Masquerade Elite Trainer Box',
    'Twilight Masquerade Booster Box',
    'Temporal Forces Elite Trainer Box',
    'Temporal Forces Booster Box',
    'Paradox Rift Elite Trainer Box',
    'Paradox Rift Booster Box',
    'Obsidian Flames Elite Trainer Box',
    'Obsidian Flames Booster Box',
    'Paldea Evolved Elite Trainer Box',
    'Scarlet & Violet Base Set Booster Box',
    'Crown Zenith Elite Trainer Box',
    'Silver Tempest Elite Trainer Box',
    'Lost Origin Elite Trainer Box',
    'Pokemon GO Elite Trainer Box',
    'Brilliant Stars Elite Trainer Box',
    'Fusion Strike Elite Trainer Box',
    'Celebrations Ultra Premium Collection',
    'Shining Fates Elite Trainer Box',
    'Evolving Skies Elite Trainer Box',
    'Chilling Reign Elite Trainer Box',
    'Battle Styles Elite Trainer Box',
    'Mega Evolutions Ascended Heroes ETB',
  ].sort();
  const [scanning, setScanning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('cards'); // cards | sealed
  const [selectedCard, setSelectedCard] = useState(null);
  const [scanError, setScanError] = useState(null);
  const scanInputRef = React.useRef(null);
  const [searching, setSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  async function searchCards(query, attempt = 0) {
    if (!query || query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      if (attempt > 0) await new Promise(r => setTimeout(r, 500 * attempt));

      // Try both TCGdex and Pokemon TCG API in parallel for best coverage
      const [tcgdexRes, ptcgRes] = await Promise.allSettled([
        fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}&pagination[page]=1&pagination[itemsPerPage]=20`)
          .then(r => r.ok ? r.json() : []),
        fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}*&pageSize=20&orderBy=-set.releaseDate`)
          .then(r => r.ok ? r.json() : { data: [] })
      ]);

      const allCards = [];

      // Add TCGdex results
      if (tcgdexRes.status === 'fulfilled' && Array.isArray(tcgdexRes.value)) {
        tcgdexRes.value.forEach(card => {
          allCards.push({
            id: `tcgdex-${card.id}`,
            name: card.name,
            number: card.localId,
            set: { name: card.set?.name || '' },
            images: { small: card.image ? `${card.image}/low.webp` : null },
            tcgplayer: null,
            _source: 'tcgdex'
          });
        });
      }

      // Add Pokemon TCG API results
      if (ptcgRes.status === 'fulfilled') {
        (ptcgRes.value?.data || []).forEach(card => {
          allCards.push({ ...card, _source: 'ptcg' });
        });
      }

      // Deduplicate by name+set
      const seen = new Set();
      const unique = allCards.filter(c => {
        const key = `${c.name}-${c.set?.name}-${c.number}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort exact matches first
      const queryLower = query.toLowerCase();
      unique.sort((a, b) => {
        const aExact = a.name.toLowerCase() === queryLower ? 0 : 1;
        const bExact = b.name.toLowerCase() === queryLower ? 0 : 1;
        return aExact - bExact;
      });

      setSearchResults(unique.slice(0, 20));
    } catch (e) { setSearchResults([]); }
    setSearching(false);
  }

  async function handleScan(e) {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    setScanError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const mediaType = file.type;
        const res = await fetch('/api/identify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await res.json();
        if (data.found) {
          setForm(f => ({
            ...f,
            card_name: data.name || f.card_name,
            set_name: data.set || f.set_name,
          }));
          await searchCards(data.name);
        } else {
          setScanError('Could not identify card. Try manual entry.');
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanError('Scan failed. Try again.');
      setScanning(false);
    }
  }

  function handleCardNameChange(e) {
    const val = e.target.value;
    setForm(f => ({...f, card_name: val}));
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!val || val.length < 2) { setSearchResults([]); return; }

    if (activeTab === 'sealed') {
      // Filter sealed product list locally
      const matches = SEALED_PRODUCTS.filter(p => p.toLowerCase().includes(val.toLowerCase())).slice(0, 10);
      setSearchResults(matches.map(name => ({ id: name, name, _sealed: true })));
      return;
    }

    const t = setTimeout(() => searchCards(val), 500);
    setSearchTimeout(t);
  }

  function handleCardNameBlur() {
    setTimeout(() => setSearchResults([]), 200);
  }

  function selectCard(card) {
    if (card._sealed) {
      setForm(f => ({ ...f, card_name: card.name }));
      setSearchResults([]);
      return;
    }
    const prices = card.tcgplayer?.prices;
    const market = prices?.holofoil?.market || prices?.normal?.market || prices?.reverseHolofoil?.market || prices?.['1stEditionHolofoil']?.market || null;
    setForm(f => ({
      ...f,
      card_name: card.name,
      set_name: card.set?.name || '',
      current_value: market ? market.toFixed(2) : f.current_value,
      image_url: card.images?.small || null,
    }));
    setSearchResults([]);
  }


  const [cardImages, setCardImages] = useState({});

  async function fetchCardImage(cardName, cardId) {
    if (!cardName || cardImages[cardId]) return;
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cardName)}"&pageSize=1`);
      const data = await res.json();
      const img = data?.data?.[0]?.images?.small;
      if (img) setCardImages(prev => ({ ...prev, [cardId]: img }));
    } catch (e) {}
  }

  const [form, setForm] = useState({
    card_name: '',
    set_name: '',
    condition: 'Raw',
    purchase_price: '',
    current_value: '',
    quantity: 1,
    notes: '',
    purchase_date: '',
    type: 'card', // card | sealed
  });

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCards() {
    setLoading(true);
    console.log('Fetching cards for user:', session?.user?.id);
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Result:', { data, error });
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
      purchase_date: form.purchase_date || null,
      type: form.type || 'card',
    });

    if (!error) {
      setForm({ card_name: '', set_name: '', condition: 'Raw', purchase_price: '', current_value: '', quantity: 1, notes: '', purchase_date: '', type: activeTab === 'sealed' ? 'sealed' : 'card' });
      setShowAdd(false);
      fetchCards();
    }
    setSaving(false);
  }

  async function deleteCard(id) {
    await supabase.from('portfolio').delete().eq('id', id);
    fetchCards();
  }

  // Filter by active tab
  const filteredCards = cards.filter(c => activeTab === 'sealed' ? c.type === 'sealed' : c.type !== 'sealed');

  // Build chart data
  const chartData = filteredCards.map(card => ({
    name: card.card_name.slice(0, 12),
    cost: Number(card.purchase_price || 0) * card.quantity,
    value: Number(card.current_value || 0) * card.quantity,
  }));

  // Stats
  const totalValue = filteredCards.reduce((sum, c) => sum + ((c.current_value || 0) * c.quantity), 0);
  const totalCost = filteredCards.reduce((sum, c) => sum + ((c.purchase_price || 0) * c.quantity), 0);
  const totalGain = totalValue - totalCost;
  const gainPercent = totalCost > 0 ? ((totalGain / totalCost) * 100).toFixed(1) : 0;

  return (
    <div className="portfolio">
      {/* Mobile hamburger */}
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
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
            <p className="portfolio-sub">{cards.length} items tracked</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(f => ({...f, type: activeTab === 'sealed' ? 'sealed' : 'card'})); setShowAdd(true); }}>+ Add {activeTab === 'sealed' ? 'Sealed' : 'Card'}</button>
        </div>

        {/* Tabs */}
        <div className="portfolio-tabs">
          <button className={`tab ${activeTab === 'cards' ? 'active' : ''}`} onClick={() => setActiveTab('cards')}>Singles</button>
          <button className={`tab ${activeTab === 'sealed' ? 'active' : ''}`} onClick={() => setActiveTab('sealed')}>Sealed Product</button>
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

        {/* Chart */}
        {cards.length > 0 && (
          <div className="portfolio-chart">
            <div className="chart-header">
              <div className="chart-title">Portfolio Overview</div>
              <div className="chart-summary">
                <div className="chart-stat">
                  <span className="chart-stat-label">Cost Basis</span>
                  <span className="chart-stat-value">${totalCost.toFixed(2)}</span>
                </div>
                <div className="chart-stat">
                  <span className="chart-stat-label">Market Value</span>
                  <span className="chart-stat-value" style={{ color: 'var(--pink)' }}>${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff2d8a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff2d8a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6b6b8a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6b6b8a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: 0 }}
                  labelStyle={{ color: '#f0f0f8', fontSize: 12 }}
                  formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'value' ? 'Market Value' : 'Cost Basis']}
                />
                <Area type="monotone" dataKey="cost" stroke="#6b6b8a" strokeWidth={1.5} fill="url(#colorCost)" />
                <Area type="monotone" dataKey="value" stroke="#ff2d8a" strokeWidth={1.5} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <div className="modal-overlay" onClick={() => setSelectedCard(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>{selectedCard.card_name}</h2>
                  {selectedCard.set_name && <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>{selectedCard.set_name}</div>}
                </div>
                <button className="modal-close" onClick={() => setSelectedCard(null)}>✕</button>
              </div>
              <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:20}}>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Condition</div>
                    <div className="detail-value">{selectedCard.condition || '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Quantity</div>
                    <div className="detail-value">{selectedCard.quantity}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Purchase Price</div>
                    <div className="detail-value">{selectedCard.purchase_price ? `$${(selectedCard.purchase_price * selectedCard.quantity).toFixed(2)}` : '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Current Value</div>
                    <div className="detail-value" style={{color:'var(--pink)'}}>{selectedCard.current_value ? `$${(selectedCard.current_value * selectedCard.quantity).toFixed(2)}` : '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Gain / Loss</div>
                    <div className={`detail-value ${(selectedCard.current_value - selectedCard.purchase_price) >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCard.purchase_price && selectedCard.current_value
                        ? `${((selectedCard.current_value - selectedCard.purchase_price) * selectedCard.quantity) >= 0 ? '+' : ''}$${((selectedCard.current_value - selectedCard.purchase_price) * selectedCard.quantity).toFixed(2)}`
                        : '—'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Return</div>
                    <div className={`detail-value ${(selectedCard.current_value - selectedCard.purchase_price) >= 0 ? 'positive' : 'negative'}`}>
                      {selectedCard.purchase_price && selectedCard.current_value
                        ? `${(((selectedCard.current_value - selectedCard.purchase_price) / selectedCard.purchase_price) * 100).toFixed(1)}%`
                        : '—'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Purchase Date</div>
                    <div className="detail-value">{selectedCard.purchase_date ? new Date(selectedCard.purchase_date).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Added</div>
                    <div className="detail-value">{new Date(selectedCard.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                {selectedCard.notes && (
                  <div>
                    <div className="detail-label">Notes</div>
                    <div style={{fontSize:14,color:'var(--text-muted)',marginTop:6}}>{selectedCard.notes}</div>
                  </div>
                )}
                <button className="btn-ghost" style={{color:'var(--red)',borderColor:'var(--red)'}} onClick={() => { deleteCard(selectedCard.id); setSelectedCard(null); }}>
                  Delete Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Card Modal */}
        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Card</h2>
                <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <form className="add-form" onSubmit={addCard}>
                <div className={`scan-section ${activeTab === 'sealed' ? '' : 'mobile-only'}`}>
                  <input
                    ref={scanInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleScan}
                  />
                  <button type="button" className="btn-scan" onClick={() => scanInputRef.current?.click()} disabled={scanning}>
                    {scanning ? '⏳ Identifying...' : activeTab === 'sealed' ? '📷 Scan Product' : '📷 Scan Card'}
                  </button>
                  {scanError && <div className="scan-error">{scanError}</div>}
                  <div className="scan-divider">or enter manually</div>
                </div>
                <div className="form-row">
                  <div className="field" style={{ position: 'relative' }}>
                    <label className="field-label">{activeTab === 'sealed' ? 'Product Name' : 'Card Name'} * {searching && <span style={{color:'var(--pink)',fontSize:11}}>Searching...</span>}</label>
                    <input className="field-input" placeholder={activeTab === 'sealed' ? "e.g. Prismatic Evolutions ETB" : "e.g. Charizard ex"} value={form.card_name} onChange={handleCardNameChange} onBlur={handleCardNameBlur} autoComplete="off" required />
                    {searchResults.length > 0 && (
                      <div className="card-search-dropdown">
                        {searchResults.map(card => {
                          const prices = card.tcgplayer?.prices;
                          const market = prices?.holofoil?.market || prices?.normal?.market || prices?.reverseHolofoil?.market || null;
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
                  <div className="field">
                    <label className="field-label">Set</label>
                    <input className="field-input" placeholder="e.g. Prismatic Evolutions" value={form.set_name} onChange={e => setForm({...form, set_name: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">{activeTab === 'sealed' ? 'Status' : 'Condition'}</label>
                    <select className="field-input" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                      {activeTab === 'sealed'
                        ? ['Sealed', 'Opened'].map(c => <option key={c}>{c}</option>)
                        : CONDITIONS.map(c => <option key={c}>{c}</option>)
                      }
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
                    <label className="field-label">Current Value ($)</label>
                    <input className="field-input" type="number" step="0.01" placeholder="0.00" value={form.current_value} onChange={e => setForm({...form, current_value: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label className="field-label">Purchase Date</label>
                    <input className="field-input" type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
                  </div>
                  <div className="field">
                    <label className="field-label">Notes</label>
                    <input className="field-input" placeholder="Optional notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
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
        ) : filteredCards.length === 0 ? (
          <div className="portfolio-empty">
            <div className="empty-icon">▣</div>
            <p>{activeTab === 'sealed' ? 'No sealed products yet' : 'No cards in your portfolio yet'}</p>
            <p className="empty-sub">{activeTab === 'sealed' ? 'Add booster boxes, ETBs, tins and more' : 'Add your first card to start tracking your collection value'}</p>
            <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ marginTop: 16 }}>+ Add {activeTab === 'sealed' ? 'Sealed Product' : 'Your First Card'}</button>
          </div>
        ) : (
          <div className="cards-list">
            {filteredCards.map(card => {
              const cost = Number(card.purchase_price || 0) * card.quantity;
              const value = Number(card.current_value || 0) * card.quantity;
              const gain = value - cost;
              const gainPct = cost > 0 ? ((gain / cost) * 100).toFixed(0) : null;
              return (
                <div key={card.id} className="card-row" onMouseEnter={() => fetchCardImage(card.card_name, card.id)} onClick={() => setSelectedCard(card)} style={{cursor:'pointer'}}>
                  {cardImages[card.id]
                    ? <img src={cardImages[card.id]} alt={card.card_name} className="card-row-img" />
                    : <div className="card-row-img-placeholder">▣</div>
                  }
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
