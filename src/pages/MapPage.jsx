// ─── CRITICAL: import Leaflet CSS from the npm package (NOT from CDN) ─────────
import 'leaflet/dist/leaflet.css';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, ExternalLink, Navigation2, ChevronRight, Loader2 } from 'lucide-react';

import {
  filterFakeListings,
  deduplicateListings,
  fixCoordinates,
  getGoogleMapsUrl,
  MUMBAI_CENTER,
} from '../utils/dataUtils';

// ─── Fix Leaflet marker icons broken by Vite's asset pipeline ─────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

// ─── Coloured SVG pin icon ────────────────────────────────────────────────────
function createPinIcon(fillColor) {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 46" width="30" height="46">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.493 15 31 15 31S30 25.493 30 15C30 6.716 23.284 0 15 0z"
        fill="${fillColor}" stroke="white" stroke-width="2"/>
      <circle cx="15" cy="15" r="6" fill="white" opacity="0.9"/>
    </svg>
  `);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [0, -48],
  });
}

// Pre-build the three icons
const ICON_LISTING  = createPinIcon('#3b82f6');
const ICON_RENTAL   = createPinIcon('#10b981');
const ICON_PROJECT  = createPinIcon('#f59e0b');

// ─── Cluster circle icon ──────────────────────────────────────────────────────
function createClusterIcon(count, color) {
  const size = count < 10 ? 34 : count < 100 ? 42 : 50;
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" stroke="white" stroke-width="2.5" opacity="0.92"/>
      <text x="${size/2}" y="${size/2}" font-family="Inter,Arial,sans-serif" font-size="${count > 99 ? 13 : 14}"
        font-weight="800" fill="white" text-anchor="middle" dominant-baseline="central">${count > 999 ? '999+' : count}</text>
    </svg>
  `);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2],
  });
}

// ─── Simple grid clustering ───────────────────────────────────────────────────
function clusterPoints(items, zoom) {
  const grid = zoom >= 14 ? 0.003 : zoom >= 12 ? 0.012 : zoom >= 10 ? 0.04 : 0.1;
  const map = new Map();
  for (const item of items) {
    const lat = Number(item._lat), lng = Number(item._lng);
    if (isNaN(lat) || isNaN(lng) || !lat || !lng) continue;
    const ky = Math.round(lat / grid) * grid;
    const kx = Math.round(lng / grid) * grid;
    const key = `${ky.toFixed(5)}_${kx.toFixed(5)}`;
    if (!map.has(key)) map.set(key, { lat: ky, lng: kx, items: [] });
    map.get(key).items.push(item);
  }
  return [...map.values()];
}

// ─── Zoom tracker (must be child of MapContainer) ────────────────────────────
function ZoomWatcher({ onZoom }) {
  const map = useMap();
  useEffect(() => {
    const fn = () => onZoom(map.getZoom());
    map.on('zoomend', fn);
    return () => map.off('zoomend', fn);
  }, [map, onZoom]);
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtSale(p) {
  const n = Number(p);
  if (!n || isNaN(n)) return '—';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}
function fmtRent(p) {
  const n = Number(p);
  if (!n || isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}/mo`;
}
function cap(s) {
  return (s || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── Popup components ─────────────────────────────────────────────────────────
function ListingPopup({ item, navigate }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai');
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: 270, lineHeight: 1.4 }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Sale · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
          {item.bedroom} BHK · {item.carpet_area} sqft
        </div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>{fmtSale(item.price)}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '6px 0', background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={11} /> Maps
          </a>
          <button onClick={() => navigate(`/listings/${item.listing_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '6px 0', background: '#eff6ff', border: '1px solid #93c5fd',
              borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}>
            Details <ChevronRight size={11} />
          </button>
        </div>
        {item.listing_url && (
          <a href={item.listing_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 6,
              fontSize: 10, color: '#94a3b8', textDecoration: 'none' }}>
            <ExternalLink size={9} /> {item.website || 'View on portal'}
          </a>
        )}
      </div>
    </div>
  );
}

function RentalPopup({ item }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai');
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: 250, lineHeight: 1.4 }}>
      <div style={{ background: 'linear-gradient(135deg,#064e3b,#059669)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Rental · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#059669', marginBottom: 8 }}>{fmtRent(item.price)}</div>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            padding: '6px 0', background: '#f0fdf4', border: '1px solid #86efac',
            borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
          <Navigation2 size={11} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

function ProjectPopup({ item, navigate }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai');
  const price = item.price_min
    ? (Number(item.price_min) >= 10000000
        ? `₹${(item.price_min / 10000000).toFixed(2)} Cr`
        : `₹${(item.price_min / 100000).toFixed(1)} L`)
    : null;
  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: 280, lineHeight: 1.4 }}>
      <div style={{ background: 'linear-gradient(135deg,#78350f,#d97706)', padding: '10px 12px', color: '#fff' }}>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Builder · {cap(item.locality)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {cap(item.apartment_name)}
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>by {item.developer_name}</div>
      </div>
      <div style={{ padding: '10px 12px', background: '#fff' }}>
        {price && <div style={{ fontSize: 15, fontWeight: 800, color: '#d97706', marginBottom: 8 }}>from {price}</div>}
        <div style={{ display: 'flex', gap: 6, marginBottom: price ? 0 : 0 }}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '6px 0', background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={11} /> Maps
          </a>
          <button onClick={() => navigate(`/projects/${item.project_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '6px 0', background: '#fffbeb', border: '1px solid #fcd34d',
              borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#92400e', cursor: 'pointer' }}>
            Details <ChevronRight size={11} />
          </button>
        </div>
        {item.project_url && (
          <a href={item.project_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 6,
              fontSize: 10, color: '#94a3b8', textDecoration: 'none' }}>
            <ExternalLink size={9} /> View on Ivy Homes
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Layer toggle panel ───────────────────────────────────────────────────────
function LayerPanel({ showL, setShowL, showR, setShowR, showP, setShowP }) {
  const layers = [
    { label: 'Listings', on: showL, toggle: () => setShowL(v => !v), color: '#3b82f6', dot: '●' },
    { label: 'Rentals',  on: showR, toggle: () => setShowR(v => !v), color: '#10b981', dot: '●' },
    { label: 'Projects', on: showP, toggle: () => setShowP(v => !v), color: '#f59e0b', dot: '●' },
  ];
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 1000,
      background: 'rgba(15,20,35,0.94)', backdropFilter: 'blur(12px)',
      borderRadius: 12, padding: '10px 10px 8px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minWidth: 130,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, paddingLeft: 2 }}>Map Layers</div>
      {layers.map(({ label, on, toggle, color }) => (
        <button key={label} onClick={toggle} style={{
          display: 'flex', alignItems: 'center', gap: 7, width: '100%',
          padding: '5px 7px', marginBottom: 3, borderRadius: 7,
          border: on ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.05)',
          background: on ? `${color}22` : 'transparent',
          cursor: 'pointer', transition: 'all 0.15s',
          fontSize: 12, fontWeight: 600,
          color: on ? color : 'rgba(255,255,255,0.35)',
        }}>
          <span style={{
            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
            background: on ? color : 'rgba(255,255,255,0.2)',
            boxShadow: on ? `0 0 6px ${color}` : 'none',
          }} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function StatsBar({ lCount, rCount, pCount, showL, showR, showP }) {
  const total = (showL ? lCount : 0) + (showR ? rCount : 0) + (showP ? pCount : 0);
  return (
    <div style={{
      position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8,
      background: 'rgba(15,20,35,0.92)', backdropFilter: 'blur(12px)',
      borderRadius: 999, padding: '6px 14px',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      fontSize: 11, fontWeight: 700, color: '#fff',
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {showL && <><span style={{ color: '#60a5fa' }}>{lCount.toLocaleString('en-IN')} listings</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span></>}
      {showR && <><span style={{ color: '#34d399' }}>{rCount.toLocaleString('en-IN')} rentals</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span></>}
      {showP && <><span style={{ color: '#fbbf24' }}>{pCount.toLocaleString('en-IN')} projects</span><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span></>}
      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{total.toLocaleString('en-IN')} total</span>
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
  const [zoom, setZoom]         = useState(12);
  const [showL, setShowL]       = useState(true);
  const [showR, setShowR]       = useState(true);
  const [showP, setShowP]       = useState(true);
  const [locality, setLocality] = useState('');

  const handleZoom = useCallback(z => setZoom(z), []);

  const LOCALITIES = [
    '', 'andheri west', 'bandra east', 'borivali west', 'chembur',
    'goregaon east', 'kandivali east', 'malad west', 'mulund west', 'powai', 'thane west',
  ];

  // ─── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [lr, rr, pr] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}listings.json`).then(r => { if (!r.ok) throw new Error('listings'); return r.json(); }),
          fetch(`${import.meta.env.BASE_URL}rentals.json`).then(r  => { if (!r.ok) throw new Error('rentals');  return r.json(); }),
          fetch(`${import.meta.env.BASE_URL}projects.json`).then(r => { if (!r.ok) throw new Error('projects'); return r.json(); }),
        ]);
        if (!alive) return;

        const normPrice = v => {
          if (!v || isNaN(v)) return null;
          const n = Number(v);
          return n >= 100000 ? n : n >= 20 ? Math.round(n * 100000) : Math.round(n * 10000000);
        };

        const rawL = Array.isArray(lr) ? lr : (lr.results || []);
        const rawR = Array.isArray(rr) ? rr : (rr.results || []);
        const rawP = Array.isArray(pr) ? pr : (pr.results || []);

        const processL = deduplicateListings(filterFakeListings(rawL))
          .filter(l => l.is_live === true && l.latitude && l.longitude)
          .map(l => { const f = fixCoordinates(l); return { ...f, _lat: Number(f.latitude), _lng: Number(f.longitude) }; });

        const processR = rawR
          .filter(r => r.is_live !== false && r.latitude && r.longitude)
          .map(r => { const f = fixCoordinates(r); return { ...f, _lat: Number(f.latitude), _lng: Number(f.longitude) }; });

        const processP = rawP
          .filter(p => p.latitude && p.longitude)
          .map(p => {
            const f = fixCoordinates(p);
            return { ...f, price_min: normPrice(p.price_min), _lat: Number(f.latitude), _lng: Number(f.longitude) };
          });

        if (alive) {
          setListings(processL);
          setRentals(processR);
          setProjects(processP);
        }
      } catch (e) {
        console.error('Map data load error:', e);
        if (alive) setError(`Failed to load map data: ${e.message}`);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // ─── Locality filter ───────────────────────────────────────────────────
  const filtL = useMemo(() => locality ? listings.filter(x => x.locality?.toLowerCase() === locality) : listings, [listings, locality]);
  const filtR = useMemo(() => locality ? rentals.filter(x  => x.locality?.toLowerCase() === locality)  : rentals,  [rentals, locality]);
  const filtP = useMemo(() => locality ? projects.filter(x => x.locality?.toLowerCase() === locality)  : projects, [projects, locality]);

  // ─── Clustering ────────────────────────────────────────────────────────
  const clL = useMemo(() => clusterPoints(filtL, zoom), [filtL, zoom]);
  const clR = useMemo(() => clusterPoints(filtR, zoom), [filtR, zoom]);
  const clP = useMemo(() => clusterPoints(filtP, zoom), [filtP, zoom]);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 20 }}>
        <Loader2 size={44} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>Loading Mumbai Map…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Fetching listings, rentals &amp; projects</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Map size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 8 }}>Map failed to load</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Reload Page</button>
      </div>
    );
  }

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{ paddingBottom: '1rem' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-blue">Interactive Map</span>
          <span className="badge badge-slate">No API Key · 100% Free</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Map size={24} strokeWidth={1.5} /> Mumbai Property Map
            </h1>
            <p className="page-subtitle">
              {listings.length.toLocaleString('en-IN')} unique homes · {rentals.length.toLocaleString('en-IN')} rentals · {projects.length.toLocaleString('en-IN')} projects
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Locality:</label>
            <select
              value={locality}
              onChange={e => setLocality(e.target.value)}
              className="input-field"
              style={{ fontSize: 13, padding: '6px 10px', minWidth: 150, textTransform: 'capitalize' }}
            >
              {LOCALITIES.map(loc => (
                <option key={loc} value={loc}>{loc === '' ? 'All Mumbai' : cap(loc)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map wrapper */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        height: 'calc(100vh - 230px)',
        minHeight: 500,
        boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px var(--border-subtle)',
      }}>
        {/* Overlays — rendered as absolute children INSIDE this wrapper */}
        <StatsBar lCount={filtL.length} rCount={filtR.length} pCount={filtP.length} showL={showL} showR={showR} showP={showP} />
        <LayerPanel showL={showL} setShowL={setShowL} showR={showR} setShowR={setShowR} showP={showP} setShowP={setShowP} />

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 40, left: 12, zIndex: 1000,
          background: 'rgba(15,20,35,0.9)', backdropFilter: 'blur(10px)',
          borderRadius: 10, padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {[['#3b82f6','Sale Listing'],['#10b981','Rental'],['#f59e0b','Builder Project']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 5px ${color}` }} />
              {label}
            </div>
          ))}
        </div>

        {/* THE MAP */}
        <MapContainer
          center={[MUMBAI_CENTER.lat, MUMBAI_CENTER.lng]}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          <ZoomWatcher onZoom={handleZoom} />

          {/* Free dark tile — CARTO Dark Matter, no API key */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />

          {/* LISTINGS */}
          {showL && clL.map((cl, i) => (
            <Marker
              key={`l${i}`}
              position={[cl.lat, cl.lng]}
              icon={cl.items.length === 1 ? ICON_LISTING : createClusterIcon(cl.items.length, '#3b82f6')}
            >
              <Popup maxWidth={290} minWidth={200}>
                {cl.items.length === 1
                  ? <ListingPopup item={cl.items[0]} navigate={navigate} />
                  : <div style={{ padding: '8px 10px', fontFamily: 'Inter,sans-serif' }}>
                      <b style={{ color: '#3b82f6' }}>🔵 {cl.items.length} listings here</b>
                      <br /><small style={{ color: '#64748b' }}>Zoom in to see each one</small>
                    </div>
                }
              </Popup>
            </Marker>
          ))}

          {/* RENTALS */}
          {showR && clR.map((cl, i) => (
            <Marker
              key={`r${i}`}
              position={[cl.lat, cl.lng]}
              icon={cl.items.length === 1 ? ICON_RENTAL : createClusterIcon(cl.items.length, '#10b981')}
            >
              <Popup maxWidth={270} minWidth={190}>
                {cl.items.length === 1
                  ? <RentalPopup item={cl.items[0]} />
                  : <div style={{ padding: '8px 10px', fontFamily: 'Inter,sans-serif' }}>
                      <b style={{ color: '#10b981' }}>🟢 {cl.items.length} rentals here</b>
                      <br /><small style={{ color: '#64748b' }}>Zoom in to see each one</small>
                    </div>
                }
              </Popup>
            </Marker>
          ))}

          {/* PROJECTS */}
          {showP && clP.map((cl, i) => (
            <Marker
              key={`p${i}`}
              position={[cl.lat, cl.lng]}
              icon={cl.items.length === 1 ? ICON_PROJECT : createClusterIcon(cl.items.length, '#f59e0b')}
            >
              <Popup maxWidth={300} minWidth={200}>
                {cl.items.length === 1
                  ? <ProjectPopup item={cl.items[0]} navigate={navigate} />
                  : <div style={{ padding: '8px 10px', fontFamily: 'Inter,sans-serif' }}>
                      <b style={{ color: '#f59e0b' }}>🟡 {cl.items.length} projects here</b>
                      <br /><small style={{ color: '#64748b' }}>Zoom in to see each one</small>
                    </div>
                }
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Global style overrides for Leaflet popup */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.22) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-attribution {
          background: rgba(15,20,35,0.7) !important;
          color: rgba(255,255,255,0.4) !important;
          font-size: 10px !important;
          border-radius: 4px 0 0 0 !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.45) !important; }
        .leaflet-control-zoom { box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important; border: none !important; }
        .leaflet-control-zoom a {
          background: rgba(15,20,35,0.92) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover { background: #2563eb !important; }
        /* Remove Leaflet logo */
        .leaflet-control-attribution .leaflet-attr-logo { display: none !important; }
        a[href="https://leafletjs.com"] { display: none !important; }
      `}</style>
    </motion.div>
  );
}
