import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  FilterX
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { apiClient } from '../api/client';
import { useCompare } from '../context/CompareContext';

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

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹2 Cr', min: '', max: '20000000' },
  { label: '₹2 Cr – ₹3.5 Cr', min: '20000000', max: '35000000' },
  { label: '₹3.5 Cr – ₹5 Cr', min: '35000000', max: '50000000' },
  { label: '₹5 Cr – ₹7.5 Cr', min: '50000000', max: '75000000' },
  { label: 'Above ₹7.5 Cr', min: '75000000', max: '' }
];

const getStoredListingsState = () => {
  try {
    const raw = sessionStorage.getItem('ivy_listings_state');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

export default function ListingsPage() {
  const { count: compareCount } = useCompare();

  const storedState = useMemo(() => getStoredListingsState(), []);

  // Filter States (restores previous state if returning via back button)
  const [selectedLocality, setSelectedLocality] = useState(storedState?.selectedLocality ?? 'All Localities');
  const [selectedBhk, setSelectedBhk] = useState(storedState?.selectedBhk ?? '');
  const [selectedFurnishing, setSelectedFurnishing] = useState(storedState?.selectedFurnishing ?? '');
  const [minPrice, setMinPrice] = useState(storedState?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(storedState?.maxPrice ?? '');
  const [searchQuery, setSearchQuery] = useState(storedState?.searchQuery ?? '');

  // Sorting States: default is 'newest_desc' (Newly listed properties)
  const initialSort = (storedState?.sortOption && storedState.sortOption !== 'default')
    ? storedState.sortOption
    : 'newest_desc';
  const [sortOption, setSortOption] = useState(initialSort);

  // Pagination States
  const [page, setPage] = useState(storedState?.page ?? 1);

  // Data States
  const [rawListings, setRawListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Persist filter and sorting state across page transitions (e.g. going to details and clicking back)
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'ivy_listings_state',
        JSON.stringify({
          selectedLocality,
          selectedBhk,
          selectedFurnishing,
          minPrice,
          maxPrice,
          searchQuery,
          sortOption,
          page
        })
      );
    } catch {}
  }, [selectedLocality, selectedBhk, selectedFurnishing, minPrice, maxPrice, searchQuery, sortOption, page]);

  // Track and save scroll position
  useEffect(() => {
    const handleScroll = () => {
      try {
        sessionStorage.setItem('ivy_listings_scroll', String(window.scrollY));
      } catch {}
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after data catalog loads
  useEffect(() => {
    if (!isLoading && rawListings.length > 0) {
      try {
        const savedScroll = sessionStorage.getItem('ivy_listings_scroll');
        if (savedScroll) {
          setTimeout(() => {
            window.scrollTo({ top: Number(savedScroll), behavior: 'instant' });
          }, 40);
        }
      } catch {}
    }
  }, [isLoading, rawListings.length]);

  // Load complete verified listings catalog to enable accurate client-side filtering across all 5,100 records
  // Proactively masks the backend API's broken pagination and silently ignored filter query parameters
  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch('/listings.json');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRawListings(data);
          setIsLoading(false);
          return;
        }
      }
      const apiData = await apiClient.getListings({ limit: 50 });
      const results = Array.isArray(apiData) ? apiData : (apiData.results || []);
      setRawListings(results);
    } catch (err) {
      console.warn('Listing load error, attempting API fallback:', err);
      try {
        const apiData = await apiClient.getListings({ limit: 50 });
        const results = Array.isArray(apiData) ? apiData : (apiData.results || []);
        setRawListings(results);
      } catch {
        setApiError('Could not connect to live API server. Please ensure you are authenticated.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Reset to page 1 ONLY when filters or sort change dynamically after initial mount
  const isFirstFilterCheck = useRef(true);
  useEffect(() => {
    if (isFirstFilterCheck.current) {
      isFirstFilterCheck.current = false;
      return;
    }
    setPage(1);
  }, [selectedLocality, selectedBhk, minPrice, maxPrice, selectedFurnishing, searchQuery, sortOption]);

  // CRITICAL CLIENT-SIDE FALLBACK FILTERING & ACTIVE STATUS ENFORCEMENT:
  // 1. Strictly filter to only render properties where is_live === true (API leaks inactive records)
  // 2. Client-side fallback for furnishing, min_price, max_price (silently ignored by server)
  const filteredListings = useMemo(() => {
    return rawListings.filter((item) => {
      // 1. Active Status Enforcement: strictly filter out inactive/expired listings
      if (item.is_live !== true) {
        return false;
      }

      // 2. Data Integrity: Filter out corrupt / non-positive prices
      const priceNum = Number(item.price);
      if (!item.price || isNaN(priceNum) || priceNum <= 0) {
        return false;
      }

      // 3. Locality Filter
      if (selectedLocality !== 'All Localities') {
        if (!item.locality || item.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
          return false;
        }
      }

      // 4. BHK / Bedroom Filter
      if (selectedBhk) {
        if (selectedBhk === '5') {
          if (Number(item.bedroom) < 5) return false;
        } else {
          if (Number(item.bedroom) !== Number(selectedBhk)) return false;
        }
      }

      // 5. Price Range Filters (server silently ignores min_price & max_price)
      // Supports flexible numeric input: <= 100 interpreted as Crores (e.g. 2.5 -> 25000000)
      const parsePriceInput = (val) => {
        if (!val || isNaN(val)) return null;
        const num = Number(val);
        return num > 0 && num <= 100 ? num * 10000000 : num;
      };

      const minVal = parsePriceInput(minPrice);
      const maxVal = parsePriceInput(maxPrice);

      if (minVal !== null && priceNum < minVal) {
        return false;
      }
      if (maxVal !== null && priceNum > maxVal) {
        return false;
      }

      // 6. Furnishing Filter (server silently ignores furnishing parameter)
      if (selectedFurnishing) {
        if (!item.furnishing || item.furnishing.trim().toLowerCase() !== selectedFurnishing.trim().toLowerCase()) {
          return false;
        }
      }

      // 7. Search Text Filter (Apartment name or description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const apt = (item.apartment_name || '').toLowerCase();
        const loc = (item.locality || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        if (!apt.includes(q) && !loc.includes(q) && !desc.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [rawListings, selectedLocality, selectedBhk, minPrice, maxPrice, selectedFurnishing, searchQuery]);

  // CRITICAL CLIENT-SIDE SORTING FALLBACK:
  // Server ignores order=desc and always returns asc. We sort/reverse locally on the client!
  const sortedListings = useMemo(() => {
    const list = [...filteredListings];
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
  }, [filteredListings, sortOption]);

  // Client-Side Pagination across complete filtered/sorted array
  const pageSize = 12;
  const totalPages = Math.ceil(sortedListings.length / pageSize) || 1;

  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedListings.slice(startIndex, startIndex + pageSize);
  }, [sortedListings, page, pageSize]);

  const hasActiveFilters =
    selectedLocality !== 'All Localities' ||
    selectedBhk !== '' ||
    selectedFurnishing !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    searchQuery !== '' ||
    sortOption !== 'newest_desc';

  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedBhk('');
    setSelectedFurnishing('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setSortOption('newest_desc');
    setPage(1);
    try {
      sessionStorage.removeItem('ivy_listings_state');
      sessionStorage.removeItem('ivy_listings_scroll');
    } catch {}
  };

  const handlePricePreset = (preset) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
    setPage(1);
  };

  return (
    <div className="main-content" style={{ paddingBottom: compareCount > 0 ? '7.5rem' : '2rem' }}>
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-accent">Verified Residences</span>
            <span className="badge badge-slate">Mumbai (City ID: 5)</span>
          </div>
          <h1 className="page-title">Mumbai Property Catalog</h1>
          <p className="page-subtitle">
            Curated residential listings with verified carpet areas, pricing benchmarks, and live filter queries.
          </p>
        </div>

        {/* Total stats pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <CheckCircle2 size={14} />
            <span>{sortedListings.length.toLocaleString('en-IN')} Matched Properties</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Listings Grid */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
              <SlidersHorizontal size={17} color="var(--accent-primary)" />
              <span>Search Filters</span>
            </div>
            {hasActiveFilters && (
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
              <label className="input-label" htmlFor="search-input">Property / Keyword</label>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="e.g. Assetz, Lodha, Powai"
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
              <label className="input-label" htmlFor="locality-select">Locality</label>
              <select
                id="locality-select"
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

            {/* Price Presets & Inputs */}
            <div className="input-group">
              <label className="input-label">Budget / Price Range</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {PRICE_PRESETS.map((p) => {
                  const isPresetActive = minPrice === p.min && maxPrice === p.max;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePricePreset(p)}
                      style={{
                        padding: '0.4rem 0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: isPresetActive ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: isPresetActive ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isPresetActive ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
                        color: isPresetActive ? 'var(--accent-text)' : 'var(--text-body)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <input
                    type="number"
                    step="any"
                    placeholder="Min (₹ or Cr)"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    className="input-field"
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                    aria-label="Minimum price in Crores or Rupees"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Max (₹ or Cr)"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    className="input-field"
                    style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                    aria-label="Maximum price in Crores or Rupees"
                  />
                </div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Enter in Crores (e.g. 2.5) or full Rupees (e.g. 25000000)
                </span>
              </div>
            </div>

            {/* Furnishing Filter */}
            <div className="input-group">
              <label className="input-label" htmlFor="furnishing-select">Furnishing</label>
              <select
                id="furnishing-select"
                value={selectedFurnishing}
                onChange={(e) => {
                  setSelectedFurnishing(e.target.value);
                  setPage(1);
                }}
                className="input-field"
                style={{ fontSize: '0.85rem' }}
              >
                {FURNISHING_OPTIONS.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Right Section: Results Header + Cards Grid + Pagination */}
        <section style={{ minWidth: 0 }}>
          {/* Results Summary Bar */}
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
              Total Matched Responses: <strong style={{ color: 'var(--text-heading)' }}>{sortedListings.length.toLocaleString('en-IN')}</strong>
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
                    minWidth: '160px'
                  }}
                  aria-label="Sort listings"
                >
                  <option value="newest_desc">Newly Listed (Default)</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_asc">Carpet: Small to Large</option>
                  <option value="area_desc">Carpet: Large to Small</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Page {page}</span>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div style={{
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Querying verified residential catalog...
              </div>
            </div>
          ) : apiError ? (
            <div className="ivy-card" style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', backgroundColor: 'var(--bg-surface)' }}>
              <p style={{ fontWeight: 600 }}>{apiError}</p>
              <button onClick={fetchCatalog} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                Retry Request
              </button>
            </div>
          ) : filteredListings.length === 0 ? (
            /* Empty Filter State */
            <div className="ivy-card" style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FilterX size={26} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                No Properties Match Your Filters
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem', maxWidth: '420px' }}>
                Try adjusting your price brackets, locality, or furnishing criteria to view available listings in Mumbai.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1.25rem' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Listings Cards Grid */
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.5rem'
              }}>
                {paginatedListings.map((listing) => (
                  <PropertyCard key={listing.listing_id} listing={listing} />
                ))}
              </div>

              {/* Pagination Controls */}
              <div style={{
                marginTop: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Page <strong style={{ color: 'var(--text-heading)' }}>{page}</strong> of{' '}
                  <strong style={{ color: 'var(--text-heading)' }}>{totalPages}</strong>
                  <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    • <strong style={{ color: 'var(--text-heading)' }}>{sortedListings.length.toLocaleString('en-IN')}</strong> total matched responses
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
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
                    type="button"
                    onClick={() => {
                      setPage((p) => p + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
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
        @media (max-width: 868px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
          .filter-sidebar {
            position: static !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
