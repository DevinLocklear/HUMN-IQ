import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './Sets.css';

export default function Sets({ session }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [setCards, setSetCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSets();
  }, []);

  async function fetchSets() {
    setLoading(true);
    try {
      const res = await fetch('https://api.pokemontcg.io/v2/sets?orderBy=-releaseDate&pageSize=30');
      const data = await res.json();
      setSets(data?.data || []);
    } catch (e) {}
    setLoading(false);
  }

  async function fetchSetCards(set) {
    setSelectedSet(set);
    setLoadingCards(true);
    setSetCards([]);
    try {
      const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}&pageSize=250&orderBy=-tcgplayer.prices.holofoil.market`);
      const data = await res.json();
      setSetCards(data?.data || []);
    } catch (e) {}
    setLoadingCards(false);
  }

  const filteredSets = sets.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top cards by market value
  const getTopCards = (cards) => {
    return cards
      .filter(c => {
        const prices = c.tcgplayer?.prices;
        return prices?.holofoil?.market || prices?.normal?.market || prices?.reverseHolofoil?.market;
      })
      .map(c => {
        const prices = c.tcgplayer?.prices;
        const market = prices?.holofoil?.market || prices?.normal?.market || prices?.reverseHolofoil?.market || 0;
        return { ...c, market };
      })
      .sort((a, b) => b.market - a.market)
      .slice(0, 12);
  };

  // Get undervalued picks (cards with low market but high potential)
  const getInvestmentPicks = (cards) => {
    return cards
      .filter(c => {
        const prices = c.tcgplayer?.prices;
        const market = prices?.holofoil?.market || prices?.normal?.market || 0;
        return market > 2 && market < 30 && c.rarity?.includes('Rare');
      })
      .map(c => {
        const prices = c.tcgplayer?.prices;
        const market = prices?.holofoil?.market || prices?.normal?.market || 0;
        return { ...c, market };
      })
      .sort((a, b) => b.market - a.market)
      .slice(0, 6);
  };

  // Set stats
  const getSetStats = (cards) => {
    const prices = cards.map(c => {
      const p = c.tcgplayer?.prices;
      return p?.holofoil?.market || p?.normal?.market || p?.reverseHolofoil?.market || 0;
    }).filter(p => p > 0);

    const totalValue = prices.reduce((a, b) => a + b, 0);
    const avgValue = prices.length ? totalValue / prices.length : 0;

    return {
      totalCards: cards.length,
      avgCardValue: avgValue,
      highValue: prices.filter(p => p > 10).length,
      chaseCards: prices.filter(p => p > 50).length,
    };
  };

  const topCards = selectedSet ? getTopCards(setCards) : [];
  const investmentPicks = selectedSet ? getInvestmentPicks(setCards) : [];
  const stats = selectedSet && setCards.length ? getSetStats(setCards) : null;

  return (
    <div className="sets-page">
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
            { icon: '◉', label: 'Sealed Analysis', path: '/sealed' },
            { icon: '◐', label: 'Set Intelligence', path: '/sets', active: true },
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

      <main className="sets-main">
        <div className="sets-header">
          <div>
            <h1 className="sets-title">Set Intelligence</h1>
            <p className="sets-sub">Explore sets, chase cards, and investment picks from every Pokemon TCG release.</p>
          </div>
        </div>

        <div className="sets-layout">
          {/* Sets list */}
          <div className="sets-panel">
            <div className="sets-search">
              <input className="field-input" placeholder="Search sets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            {loading ? (
              <div className="sets-loading"><div className="loading-spinner" /></div>
            ) : (
              <div className="sets-list">
                {filteredSets.map(set => (
                  <div key={set.id} className={`set-item ${selectedSet?.id === set.id ? 'active' : ''}`} onClick={() => fetchSetCards(set)}>
                    <img src={set.images?.symbol} alt={set.name} className="set-symbol" />
                    <div className="set-item-info">
                      <div className="set-item-name">{set.name}</div>
                      <div className="set-item-meta">{set.total} cards · {new Date(set.releaseDate).getFullYear()}</div>
                    </div>
                    <div className="set-item-series">{set.series}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Set detail */}
          <div className="sets-detail">
            {!selectedSet ? (
              <div className="sets-empty">
                <div className="sets-empty-icon">◐</div>
                <p>Select a set to see intelligence</p>
                <div className="sets-empty-tips">
                  <div className="tip">Chase cards and top pulls</div>
                  <div className="tip">Investment picks under $30</div>
                  <div className="tip">Set stats and card counts</div>
                </div>
              </div>
            ) : loadingCards ? (
              <div className="sets-empty"><div className="loading-spinner" /></div>
            ) : (
              <>
                {/* Set header */}
                <div className="set-detail-header">
                  <img src={selectedSet.images?.logo} alt={selectedSet.name} className="set-logo" />
                  <div className="set-detail-info">
                    <h2 className="set-detail-name">{selectedSet.name}</h2>
                    <div className="set-detail-meta">{selectedSet.series} · Released {new Date(selectedSet.releaseDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="set-stats">
                    <div className="set-stat">
                      <div className="set-stat-label">Total Cards</div>
                      <div className="set-stat-value">{stats.totalCards}</div>
                    </div>
                    <div className="set-stat">
                      <div className="set-stat-label">Avg Card Value</div>
                      <div className="set-stat-value">${stats.avgCardValue.toFixed(2)}</div>
                    </div>
                    <div className="set-stat">
                      <div className="set-stat-label">Cards $10+</div>
                      <div className="set-stat-value">{stats.highValue}</div>
                    </div>
                    <div className="set-stat">
                      <div className="set-stat-label">Chase Cards $50+</div>
                      <div className="set-stat-value" style={{ color: 'var(--pink)' }}>{stats.chaseCards}</div>
                    </div>
                  </div>
                )}

                {/* Top pulls */}
                {topCards.length > 0 && (
                  <div className="set-section">
                    <div className="set-section-label">Top Pulls — Chase Cards</div>
                    <div className="cards-grid">
                      {topCards.map(card => (
                        <div key={card.id} className="card-cell">
                          <img src={card.images?.small} alt={card.name} className="card-cell-img" />
                          <div className="card-cell-name">{card.name}</div>
                          <div className="card-cell-num">#{card.number}</div>
                          <div className="card-cell-price">${card.market.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Investment picks */}
                {investmentPicks.length > 0 && (
                  <div className="set-section">
                    <div className="set-section-label">Investment Picks — Under $30</div>
                    <div className="investment-list">
                      {investmentPicks.map(card => (
                        <div key={card.id} className="investment-row">
                          <img src={card.images?.small} alt={card.name} className="investment-img" />
                          <div className="investment-info">
                            <div className="investment-name">{card.name}</div>
                            <div className="investment-rarity">{card.rarity} · #{card.number}</div>
                          </div>
                          <div className="investment-price">${card.market.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
