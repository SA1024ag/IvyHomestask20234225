import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Home,
  CheckCircle2,
  Loader2,
  Sparkles,
  FilterX
} from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { apiClient } from '../api/client';

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
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under ₹2 Cr', min: '', max: '20000000' },
  { label: '₹2 Cr – ₹4 Cr', min: '20000000', max: '40000000' },
  { label: '₹4 Cr – ₹7 Cr', min: '40000000', max: '70000000' },
  { label: 'Above ₹7 Cr', min: '70000000', max: '' }
];

export default function ListingsPage() {
  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedBhk, setSelectedBhk] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Data States
  const [rawListings, setRawListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [totalServerCount, setTotalServerCount] = useState(5100);

  // Fetch listings from GET /v1/listings with API filter query parameters
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    const queryParams = {
      page: page,
      limit: 50, // Request page batch from API
      offset: (page - 1) * 50
    };

    // Pass filters to the server
    if (selectedLocality !== 'All Localities') {
      queryParams.locality = selectedLocality.toLowerCase();
    }
    if (selectedBhk) {
      queryParams.bhk = selectedBhk;
    }
    if (minPrice) {
      queryParams.min_price = minPrice;
    }
    if (maxPrice) {
      queryParams.max_price = maxPrice;
    }
    if (selectedFurnishing) {
      queryParams.furnishing = selectedFurnishing;
    }

    try {
      const data = await apiClient.getListings(queryParams);
      const results = Array.isArray(data) ? data : (data.results || []);
      setRawListings(results);
      if (typeof data.total === 'number') {
        setTotalServerCount(data.total);
      }
    } catch (err) {
      console.error('API listing fetch error:', err);
      setApiError('Could not connect to live API server. Please ensure you are authenticated.');
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedLocality, selectedBhk, minPrice, maxPrice, selectedFurnishing]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // CRITICAL CLIENT-SIDE FALLBACK FILTERING:
  // Strictly filter the resulting array on client-side to enforce filters even if server ignores them!
  const filteredListings = useMemo(() => {
    return rawListings.filter((item) => {
      // 1. Locality Filter
      if (selectedLocality !== 'All Localities') {
        if (!item.locality || item.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
          return false;
        }
      }

      // 2. BHK / Bedroom Filter
      if (selectedBhk) {
        if (selectedBhk === '5') {
          if (Number(item.bedroom) < 5) return false;
        } else {
          if (Number(item.bedroom) !== Number(selectedBhk)) return false;
        }
      }

      // 3. Price Range Filters
      if (minPrice && Number(item.price) < Number(minPrice)) {
        return false;
      }
      if (maxPrice && Number(item.price) > Number(maxPrice)) {
        return false;
      }

      // 4. Furnishing Filter
      if (selectedFurnishing) {
        if (!item.furnishing || item.furnishing.toLowerCase() !== selectedFurnishing.toLowerCase()) {
          return false;
        }
      }

      // 5. Search Text Filter (Apartment name or description)
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

  // Client-side pagination slice for pristine grid presentation
  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * limit;
    // If the server-side query already paginated, we display the filtered set
    return filteredListings.slice(0, limit);
  }, [filteredListings, page, limit]);

  const hasActiveFilters =
    selectedLocality !== 'All Localities' ||
    selectedBhk !== '' ||
    selectedFurnishing !== '' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    searchQuery !== '';

  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedBhk('');
    setSelectedFurnishing('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setPage(1);
  };

  const handlePricePreset = (preset) => {
    setMinPrice(preset.min);
    setMaxPrice(preset.max);
    setPage(1);
  };

  return (
    <div className="main-content">
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-emerald">Verified Properties</span>
            <span className="badge badge-slate">Mumbai (City ID: 5)</span>
          </div>
          <h1 className="page-title">Mumbai Property Catalog</h1>
          <p className="page-subtitle">
            Browse live verified residential sale listings with real-time strict client-side filtering.
          </p>
        </div>

        {/* Total stats pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}>
            <CheckCircle2 size={15} />
            <span>5,100 Verified Records in City</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Filter Sidebar + Listings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 290px) 1fr', gap: '2rem', alignItems: 'start' }} className="catalog-layout">
        
        {/* Left Filter Sidebar */}
        <aside className="ivy-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <SlidersHorizontal size={18} color="var(--primary-600)" />
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="search-input">Property Name / Keyword</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
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
                  style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
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
                        border: active ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                        backgroundColor: active ? 'var(--primary-50)' : 'var(--bg-main)',
                        color: active ? 'var(--primary-800)' : 'var(--text-secondary)',
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
              <label className="input-label">Price Range</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.5rem' }}>
                {PRICE_PRESETS.map((p) => {
                  const isPresetActive = minPrice === p.min && maxPrice === p.max;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePricePreset(p)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: isPresetActive ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: isPresetActive ? '1.5px solid var(--primary-600)' : '1px solid var(--border-light)',
                        backgroundColor: isPresetActive ? 'var(--primary-50)' : 'transparent',
                        color: isPresetActive ? 'var(--primary-800)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min INR"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                />
                <input
                  type="number"
                  placeholder="Max INR"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.78rem', padding: '0.45rem' }}
                />
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
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredListings.length}</strong> matching verified listings
              {selectedLocality !== 'All Localities' && ` in ${selectedLocality}`}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Page {page}</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div style={{
              minHeight: '340px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <Loader2 size={36} color="var(--primary-600)" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Querying GET /v1/listings with client-side verification...
              </div>
            </div>
          ) : apiError ? (
            <div className="ivy-card" style={{ padding: '2rem', textAlign: 'center', color: '#b91c1c', backgroundColor: '#fef2f2' }}>
              <p style={{ fontWeight: 600 }}>{apiError}</p>
              <button onClick={fetchListings} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
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
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-50)',
                color: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FilterX size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                padding: '1rem 1.5rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} />
                  <span>Previous Page</span>
                </button>

                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Page {page}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={filteredListings.length < limit}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next Page</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Responsive media styling */}
      <style>{`
        @media (max-width: 868px) {
          .catalog-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
