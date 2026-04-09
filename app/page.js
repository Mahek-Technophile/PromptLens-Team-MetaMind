'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_prompt: prompt }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const tokensSaved = result?.run ? result.run.original_tokens - result.run.optimized_tokens : 0;
  const co2Grams = (tokensSaved / 1000) * 0.001;
  const waterMl = (tokensSaved / 1000) * 0.5;
  const waterLabel = waterMl >= 1000 ? `≈ ${(waterMl / 1000).toFixed(1)} L` : waterMl >= 250 ? `≈ ${(waterMl / 250).toFixed(1)} sips` : `${waterMl.toFixed(1)} ml`;

  return (
    <>
      {/* Header */}
      <header className="header">
        <a href="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <span className="logo-prompt">Prompt</span>
          <span className="logo-lens">Lens</span>
        </a>

        <nav className="nav">
          <a href="#purpose">Purpose</a>
          <a href="#solutions">Solutions</a>
          <a href="#developers">Developers</a>
          <a href="#docs">Docs</a>
          <a href="#blogs">Blogs</a>
        </nav>

        <div className="header-actions">
          <button className="btn btn-login">Login</button>
          <button className="btn btn-signup">Sign Up</button>
        </div>
      </header>

      {/* Hero */}
      <main className="hero">
        <h1 className="hero-title">
          <div className="line1">Saving Energy, Nurturing Ideas</div>
          <div>
            <span className="prompt">with </span>
            <span className="lens">PromptLens</span>
          </div>
        </h1>

        <div className="input-container">
          <form onSubmit={handleSubmit}>
            <textarea
              className="prompt-input"
              placeholder="Waiting for prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
            <div style={{ textAlign: 'center' }}>
              <button type="submit" className="submit-btn" disabled={loading || !prompt.trim()}>
                {loading ? 'Optimizing...' : 'Optimize Prompt'}
              </button>
            </div>
          </form>
        </div>

        {/* Output Section */}
        {result && !loading && (
          <div className="output-section">
            <h2>✨ Optimized Results</h2>

            <div className="optimized-prompt">
              <h3>Optimized Prompt</h3>
              <p>{result.run?.optimized_prompt}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{tokensSaved}</div>
                <div className="stat-label">Tokens Saved</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{co2Grams.toFixed(4)}g</div>
                <div className="stat-label">CO₂ Reduced</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{waterLabel}</div>
                <div className="stat-label">Water Saved</div>
              </div>
            </div>

            <p className="thank-you">
              🌱 Thank you for optimizing your prompts and helping the planet!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#careers">Careers</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="#docs">Documentation</a>
            <a href="#api">API Reference</a>
            <a href="#blog">Blog</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 PromptLens. All rights reserved.</span>
          <div className="social-links">
            <a href="#twitter">Twitter</a>
            <a href="#github">GitHub</a>
            <a href="#linkedin">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  );
}
