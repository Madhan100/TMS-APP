import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-top-bar">
        <Link to="/" className="mobile-brand" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-icon">🚀</span> <span className="brand-text">TMS</span>
        </Link>

        <div className="mobile-top-actions">
          {isAuthenticated && (
            <span className="mobile-user-badge">
              👤 {user?.username}
            </span>
          )}
          <button
            className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile */}
      <div
        className={`nav-backdrop ${mobileMenuOpen ? 'show' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Main Navigation Sidebar / Mobile Drawer */}
      <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Main Navigation">
        <div className="navbar-container">
          <div className="navbar-brand-wrapper">
            <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
              <span className="logo-icon" style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>T</span>
              <span style={{ fontWeight: 800, letterSpacing: '0.05em' }}>TMS</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06b6d4', color: '#38bdf8', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 700, marginLeft: '0.3rem' }}>PLATFORM</span>
            </Link>
            <button
              className="drawer-close-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              ✕
            </button>
          </div>

          {isAuthenticated && (
            <>
              <div className="nav-links">
                {/* Raise Ticket */}
                <Link
                  to="/complaints/new"
                  className={`nav-link ${isActive('/complaints/new') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">✏️</span> <span className="nav-text">Raise Ticket</span>
                </Link>

                {/* Tickets */}
                <Link
                  to={user?.role === 'SuperAdmin' ? "/complaints" : "/my-complaints"}
                  className={`nav-link ${isActive('/complaints') || isActive('/my-complaints') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">📁</span> <span className="nav-text">Tickets</span>
                </Link>

                {/* SuperAdmin Menu */}
                {user?.role === 'SuperAdmin' && (
                  <>
                    <Link
                      to="/departments"
                      className={`nav-link ${isActive('/departments') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">📖</span> <span className="nav-text">Departments</span>
                    </Link>

                    <Link
                      to="/programmes"
                      className={`nav-link ${isActive('/programmes') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">🎓</span> <span className="nav-text">Programmes</span>
                    </Link>

                    <Link
                      to="/blocks"
                      className={`nav-link ${isActive('/blocks') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">🏛️</span> <span className="nav-text">Blocks</span>
                    </Link>

                    <Link
                      to="/rooms"
                      className={`nav-link ${isActive('/rooms') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">🚪</span> <span className="nav-text">Rooms</span>
                    </Link>

                    <Link
                      to="/users"
                      className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">👥</span> <span className="nav-text">Users</span>
                    </Link>

                    <Link
                      to="/roles"
                      className={`nav-link ${isActive('/roles') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">🛡️</span> <span className="nav-text">Roles</span>
                    </Link>

                    <Link
                      to="/reports"
                      className={`nav-link ${isActive('/reports') ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="nav-icon">📊</span> <span className="nav-text">Reports</span>
                    </Link>
                  </>
                )}
              </div>

              <div className="nav-actions">
                <div className="nav-user">
                  <span className="user-icon">👤</span>
                  <div className="user-details">
                    <span className="user-name">{user?.username}</span>
                    <span className="user-role-badge">{user?.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <span>🚪</span> <span>Logout</span>
                </button>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <div className="nav-links">
              <Link
                to="/login"
                className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">🔑</span> <span className="nav-text">Login</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;