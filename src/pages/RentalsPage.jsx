import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  KeyRound,
  Search,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FilterX
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useCompare } from '../context/CompareContext';
import RentalCard from '../components/RentalCard';

const LOCALITIES = [
  'All Localities',
  'andheri west',
  'bandra east',
  'borivali west',
  'chembur',
  'goregaon east',
  'kandivali east',
  'malad west',
  'mulund west',
  'powai',
  'thane west'
];

const BHK_OPTIONS = [
  { label: 'All BHKs', value: '' },
  { label: '1 BHK', value: '1' },
  { label: '2 BHK', value: '2' },
  { label: '3 BHK', value: '3' },
  { label: '4 BHK', value: '4' },
  { label: '5+ BHK', value: '5' }
];

const FURNISHING_OPTIONS = [
  { label: 'All Furnishing', value: '' },
  { label: 'Unfurnished', value: 'unfurnished' },
  { label: 'Semi-Furnished', value: 'semi-furnished' },
  { label: 'Fully-Furnished', value: 'fully-furnished' }
];

export default function RentalsPage() {
  const { rentalsCount } = useCompare();

  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedBhk, setSelectedBhk] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalCount, setTotalCount] = useState(2025);
  const [hasMore, setHasMore] = useState(true);

  // Data States
  const [rawRentals, setRawRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [contactRevealedId, setContactRevealedId] = useState(null);

  // Fetch rentals from GET /v1/rentals
  const fetchRentals = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    const queryParams = {
      page: page,
      limit: limit,
      offset: (page - 1) * limit
    };

    if (selectedLocality !== 'All Localities') {
      queryParams.locality = selectedLocality.toLowerCase();
    }
    if (selectedBhk) {
      queryParams.bhk = selectedBhk;
    }
    if (selectedFurnishing) {
      queryParams.furnishing = selectedFurnishing;
    }

    try {
      const data = await apiClient.getRentals(queryParams);
      const results = Array.isArray(data) ? data : (data.results || []);
      setRawRentals(results);
      if (typeof data.total === 'number') {
        setTotalCount(data.total);
      }
      if (typeof data.has_more === 'boolean') {
        setHasMore(data.has_more);
      } else {
        setHasMore(results.length >= limit);
      }
    } catch (err) {
      console.error('Rentals fetch error:', err);
      setApiError(err.message || 'Could not load rentals from server.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, selectedLocality, selectedBhk, selectedFurnishing]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  // Client-Side Fallback Filtering:
  // Strictly filters results in case API ignored query parameters
  const filteredRentals = useMemo(() => {
    return rawRentals.filter((item) => {
      // Locality fallback
      if (selectedLocality !== 'All Localities') {
        if (!item.locality || item.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
          return false;
        }
      }
      // Bedroom fallback
      if (selectedBhk) {
        if (String(item.bedroom) !== String(selectedBhk)) {
          return false;
        }
      }
      // Furnishing fallback
      if (selectedFurnishing) {
        if (!item.furnishing || item.furnishing.toLowerCase() !== selectedFurnishing.toLowerCase()) {
          return false;
        }
      }
      // Search query fallback
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchApartment = item.apartment_name?.toLowerCase().includes(q);
        const matchLoc = item.locality?.toLowerCase().includes(q);
        if (!matchTitle && !matchApartment && !matchLoc) {
          return false;
        }
      }
      return true;
    });
  }, [rawRentals, selectedLocality, selectedBhk, selectedFurnishing, searchQuery]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedBhk('');
    setSelectedFurnishing('');
    setSearchQuery('');
    setPage(1);
  };

  const activeFilterCount =
    (selectedLocality !== 'All Localities' ? 1 : 0) +
    (selectedBhk ? 1 : 0) +
    (selectedFurnishing ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="main-content" style={{ paddingBottom: rentalsCount > 0 ? '7.5rem' : '2rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <KeyRound size={12} /> Verified Rentals
            </span>
            <span className="badge badge-slate">Mumbai Region</span>
            <span className="badge badge-blue">Zero Brokerage Options</span>
          </div>
          <h1 className="page-title">Rental Homes in Mumbai</h1>
          <p className="page-subtitle">
            Browse verified residential rentals with clear monthly rents, security deposits, and maintenance breakdowns.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <span>{totalCount.toLocaleString('en-IN')} Verified Rentals</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Filter Sidebar + Rentals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 290px) 1fr', gap: '2rem', alignItems: 'start' }} className="catalog-layout">
        {/* Left Filter Sidebar */}
        <aside
          className="ivy-card filter-sidebar"
          style={{
            padding: '1.5rem',
            position: 'sticky',
            top: '84px',
            maxHeight: 'calc(100vh - 104px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--border-subtle) transparent'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'sticky',
              top: '-1.5rem',
              marginTop: '-1.5rem',
              paddingTop: '1.5rem',
              backgroundColor: 'var(--bg-surface)',
              zIndex: 5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
              <SlidersHorizontal size={17} color="var(--accent-primary)" />
              <span>Rental Filters</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: '#ef4444', padding: '0.2rem 0.4rem' }}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="rental-search">Property / Society</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="rental-search"
                  type="text"
                  placeholder="e.g. Mantri, Powai, Lake"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Locality Dropdown */}
            <div className="input-group">
              <label className="input-label" htmlFor="rental-locality">Locality</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  id="rental-locality"
                  value={selectedLocality}
                  onChange={(e) => {
                    setSelectedLocality(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ paddingLeft: '34px', fontSize: '0.85rem', textTransform: 'capitalize' }}
                >
                  {LOCALITIES.map((loc) => (
                    <option key={loc} value={loc} style={{ textTransform: 'capitalize' }}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bedrooms (BHK) Filter */}
            <div className="input-group">
              <label className="input-label">Bedrooms (BHK)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
                {BHK_OPTIONS.map((opt) => {
                  const active = selectedBhk === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setSelectedBhk(opt.value);
                        setPage(1);
                      }}
                      style={{
                        padding: '0.45rem 0.2rem',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: active ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
                        color: active ? 'var(--accent-text)' : 'var(--text-body)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt.label.replace(' BHK', 'BHK')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Furnishing Filter */}
            <div className="input-group">
              <label className="input-label" htmlFor="rental-furnishing">Furnishing Type</label>
              <select
                id="rental-furnishing"
                value={selectedFurnishing}
                onChange={(e) => {
                  setSelectedFurnishing(e.target.value);
                  setPage(1);
                }}
                className="input-field"
                style={{ fontSize: '0.85rem' }}
              >
                {FURNISHING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Right Section: Results Header + 2-in-a-row Cards Grid + Pagination */}
        <section style={{ minWidth: 0 }}>
          {/* Summary Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-heading)' }}>{filteredRentals.length}</strong> matching verified rentals
              {selectedLocality !== 'All Localities' && (
                <span> in <strong style={{ color: 'var(--text-heading)', textTransform: 'capitalize' }}>{selectedLocality}</strong></span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Page {page}</span>
            </div>
          </div>

          {/* Error Notice */}
          {apiError && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#991b1b',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {apiError}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div style={{
              padding: '5rem 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}>
              <Loader2 size={36} color="var(--accent-primary)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Fetching rental catalog from live server...
              </p>
            </div>
          ) : filteredRentals.length === 0 ? (
            /* Empty State */
            <div className="ivy-card" style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '1rem'
              }}>
                <FilterX size={26} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-heading)' }}>
                No rentals found matching your criteria
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
                Try expanding your locality selection or removing the furnishing filter to discover more rental properties.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                <RotateCcw size={16} /> Reset All Filters
              </button>
            </div>
          ) : (
            /* Rentals Grid (2 in a row as requested) */
            <>
              <div
                className="catalog-two-col-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1.75rem'
                }}
              >
                {filteredRentals.map((rental) => (
                  <RentalCard
                    key={rental.listing_id}
                    rental={rental}
                    isRevealed={contactRevealedId === rental.listing_id}
                    onToggleReveal={() =>
                      setContactRevealedId((prev) =>
                        prev === rental.listing_id ? null : rental.listing_id
                      )
                    }
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div style={{
                marginTop: '2.5rem',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Page <strong style={{ color: 'var(--text-heading)' }}>{page}</strong> of{' '}
                  <strong style={{ color: 'var(--text-heading)' }}>{totalPages}</strong>
                  <span style={{ marginLeft: '0.75rem', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
                    ({limit} properties per batch • {totalCount.toLocaleString('en-IN')} total)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <span style={{
                    padding: '0.35rem 0.75rem',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-text)',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {page}
                  </span>

                  <button
                    onClick={() => {
                      setPage((prev) => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!hasMore || page >= totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <style>{`
        .filter-sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .filter-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .filter-sidebar::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 4px;
        }
        .filter-sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .filter-sidebar {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
          .catalog-two-col-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
