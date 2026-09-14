import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, MapPin, CalendarDays, Shield, Home, Layers,
  ExternalLink, Navigation2, ChevronRight, Star, Loader2, Tag, Users,
} from 'lucide-react';
import { filterFakeListings, deduplicateListings, fixCoordinates, getGoogleMapsUrl } from '../utils/dataUtils';
import { formatProjectPrice, formatDate } from '../components/ProjectCard';
import PropertyCard from '../components/PropertyCard';
import { useCompare } from '../context/CompareContext';

function normalizeProjectPrice(val) {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return null;
  const n = Number(val);
  if (n >= 100000) return n;
  if (n >= 20) return Math.round(n * 100000);
  return Math.round(n * 10000000);
}

function capitalize(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Status badge color
function getStatusStyle(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('ready')) return { bg: 'rgba(5,150,105,0.12)', color: '#059669', border: '#6ee7b7' };
  if (s.includes('launch')) return { bg: 'rgba(37,99,235,0.12)', color: '#2563eb', border: '#93c5fd' };
  return { bg: 'rgba(217,119,6,0.12)', color: '#d97706', border: '#fcd34d' };
}

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
};
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.05 } },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { count: compareCount } = useCompare();

  const [project, setProject]   = useState(null);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 6;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  // ─── Load project + associated listings ─────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [pr, lr] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}projects.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}listings.json`).then(r => r.json()),
        ]);

        const projectsArr = Array.isArray(pr) ? pr : (pr.results || []);
        const rawListings  = Array.isArray(lr) ? lr : (lr.results || []);

        // Find this project
        const found = projectsArr.find(p => String(p.project_id) === String(id));
        if (!found) {
          if (mounted) setError('Project not found.');
          return;
        }

        const fixedProject = fixCoordinates({
          ...found,
          price_min: normalizeProjectPrice(found.price_min),
          price_max: normalizeProjectPrice(found.price_max),
        });

        // Filter associated listings: same project_id, live, not fake, deduped
        const associated = deduplicateListings(
          filterFakeListings(rawListings)
            .filter(l => l.is_live === true && String(l.project_id) === String(id))
        ).map(fixCoordinates);

        if (mounted) {
          setProject(fixedProject);
          setListings(associated);
        }
      } catch (err) {
        if (mounted) setError('Failed to load project data.');
        console.error(err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  const paginatedListings = useMemo(() => {
    const start = (listPage - 1) * LIST_PAGE_SIZE;
    return listings.slice(start, start + LIST_PAGE_SIZE);
  }, [listings, listPage]);

  const totalListPages = Math.ceil(listings.length / LIST_PAGE_SIZE) || 1;

  if (isLoading) {
    return (
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1.5rem' }}>
        <Loader2 size={42} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading project details…</p>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{error || 'Project not found'}</h2>
        <button onClick={() => navigate('/projects')} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          ← Back to Projects
        </button>
      </div>
    );
  }

  const mapsUrl = getGoogleMapsUrl(project.latitude, project.longitude, project.apartment_name + ', ' + project.locality + ', Mumbai');
  const statusStyle = getStatusStyle(project.project_status);

  const minPriceStr = formatProjectPrice(project.price_min);
  const maxPriceStr = formatProjectPrice(project.price_max);

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ paddingBottom: compareCount > 0 ? '7.5rem' : '2.5rem' }}
    >
      {/* Breadcrumb / Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)', transition: 'color 0.15s' }}
        >
          <ArrowLeft size={15} /> Builder Projects
        </button>
        <span>/</span>
        <span style={{ color: 'var(--text-body)', fontWeight: 600 }}>{capitalize(project.apartment_name)}</span>
      </div>

      {/* ─── Hero Card ──────────────────────────────────────────────────── */}
      <div className="ivy-card" style={{ overflow: 'hidden', marginBottom: '2rem', position: 'relative' }}>
        {/* Gradient hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '100px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Status + badges */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                background: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'capitalize',
              }}>
                {project.project_status || 'Under Construction'}
              </span>
              {project.rera_number && (
                <span style={{
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: 'rgba(16,185,129,0.15)', color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.3)',
                  fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace',
                }}>
                  RERA: {project.rera_number}
                </span>
              )}
              {listings.length > 0 && (
                <span style={{
                  padding: '0.3rem 0.75rem', borderRadius: '999px',
                  background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  fontSize: '0.72rem', fontWeight: 700,
                }}>
                  {listings.length} Live Listing{listings.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900,
              color: '#fff', marginBottom: '0.35rem', letterSpacing: '-0.02em',
            }}>
              {capitalize(project.apartment_name)}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', marginBottom: '1.25rem' }}>
              by <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{project.developer_name}</strong>
            </p>

            {/* Location + CTA row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
                <MapPin size={15} />
                <span style={{ textTransform: 'capitalize' }}>{project.locality}, Mumbai</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)',
                    background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.4)',
                    color: '#34d399', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <Navigation2 size={14} /> Google Maps
                </a>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ExternalLink size={14} /> Visit on Ivy Homes
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Price banner */}
        {(project.price_min || project.price_max) && (
          <div style={{
            padding: '1.25rem 2rem',
            background: 'var(--bg-surface-subtle)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price Range</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-text)', letterSpacing: '-0.02em' }}>
                {minPriceStr} {maxPriceStr && minPriceStr !== maxPriceStr ? `– ${maxPriceStr}` : ''}
              </div>
            </div>
            {project.total_units && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Units</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>{project.total_units.toLocaleString('en-IN')}</div>
              </div>
            )}
            {project.total_listings && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Listed Inventory</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>{project.total_listings}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Info Grid ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Project Details */}
        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--accent-primary)" /> Project Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Launch Date', value: formatDate(project.launch_date), icon: <CalendarDays size={14} /> },
              { label: 'Possession', value: formatDate(project.possession_date), icon: <CalendarDays size={14} /> },
              project.total_towers && { label: 'Towers', value: project.total_towers, icon: <Building2 size={14} /> },
              project.total_floors && { label: 'Floors', value: project.total_floors, icon: <Layers size={14} /> },
              project.min_area_sqft && { label: 'Min Area', value: `${project.min_area_sqft} sqft`, icon: <Home size={14} /> },
              project.max_area_sqft && { label: 'Max Area', value: `${project.max_area_sqft} sqft`, icon: <Home size={14} /> },
            ].filter(Boolean).map(({ label, value, icon }) => (
              <div key={label}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                  {icon} {label}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-heading)' }}>{value || 'TBA'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Location + Google Maps embed link */}
        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="#10b981" /> Location
          </h2>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Locality</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)', textTransform: 'capitalize', marginTop: '0.2rem' }}>{project.locality}, Mumbai</div>
          </div>
          {project.latitude && project.longitude && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Coordinates</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-body)', marginTop: '0.2rem' }}>
                {Number(project.latitude).toFixed(5)}, {Number(project.longitude).toFixed(5)}
              </div>
            </div>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.65rem', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-body)', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
              transition: 'all 0.2s',
              width: '100%',
            }}
          >
            <Navigation2 size={16} color="#10b981" />
            Open in Google Maps
            <ExternalLink size={13} color="var(--text-muted)" />
          </a>
        </div>

        {/* RERA / Verification */}
        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#6366f1" /> Registration
          </h2>
          {project.rera_number ? (
            <div style={{
              padding: '1rem',
              background: 'rgba(99,102,241,0.06)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.75rem',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(99,102,241,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>RERA Number</div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.92rem', fontWeight: 800, color: '#6366f1' }}>{project.rera_number}</div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>RERA registration not available</p>
          )}
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 600,
                textDecoration: 'none', marginTop: '0.25rem',
              }}
            >
              <ExternalLink size={14} /> Official Project Page on Ivy Homes ↗
            </a>
          )}
        </div>
      </div>

      {/* ─── Amenities ──────────────────────────────────────────────────── */}
      {Array.isArray(project.amenities) && project.amenities.length > 0 && (
        <div className="ivy-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} color="#f59e0b" /> Community Amenities
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.amenities.map((amenity, i) => (
              <span
                key={i}
                style={{
                  padding: '0.35rem 0.8rem',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-body)',
                  textTransform: 'capitalize',
                }}
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Associated Listings ─────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={20} color="var(--accent-primary)" />
            Available Units in this Project
            {listings.length > 0 && (
              <span style={{
                padding: '0.2rem 0.65rem', borderRadius: '999px',
                background: 'var(--accent-subtle)', color: 'var(--accent-text)',
                fontSize: '0.75rem', fontWeight: 800,
              }}>
                {listings.length}
              </span>
            )}
          </h2>
          {listings.length > 0 && (
            <Link
              to={`/listings?locality=${encodeURIComponent(project.locality)}`}
              style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              Browse all in {capitalize(project.locality)} <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {listings.length === 0 ? (
          <div className="ivy-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Home size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.5rem' }}>No active listings in this project</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All units may be sold or not yet listed. Check back soon.</p>
          </div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {paginatedListings.map((listing) => (
                <motion.div key={listing.listing_id} variants={cardVariants}>
                  <PropertyCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination for listings */}
            {totalListPages > 1 && (
              <div style={{
                marginTop: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              }}>
                <button
                  onClick={() => setListPage(p => Math.max(1, p - 1))}
                  disabled={listPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Page {listPage} of {totalListPages}
                </span>
                <button
                  onClick={() => setListPage(p => Math.min(totalListPages, p + 1))}
                  disabled={listPage >= totalListPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
