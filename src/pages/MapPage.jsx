// CSS from npm — the ONLY correct way with Vite
import 'leaflet/dist/leaflet.css';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Map, Navigation2, ExternalLink, ChevronRight,
  Loader2, Home, Building2, Tag,
} from 'lucide-react';

import {
  filterFakeListings,
  deduplicateListings,
  fixCoordinates,
  getGoogleMapsUrl,
  MUMBAI_CENTER,
} from '../utils/dataUtils';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cap = s => (s || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

function fmtPrice(p, isRent = false) {
  const n = Number(p);
  if (!n || isNaN(n)) return null;
  if (isRent) return `₹${n.toLocaleString('en-IN')}/mo`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Zoom watcher (must be a MapContainer child) ──────────────────────────────
function ZoomWatcher({ onZoom }) {
  const map = useMap();
  useEffect(() => {
    const fn = () => onZoom(map.getZoom());
    map.on('zoomend', fn);
    return () => { map.off('zoomend', fn); };
  }, [map, onZoom]);
  return null;
}

// ─── FlyTo (flies map to lat/lng when locality changes) ───────────────────────
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 0.9, easeLinearity: 0.5 });
  }, [center, zoom, map]);
  return null;
}

// ─── Locality colors ──────────────────────────────────────────────────────────
const LOCALITY_COLORS = [
  '#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b',
  '#ef4444','#ec4899','#6366f1','#14b8a6','#f97316',
  '#84cc16','#a855f7','#0ea5e9','#d946ef','#22c55e',
  '#eab308','#2563eb','#7c3aed','#059669','#dc2626',
];

// ─── Popup: individual listing ────────────────────────────────────────────────
function ListingPopup({ item, navigate }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 220, lineHeight: 1.5 }}>
      <div style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Sale · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fmtPrice(item.price) && (
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>{fmtPrice(item.price)}</div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '6px 4px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 7,
              fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={11} /> Maps
          </a>
          <button onClick={() => navigate(`/listings/${item.listing_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '6px 4px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 7,
              fontSize: 11, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>
            View <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RentalPopup({ item }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 200, lineHeight: 1.5 }}>
      <div style={{ background: 'linear-gradient(135deg,#065f46,#10b981)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Rental · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fmtPrice(item.price, true) && (
          <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{fmtPrice(item.price, true)}</div>
        )}
        <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')}
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
            padding: '6px 4px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 7,
            fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
          <Navigation2 size={11} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function ProjectPopup({ item, navigate }) {
  const normP = v => { if (!v || isNaN(v)) return null; const n = Number(v); return n >= 100000 ? n : n >= 20 ? Math.round(n*100000) : Math.round(n*10000000); };
  const price = fmtPrice(normP(item.price_min));
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 220, lineHeight: 1.5 }}>
      <div style={{ background: 'linear-gradient(135deg,#78350f,#f59e0b)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Builder · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>by {item.developer_name}</div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {price && <div style={{ fontSize: 15, fontWeight: 800, color: '#d97706' }}>from {price}</div>}
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '6px 4px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 7,
              fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={11} /> Maps
          </a>
          <button onClick={() => navigate(`/projects/${item.project_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
              padding: '6px 4px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 7,
              fontSize: 11, fontWeight: 700, color: '#92400e', cursor: 'pointer' }}>
            View <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Locality cluster popup ───────────────────────────────────────────────────
function LocalityPopup({ cluster, onSelect }) {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: 190, padding: '12px 14px', background: '#fff', lineHeight: 1.5 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>{cap(cluster.loc)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        {cluster.listings > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#1d4ed8', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
            {cluster.listings.toLocaleString('en-IN')} sale listings
          </div>
        )}
        {cluster.rentals > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#059669', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            {cluster.rentals.toLocaleString('en-IN')} rentals
          </div>
        )}
        {cluster.projects > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d97706', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            {cluster.projects.toLocaleString('en-IN')} projects
          </div>
        )}
      </div>
      <button
        onClick={() => onSelect(cluster.loc)}
        style={{
          width: '100%', padding: '7px', background: '#1d4ed8', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}>
        Explore {cap(cluster.loc)} <ChevronRight size={12} />
      </button>
    </div>
  );
}

// ─── Sidebar: property list for selected locality ─────────────────────────────
function LocalitySidebar({ locality, listings, rentals, projects, onClose, navigate, showL, showR, showP }) {
  const items = [
    ...(showL ? listings.map(l => ({ ...l, _t: 'listing' })) : []),
    ...(showR ? rentals.map(r  => ({ ...r, _t: 'rental' }))  : []),
    ...(showP ? projects.map(p => ({ ...p, _t: 'project' })) : []),
  ].slice(0, 50); // cap at 50 in sidebar for readability

  const colorMap = { listing: '#3b82f6', rental: '#10b981', project: '#f59e0b' };
  const labelMap = { listing: 'Sale', rental: 'Rent', project: 'Project' };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, zIndex: 900,
      width: 300, background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-subtle)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.15)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-heading)' }}>{cap(locality)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
              {listings.length} listings · {rentals.length} rentals · {projects.length} projects
            </div>
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1, padding: 4 }}>
            ×
          </button>
        </div>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>
            No properties to show.<br/>Check the layer toggles above.
          </div>
        )}
        {items.map((item, i) => {
          const color = colorMap[item._t];
          const label = labelMap[item._t];
          const price = item._t === 'rental'
            ? fmtPrice(item.price, true)
            : fmtPrice(item.price || item.price_min);
          const mapsUrl = getGoogleMapsUrl(item._lat || item.latitude, item._lng || item.longitude, cap(item.apartment_name) + ', Mumbai');

          return (
            <div key={`${item._t}-${i}`} style={{
              marginBottom: 8, padding: '10px 10px', borderRadius: 10,
              background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)',
              transition: 'box-shadow 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                {item.bedroom && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>· {item.bedroom} BHK</span>}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cap(item.apartment_name)}
              </div>
              {item.developer_name && (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>by {item.developer_name}</div>
              )}
              {price && <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-text)', marginBottom: 6 }}>{price}</div>}
              <div style={{ display: 'flex', gap: 5 }}>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#059669', textDecoration: 'none' }}>
                  <Navigation2 size={9} /> Maps
                </a>
                {item._t === 'listing' && item.listing_id && (
                  <button onClick={() => navigate(`/listings/${item.listing_id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: 'var(--accent-text)', cursor: 'pointer' }}>
                    Details
                  </button>
                )}
                {item._t === 'project' && item.project_id && (
                  <button onClick={() => navigate(`/projects/${item.project_id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#d97706', cursor: 'pointer' }}>
                    Details
                  </button>
                )}
                {item.listing_url && (
                  <a href={item.listing_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 6, fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}>
                    <ExternalLink size={9} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {items.length >= 50 && (
          <div style={{ textAlign: 'center', padding: '8px', fontSize: 11, color: 'var(--text-muted)' }}>
            Showing top 50. Use filters to refine.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main MapPage ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [rentals,  setRentals]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [showL, setShowL] = useState(true);
  const [showR, setShowR] = useState(true);
  const [showP, setShowP] = useState(true);

  // Selected locality — '' means city-level view (only ~20 locality clusters)
  const [selectedLocality, setSelectedLocality] = useState('');
  const [flyTarget, setFlyTarget] = useState(null);
  const [zoom, setZoom] = useState(11);

  const handleZoom = useCallback(z => setZoom(z), []);
  const navigate_ = navigate;

  // ─── Load all data once ──────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      try {
        const [lr, rr, pr] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}listings.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}rentals.json`).then(r  => r.json()),
          fetch(`${import.meta.env.BASE_URL}projects.json`).then(r => r.json()),
        ]);
        if (!alive) return;

        const normP = v => { if (!v || isNaN(v)) return null; const n = Number(v); return n >= 100000 ? n : n >= 20 ? Math.round(n*100000) : Math.round(n*10000000); };

        const rawL = Array.isArray(lr) ? lr : (lr.results || []);
        const rawR = Array.isArray(rr) ? rr : (rr.results || []);
        const rawP = Array.isArray(pr) ? pr : (pr.results || []);

        setListings(
          deduplicateListings(filterFakeListings(rawL))
            .filter(l => l.is_live === true && l.latitude && l.longitude)
            .map(l => { const f = fixCoordinates(l); return { ...f, _lat: Number(f.latitude), _lng: Number(f.longitude) }; })
        );
        setRentals(
          rawR.filter(r => r.is_live !== false && r.latitude && r.longitude)
            .map(r => { const f = fixCoordinates(r); return { ...f, _lat: Number(f.latitude), _lng: Number(f.longitude) }; })
        );
        setProjects(
          rawP.filter(p => p.latitude && p.longitude)
            .map(p => { const f = fixCoordinates(p); return { ...f, price_min: normP(p.price_min), _lat: Number(f.latitude), _lng: Number(f.longitude) }; })
        );
      } catch (e) {
        console.error(e);
        if (alive) setError('Failed to load map data. Please refresh.');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // ─── Locality-level aggregation (city view: ~20 circles only) ────────────
  const localityClusters = useMemo(() => {
    const buckets = {};
    const addItem = (item, type) => {
      const loc = (item.locality || '').toLowerCase().trim();
      if (!loc || !item._lat || !item._lng || isNaN(item._lat)) return;
      if (!buckets[loc]) buckets[loc] = { loc, listings: 0, rentals: 0, projects: 0, latSum: 0, lngSum: 0, n: 0 };
      buckets[loc][type]++;
      buckets[loc].latSum += item._lat;
      buckets[loc].lngSum += item._lng;
      buckets[loc].n++;
    };
    if (showL) listings.forEach(l => addItem(l, 'listings'));
    if (showR) rentals.forEach(r  => addItem(r, 'rentals'));
    if (showP) projects.forEach(p => addItem(p, 'projects'));

    return Object.values(buckets).map(b => ({
      ...b,
      lat: b.latSum / b.n,
      lng: b.lngSum / b.n,
      total: b.listings + b.rentals + b.projects,
    })).sort((a, b) => b.total - a.total);
  }, [listings, rentals, projects, showL, showR, showP]);

  // ─── Filtered items for selected locality (detail view) ──────────────────
  const localL = useMemo(() => listings.filter(l => l.locality?.toLowerCase() === selectedLocality), [listings, selectedLocality]);
  const localR = useMemo(() => rentals.filter(r  => r.locality?.toLowerCase()  === selectedLocality), [rentals,  selectedLocality]);
  const localP = useMemo(() => projects.filter(p => p.locality?.toLowerCase()  === selectedLocality), [projects, selectedLocality]);

  // Get unique locality list for dropdown
  const localityList = useMemo(() => {
    const set = new Set();
    listings.forEach(l => l.locality && set.add(l.locality.toLowerCase()));
    rentals.forEach(r  => r.locality  && set.add(r.locality.toLowerCase()));
    projects.forEach(p => p.locality  && set.add(p.locality.toLowerCase()));
    return ['', ...Array.from(set).sort()];
  }, [listings, rentals, projects]);

  // Handle locality selection (from dropdown or cluster click)
  const handleSelectLocality = useCallback((loc) => {
    setSelectedLocality(loc);
    if (loc) {
      // Find the cluster for this locality to fly there
      const cluster = localityClusters.find(c => c.loc === loc);
      if (cluster) setFlyTarget({ lat: cluster.lat, lng: cluster.lng });
    } else {
      setFlyTarget({ lat: MUMBAI_CENTER.lat, lng: MUMBAI_CENTER.lng });
    }
  }, [localityClusters]);

  // ─── Loading / Error ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 20 }}>
        <Loader2 size={44} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>Loading Mumbai Map…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>Fetching listings, rentals &amp; projects</p>
        </div>
        <style>{`@keyframes spin { from { transform:rotate(0) } to { transform:rotate(360deg) } }`}</style>
      </div>
    );
  }
  if (error) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Map size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700 }}>Map failed to load</h2>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px' }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Reload</button>
      </div>
    );
  }

  const inDetailView = Boolean(selectedLocality);
  const totalVisible = (showL ? (inDetailView ? localL.length : listings.length) : 0)
    + (showR ? (inDetailView ? localR.length : rentals.length) : 0)
    + (showP ? (inDetailView ? localP.length : projects.length) : 0);

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ paddingBottom: '1rem' }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Map size={22} strokeWidth={1.5} /> Mumbai Property Map
            </h1>
            <p className="page-subtitle" style={{ margin: 0 }}>
              {inDetailView
                ? `${cap(selectedLocality)} — ${totalVisible} properties`
                : `${localityClusters.length} localities · ${listings.length.toLocaleString('en-IN')} sale · ${rentals.length.toLocaleString('en-IN')} rental · ${projects.length.toLocaleString('en-IN')} projects`
              }
            </p>
          </div>

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Layer toggles */}
            {[
              { label: 'Sale', on: showL, toggle: () => setShowL(v => !v), color: '#3b82f6' },
              { label: 'Rental', on: showR, toggle: () => setShowR(v => !v), color: '#10b981' },
              { label: 'Projects', on: showP, toggle: () => setShowP(v => !v), color: '#f59e0b' },
            ].map(({ label, on, toggle, color }) => (
              <button key={label} onClick={toggle} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999,
                border: on ? `1.5px solid ${color}` : '1.5px solid var(--border-subtle)',
                background: on ? `${color}18` : 'transparent',
                color: on ? color : 'var(--text-muted)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: on ? color : 'var(--border-subtle)', display: 'inline-block' }} />
                {label}
              </button>
            ))}

            {/* Locality selector */}
            <select
              value={selectedLocality}
              onChange={e => handleSelectLocality(e.target.value)}
              className="input-field"
              style={{ fontSize: 12, padding: '5px 10px', minWidth: 160 }}
            >
              <option value="">All Mumbai (city view)</option>
              {localityList.filter(Boolean).map(loc => (
                <option key={loc} value={loc}>{cap(loc)}</option>
              ))}
            </select>

            {/* Clear locality button */}
            {inDetailView && (
              <button
                onClick={() => handleSelectLocality('')}
                className="btn btn-secondary btn-sm"
                style={{ borderRadius: 999, fontSize: 12 }}
              >
                ← All Mumbai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── Map area ───────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        height: 'calc(100vh - 210px)',
        minHeight: 480,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px var(--border-subtle)',
        display: 'flex',
      }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <MapContainer
            center={[MUMBAI_CENTER.lat, MUMBAI_CENTER.lng]}
            zoom={11}
            style={{ width: '100%', height: '100%' }}
            scrollWheelZoom
            zoomSnap={0.5}
          >
            <ZoomWatcher onZoom={handleZoom} />
            {flyTarget && (
              <FlyTo
                center={[flyTarget.lat, flyTarget.lng]}
                zoom={inDetailView ? 14 : 11}
              />
            )}

            {/* ── FREE OpenStreetMap tiles — no API key, no watermark ── */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />

            {/* ── CITY VIEW: locality circles (~20 markers, very fast) ── */}
            {!inDetailView && localityClusters.map((cluster, i) => {
              const color = LOCALITY_COLORS[i % LOCALITY_COLORS.length];
              // Scale radius by count (log scale so big clusters don't overwhelm)
              const r = Math.min(34, Math.max(16, 12 + Math.log10(cluster.total + 1) * 10));
              return (
                <CircleMarker
                  key={cluster.loc}
                  center={[cluster.lat, cluster.lng]}
                  radius={r}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.82,
                    color: '#fff',
                    weight: 2.5,
                  }}
                >
                  <Popup maxWidth={220} minWidth={180} closeButton>
                    <LocalityPopup cluster={cluster} onSelect={(loc) => {
                      handleSelectLocality(loc);
                    }} />
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* ── DETAIL VIEW: individual small dots for selected locality ── */}
            {inDetailView && showL && localL.map((item, i) => (
              <CircleMarker key={`dl${i}`} center={[item._lat, item._lng]} radius={6}
                pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.85, color: '#fff', weight: 1.5 }}>
                <Popup maxWidth={250} minWidth={200}><ListingPopup item={item} navigate={navigate_} /></Popup>
              </CircleMarker>
            ))}

            {inDetailView && showR && localR.map((item, i) => (
              <CircleMarker key={`dr${i}`} center={[item._lat, item._lng]} radius={6}
                pathOptions={{ fillColor: '#10b981', fillOpacity: 0.85, color: '#fff', weight: 1.5 }}>
                <Popup maxWidth={230} minWidth={190}><RentalPopup item={item} /></Popup>
              </CircleMarker>
            ))}

            {inDetailView && showP && localP.map((item, i) => (
              <CircleMarker key={`dp${i}`} center={[item._lat, item._lng]} radius={8}
                pathOptions={{ fillColor: '#f59e0b', fillOpacity: 0.9, color: '#fff', weight: 1.5 }}>
                <Popup maxWidth={260} minWidth={200}><ProjectPopup item={item} navigate={navigate_} /></Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* ── Map legend (bottom-left) ── */}
          <div style={{
            position: 'absolute', bottom: 32, left: 12, zIndex: 1000,
            background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
            borderRadius: 10, padding: '8px 12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.07)',
          }}>
            {inDetailView
              ? [['#3b82f6','Sale Listings'],['#10b981','Rentals'],['#f59e0b','Projects']].map(([c,l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'#334155', marginBottom:3 }}>
                    <span style={{ width:9, height:9, borderRadius:'50%', background:c, display:'inline-block' }} />{l}
                  </div>
                ))
              : <div style={{ fontSize:11, fontWeight:600, color:'#334155' }}>
                  <div style={{ marginBottom:3 }}>🔵 Circle = locality cluster</div>
                  <div>Size ∝ number of properties</div>
                </div>
            }
          </div>
        </div>

        {/* ── Sidebar: property list for selected locality ── */}
        {inDetailView && (
          <LocalitySidebar
            locality={selectedLocality}
            listings={localL}
            rentals={localR}
            projects={localP}
            onClose={() => handleSelectLocality('')}
            navigate={navigate_}
            showL={showL}
            showR={showR}
            showP={showP}
          />
        )}
      </div>

      {/* Leaflet popup overrides */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important; padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-zoom { box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; border: none !important; }
        .leaflet-control-zoom a { background: #fff !important; color: #334155 !important; border: 1px solid #e2e8f0 !important; }
        .leaflet-control-zoom a:hover { background: #f1f5f9 !important; }
        .leaflet-control-attribution { font-size: 10px !important; }
        a[href="https://leafletjs.com"] { display: none !important; }
        .leaflet-attribution-flag { display: none !important; }
      `}</style>
    </motion.div>
  );
}
