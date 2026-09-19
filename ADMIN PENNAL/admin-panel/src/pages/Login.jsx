import { useState } from 'react';
import './Login.css';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@parimatch.com' && password === 'admin123') {
        onLogin();
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <img src="/logo.jpg" alt="Logo" className="login-logo-img" />
        </div>

        <h1 className="login-title">Admin Panel</h1>
        <p className="login-subtitle">Parimatch Help Center</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4L12 13 2 4" />
              </svg>
              <input
                type="email"
                placeholder="admin@parimatch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">Demo: admin@parimatch.com / admin123</p>
      </div>
    </div>
  );
}
