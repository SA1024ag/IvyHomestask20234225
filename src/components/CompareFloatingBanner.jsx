import React from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeftRight, X, Trash2, AlertCircle } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { formatINR } from './PropertyCard';

export default function CompareFloatingBanner() {
  const { compareListings, removeFromCompare, clearCompare, count, maxLimit, warningMessage } = useCompare();

  if (count === 0 && !warningMessage) return null;

  return (
    <aside
      aria-label="Property comparison dock"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 'calc(100% - 2rem)',
        maxWidth: '780px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none'
      }}
    >
      {/* Warning Toast if user exceeds 3 properties */}
      {warningMessage && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          pointerEvents: 'auto',
          animation: 'fadeIn 0.2s ease'
        }}>
          <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Main Floating Banner Bar */}
      {count > 0 && (
        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 'var(--radius-xl)',
          padding: '0.85rem 1.25rem',
          color: '#ffffff',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          pointerEvents: 'auto',
          flexWrap: 'wrap'
        }}>
          {/* Left: Indicator & Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <ArrowLeftRight size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Side-by-Side Compare
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  {count} of {maxLimit} selected
                </div>
              </div>
            </div>

            {/* Property Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {compareListings.map((item) => (
                <div
                  key={item.listing_id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    maxWidth: '170px'
                  }}
                >
                  <span style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600
                  }}>
                    {item.apartment_name || item.locality || `#${item.listing_id}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromCompare(item.listing_id)}
                    aria-label={`Remove ${item.apartment_name || item.listing_id} from compare`}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={clearCompare}
              className="btn btn-ghost btn-sm"
              style={{
                color: '#94a3b8',
                fontSize: '0.8rem',
                padding: '0.4rem 0.6rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              title="Clear all selections"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>

            <NavLink
              to="/compare"
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: 'var(--primary-500)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
              }}
            >
              <span>Compare Now ({count})</span>
              <span>→</span>
            </NavLink>
          </div>
        </div>
      )}
    </aside>
  );
}
