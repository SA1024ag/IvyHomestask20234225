import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FilterX } from 'lucide-react';
import { apiClient } from '../api/client';
import { useCompare } from '../context/CompareContext';
import RentalCard from '../components/RentalCard';
import { fixCoordinates } from '../utils/dataUtils';

// Animation variants
const gridContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};
const cardItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

// ─── Rental Skeleton Card ────────────────────────────────────────────────────
function RentalCardSkeleton() {
  return (
    <div className="ivy-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ width: '100%', aspectRatio: '16 / 10', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite' }} />
      </div>
      {/* Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
        <div style={{ height: '28px', width: '45%', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite' }} />
        </div>
        <div style={{ height: '18px', width: '75%', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite 0.1s' }} />
        </div>
        <div style={{ height: '14px', width: '40%', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite 0.2s' }} />
        </div>
        {/* Financial box */}
        <div style={{ height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden', marginTop: '0.25rem' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite 0.15s' }} />
        </div>
        {/* Spec row */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ height: '20px', flex: 1, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: `rentalShimmer 1.6s infinite ${i * 0.1}s` }} />
            </div>
          ))}
        </div>
      </div>
      {/* Action row */}
      <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
        <div style={{ height: '36px', width: '80px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite' }} />
        </div>
        <div style={{ height: '36px', flex: 1, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface-hover) 50%, transparent 100%)', animation: 'rentalShimmer 1.6s infinite 0.1s' }} />
        </div>
      </div>
      <style>{`
        @keyframes rentalShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

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
  const { count: rentalsCount } = useCompare();

  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedBhk, setSelectedBhk] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting States: default is 'newest_desc' (Newly listed rentals)
  const [sortOption, setSortOption] = useState('newest_desc');

  // Pagination States
  const [page, setPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');

  useEffect(() => {
    setJumpInput(String(page));
  }, [page]);

  // Data States
  const [rawRentals, setRawRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [contactRevealedId, setContactRevealedId] = useState(null);

  // Load complete verified rentals dataset with coordinate correction
  useEffect(() => {
    let isMounted = true;
    async function loadRentalCatalog() {
      setIsLoading(true);
      setApiError(null);
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}rentals.json`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            // Fix swapped lat/lon on 11 affected rental records
            setRawRentals(data.map(fixCoordinates));
            setIsLoading(false);
            return;
          }
        }
        const apiData = await apiClient.getRentals({ limit: 50 });
        const results = Array.isArray(apiData) ? apiData : (apiData.results || []);
        if (isMounted) {
          setRawRentals(results.map(fixCoordinates));
        }
      } catch (err) {
        console.warn('Rentals load error, attempting API fallback:', err);
        try {
          const apiData = await apiClient.getRentals({ limit: 50 });
          const results = Array.isArray(apiData) ? apiData : (apiData.results || []);
          if (isMounted) setRawRentals(results.map(fixCoordinates));
        } catch {
          if (isMounted) setApiError('Could not load rentals from server.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRentalCatalog();
    return () => { isMounted = false; };
  }, []);

  // Reset to page 1 whenever any filter or sort option changes
  useEffect(() => {
    setPage(1);
  }, [selectedLocality, selectedBhk, selectedFurnishing, minPrice, maxPrice, searchQuery, sortOption]);

  // Client-Side Fallback Filtering:
  // Strictly filters results in case API leaked inactive records (is_live: false) or ignored query parameters (min_price, max_price, furnishing)
  const filteredRentals = useMemo(() => {
    return rawRentals.filter((item) => {
      // Inactive rentals leakage check: strictly only render active rentals where is_live === true
      if (item.is_live !== undefined && item.is_live !== null && item.is_live !== true) {
        return false;
      }

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
      // Furnishing fallback (server silently ignores furnishing parameter)
      if (selectedFurnishing) {
        if (!item.furnishing || item.furnishing.trim().toLowerCase() !== selectedFurnishing.trim().toLowerCase()) {
          return false;
        }
      }
      // Price range fallback: price >= requested_min_price (server silently ignores min_price & max_price)
      if (minPrice !== '' && minPrice !== null && minPrice !== undefined) {
        if (Number(item.price) < Number(minPrice)) {
          return false;
        }
      }
      if (maxPrice !== '' && maxPrice !== null && maxPrice !== undefined) {
        if (Number(item.price) > Number(maxPrice)) {
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
  }, [rawRentals, selectedLocality, selectedBhk, selectedFurnishing, minPrice, maxPrice, searchQuery]);

  // Client-Side Sorting Fallback:
  // Server ignores order=desc and always returns asc. We sort/reverse locally on client!
  const sortedRentals = useMemo(() => {
    const list = [...filteredRentals];
    const [field, order] = sortOption.split('_');

    list.sort((a, b) => {
      if (field === 'newest') {
        const tA = new Date(a.posted_at).getTime() || 0;
        const tB = new Date(b.posted_at).getTime() || 0;
        return order === 'desc' ? tB - tA : tA - tB;
      }
      if (field === 'price') {
        const pA = Number(a.price) || 0;
        const pB = Number(b.price) || 0;
        return order === 'desc' ? pB - pA : pA - pB;
      }
      if (field === 'area') {
        const aA = Number(a.carpet_area) || 0;
        const aB = Number(b.carpet_area) || 0;
        return order === 'desc' ? aB - aA : aA - aB;
      }
      return 0;
    });

    return list;
  }, [filteredRentals, sortOption]);

  // Client-Side Pagination across complete filtered/sorted array
  const pageSize = 12;
  const totalPages = Math.ceil(sortedRentals.length / pageSize) || 1;

  const paginatedRentals = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedRentals.slice(startIndex, startIndex + pageSize);
  }, [sortedRentals, page, pageSize]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedBhk('');
    setSelectedFurnishing('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortOption('newest_desc');
    setPage(1);
  };

  const activeFilterCount =
    (selectedLocality !== 'All Localities' ? 1 : 0) +
    (selectedBhk ? 1 : 0) +
    (selectedFurnishing ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ paddingBottom: rentalsCount > 0 ? '7.5rem' : '2rem' }}
    >
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">
              Verified Rentals
            </span>
            <span className="badge badge-slate">Mumbai Region</span>
            <span className="badge badge-blue">Zero Brokerage Options</span>
          </div>
          <h1 className="page-title">Rental Homes in Mumbai</h1>
          <p className="page-subtitle">
            Browse verified residential rentals with clear monthly rents, security deposits, and maintenance breakdowns.
          </p>
        </div>

        {/* Total stats pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <span>{sortedRentals.length.toLocaleString('en-IN')} Matched Rentals</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Filter Sidebar + Rentals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 290px) 1fr', gap: '2rem', alignItems: 'start' }} className="catalog-layout">
        {/* Left Filter Sidebar with Optimized Smooth Scrolling */}
        <aside
          className="ivy-card filter-sidebar"
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: '84px',
            maxHeight: 'calc(100vh - 100px)',
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {/* Pinned non-scrolling header */}
          <div
            style={{
              padding: '1.25rem 1.25rem 0.85rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)',
              zIndex: 5
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
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
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Smooth scrollable filter controls body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.1rem 1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              overscrollBehavior: 'contain',
              scrollBehavior: 'smooth'
            }}
          >
            {/* Search Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="rental-search">Property / Society</label>
              <div>
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
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Locality Dropdown */}
            <div className="input-group">
              <label className="input-label" htmlFor="rental-locality">Locality</label>
              <div>
                <select
                  id="rental-locality"
                  value={selectedLocality}
                  onChange={(e) => {
                    setSelectedLocality(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}
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

            {/* Monthly Rent Range Filter */}
            <div className="input-group">
              <label className="input-label">Monthly Rent (₹)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem' }}
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem' }}
                />
              </div>
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
              Total Matched Responses: <strong style={{ color: 'var(--text-heading)' }}>{sortedRentals.length.toLocaleString('en-IN')}</strong>
              {selectedLocality !== 'All Localities' && (
                <span> in <strong style={{ color: 'var(--text-heading)', textTransform: 'capitalize' }}>{selectedLocality}</strong></span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '150px'
                  }}
                  aria-label="Sort rentals"
                >
                  <option value="newest_desc">Newly Listed (Default)</option>
                  <option value="price_asc">Rent: Low to High</option>
                  <option value="price_desc">Rent: High to Low</option>
                  <option value="area_asc">Carpet: Small to Large</option>
                  <option value="area_desc">Carpet: Large to Small</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Page {page}</span>
              </div>
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

          {/* Skeleton Loading State */}
          {isLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <RentalCardSkeleton key={i} />
              ))}
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
                borderRadius: 'var(--radius-xs)',
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
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Rentals Grid (2 in a row as requested) */
            <>
              <motion.div
                variants={gridContainerVariants}
                initial="hidden"
                animate="show"
                className="catalog-two-col-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '1.75rem'
                }}
              >
                {paginatedRentals.map((rental) => (
                  <motion.div key={rental.listing_id} variants={cardItemVariants}>
                    <RentalCard
                      rental={rental}
                      isRevealed={contactRevealedId === rental.listing_id}
                      onToggleReveal={() =>
                        setContactRevealedId((prev) =>
                          prev === rental.listing_id ? null : rental.listing_id
                        )
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls */}
              <div style={{
                marginTop: '2.5rem',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Page <strong style={{ color: 'var(--text-heading)' }}>{page}</strong> of{' '}
                  <strong style={{ color: 'var(--text-heading)' }}>{totalPages}</strong>
                  <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    • <strong style={{ color: 'var(--text-heading)' }}>{sortedRentals.length.toLocaleString('en-IN')}</strong> total matched responses
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setPage((prev) => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>

                  {/* Interactive Page Jumper */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const p = parseInt(jumpInput, 10);
                      if (!isNaN(p)) {
                        const clamped = Math.min(totalPages, Math.max(1, p));
                        setPage(clamped);
                        setJumpInput(String(clamped));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpInput}
                      onChange={(e) => setJumpInput(e.target.value)}
                      onBlur={() => {
                        const p = parseInt(jumpInput, 10);
                        if (!isNaN(p)) {
                          const clamped = Math.min(totalPages, Math.max(1, p));
                          if (clamped !== page) {
                            setPage(clamped);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          setJumpInput(String(clamped));
                        } else {
                          setJumpInput(String(page));
                        }
                      }}
                      aria-label="Hop to page number"
                      title="Type any page number and press Enter"
                      style={{
                        width: '54px',
                        height: '32px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        color: 'var(--accent-text)',
                        backgroundColor: 'var(--accent-subtle)',
                        border: '1px solid var(--accent-border)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none',
                        MozAppearance: 'textfield'
                      }}
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>of {totalPages}</span>
                    <button
                      type="submit"
                      className="btn btn-secondary btn-sm"
                      style={{ height: '32px', padding: '0 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}
                      title="Hop to page"
                    >
                      Go
                    </button>
                  </form>

                  <button
                    onClick={() => {
                      setPage((prev) => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
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
    </motion.div>
  );
}
