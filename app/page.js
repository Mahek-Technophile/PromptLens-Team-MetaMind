'use client';

import { useState, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useState(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  });

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user,
      showAuth,
      setShowAuth,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithGithub,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

function AuthModal() {
  const { setShowAuth, signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider) => {
    setError('');
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={() => setShowAuth(false)}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#666', textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Sign in to continue' : 'Join PromptLens today'}
        </p>

        {error && (
          <div style={{
            background: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => handleOAuth('google')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          <span style={{ color: '#888', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#333' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#3EB489',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3EB489',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <button
          onClick={() => setShowAuth(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#888',
          }}
        >
          x
        </button>
      </div>
    </div>
  );
}

const blogPosts = [
  {
    id: 1,
    title: 'AI Data Centers Face Water Crisis as Demand Surges',
    excerpt: 'US data centers projected to consume 170% more water by 2030. GPU cooling demands are creating unprecedented strain on local water resources.',
    tag: 'Water Impact',
    source: 'Water Exchange Q2 2025',
    sourceUrl: 'https://waterexchange.com/wp-content/uploads/2025/03/2025-Q2-Water-Market-Insider-Data-Centers.pdf',
    icon: '💧',
    imageClass: 'water',
    stats: ['20B+ liters/year', '170% increase by 2030']
  },
  {
    id: 2,
    title: 'The Hidden Energy Cost of AI Queries',
    excerpt: 'A single ChatGPT query uses enough energy to power a lightbulb for 20 minutes. With 1B+ daily queries, the cumulative impact is massive.',
    tag: 'Energy Impact',
    source: 'MIT Technology Review',
    sourceUrl: 'https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech',
    icon: '⚡',
    imageClass: 'energy',
    stats: ['109 GWh/year', '$4.6B energy cost']
  },
  {
    id: 3,
    title: 'GPU Thermal Throttling: When Processors Melt',
    excerpt: 'Next-gen AI GPUs consume 240kW per rack - far beyond air cooling capacity. Liquid cooling market surges from $2.8B to $21B by 2032.',
    tag: 'Hardware',
    source: 'Introl Blog',
    sourceUrl: 'https://introl.com/blog/liquid-cooling-ai-data-center-infrastructure-essential-2025',
    icon: '🔥',
    imageClass: 'energy',
    stats: ['240kW/rack', '30% CAGR growth']
  },
  {
    id: 4,
    title: 'From 9Wh to 0.24Wh: How AI Got 33x More Efficient',
    excerpt: 'Google reports dramatic efficiency gains in AI inference. But with projected 22% of US household electricity by 2028, the race continues.',
    tag: 'Efficiency',
    source: 'Sustainability by Numbers',
    sourceUrl: 'https://www.sustainabilitybynumbers.com/p/ai-footprint-august-2025',
    icon: '📊',
    imageClass: 'water',
    stats: ['33x efficiency', '22% US electricity by 2028']
  }
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { user, setShowAuth, signOut } = useAuth() || {};

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
  const waterLabel = waterMl >= 1000 ? `${(waterMl / 1000).toFixed(1)} L` : waterMl >= 250 ? `${(waterMl / 250).toFixed(1)} sips` : `${waterMl.toFixed(1)} ml`;

  return (
    <AuthProvider>
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
            {user ? (
              <>
                <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>
                  {user.email}
                </span>
                <button className="btn btn-login" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <>
                <button className="btn btn-login" onClick={() => setShowAuth(true)}>Login</button>
                <button className="btn btn-signup" onClick={() => setShowAuth(true)}>Sign Up</button>
              </>
            )}
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
              <h2>Optimized Results</h2>

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
                  <div className="stat-label">CO2 Reduced</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{waterLabel}</div>
                  <div className="stat-label">Water Saved</div>
                </div>
              </div>

              <p className="thank-you">
                Thank you for optimizing your prompts and helping the planet!
              </p>
            </div>
          )}
        </main>

        {/* Purpose Section */}
        <section id="purpose" className="section purpose-section">
          <h2 className="section-title">Why PromptLens Exists</h2>
          <p className="section-subtitle">
            The AI revolution comes with an hidden environmental cost. Every optimized prompt reduces the strain on our planet.
          </p>

          <div className="purpose-grid">
            <div className="purpose-card">
              <h3>
                <span className="purpose-icon red">1</span>
                The Water Crisis
              </h3>
              <p>
                US data centers consumed over <strong>20 billion liters of water</strong> last year for cooling alone. By 2027, AI systems could withdraw more water than entire countries. Nearly two-thirds of new data centers since 2022 are in water-stressed regions.
              </p>
              <div className="stat-highlight">170% increase in water consumption by 2030</div>
            </div>

            <div className="purpose-card">
              <h3>
                <span className="purpose-icon orange">2</span>
                GPU Overheating
              </h3>
              <p>
                Modern AI GPUs consume up to <strong>240kW per rack</strong> - far beyond what air cooling can handle. The shift to liquid cooling has created a $2.8B industry thats projected to reach <strong>$21B by 2032</strong>.
              </p>
              <div className="stat-highlight">30% CAGR growth in cooling infrastructure</div>
            </div>

            <div className="purpose-card">
              <h3>
                <span className="purpose-icon blue">3</span>
                Energy Demand
              </h3>
              <p>
                Data centers now account for <strong>4% of US electricity</strong>, projected to hit 6-12% by 2028. AI could consume 22% of all US household electricity by 2028. A single ChatGPT query uses enough energy to power a lightbulb for 20 minutes.
              </p>
              <div className="stat-highlight">1 billion+ queries per day</div>
            </div>

            <div className="purpose-card">
              <h3>
                <span className="purpose-icon green">4</span>
                The Solution
              </h3>
              <p>
                Optimizing prompts by just <strong>30-50%</strong> directly reduces token processing, cutting energy, water, and carbon footprint proportionally. Small changes compound - 1 million optimized prompts daily can save terabytes of processing.
              </p>
              <div className="stat-highlight">30-50% token reduction guaranteed</div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="section solutions-section">
          <h2 className="section-title">Our Solution</h2>
          <p className="section-subtitle">
            AI-powered optimization that reduces your carbon footprint without sacrificing output quality.
          </p>

          <div className="solutions-grid">
            <div className="solution-card">
              <div className="solution-icon">1</div>
              <h3>Token Optimization</h3>
              <p>Reduce prompt length by 30-50% using proven compression techniques</p>
            </div>
            <div className="solution-card">
              <div className="solution-icon">2</div>
              <h3>Environmental Tracking</h3>
              <p>Real-time CO2 and water savings metrics for every optimization</p>
            </div>
            <div className="solution-card">
              <div className="solution-icon">3</div>
              <h3>Quality Preservation</h3>
              <p>Optimized prompts produce equivalent or better outputs</p>
            </div>
            <div className="solution-card">
              <div className="solution-icon">4</div>
              <h3>Fast Processing</h3>
              <p>Sub-second optimization via Groq high-speed inference</p>
            </div>
            <div className="solution-card">
              <div className="solution-icon">5</div>
              <h3>Persistent History</h3>
              <p>All optimization runs stored for analysis and improvement</p>
            </div>
            <div className="solution-card">
              <div className="solution-icon">6</div>
              <h3>API Access</h3>
              <p>Integrate optimization into your applications seamlessly</p>
            </div>
          </div>
        </section>

        {/* Developers Section */}
        <section id="developers" className="section developers-section">
          <h2 className="section-title">For Developers</h2>
          <p className="section-subtitle">
            Integrate prompt optimization into your workflow with our simple API.
          </p>

          <div className="dev-features">
            <div className="dev-feature">
              <div className="dev-feature-icon">{'</>'}</div>
              <div>
                <h3>RESTful API</h3>
                <p>Simple endpoints to optimize prompts programmatically</p>
                <pre className="api-code">{`POST /api/optimize
{
  "original_prompt": "Your prompt here..."
}`}</pre>
              </div>
            </div>

            <div className="dev-feature">
              <div className="dev-feature-icon">{'{}'}</div>
              <div>
                <h3>JSON Response</h3>
                <p>Structured output with token savings and environmental metrics</p>
                <pre className="api-code">{`{
  "run": {
    "optimized_prompt": "...",
    "tokens_saved": 45,
    "co2_grams": 0.05,
    "water_ml": 22.5
  }
}`}</pre>
              </div>
            </div>

            <div className="dev-feature">
              <div className="dev-feature-icon">{'#'}</div>
              <div>
                <h3>Technique Transparency</h3>
                <p>See exactly which optimization methods were applied</p>
                <pre className="api-code">{`{
  "techniques_used": [
    "filler_removal",
    "structured_format",
    "output_constraints"
  ]
}`}</pre>
              </div>
            </div>

            <div className="dev-feature">
              <div className="dev-feature-icon">{'...'}</div>
              <div>
                <h3>History Endpoint</h3>
                <p>Retrieve past optimizations for analysis</p>
                <pre className="api-code">{`GET /api/history
// Returns last 20 optimization runs`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Docs Section */}
        <section id="docs" className="section docs-section">
          <h2 className="section-title">Documentation</h2>
          <p className="section-subtitle">
            Everything you need to get started with PromptLens.
          </p>

          <div className="docs-grid">
            <div className="doc-card">
              <h3>Environment Variables</h3>
              <p>Configure your Groq API key and Supabase credentials to get started</p>
            </div>
            <div className="doc-card">
              <h3>Database Setup</h3>
              <p>Create the required Supabase table to store optimization history</p>
            </div>
            <div className="doc-card">
              <h3>API Reference</h3>
              <p>Complete endpoint documentation with examples and error codes</p>
            </div>
            <div className="doc-card">
              <h3>Optimization Techniques</h3>
              <p>Deep dive into the 5 methods used for prompt compression</p>
            </div>
          </div>
        </section>

        {/* Blogs Section */}
        <section id="blogs" className="section blogs-section">
          <h2 className="section-title">Latest Research</h2>
          <p className="section-subtitle">
            Stay informed about AI environmental impact with real-time research and data.
          </p>

          <div className="blog-grid">
            {blogPosts.map((post) => (
              <a
                key={post.id}
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="blog-card"
                style={{ textDecoration: 'none' }}
              >
                <div className={`blog-image ${post.imageClass}`}>
                  {post.icon}
                </div>
                <div className="blog-content">
                  <span className="blog-tag">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-stats">
                    {post.stats.map((stat, idx) => (
                      <span key={idx} className="blog-stat">{stat}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <span className="blog-source">Source: {post.source}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#developers">API Reference</a>
              <a href="#blogs">Research</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>2026 PromptLens. All rights reserved.</span>
          </div>
        </footer>

        {/* Auth Modal */}
        {useAuth()?.showAuth && <AuthModal />}
      </>
    </AuthProvider>
  );
}