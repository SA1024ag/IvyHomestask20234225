import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';
import { useCompare } from '../context/CompareContext';
import { useTheme } from '../context/ThemeContext';
import IvyLogo from './IvyLogo';
import {
  LogOut,
  User,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { count: savedCount } = useFavourites();
  const { totalCount: compareCount } = useCompare();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Listings', path: '/listings' },
    { label: 'Rentals', path: '/rentals' },
    { label: 'Projects', path: '/projects' },
    { label: 'Compare', path: '/compare', badge: compareCount > 0 ? compareCount : null },
    { label: 'Saved', path: '/saved', badge: savedCount },
    { label: 'Insights', path: '/insights' },
  ];

  return (
    <header className="glass-header">
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLink to="/" style={{ textDecoration: 'none' }}>
            <IvyLogo variant="full" size="md" />
          </NavLink>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-subtle)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{item.label}</span>
                {Boolean(item.badge) && (
                  <span style={{
                    marginLeft: '2px',
                    padding: '1px 6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle + User + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="btn btn-secondary btn-sm"
            style={{
              width: '36px',
              height: '36px',
              padding: 0,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isDark ? (
              <Sun size={17} color="#fbbf24" style={{ transition: 'transform 0.2s ease' }} />
            ) : (
              <Moon size={17} color="var(--accent-primary)" style={{ transition: 'transform 0.2s ease' }} />
            )}
          </button>

          {isAuthenticated ? (
            <>
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }} className="user-status-badge">
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)'
                }} />
                <User size={13} color="var(--accent-primary)" />
                <span style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'User'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of Ivy Homes"
              >
                <LogOut size={14} />
                <span className="logout-text">Logout</span>
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm">
              Sign In
            </NavLink>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm mobile-toggle"
            aria-label="Toggle navigation menu"
            style={{ padding: '0.4rem', minWidth: 'auto', display: 'flex' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }} className="mobile-drawer">
          {isAuthenticated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.65rem 0.85rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.5rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <User size={16} color="var(--accent-primary)" />
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{user?.email}</div>
                <div style={{ color: 'var(--text-muted)' }}>Authenticated Session Active</div>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-heading)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--bg-surface-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent'
                }}
              >
                <span>{item.label}</span>
                {Boolean(item.badge) && (
                  <span style={{
                    padding: '2px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
          .user-status-badge {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
