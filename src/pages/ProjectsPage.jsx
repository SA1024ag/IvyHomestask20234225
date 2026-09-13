import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FilterX, X, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useCompare } from '../context/CompareContext';
import ProjectCard, { formatProjectPrice, formatDate } from '../components/ProjectCard';

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

export default function ProjectsPage() {
  const { projectsCount } = useCompare();

  // Filter States
  const [selectedLocality, setSelectedLocality] = useState('All Localities');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting States: server silently ignores order=desc, so client performs local sort
  const [sortOption, setSortOption] = useState('default');

  // Pagination States
  const [page, setPage] = useState(1);
  const [jumpInput, setJumpInput] = useState('1');
  const [limit] = useState(12);
  const [totalCount, setTotalCount] = useState(569);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setJumpInput(String(page));
  }, [page]);

  // Data States
  const [rawProjects, setRawProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [selectedProjectModal, setSelectedProjectModal] = useState(null);

  // Fetch projects from GET /v1/projects strictly using offset and limit (max 50)
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    const safeLimit = Math.min(limit, 50);
    const queryParams = {
      offset: (page - 1) * safeLimit,
      limit: safeLimit,
    };

    if (selectedLocality !== 'All Localities') {
      queryParams.locality = selectedLocality.toLowerCase();
    }
    if (selectedStatus) {
      queryParams.project_status = selectedStatus;
    }

    try {
      const data = await apiClient.getProjects(queryParams);
      // Parse envelope: { limit, offset, count, total, has_more, results }
      const results = Array.isArray(data) ? data : (data.results || []);

      // Convert project price_min & price_max from floating-point Crores/Lakhs to full Rupees
      // Values >= 20 represent Lakhs (e.g. 90.8 L = 9,080,000), values < 20 represent Crores (e.g. 2.94 Cr = 29,400,000)
      const normalizeProjectPrice = (val) => {
        if (val === null || val === undefined || isNaN(val) || val <= 0) return null;
        const num = Number(val);
        if (num >= 100000) return num;
        if (num >= 20) return Math.round(num * 100000);
        return Math.round(num * 10000000);
      };

      const convertedProjects = results.map((proj) => ({
        ...proj,
        price_min: normalizeProjectPrice(proj.price_min),
        price_max: normalizeProjectPrice(proj.price_max),
      }));
      setRawProjects(convertedProjects);
      if (typeof data.total === 'number') {
        setTotalCount(data.total);
      }
      if (typeof data.has_more === 'boolean') {
        setHasMore(data.has_more);
      } else {
        setHasMore(results.length >= safeLimit);
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

  // Client-side sorting: Server silently ignores order=desc, so we locally sort/reverse
  const sortedProjects = useMemo(() => {
    const list = [...filteredProjects];
    if (sortOption === 'price_asc') {
      list.sort((a, b) => (Number(a.price_min) || 0) - (Number(b.price_min) || 0));
    } else if (sortOption === 'price_desc') {
      // Server ignores order=desc; apply local descending sort
      list.sort((a, b) => (Number(b.price_min) || 0) - (Number(a.price_min) || 0));
    } else if (sortOption === 'name_asc') {
      list.sort((a, b) => (a.apartment_name || '').localeCompare(b.apartment_name || ''));
    } else if (sortOption === 'name_desc') {
      // Server ignores order=desc; apply local descending sort
      list.sort((a, b) => (b.apartment_name || '').localeCompare(a.apartment_name || ''));
    } else if (sortOption === 'inventory_desc') {
      list.sort((a, b) => (Number(b.total_listings) || 0) - (Number(a.total_listings) || 0));
    }
    return list;
  }, [filteredProjects, sortOption]);

  const handleResetFilters = () => {
    setSelectedLocality('All Localities');
    setSelectedStatus('');
    setSearchQuery('');
    setSortOption('default');
    setPage(1);
  };

  const activeFilterCount =
    (selectedLocality !== 'All Localities' ? 1 : 0) +
    (selectedStatus ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ paddingBottom: projectsCount > 0 ? '7.5rem' : '2rem' }}
    >
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-amber">
              Developer Projects
            </span>
            <span className="badge badge-slate">Mumbai Region</span>
            <span className="badge badge-emerald">Direct Builder Inventories</span>
          </div>
          <h1 className="page-title">Builder Projects in Mumbai</h1>
          <p className="page-subtitle">
            Track upcoming and under-construction builder developments, launch timelines, unit inventories, and RERA registrations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge badge-amber" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            <span>{totalCount.toLocaleString('en-IN')} RERA Registered</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Filter Sidebar + Projects Grid */}
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
              <span>Project Filters</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search Input */}
            <div className="input-group">
              <label className="input-label" htmlFor="project-search">Search Projects / Developers</label>
              <div>
                <input
                  id="project-search"
                  type="text"
                  placeholder="Developer, project, RERA..."
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
              <label className="input-label" htmlFor="project-locality">Locality</label>
              <div>
                <select
                  id="project-locality"
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
                      {loc === 'All Localities' ? 'All Localities' : loc.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Status Dropdown */}
            <div className="input-group">
              <label className="input-label" htmlFor="project-status">Project Status</label>
              <div>
                <select
                  id="project-status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                  style={{ fontSize: '0.85rem' }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Quick Selection Buttons */}
            <div className="input-group">
              <label className="input-label">Quick Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = selectedStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(opt.value);
                        setPage(1);
                      }}
                      style={{
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 500,
                        borderRadius: 'var(--radius-sm)',
                        border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: active ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
                        color: active ? 'var(--accent-text)' : 'var(--text-body)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{opt.label}</span>
                      {active && (
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '1px',
                          backgroundColor: 'var(--accent-primary)'
                        }} />
                      )}
                    </button>
                  );
                })}
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
            justifyContent: selectedLocality !== 'All Localities' ? 'space-between' : 'flex-end',
            marginBottom: '1.25rem',
            padding: '0.65rem 1.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {selectedLocality !== 'All Localities' && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Projects in <strong style={{ color: 'var(--text-heading)', textTransform: 'capitalize' }}>{selectedLocality}</strong></span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="input-field"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    minWidth: '150px'
                  }}
                  aria-label="Sort developer projects"
                >
                  <option value="default">Default Registry Order</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="inventory_desc">Available Units: High to Low</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Page {page} of {totalPages}</span>
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
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Fetching developer project registry...
              </p>
            </div>
          ) : sortedProjects.length === 0 ? (
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
                No developer projects match your criteria
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
                Try resetting status or locality filters to explore all available developer projects in Mumbai.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Projects Grid (2 in a row as requested) */
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
              {sortedProjects.map((proj) => (
                <motion.div key={proj.project_id} variants={cardItemVariants}>
                  <ProjectCard
                    proj={proj}
                    onViewPlan={(project) => setSelectedProjectModal(project)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination Controls */}
          {!isLoading && filteredProjects.length > 0 && (
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
                  ({limit} projects per batch • {totalCount.toLocaleString('en-IN')} total)
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
                  disabled={!hasMore || page >= totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal: Project Development Details */}
      {selectedProjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--bg-modal)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
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
            boxShadow: 'var(--shadow-float)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-amber" style={{ textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                  {selectedProjectModal.project_status}
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>{selectedProjectModal.apartment_name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Developed by {selectedProjectModal.developer_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="btn btn-ghost"
                style={{ padding: '0.4rem', borderRadius: 'var(--radius-xs)', minWidth: 'auto' }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1rem',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRICE BRACKET</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-text)', marginTop: '2px' }}>
                {formatProjectPrice(selectedProjectModal.price_min)} – {formatProjectPrice(selectedProjectModal.price_max)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {selectedProjectModal.price_min ? `₹${Number(selectedProjectModal.price_min).toLocaleString('en-IN')}` : '—'} – {selectedProjectModal.price_max ? `₹${Number(selectedProjectModal.price_max).toLocaleString('en-IN')}` : '—'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>RERA REGISTRATION</div>
                <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-heading)' }}>
                  {selectedProjectModal.rera_number || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOTAL LISTINGS</div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{selectedProjectModal.total_listings} active listings</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>LAUNCH DATE</div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{formatDate(selectedProjectModal.launch_date)}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>POSSESSION DATE</div>
                <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>{formatDate(selectedProjectModal.possession_date)}</div>
              </div>
              {selectedProjectModal.total_towers && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>TOWERS & FLOORS</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                    {selectedProjectModal.total_towers} Towers • {selectedProjectModal.total_floors || 'Multiple'} Floors
                  </div>
                </div>
              )}
              {selectedProjectModal.min_area_sqft && (
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>UNIT AREA SPAN</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
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
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                        color: 'var(--text-body)'
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

      {/* Responsive & scrollbar styles */}
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
