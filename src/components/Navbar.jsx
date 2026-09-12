import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouritesContext';
import { useCompare } from '../context/CompareContext';
import {
  Building2,
  Home,
  KeyRound,
  FolderKanban,
  Bookmark,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  ShieldCheck,
  MapPin,
  ArrowLeftRight
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { count: savedCount } = useFavourites();
  const { totalCount: compareCount } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Listings', path: '/listings', icon: Home },
    { label: 'Compare', path: '/compare', icon: ArrowLeftRight, badge: compareCount > 0 ? compareCount : null },
    { label: 'Rentals', path: '/rentals', icon: KeyRound },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Saved', path: '/saved', icon: Bookmark, badge: savedCount },
    { label: 'Insights', path: '/insights', icon: BarChart3 },
  ];

  if (!isAuthenticated && location.pathname === '/login') {
    return null; // Keep login screen distraction-free
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)'
    }}>
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
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NavLink to="/listings" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(5, 150, 105, 0.3)'
            }}>
              <Building2 size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Ivy<span style={{ color: 'var(--primary-600)' }}>Homes</span>
                </span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--primary-50)',
                  color: 'var(--primary-700)',
                  border: '1px solid var(--primary-200)',
                  letterSpacing: '0.05em'
                }}>
                  Pro
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 500 }}>
                <MapPin size={11} color="var(--primary-600)" />
                <span>Mumbai Region</span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-700)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent'
                }}
              >
                <Icon size={17} strokeWidth={isActive ? 2.3 : 1.8} color={isActive ? 'var(--primary-600)' : 'currentColor'} />
                <span>{item.label}</span>
                {Boolean(item.badge) && (
                  <span style={{
                    marginLeft: '2px',
                    padding: '1px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-600)',
                    color: '#ffffff'
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Right: User Status & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <>
              <div style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-light)'
              }} className="user-status-badge">
                <span className="pulse-dot" title="Session active with auto-refresh" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <User size={14} color="var(--primary-600)" />
                  <span>{user?.email || 'Demo User'}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                title="Sign out of Ivy Homes"
              >
                <LogOut size={15} />
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
            className="btn btn-ghost btn-sm mobile-toggle"
            aria-label="Toggle menu"
            style={{ display: 'flex', padding: '0.4rem' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div style={{
          borderTop: '1px solid var(--border-light)',
          backgroundColor: '#ffffff',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }} className="mobile-drawer">
          {isAuthenticated && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.8rem',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.5rem'
            }}>
              <ShieldCheck size={18} color="var(--primary-600)" />
              <div style={{ fontSize: '0.825rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--primary-800)' }}>Logged in as</div>
                <div style={{ color: 'var(--primary-700)', fontWeight: 500 }}>{user?.email}</div>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary-700)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-200)' : '1px solid transparent'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary-600)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
                {Boolean(item.badge) && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '1px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--primary-600)',
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

      {/* Responsive media query styling */}
      <style>{`
        @media (min-width: 768px) {
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
