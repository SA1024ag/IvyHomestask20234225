import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, ExternalLink, Navigation2, Layers, ChevronRight, Loader2 } from 'lucide-react';

import {
  filterFakeListings,
  deduplicateListings,
  fixCoordinates,
  getGoogleMapsUrl,
  MUMBAI_CENTER,
} from '../utils/dataUtils';

// ─── Fix Leaflet default icon paths broken by Vite asset handling ─────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── 3D-style SVG pin icon factory ───────────────────────────────────────────
function makePinIcon(color, glowColor, size = 36) {
  const half = size / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}">
    <defs>
      <radialGradient id="g${color.replace('#','')}" cx="38%" cy="28%" r="62%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
        <stop offset="100%" stop-color="${color}"/>
      </radialGradient>
      <filter id="sh${color.replace('#','')}">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${glowColor}" flood-opacity="0.5"/>
      </filter>
    </defs>
    <ellipse cx="${half}" cy="${size + 6}" rx="${half / 3}" ry="3.5" fill="${glowColor}" opacity="0.3"/>
    <circle cx="${half}" cy="${half - 3}" r="${half - 3}" fill="url(#g${color.replace('#','')})" filter="url(#sh${color.replace('#','')})" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
    <path d="M${half - 5},${size - 8} Q${half},${size + 6} ${half + 5},${size - 8}" fill="${color}" filter="url(#sh${color.replace('#','')})"/>
    <circle cx="${half - 5}" cy="${half - 9}" r="4" fill="rgba(255,255,255,0.45)"/>
  </svg>`;
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [size, size + 10],
    iconAnchor: [half, size + 10],
    popupAnchor: [0, -(size + 10)],
  });
}

const ICON_LISTING = makePinIcon('#3b82f6', '#1d4ed8', 36);
const ICON_RENTAL  = makePinIcon('#10b981', '#065f46', 36);
const ICON_PROJECT = makePinIcon('#f59e0b', '#92400e', 40);

// ─── Cluster bubble icon factory ─────────────────────────────────────────────
function makeClusterIcon(count, color) {
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:${size < 44 ? 12 : 14}px;font-weight:800;color:#fff;box-shadow:0 4px 14px ${color}88,0 0 0 3px rgba(255,255,255,0.25);border:2px solid rgba(255,255,255,0.7);font-family:Inter,sans-serif;">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Simple grid-based clustering (no external plugin) ────────────────────────
function clusterPoints(items, zoom) {
  const GRID = zoom >= 14 ? 0.003 : zoom >= 12 ? 0.012 : zoom >= 10 ? 0.035 : 0.09;
  const clusters = new Map();
  for (const item of items) {
    const lat = Number(item._lat), lng = Number(item._lng);
    if (isNaN(lat) || isNaN(lng)) continue;
    const key = `${(Math.round(lat / GRID) * GRID).toFixed(6)}_${(Math.round(lng / GRID) * GRID).toFixed(6)}`;
    if (!clusters.has(key)) clusters.set(key, { lat: Math.round(lat / GRID) * GRID, lng: Math.round(lng / GRID) * GRID, items: [] });
    clusters.get(key).items.push(item);
  }
  return [...clusters.values()];
}

// ─── Hook: track zoom level ───────────────────────────────────────────────────
function ZoomWatcher({ onZoom }) {
  const map = useMap();
  useEffect(() => {
    const fn = () => onZoom(map.getZoom());
    map.on('zoomend', fn);
    return () => map.off('zoomend', fn);
  }, [map, onZoom]);
  return null;
}

// ─── Price formatters ─────────────────────────────────────────────────────────
function fmtSale(p) {
  const n = Number(p); if (!n || isNaN(n)) return '—';
  return n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)} L` : `₹${n.toLocaleString('en-IN')}`;
}
function fmtRent(p) {
  const n = Number(p); if (!n || isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN')}/mo`;
}

// ─── Capitalize helper ────────────────────────────────────────────────────────
const cap = s => (s || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// ─── Popup: Sale Listing ──────────────────────────────────────────────────────
function ListingPopup({ item, navigate }) {
  return (
    <div style={{ width: 290, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)', padding: '0.85rem 1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Sale · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 2 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '0.8rem 1rem', background: '#fff' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.5rem' }}>{fmtSale(item.price)}</div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0.38rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={12} /> Maps
          </a>
          <button onClick={() => navigate(`/listings/${item.listing_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0.38rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>
            Details <ChevronRight size={12} />
          </button>
        </div>
        {item.listing_url && (
          <a href={item.listing_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: '0.4rem', fontSize: '0.65rem', color: '#64748b', textDecoration: 'none' }}>
            <ExternalLink size={10} /> {item.website || 'View on portal'} ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Popup: Rental ────────────────────────────────────────────────────────────
function RentalPopup({ item }) {
  return (
    <div style={{ width: 270, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#064e3b,#059669)', padding: '0.85rem 1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Rental · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 2 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '0.8rem 1rem', background: '#fff' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>{fmtRent(item.price)}</div>
        {item.deposit && <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>Deposit ₹{Number(item.deposit).toLocaleString('en-IN')}</div>}
        <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0.38rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
          <Navigation2 size={12} /> Open in Google Maps
        </a>
      </div>
    </div>
  );
}

// ─── Popup: Project ───────────────────────────────────────────────────────────
function ProjectPopup({ item, navigate }) {
  const minP = item.price_min ? (Number(item.price_min) >= 10000000 ? `₹${(item.price_min/10000000).toFixed(2)} Cr` : `₹${(item.price_min/100000).toFixed(1)} L`) : null;
  return (
    <div style={{ width: 300, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#78350f,#d97706)', padding: '0.85rem 1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Builder · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 2 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>by {item.developer_name}</div>
      </div>
      <div style={{ padding: '0.8rem 1rem', background: '#fff' }}>
        {minP && <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', marginBottom: '0.4rem' }}>from {minP}</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
          {item.project_status && <span style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#fef3c7', borderRadius: 999, color: '#92400e', fontWeight: 700 }}>{cap(item.project_status)}</span>}
          {item.total_listings && <span style={{ fontSize: '0.68rem', padding: '2px 7px', background: '#f1f5f9', borderRadius: 999, color: '#475569', fontWeight: 600 }}>{item.total_listings} units</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <a href={getGoogleMapsUrl(item._lat, item._lng, cap(item.apartment_name) + ', Mumbai')} target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0.38rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, color: '#15803d', textDecoration: 'none' }}>
            <Navigation2 size={12} /> Maps
          </a>
          <button onClick={() => navigate(`/projects/${item.project_id}`)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '0.38rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, fontSize: '0.73rem', fontWeight: 700, color: '#92400e', cursor: 'pointer' }}>
            Details <ChevronRight size={12} />
          </button>
        </div>
        {item.project_url && (
          <a href={item.project_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: '0.4rem', fontSize: '0.65rem', color: '#64748b', textDecoration: 'none' }}>
            <ExternalLink size={10} /> View on Ivy Homes ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Layer Toggle Panel ───────────────────────────────────────────────────────
function LayerPanel({ showListings, setShowListings, showRentals, setShowRentals, showProjects, setShowProjects }) {
  return (
    <div style={{
      position: 'absolute', top: '4.5rem', right: '1rem', zIndex: 1000,
      background: 'rgba(10,14,26,0.93)', backdropFilter: 'blur(16px)',
      borderRadius: '0.9rem', padding: '0.7rem',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '135px',
    }}>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: 2, marginBottom: 2 }}>Layers</div>
      {[
        { label: 'Sale Listings', on: showListings, toggle: () => setShowListings(v => !v), color: '#3b82f6' },
        { label: 'Rentals',       on: showRentals,  toggle: () => setShowRentals(v => !v),  color: '#10b981' },
        { label: 'Projects',      on: showProjects, toggle: () => setShowProjects(v => !v), color: '#f59e0b' },
      ].map(({ label, on, toggle, color }) => (
        <button key={label} onClick={toggle} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '0.38rem 0.55rem', borderRadius: '0.5rem',
          border: on ? `1px solid ${color}44` : '1px solid rgba(255,255,255,0.05)',
          background: on ? `${color}18` : 'transparent',
          cursor: 'pointer', transition: 'all 0.18s',
          fontSize: '0.75rem', fontWeight: 600,
          color: on ? color : 'rgba(255,255,255,0.38)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? color : 'rgba(255,255,255,0.15)', display: 'inline-block', boxShadow: on ? `0 0 6px ${color}` : 'none', flexShrink: 0 }} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ lCount, rCount, pCount, showL, showR, showP }) {
  return (
    <div style={{
      position: 'absolute', top: '0.9rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', gap: '0.45rem', alignItems: 'center',
      background: 'rgba(10,14,26,0.88)', backdropFilter: 'blur(16px)',
      borderRadius: '999px', padding: '0.4rem 0.9rem',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
      fontSize: '0.72rem', fontWeight: 700, color: '#fff',
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: '#60a5fa' }}>{showL ? lCount.toLocaleString('en-IN') : 0} listings</span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
      <span style={{ color: '#34d399' }}>{showR ? rCount.toLocaleString('en-IN') : 0} rentals</span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
      <span style={{ color: '#fbbf24' }}>{showP ? pCount.toLocaleString('en-IN') : 0} projects</span>
    </div>
  );
}

// ─── Map Legend ───────────────────────────────────────────────────────────────
function MapLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: '2.5rem', left: '1rem', zIndex: 1000,
      background: 'rgba(10,14,26,0.88)', backdropFilter: 'blur(14px)',
      borderRadius: '0.75rem', padding: '0.6rem 0.85rem',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', gap: '0.28rem',
    }}>
      {[['#3b82f6','Sale Listing'],['#10b981','Rental'],['#f59e0b','Builder Project']].map(([color,label]) => (
        <div key={label} style={{ display:'flex', alignItems:'center', gap:7, fontSize:'0.72rem', fontWeight:600, color:'rgba(255,255,255,0.78)' }}>
          <span style={{ width:9, height:9, borderRadius:'50%', background:color, display:'inline-block', boxShadow:`0 0 5px ${color}` }} />
          {label}
        </div>
      ))}
    </div>
  );
}

// ─── Main MapPage ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [rentals,  setRentals]  = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [zoom, setZoom] = useState(12);
  const [showListings, setShowListings] = useState(true);
  const [showRentals,  setShowRentals]  = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState('');

  const handleZoom = useCallback(z => setZoom(z), []);

  const LOCALITIES = [
    '', 'andheri west', 'bandra east', 'borivali west', 'chembur',
    'goregaon east', 'kandivali east', 'malad west', 'mulund west', 'powai', 'thane west',
  ];

  // ─── Load all data in parallel ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [lr, rr, pr] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}listings.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}rentals.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}projects.json`).then(r => r.json()),
        ]);

        if (!mounted) return;

        // Normalize project prices
        const normPrice = v => {
          if (!v || isNaN(v) || v <= 0) return null;
          const n = Number(v);
          return n >= 100000 ? n : n >= 20 ? Math.round(n * 100000) : Math.round(n * 10000000);
        };

        const rawL = Array.isArray(lr) ? lr : (lr.results || []);
        const rawR = Array.isArray(rr) ? rr : (rr.results || []);
        const rawP = Array.isArray(pr) ? pr : (pr.results || []);

        setListings(
          deduplicateListings(filterFakeListings(rawL))
            .filter(l => l.is_live === true && l.latitude && l.longitude)
            .map(l => { const f = fixCoordinates(l); return { ...f, _lat: f.latitude, _lng: f.longitude }; })
        );
        setRentals(
          rawR.filter(r => r.is_live !== false && r.latitude && r.longitude)
            .map(r => { const f = fixCoordinates(r); return { ...f, _lat: f.latitude, _lng: f.longitude }; })
        );
        setProjects(
          rawP.filter(p => p.latitude && p.longitude)
            .map(p => {
              const f = fixCoordinates(p);
              return { ...f, price_min: normPrice(p.price_min), price_max: normPrice(p.price_max), _lat: f.latitude, _lng: f.longitude };
            })
        );
      } catch (err) {
        console.error('Map load error:', err);
        if (mounted) setLoadError('Failed to load map data. Please refresh.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // ─── Locality filter ───────────────────────────────────────────────────
  const filtL = useMemo(() => selectedLocality ? listings.filter(l => l.locality?.toLowerCase() === selectedLocality) : listings, [listings, selectedLocality]);
  const filtR = useMemo(() => selectedLocality ? rentals.filter(r  => r.locality?.toLowerCase()  === selectedLocality) : rentals,  [rentals,  selectedLocality]);
  const filtP = useMemo(() => selectedLocality ? projects.filter(p => p.locality?.toLowerCase()  === selectedLocality) : projects, [projects, selectedLocality]);

  // ─── Cluster ───────────────────────────────────────────────────────────
  const clL = useMemo(() => clusterPoints(filtL, zoom), [filtL, zoom]);
  const clR = useMemo(() => clusterPoints(filtR, zoom), [filtR, zoom]);
  const clP = useMemo(() => clusterPoints(filtP, zoom), [filtP, zoom]);

  // ─── Loading / error states ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="main-content" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', gap:'1.5rem' }}>
        <Loader2 size={48} color="var(--accent-primary)" style={{ animation:'spin 1s linear infinite' }} />
        <div style={{ textAlign:'center' }}>
          <p style={{ fontWeight:700, fontSize:'1.1rem', color:'var(--text-heading)' }}>Loading Mumbai Property Map…</p>
          <p style={{ color:'var(--text-muted)', fontSize:'0.875rem', marginTop:4 }}>Fetching {0} listings, rentals &amp; projects</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="main-content" style={{ textAlign:'center', padding:'4rem 2rem' }}>
        <Map size={48} color="var(--text-muted)" style={{ marginBottom:'1rem' }} />
        <h2 style={{ color:'var(--text-heading)', fontWeight:700 }}>{loadError}</h2>
        <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop:'1.5rem' }}>Reload</button>
      </div>
    );
  }

  return (
    <motion.div className="main-content" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.4 }} style={{ paddingBottom:'1rem' }}>

      {/* ─── Header ─── */}
      <div className="page-header" style={{ marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
          <span className="badge badge-blue">Interactive Map</span>
          <span className="badge badge-slate">Mumbai · No API Key Required</span>
          <span className="badge badge-emerald">OpenStreetMap · Free</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Map size={26} strokeWidth={1.5} /> Mumbai Property Map
            </h1>
            <p className="page-subtitle">
              {listings.length.toLocaleString('en-IN')} unique homes · {rentals.length.toLocaleString('en-IN')} rentals · {projects.length.toLocaleString('en-IN')} projects — real coords, no fakes
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <label style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Locality:</label>
            <select value={selectedLocality} onChange={e => setSelectedLocality(e.target.value)} className="input-field"
              style={{ fontSize:'0.82rem', padding:'0.35rem 0.7rem', minWidth:'155px', textTransform:'capitalize' }}>
              {LOCALITIES.map(loc => (
                <option key={loc} value={loc} style={{ textTransform:'capitalize' }}>
                  {loc === '' ? 'All Mumbai' : cap(loc)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── Map Container ─── */}
      <div style={{
        position:'relative', borderRadius:'1.25rem', overflow:'hidden',
        boxShadow:'0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px var(--border-subtle)',
        height:'calc(100vh - 220px)', minHeight:'520px',
      }}>
        <StatsBar lCount={filtL.length} rCount={filtR.length} pCount={filtP.length} showL={showListings} showR={showRentals} showP={showProjects} />
        <LayerPanel showListings={showListings} setShowListings={setShowListings} showRentals={showRentals} setShowRentals={setShowRentals} showProjects={showProjects} setShowProjects={setShowProjects} />

        <MapContainer
          center={[MUMBAI_CENTER.lat, MUMBAI_CENTER.lng]}
          zoom={12}
          style={{ width:'100%', height:'100%' }}
          scrollWheelZoom
        >
          <ZoomWatcher onZoom={handleZoom} />

          {/* Dark premium tile — free, no API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* ── LISTINGS ── */}
          {showListings && clL.map((cl, i) => {
            const single = cl.items.length === 1;
            return (
              <Marker key={`L${i}`} position={[cl.lat, cl.lng]} icon={single ? ICON_LISTING : makeClusterIcon(cl.items.length, '#3b82f6')}>
                <Popup maxWidth={300} minWidth={200}>
                  {single
                    ? <ListingPopup item={cl.items[0]} navigate={navigate} />
                    : <div style={{ padding:'0.6rem 0.8rem', fontFamily:'Inter,sans-serif' }}><b style={{ color:'#3b82f6' }}>🔵 {cl.items.length} listings</b><br/><small style={{ color:'#64748b' }}>Zoom in to see each property</small></div>
                  }
                </Popup>
              </Marker>
            );
          })}

          {/* ── RENTALS ── */}
          {showRentals && clR.map((cl, i) => {
            const single = cl.items.length === 1;
            return (
              <Marker key={`R${i}`} position={[cl.lat, cl.lng]} icon={single ? ICON_RENTAL : makeClusterIcon(cl.items.length, '#10b981')}>
                <Popup maxWidth={280} minWidth={190}>
                  {single
                    ? <RentalPopup item={cl.items[0]} />
                    : <div style={{ padding:'0.6rem 0.8rem', fontFamily:'Inter,sans-serif' }}><b style={{ color:'#10b981' }}>🟢 {cl.items.length} rentals</b><br/><small style={{ color:'#64748b' }}>Zoom in to see each rental</small></div>
                  }
                </Popup>
              </Marker>
            );
          })}

          {/* ── PROJECTS ── */}
          {showProjects && clP.map((cl, i) => {
            const single = cl.items.length === 1;
            return (
              <Marker key={`P${i}`} position={[cl.lat, cl.lng]} icon={single ? ICON_PROJECT : makeClusterIcon(cl.items.length, '#f59e0b')}>
                <Popup maxWidth={310} minWidth={200}>
                  {single
                    ? <ProjectPopup item={cl.items[0]} navigate={navigate} />
                    : <div style={{ padding:'0.6rem 0.8rem', fontFamily:'Inter,sans-serif' }}><b style={{ color:'#f59e0b' }}>🟡 {cl.items.length} projects</b><br/><small style={{ color:'#64748b' }}>Zoom in to see each project</small></div>
                  }
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <MapLegend />
      </div>

      {/* Popup style overrides */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
          overflow: hidden !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 16px rgba(0,0,0,0.35) !important; }
        .leaflet-control-zoom a { background: rgba(10,14,26,0.92) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .leaflet-control-zoom a:hover { background: rgba(59,130,246,0.8) !important; }
        .leaflet-control-attribution { background: rgba(10,14,26,0.65) !important; color: rgba(255,255,255,0.4) !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.45) !important; }
      `}</style>
    </motion.div>
  );
}
