import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FolderKanban,
  Building,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Tag,
  Eye
} from 'lucide-react';
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

const STATUS_OPTIONS = [
  { label: 'All Project Statuses', value: '' },
  { label: 'Under Construction', value: 'under construction' },
  { label: 'Ready to Move', value: 'ready to move' },
  { label: 'New Launch', value: 'new launch' }
];

// Helper: Format project price range using price_min and price_max
function formatProjectPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Price on Request';
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num > 0) {
    // Values under 100 in the API are already expressed in Crores (e.g. 4.03 -> ₹4.03 Cr)
    return `₹${num.toFixed(2)} Cr`;
  }
  return 'Price on Request';
}

// Helper: Format date cleanly as YYYY-MM-DD (e.g., 2023-11-27)
function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 10);
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

export default function ProjectsPage() {
  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalCount, setTotalCount] = useState(590);
  const [hasMore, setHasMore] = useState(true);

  // Data States
  const [rawProjects, setRawProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  // Fetch projects from GET /v1/projects with pagination
  const fetchProjects = useCallback(async () => {
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
    if (selectedStatus) {
      queryParams.project_status = selectedStatus;
    }

    try {
      const data = await apiClient.getProjects(queryParams);
      const results = Array.isArray(data) ? data : (data.results || []);
      setRawProjects(results);
      if (typeof data.total === 'number') {
        setTotalCount(data.total);
      }
      if (typeof data.has_more === 'boolean') {
        setHasMore(data.has_more);
      } else {
        setHasMore(results.length >= limit);
      }
    } catch (err) {
      console.error('Projects fetch error:', err);
      setApiError(err.message || 'Failed to fetch projects from server.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, selectedLocality, selectedStatus]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Client-side fallback filtering to guarantee UI correctness
  const filteredProjects = useMemo(() => {
    return rawProjects.filter((proj) => {
      // Locality fallback
      if (selectedLocality !== 'All Localities') {
        if (!proj.locality || proj.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
          return false;
        }
      }
      // Status fallback
      if (selectedStatus) {
        if (!proj.project_status || proj.project_status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }
      // Search query fallback
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = proj.apartment_name?.toLowerCase().includes(q);
        const matchDev = proj.developer_name?.toLowerCase().includes(q);
        const matchLoc = proj.locality?.toLowerCase().includes(q);
        const matchRera = proj.rera_number?.toLowerCase().includes(q);
        if (!matchName && !matchDev && !matchLoc && !matchRera) {
          return false;
        }
      }
      return true;
    });
  }, [rawProjects, selectedLocality, selectedStatus, searchQuery]);

  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedStatus('');
    setSearchQuery('');
    setPage(1);
  };

  const activeFilterCount =
    (selectedLocality !== 'All Localities' ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-amber" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <FolderKanban size={12} /> Developer Projects
          </span>
          <span className="badge badge-slate">590 RERA Registered</span>
          <span className="badge badge-emerald">Direct Builder Inventories</span>
        </div>
        <h1 className="page-title">Builder Projects in Mumbai</h1>
        <p className="page-subtitle">
          Track upcoming and under-construction builder developments, launch timelines, unit inventories, and RERA registrations.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="ivy-card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Projects / Developers
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Developer, project name, RERA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Project Status
            </label>
            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '0.875rem' }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Locality Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Locality
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                className="input-field"
                value={selectedLocality}
                onChange={(e) => {
                  setSelectedLocality(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: '2.25rem', fontSize: '0.875rem', textTransform: 'capitalize' }}
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'All Localities' ? 'All Localities' : loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Action */}
          <div>
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary"
              style={{ width: '100%', height: '42px', fontSize: '0.85rem' }}
              disabled={activeFilterCount === 0}
            >
              <RotateCcw size={15} />
              Reset {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </button>
          </div>
        </div>

        {/* Counter Bar */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredProjects.length}</strong> of{' '}
            <strong>{rawProjects.length}</strong> projects loaded for this page
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-amber)'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
              Live RERA registered developments
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
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
          <Loader2 size={36} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Fetching developer project registry...
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="ivy-card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No developer projects match your filter criteria
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
            Try resetting status or locality filters to explore all available developer projects in Mumbai.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            <RotateCcw size={16} /> Reset All Filters
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProjects.map((proj) => {
            const statusClean = proj.project_status || 'Under Construction';
            const statusLower = statusClean.toLowerCase();
            const statusBadgeClass =
              statusLower.includes('ready')
                ? 'badge-emerald'
                : statusLower.includes('launch')
                ? 'badge-blue'
                : 'badge-amber';

            return (
              <div
                key={proj.project_id}
                className="ivy-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: '1px solid var(--border-light)'
                }}
              >
                {/* Header: Developer Name & Status */}
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    gap: '0.5rem'
                  }}>
                    <span className={`badge ${statusBadgeClass}`} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
                      {statusClean}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
                      {proj.rera_number || proj.project_id}
                    </span>
                  </div>

                  {/* Developer Name */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--primary-700)',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <Building size={14} />
                    <span>{proj.developer_name || 'Grade A Developer'}</span>
                  </div>

                  {/* Project Name */}
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    marginBottom: '0.35rem'
                  }}>
                    {proj.apartment_name}
                  </h3>

                  {/* Locality */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    textTransform: 'capitalize'
                  }}>
                    <MapPin size={14} color="var(--primary-600)" />
                    <span>{proj.locality || 'Mumbai'}</span>
                    {proj.total_units && (
                      <>
                        <span style={{ color: 'var(--text-light)' }}>•</span>
                        <span>{proj.total_units.toLocaleString('en-IN')} units</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Body: Price Range & Project Specs */}
                <div>
                  {/* Price Range (Prominent Requirement) */}
                  <div style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Estimated Price Range
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      marginTop: '2px'
                    }}>
                      {formatProjectPrice(proj.price_min)} – {formatProjectPrice(proj.price_max)}
                    </div>
                  </div>

                  {/* Detailed Specs Grid (total_listings, launch_date, possession_date) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    marginBottom: '1rem',
                    fontSize: '0.8rem'
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Total Listings
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-700)', marginTop: '2px' }}>
                        {proj.total_listings ?? 0} Units
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Launch Date
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {formatDate(proj.launch_date)}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                        Possession
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {formatDate(proj.possession_date)}
                      </div>
                    </div>
                  </div>

                  {/* Amenities Chips (if present) */}
                  {Array.isArray(proj.amenities) && proj.amenities.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginBottom: '1rem'
                    }}>
                      {proj.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            backgroundColor: 'var(--bg-main)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                            textTransform: 'capitalize'
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {proj.amenities.length > 3 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 4px' }}>
                          +{proj.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedProjectModal(proj)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <Eye size={14} /> View Development Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && filteredProjects.length > 0 && (
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-xs)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Page <strong style={{ color: 'var(--text-primary)' }}>{page}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalPages}</strong>
            <span style={{ marginLeft: '0.75rem', color: 'var(--text-light)' }}>
              ({limit} projects per page)
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
              backgroundColor: 'var(--accent-amber-light)',
              color: 'var(--accent-amber)',
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
      )}

      {/* Modal: Project Development Details */}
      {selectedProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="ivy-card" style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-amber" style={{ textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                  {selectedProjectModal.project_status}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedProjectModal.apartment_name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Developed by {selectedProjectModal.developer_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="btn btn-ghost"
                style={{ padding: '0.4rem', borderRadius: '50%', minWidth: 'auto' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRICE BRACKET</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-700)', marginTop: '2px' }}>
                {formatProjectPrice(selectedProjectModal.price_min)} – {formatProjectPrice(selectedProjectModal.price_max)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>RERA REGISTRATION</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {selectedProjectModal.rera_number || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL LISTINGS</div>
                <div style={{ fontWeight: 700 }}>{selectedProjectModal.total_listings} active listings</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LAUNCH DATE</div>
                <div style={{ fontWeight: 700 }}>{formatDate(selectedProjectModal.launch_date)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>POSSESSION DATE</div>
                <div style={{ fontWeight: 700 }}>{formatDate(selectedProjectModal.possession_date)}</div>
              </div>
              {selectedProjectModal.total_towers && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOWERS & FLOORS</div>
                  <div style={{ fontWeight: 700 }}>
                    {selectedProjectModal.total_towers} Towers • {selectedProjectModal.total_floors || 'Multiple'} Floors
                  </div>
                </div>
              )}
              {selectedProjectModal.min_area_sqft && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>UNIT AREA SPAN</div>
                  <div style={{ fontWeight: 700 }}>
                    {selectedProjectModal.min_area_sqft} – {selectedProjectModal.max_area_sqft} sqft
                  </div>
                </div>
              )}
            </div>

            {Array.isArray(selectedProjectModal.amenities) && selectedProjectModal.amenities.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  COMMUNITY AMENITIES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedProjectModal.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.78rem',
                        textTransform: 'capitalize',
                        fontWeight: 500
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedProjectModal(null)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Close Development View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
