import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Building2, Home, Tag, ExternalLink, Navigation2, Layers, X, ChevronRight, Loader2 } from 'lucide-react';

import {
  filterFakeListings,
  deduplicateListings,
  fixCoordinates,
  getGoogleMapsUrl,
  MUMBAI_CENTER,
} from '../utils/dataUtils';

// ─── Fix Leaflet default icon paths (Vite/webpack asset issue) ────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Custom SVG 3D-style Pin Icons ────────────────────────────────────────────
function makePinIcon(color, glowColor, size = 38) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}">
      <defs>
        <radialGradient id="g1" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="100%" stop-color="${color}"/>
        </radialGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${glowColor}" flood-opacity="0.6"/>
        </filter>
      </defs>
      <!-- Drop shadow ellipse under pin -->
      <ellipse cx="${size / 2}" cy="${size + 6}" rx="${size / 4}" ry="4" fill="${glowColor}" opacity="0.35"/>
      <!-- Pin body -->
      <circle cx="${size / 2}" cy="${size / 2 - 4}" r="${size / 2 - 3}" fill="url(#g1)" filter="url(#shadow)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <!-- Pin stem -->
      <path d="M${size / 2 - 5},${size - 8} Q${size / 2},${size + 6} ${size / 2 + 5},${size - 8}" fill="${color}" filter="url(#shadow)"/>
      <!-- Highlight glint -->
      <circle cx="${size / 2 - 5}" cy="${size / 2 - 10}" r="4" fill="rgba(255,255,255,0.5)"/>
    </svg>
  `.trim();

  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
  });
}

const LISTING_ICON  = makePinIcon('#3b82f6', '#1d4ed8', 36);
const RENTAL_ICON   = makePinIcon('#10b981', '#065f46', 36);
const PROJECT_ICON  = makePinIcon('#f59e0b', '#92400e', 40);

// ─── Cluster-style icon factory ───────────────────────────────────────────────
function makeClusterIcon(count, color) {
  const size = count < 10 ? 36 : count < 100 ? 44 : 52;
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        display:flex;align-items:center;justify-content:center;
        font-size:${size < 44 ? 12 : 14}px;font-weight:800;color:#fff;
        box-shadow:0 4px 14px ${color}99,0 0 0 3px rgba(255,255,255,0.3);
        border:2px solid rgba(255,255,255,0.7);
        font-family:'Inter',sans-serif;
      ">${count}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// ─── Simple manual clustering (no external plugin needed) ────────────────────
function clusterMarkers(items, zoom) {
  // At high zoom levels, don't cluster; at low zoom, group by ~0.01° grid
  const GRID = zoom >= 14 ? 0.003 : zoom >= 12 ? 0.01 : zoom >= 10 ? 0.03 : 0.08;
  const clusters = new Map();

  for (const item of items) {
    const lat = Number(item._lat);
    const lng = Number(item._lng);
    if (isNaN(lat) || isNaN(lng)) continue;

    const gridLat = Math.round(lat / GRID) * GRID;
    const gridLng = Math.round(lng / GRID) * GRID;
    const key = `${gridLat.toFixed(6)}_${gridLng.toFixed(6)}`;

    if (clusters.has(key)) {
      clusters.get(key).items.push(item);
    } else {
      clusters.set(key, { lat: gridLat, lng: gridLng, items: [item] });
    }
  }

  return [...clusters.values()];
}

// ─── Map zoom tracker ─────────────────────────────────────────────────────────
function ZoomTracker({ onZoom }) {
  const map = useMap();
  useEffect(() => {
    const handler = () => onZoom(map.getZoom());
    map.on('zoomend', handler);
    return () => map.off('zoomend', handler);
  }, [map, onZoom]);
  return null;
}

// ─── Format price helpers ─────────────────────────────────────────────────────
function fmtPrice(p, isRental = false) {
  const n = Number(p);
  if (!n || isNaN(n)) return '—';
  if (isRental) return `₹${n.toLocaleString('en-IN')}/mo`;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtProjectPrice(p) {
  const n = Number(p);
  if (!n || isNaN(n) || n <= 0) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

// ─── Layer stats overlay ──────────────────────────────────────────────────────
function StatsBar({ listingCount, rentalCount, projectCount, showListings, showRentals, showProjects }) {
  const total = (showListings ? listingCount : 0) + (showRentals ? rentalCount : 0) + (showProjects ? projectCount : 0);
  return (
    <div style={{
      position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, display: 'flex', gap: '0.5rem', alignItems: 'center',
      background: 'rgba(10,14,26,0.88)', backdropFilter: 'blur(16px)',
      borderRadius: '999px', padding: '0.45rem 1rem',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      fontSize: '0.75rem', fontWeight: 700, color: '#fff',
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>Showing</span>
      <span style={{ color: '#60a5fa' }}>{showListings ? listingCount.toLocaleString('en-IN') : 0} Listings</span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
      <span style={{ color: '#34d399' }}>{showRentals ? rentalCount.toLocaleString('en-IN') : 0} Rentals</span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
      <span style={{ color: '#fbbf24' }}>{showProjects ? projectCount.toLocaleString('en-IN') : 0} Projects</span>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
      <span style={{ color: '#e2e8f0' }}>{total.toLocaleString('en-IN')} Total</span>
    </div>
  );
}

// ─── Layer Toggle Control ─────────────────────────────────────────────────────
function LayerControl({ showListings, setShowListings, showRentals, setShowRentals, showProjects, setShowProjects }) {
  return (
    <div style={{
      position: 'absolute', top: '4.5rem', right: '1rem',
      zIndex: 1000, background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(16px)',
      borderRadius: '1rem', padding: '0.75rem',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column', gap: '0.4rem',
      minWidth: '140px',
    }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>
        Map Layers
      </div>
      {[
        { label: 'Sale Listings', active: showListings, toggle: () => setShowListings(v => !v), color: '#3b82f6', dot: '🔵' },
        { label: 'Rentals',       active: showRentals,  toggle: () => setShowRentals(v => !v),  color: '#10b981', dot: '🟢' },
        { label: 'Projects',      active: showProjects, toggle: () => setShowProjects(v => !v), color: '#f59e0b', dot: '🟡' },
      ].map(({ label, active, toggle, color, dot }) => (
        <button
          key={label}
          onClick={toggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
            border: active ? `1px solid ${color}44` : '1px solid rgba(255,255,255,0.06)',
            background: active ? `${color}18` : 'transparent',
            cursor: 'pointer', transition: 'all 0.2s ease',
            fontSize: '0.78rem', fontWeight: 600,
            color: active ? color : 'rgba(255,255,255,0.4)',
          }}
        >
          <span style={{ fontSize: '0.7rem' }}>{dot}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Map Page ─────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [rentals, setRentals]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(12);
  const [showListings, setShowListings] = useState(true);
  const [showRentals,  setShowRentals]  = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [selectedLocality, setSelectedLocality] = useState('');
  const mapRef = useRef(null);

  // ─── Load all 3 datasets in parallel ──────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [lr, rr, pr] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}listings.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}rentals.json`).then(r => r.json()),
          fetch(`${import.meta.env.BASE_URL}projects.json`).then(r => r.json()),
        ]);

        // Listings: fake-filter → deduplicate → fix coords → live only
        const rawListings = Array.isArray(lr) ? lr : (lr.results || []);
        const cleanListings = deduplicateListings(filterFakeListings(rawListings))
          .filter(l => l.is_live === true && l.latitude && l.longitude)
          .map(l => {
            const fixed = fixCoordinates(l);
            return { ...fixed, _lat: fixed.latitude, _lng: fixed.longitude, _type: 'listing' };
          });
        setListings(cleanListings);

        // Rentals: fix coords → live only
        const rawRentals = Array.isArray(rr) ? rr : (rr.results || []);
        const cleanRentals = rawRentals
          .filter(r => r.is_live !== false && r.latitude && r.longitude)
          .map(r => {
            const fixed = fixCoordinates(r);
            return { ...fixed, _lat: fixed.latitude, _lng: fixed.longitude, _type: 'rental' };
          });
        setRentals(cleanRentals);

        // Projects: fix coords (they have lat/lon too)
        const rawProjects = Array.isArray(pr) ? pr : (pr.results || []);
        const normalizeProjectPrice = (val) => {
          if (!val || isNaN(val) || val <= 0) return null;
          const n = Number(val);
          if (n >= 100000) return n;
          if (n >= 20) return Math.round(n * 100000);
          return Math.round(n * 10000000);
        };
        const cleanProjects = rawProjects
          .filter(p => p.latitude && p.longitude)
          .map(p => {
            const fixed = fixCoordinates(p);
            return {
              ...fixed,
              price_min: normalizeProjectPrice(p.price_min),
              price_max: normalizeProjectPrice(p.price_max),
              _lat: fixed.latitude,
              _lng: fixed.longitude,
              _type: 'project',
            };
          });
        setProjects(cleanProjects);
      } catch (err) {
        console.error('MapPage load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  const handleZoom = useCallback((z) => setZoom(z), []);

  // ─── Filter by locality ────────────────────────────────────────────────────
  const filteredListings = useMemo(() =>
    selectedLocality ? listings.filter(l => l.locality?.toLowerCase() === selectedLocality) : listings,
  [listings, selectedLocality]);

  const filteredRentals = useMemo(() =>
    selectedLocality ? rentals.filter(r => r.locality?.toLowerCase() === selectedLocality) : rentals,
  [rentals, selectedLocality]);

  const filteredProjects = useMemo(() =>
    selectedLocality ? projects.filter(p => p.locality?.toLowerCase() === selectedLocality) : projects,
  [projects, selectedLocality]);

  // ─── Cluster items by zoom ─────────────────────────────────────────────────
  const listingClusters  = useMemo(() => clusterMarkers(filteredListings, zoom),  [filteredListings, zoom]);
  const rentalClusters   = useMemo(() => clusterMarkers(filteredRentals, zoom),   [filteredRentals, zoom]);
  const projectClusters  = useMemo(() => clusterMarkers(filteredProjects, zoom),  [filteredProjects, zoom]);

  const LOCALITIES = [
    '', 'andheri west', 'bandra east', 'borivali west', 'chembur',
    'goregaon east', 'kandivali east', 'malad west', 'mulund west', 'powai', 'thane west',
  ];

  if (isLoading) {
    return (
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: '1.5rem' }}>
        <Loader2 size={48} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)', textAlign: 'center' }}>Loading Mumbai Property Map…</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', marginTop: '0.25rem' }}>Fetching listings, rentals &amp; projects</p>
        </div>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ paddingBottom: '1rem' }}
    >
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-blue">Interactive Map</span>
          <span className="badge badge-slate">Mumbai (City ID: 5)</span>
          <span className="badge badge-emerald">3D Pin View</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Map size={28} strokeWidth={1.5} />
              Mumbai Property Map
            </h1>
            <p className="page-subtitle">
              {listings.length.toLocaleString('en-IN')} unique homes • {rentals.filter(r => r.is_live !== false).length.toLocaleString('en-IN')} rentals • {projects.length.toLocaleString('en-IN')} builder projects — plotted on real city coordinates
            </p>
          </div>

          {/* Locality quick filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Locality:</label>
            <select
              value={selectedLocality}
              onChange={e => setSelectedLocality(e.target.value)}
              className="input-field"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.7rem', minWidth: '160px', textTransform: 'capitalize' }}
            >
              {LOCALITIES.map(loc => (
                <option key={loc} value={loc} style={{ textTransform: 'capitalize' }}>
                  {loc === '' ? 'All Localities' : loc.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{
        position: 'relative',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px var(--border-subtle)',
        height: 'calc(100vh - 220px)',
        minHeight: '550px',
      }}>
        {/* Stats overlay */}
        <StatsBar
          listingCount={filteredListings.length}
          rentalCount={filteredRentals.length}
          projectCount={filteredProjects.length}
          showListings={showListings}
          showRentals={showRentals}
          showProjects={showProjects}
        />

        {/* Layer toggle */}
        <LayerControl
          showListings={showListings} setShowListings={setShowListings}
          showRentals={showRentals}   setShowRentals={setShowRentals}
          showProjects={showProjects} setShowProjects={setShowProjects}
        />

        <MapContainer
          center={[MUMBAI_CENTER.lat, MUMBAI_CENTER.lng]}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          ref={mapRef}
        >
          <ZoomControl position="bottomright" />
          <ZoomTracker onZoom={handleZoom} />

          {/* Dark premium tile layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* ─── LISTING MARKERS ─── */}
          {showListings && listingClusters.map((cluster, i) => {
            const isCluster = cluster.items.length > 1;
            const item = cluster.items[0];
            const icon = isCluster ? makeClusterIcon(cluster.items.length, '#3b82f6') : LISTING_ICON;

            return (
              <Marker
                key={`listing-cluster-${i}`}
                position={[cluster.lat, cluster.lng]}
                icon={icon}
              >
                {!isCluster && (
                  <Popup maxWidth={320} className="ivy-map-popup">
                    <MapPopupListing item={item} navigate={navigate} />
                  </Popup>
                )}
                {isCluster && (
                  <Popup maxWidth={280}>
                    <div style={{ padding: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                        🔵 {cluster.items.length} Sale Listings
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Zoom in to see individual properties
                      </div>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}

          {/* ─── RENTAL MARKERS ─── */}
          {showRentals && rentalClusters.map((cluster, i) => {
            const isCluster = cluster.items.length > 1;
            const item = cluster.items[0];
            const icon = isCluster ? makeClusterIcon(cluster.items.length, '#10b981') : RENTAL_ICON;

            return (
              <Marker
                key={`rental-cluster-${i}`}
                position={[cluster.lat, cluster.lng]}
                icon={icon}
              >
                {!isCluster && (
                  <Popup maxWidth={320}>
                    <MapPopupRental item={item} />
                  </Popup>
                )}
                {isCluster && (
                  <Popup maxWidth={280}>
                    <div style={{ padding: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                        🟢 {cluster.items.length} Rentals
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Zoom in to see individual rentals</div>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}

          {/* ─── PROJECT MARKERS ─── */}
          {showProjects && projectClusters.map((cluster, i) => {
            const isCluster = cluster.items.length > 1;
            const item = cluster.items[0];
            const icon = isCluster ? makeClusterIcon(cluster.items.length, '#f59e0b') : PROJECT_ICON;

            return (
              <Marker
                key={`project-cluster-${i}`}
                position={[cluster.lat, cluster.lng]}
                icon={icon}
              >
                {!isCluster && (
                  <Popup maxWidth={340}>
                    <MapPopupProject item={item} navigate={navigate} />
                  </Popup>
                )}
                {isCluster && (
                  <Popup maxWidth={280}>
                    <div style={{ padding: '0.5rem', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
                        🟡 {cluster.items.length} Builder Projects
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Zoom in to explore projects</div>
                    </div>
                  </Popup>
                )}
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: '2.5rem', left: '1rem',
          zIndex: 1000, background: 'rgba(10,14,26,0.88)', backdropFilter: 'blur(16px)',
          borderRadius: '0.75rem', padding: '0.65rem 0.9rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', gap: '0.3rem',
        }}>
          {[
            { color: '#3b82f6', label: 'Sale Listing' },
            { color: '#10b981', label: 'Rental' },
            { color: '#f59e0b', label: 'Builder Project' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.25) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          overflow: hidden !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          font-family: 'Inter', sans-serif !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(10,14,26,0.92) !important;
          color: #fff !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(59,130,246,0.8) !important;
        }
        .leaflet-control-attribution {
          background: rgba(10,14,26,0.7) !important;
          color: rgba(255,255,255,0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: rgba(255,255,255,0.5) !important; }
      `}</style>
    </motion.div>
  );
}

// ─── Popup: Sale Listing ───────────────────────────────────────────────────────
function MapPopupListing({ item, navigate }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, item.apartment_name + ', ' + item.locality + ', Mumbai');
  const price = fmtPrice(item.price);
  const cap = s => s ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : '';

  return (
    <div style={{ width: 300, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)', padding: '1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
          Sale Listing · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.15rem' }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      {/* Body */}
      <div style={{ padding: '0.9rem 1rem', background: '#fff' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.6rem' }}>{price}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.8rem' }}>
          {[
            item.furnishing && cap(item.furnishing),
            item.floor && `Floor ${item.floor}/${item.total_floors}`,
            item.facing_direction && cap(item.facing_direction) + ' Facing',
          ].filter(Boolean).map(tag => (
            <span key={tag} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '999px', color: '#475569', fontWeight: 600 }}>{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            <Navigation2 size={13} /> Google Maps
          </a>
          <button
            onClick={() => navigate(`/listings/${item.listing_id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', cursor: 'pointer', flex: 1, justifyContent: 'center' }}
          >
            View Details <ChevronRight size={13} />
          </button>
        </div>
        {item.listing_url && (
          <a href={item.listing_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#64748b', marginTop: '0.5rem', textDecoration: 'none', justifyContent: 'center' }}>
            <ExternalLink size={11} /> View on {item.website || 'portal'} ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Popup: Rental ─────────────────────────────────────────────────────────────
function MapPopupRental({ item }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, item.apartment_name + ', ' + item.locality + ', Mumbai');
  const cap = s => s ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : '';

  return (
    <div style={{ width: 300, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', padding: '1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
          Rental · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.15rem' }}>{item.bedroom} BHK · {item.carpet_area} sqft</div>
      </div>
      <div style={{ padding: '0.9rem 1rem', background: '#fff' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669', marginBottom: '0.25rem' }}>{fmtPrice(item.price, true)}</div>
        {item.deposit && <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.6rem' }}>Deposit: ₹{Number(item.deposit).toLocaleString('en-IN')}</div>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            <Navigation2 size={13} /> Google Maps
          </a>
          {item.listing_url && (
            <a href={item.listing_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
              <ExternalLink size={13} /> View Listing
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Popup: Project ────────────────────────────────────────────────────────────
function MapPopupProject({ item, navigate }) {
  const mapsUrl = getGoogleMapsUrl(item._lat, item._lng, item.apartment_name + ', ' + item.locality + ', Mumbai');
  const cap = s => s ? s.split(' ').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ') : '';
  const minP = fmtProjectPrice(item.price_min);
  const maxP = fmtProjectPrice(item.price_max);

  return (
    <div style={{ width: 320, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)', padding: '1rem', color: '#fff' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>
          Builder Project · {cap(item.locality)}
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.3 }}>{cap(item.apartment_name)}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.15rem' }}>by {item.developer_name}</div>
      </div>
      <div style={{ padding: '0.9rem 1rem', background: '#fff' }}>
        {(minP || maxP) && (
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', marginBottom: '0.4rem' }}>
            {minP && maxP ? `${minP} – ${maxP}` : minP || maxP}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.7rem' }}>
          {item.project_status && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#fef3c7', borderRadius: '999px', color: '#92400e', fontWeight: 600 }}>{cap(item.project_status)}</span>}
          {item.total_listings && <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#f1f5f9', borderRadius: '999px', color: '#475569', fontWeight: 600 }}>{item.total_listings} units</span>}
          {item.rera_number && <span style={{ fontSize: '0.67rem', padding: '0.2rem 0.5rem', background: '#f0fdf4', borderRadius: '999px', color: '#166534', fontWeight: 600, fontFamily: 'monospace' }}>{item.rera_number}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textDecoration: 'none', flex: 1, justifyContent: 'center' }}
          >
            <Navigation2 size={13} /> Google Maps
          </a>
          <button
            onClick={() => navigate(`/projects/${item.project_id}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.7rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', cursor: 'pointer', flex: 1, justifyContent: 'center' }}
          >
            View Project <ChevronRight size={13} />
          </button>
        </div>
        {item.project_url && (
          <a href={item.project_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', color: '#64748b', marginTop: '0.5rem', textDecoration: 'none', justifyContent: 'center' }}>
            <ExternalLink size={11} /> View on Ivy Homes ↗
          </a>
        )}
      </div>
    </div>
  );
}
