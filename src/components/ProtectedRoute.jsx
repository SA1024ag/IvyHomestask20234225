import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IvyLogo from './IvyLogo';
import {
  Loader2,
  Lock,
  Building2,
  Home,
  KeyRound,
  Heart,
  ArrowLeftRight,
  BarChart3
} from 'lucide-react';

const PAGE_CONTEXT = {
  '/listings': {
    title: 'Browse Mumbai Listings',
    description: 'Access 4,000+ verified sale listings with smart filters, price analytics, and comparison tools.',
    icon: Home,
  },
  '/rentals': {
    title: 'Explore Rental Homes',
    description: 'Discover 2,100 curated rentals with transparent pricing, security deposits, and zero-brokerage options.',
    icon: KeyRound,
  },
  '/projects': {
    title: 'View Builder Projects',
    description: 'Explore 590 residential projects by top Mumbai builders with live inventory and price tracking.',
    icon: Building2,
  },
  '/saved': {
    title: 'Your Saved Properties',
    description: 'Access your bookmarked listings and rentals across sessions with persistent cloud sync.',
    icon: Heart,
  },
  '/compare': {
    title: 'Compare Properties',
    description: 'Side-by-side comparison of up to 4 properties with price, area, BHK, and amenity breakdowns.',
    icon: ArrowLeftRight,
  },
  '/insights': {
    title: 'Market Intelligence & Analytics',
    description: 'Real-time city-wide valuation benchmarks, supply breakdowns, and full forensic audit disclosures.',
    icon: BarChart3,
  },
};

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <Loader2 size={36} color="var(--primary-600)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
          Verifying Ivy Homes session...
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    const ctx = PAGE_CONTEXT[location.pathname] || {
      title: 'Sign In Required',
      description: 'Please sign in to your Ivy Homes account to continue.',
      icon: Lock,
    };

    return (
      <div
        className="main-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - var(--header-height) - 4rem)',
          padding: '3rem 1.5rem',
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, var(--accent-subtle) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{
          width: '100%',
          maxWidth: '520px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Page icon + lock badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            position: 'relative',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}>
              {React.createElement(ctx.icon, { size: 32, color: 'var(--accent-primary)', strokeWidth: 1.75 })}
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              right: 'calc(50% - 42px)',
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--accent-primary)',
              border: '2px solid var(--bg-canvas)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Lock size={12} color="#ffffff" strokeWidth={2.5} />
            </div>
          </div>

          {/* Main card */}
          <div className="ivy-card" style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: 'linear-gradient(to bottom, var(--bg-surface), var(--bg-surface-subtle))',
          }}>
            {/* Brand line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
            }}>
              <IvyLogo variant="full" size="sm" />
            </div>

            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: 'var(--text-heading)',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
            }}>
              {ctx.title}
            </h1>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.925rem',
              lineHeight: 1.55,
              marginBottom: '2rem',
              maxWidth: '380px',
              margin: '0 auto 2rem',
            }}>
              {ctx.description}
            </p>

            {/* Feature pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.45rem',
              marginBottom: '2rem',
            }}>
              {['Free to sign up', 'Instant access', '3 demo accounts', 'No credit card'].map((f) => (
                <span key={f} style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)'
                }}>
                  {f}
                </span>
              ))}
            </div>

            {/* Primary CTA */}
            <Link
              to="/login"
              state={{ from: location }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                fontSize: '0.975rem',
                justifyContent: 'center',
                marginBottom: '1rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Sign In to Continue
            </Link>

            {/* Subtext */}
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--text-faint)',
              lineHeight: 1.5,
            }}>
              Demo credentials are pre-filled. One click to sign in.
            </p>
          </div>

          {/* Security callout */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-body)', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: 'var(--text-heading)' }}>Auto-renewing sessions: </span>
              Tokens are refreshed every 12 min so you stay logged in for 30+ minutes seamlessly.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
