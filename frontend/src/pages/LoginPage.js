import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" >
      <div className="login-card">
        <div className="login-header-icon">🚀</div>
        <h1>Login to TMS</h1>
        <p className="subtitle">Complaint Management System</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-fill-container" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚡ Quick Demo Login
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>
              1-Tap Fill
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('superadmin@example.com');
                setPassword('SuperAdmin@123');
              }}
              style={{
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#60a5fa',
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              👑 SuperAdmin
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('user@example.com');
                setPassword('User@123');
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#34d399',
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              👤 Student / User
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('network@example.com');
                setPassword('User@123');
              }}
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                color: '#a5b4fc',
                padding: '0.5rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              🌐 Network Staff
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('plumber@example.com');
                setPassword('User@123');
              }}
              style={{
                background: 'rgba(14, 165, 233, 0.12)',
                border: '1px solid rgba(14, 165, 233, 0.35)',
                color: '#38bdf8',
                padding: '0.5rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              🔧 Plumber
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('electrician@example.com');
                setPassword('User@123');
              }}
              style={{
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.35)',
                color: '#facc15',
                padding: '0.5rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              ⚡ Electrician
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('developer@example.com');
                setPassword('User@123');
              }}
              style={{
                background: 'rgba(168, 85, 247, 0.12)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                color: '#c084fc',
                padding: '0.5rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              💻 Software Dev
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('hardware@example.com');
                setPassword('User@123');
              }}
              style={{
                gridColumn: 'span 2',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                padding: '0.5rem 0.4rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              🖥️ PC Hardware Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
