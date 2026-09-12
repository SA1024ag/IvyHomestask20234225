import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ArrowLeftRight, X, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function CompareFloatingBanner() {
  const {
    compareSales,
    compareRentals,
    compareProjects,
    removeFromCompare,
    clearCompare,
    maxLimit,
    warningMessage
  } = useCompare();

  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  // CRITICAL: Never display the floating banner on the comparison page itself (/compare)
  if (location.pathname === '/compare') {
    return null;
  }

  // Determine which category to display based on current page
  let activeCategory = 'sale';
  let activeList = compareSales;
  let categoryLabel = 'Properties';
  let tabParam = 'sale';

  if (location.pathname.startsWith('/rentals')) {
    activeCategory = 'rentals';
    activeList = compareRentals;
    categoryLabel = 'Rentals';
    tabParam = 'rentals';
  } else if (location.pathname.startsWith('/projects')) {
    activeCategory = 'projects';
    activeList = compareProjects;
    categoryLabel = 'Projects';
    tabParam = 'projects';
  } else {
    // If on /listings or another page, fallback to whatever category has items if sales has none
    if (compareSales.length > 0) {
      activeCategory = 'sale';
      activeList = compareSales;
      categoryLabel = 'Properties';
      tabParam = 'sale';
    } else if (compareRentals.length > 0) {
      activeCategory = 'rentals';
      activeList = compareRentals;
      categoryLabel = 'Rentals';
      tabParam = 'rentals';
    } else if (compareProjects.length > 0) {
      activeCategory = 'projects';
      activeList = compareProjects;
      categoryLabel = 'Projects';
      tabParam = 'projects';
    }
  }

  const count = activeList.length;

  // Do not render if there are no items in this active category and no warning
  if (count === 0 && !warningMessage) {
    return null;
  }

  return (
    <aside
      aria-label="Comparison dock"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 90,
        width: 'calc(100% - 2rem)',
        maxWidth: isMinimized ? '330px' : '780px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Warning Toast if limit is reached */}
      {warningMessage && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '0.65rem 1rem',
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
          padding: isMinimized ? '0.65rem 1rem' : '0.85rem 1.25rem',
          color: '#ffffff',
          boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          pointerEvents: 'auto',
          flexWrap: 'wrap'
        }}>
          {/* Minimized Pill View */}
          {isMinimized ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <ArrowLeftRight size={14} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Compare {categoryLabel} ({count}/{maxLimit})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <NavLink
                  to={`/compare?tab=${tabParam}`}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: 'var(--primary-500)',
                    color: '#ffffff',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  View Table →
                </NavLink>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  title="Expand comparison dock"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Full Dock View */
            <>
              {/* Left: Indicator & Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Compare {categoryLabel}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                      {count} of {maxLimit} selected
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {activeList.map((item) => {
                    const id = activeCategory === 'projects' ? (item.project_id || item.id) : (item.listing_id || item.id);
                    const name = item.apartment_name || item.developer_name || item.title || item.locality || `#${id}`;
                    return (
                      <div
                        key={id}
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
                          {name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCompare(id, activeCategory)}
                          aria-label={`Remove ${name} from compare`}
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
                    );
                  })}
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => clearCompare(activeCategory)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.6rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  title="Clear all selections in this category"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>

                <NavLink
                  to={`/compare?tab=${tabParam}`}
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
                  <span>Compare {categoryLabel} ({count})</span>
                  <span>→</span>
                </NavLink>

                {/* Minimize Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMinimized(true)}
                  title="Minimize comparison dock"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '2px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
