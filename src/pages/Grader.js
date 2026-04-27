import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Grader.css';

const GRADE_COLORS = {
  10: '#c8ff00',
  9: '#00ff88',
  8: '#4499ff',
  7: '#ffcc00',
  6: '#ff8800',
  5: '#ff4444',
};

export default function Grader() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  async function gradeCard() {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        const mediaType = image.type;

        const response = await fetch('/api/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });

        if (!response.ok) {
          const err = await response.json();
          setError(err.error || 'Grading failed. Please try again.');
          setLoading(false);
          return;
        }

        const parsed = await response.json();
        setResult(parsed);
        setLoading(false);
      };
      reader.readAsDataURL(image);
    } catch (err) {
      setError('Grading failed. Please try again.');
      setLoading(false);
    }
  }

  const gradeColor = result ? (GRADE_COLORS[Math.floor(result.overallGrade)] || '#666') : '#666';

  return (
    <div className="grader">
      <nav className="grader-nav">
        <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          HUMN <span className="nav-iq">IQ</span>
        </div>
        <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
          Dashboard
        </button>
      </nav>

      <div className="grader-content">
        <div className="grader-left">
          <div className="grader-header">
            <div className="tag">AI Card Grader</div>
            <h1 className="grader-title">Grade your card</h1>
            <p className="grader-sub">Upload a clear photo of your Pokemon card and get an instant PSA grade prediction.</p>
          </div>

          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''} ${imagePreview ? 'has-image' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Card preview" className="card-preview" />
            ) : (
              <div className="drop-placeholder">
                <div className="drop-icon">◈</div>
                <p className="drop-text">Drop card image here</p>
                <p className="drop-sub">or click to browse</p>
                <p className="drop-hint">JPG, PNG — front of card only</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {imagePreview && (
            <div className="grader-actions">
              <button
                className="btn-primary"
                onClick={gradeCard}
                disabled={loading}
                style={{ width: '100%', padding: '16px' }}
              >
                {loading ? 'Analyzing...' : 'Grade This Card'}
              </button>
              <button
                className="btn-ghost"
                onClick={() => { setImage(null); setImagePreview(null); setResult(null); }}
                style={{ width: '100%' }}
              >
                Clear
              </button>
            </div>
          )}

          {error && <div className="grader-error">{error}</div>}
        </div>

        <div className="grader-right">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Analyzing centering, corners, edges & surface...</p>
            </div>
          )}

          {result && !loading && (
            <div className="result">
              <div className="result-header">
                <div>
                  <div className="result-card-name">{result.cardName || 'Pokemon Card'}</div>
                  {result.set && <div className="result-set">{result.set}</div>}
                </div>
                <div className="result-grade" style={{ color: gradeColor }}>
                  <div className="result-grade-num">{result.overallGrade}</div>
                  <div className="result-grade-label">{result.psaEquivalent}</div>
                </div>
              </div>

              <div className="scores-grid">
                {[
                  { label: 'Centering', data: result.centering },
                  { label: 'Corners', data: result.corners },
                  { label: 'Edges', data: result.edges },
                  { label: 'Surface', data: result.surface },
                ].map((item, i) => (
                  <div key={i} className="score-card">
                    <div className="score-header">
                      <span className="score-label">{item.label}</span>
                      <span className="score-value" style={{ color: GRADE_COLORS[item.data?.score] || '#666' }}>
                        {item.data?.score}/10
                      </span>
                    </div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${(item.data?.score / 10) * 100}%`,
                          background: GRADE_COLORS[item.data?.score] || '#444'
                        }}
                      />
                    </div>
                    {item.label === 'Centering' && item.data?.frontLeftRight && (
                      <div className="score-detail mono">
                        L/R: {item.data.frontLeftRight} · T/B: {item.data.frontTopBottom}
                      </div>
                    )}
                    <div className="score-notes">{item.data?.notes}</div>
                  </div>
                ))}
              </div>

              <div className={`submit-rec ${result.submitRecommendation ? 'rec-yes' : 'rec-no'}`}>
                <div className="rec-icon">{result.submitRecommendation ? '✓' : '✗'}</div>
                <div>
                  <div className="rec-title">
                    {result.submitRecommendation ? 'Worth Submitting' : 'Not Recommended'}
                  </div>
                  <div className="rec-reason">{result.submitReason}</div>
                </div>
              </div>

              {result.estimatedValue && (
                <div className="value-grid">
                  <div className="value-label">Estimated Values</div>
                  <div className="value-items">
                    <div className="value-item">
                      <span className="value-tier">Raw</span>
                      <span className="value-price">{result.estimatedValue.raw}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-tier">PSA 8</span>
                      <span className="value-price">{result.estimatedValue.psa8}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-tier">PSA 9</span>
                      <span className="value-price">{result.estimatedValue.psa9}</span>
                    </div>
                    <div className="value-item">
                      <span className="value-tier">PSA 10</span>
                      <span className="value-price accent">{result.estimatedValue.psa10}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="result-empty">
              <div className="result-empty-icon">◈</div>
              <p>Upload a card to see your grade analysis</p>
              <div className="result-empty-tips">
                <div className="tip">📸 Use good lighting, no glare</div>
                <div className="tip">📐 Keep card flat and centered</div>
                <div className="tip">🔍 Higher resolution = better accuracy</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
