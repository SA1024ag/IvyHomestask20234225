import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Building2,
  Home,
  KeyRound,
  FolderKanban,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  MapPin,
  CheckCircle2,
  Activity,
  ArrowLeftRight,
  BarChart3,
  Search,
  Layers,
  Award,
  ShieldAlert,
  BedDouble,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOCALITIES = [
  { id: 'all', name: 'All Mumbai Localities' },
  { id: 'bandra west', name: 'Bandra West' },
  { id: 'worli', name: 'Worli' },
  { id: 'powai', name: 'Powai' },
  { id: 'andheri west', name: 'Andheri West' },
  { id: 'lower parel', name: 'Lower Parel' },
  { id: 'juhu', name: 'Juhu' },
  { id: 'dadar', name: 'Dadar' },
  { id: 'khar', name: 'Khar' }
];

const LOCALITY_SPOTLIGHTS = [
  {
    name: 'Bandra West',
    tagline: 'Queen of Suburbs • Sea Face & Chic Living',
    medianPrice: '₹5.20 Cr',
    pricePerSqft: '₹48,200',
    count: '1,180+',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
    badge: 'High Demand'
  },
  {
    name: 'Worli',
    tagline: 'South Mumbai Luxury Corridor & Sea Link',
    medianPrice: '₹7.80 Cr',
    pricePerSqft: '₹62,500',
    count: '840+',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
    badge: 'Ultra Luxury'
  },
  {
    name: 'Powai',
    tagline: 'Lakeside Tech, Startup & Academic Hub',
    medianPrice: '₹2.40 Cr',
    pricePerSqft: '₹24,800',
    count: '720+',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    badge: 'Executive Leases'
  },
  {
    name: 'Andheri West',
    tagline: 'Vibrant Entertainment, Dining & Metro Nexus',
    medianPrice: '₹2.85 Cr',
    pricePerSqft: '₹28,600',
    count: '950+',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    badge: 'Urban Lifestyle'
  },
  {
    name: 'Lower Parel',
    tagline: 'Corporate Financial Epicenter & Mills',
    medianPrice: '₹4.50 Cr',
    pricePerSqft: '₹42,000',
    count: '610+',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    badge: 'Prime Commercial'
  },
  {
    name: 'Juhu',
    tagline: 'Celebrity Beachfront Enclave & Serenity',
    medianPrice: '₹9.10 Cr',
    pricePerSqft: '₹68,000',
    count: '400+',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    badge: 'Private Estates'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Interactive Quick Search State
  const [searchMode, setSearchMode] = useState('buy'); // 'buy' | 'rent' | 'projects'
  const [selectedLocality, setSelectedLocality] = useState('all');
  const [selectedBhk, setSelectedBhk] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');

  const handleLaunchSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedLocality && selectedLocality !== 'all') {
      params.append('locality', selectedLocality);
    }

    if (searchMode === 'buy') {
      if (selectedBhk && selectedBhk !== 'all') params.append('bhk', selectedBhk);
      if (selectedBudget === 'under2') {
        params.append('max_price', '20000000');
      } else if (selectedBudget === '2to5') {
        params.append('min_price', '20000000');
        params.append('max_price', '50000000');
      } else if (selectedBudget === '5to10') {
        params.append('min_price', '50000000');
        params.append('max_price', '100000000');
      } else if (selectedBudget === 'above10') {
        params.append('min_price', '100000000');
      }
      navigate(`/listings?${params.toString()}`);
    } else if (searchMode === 'rent') {
      if (selectedBhk && selectedBhk !== 'all') params.append('bhk', selectedBhk);
      if (selectedBudget === 'under50k') {
        params.append('max_price', '50000');
      } else if (selectedBudget === '50kto1L') {
        params.append('min_price', '50000');
        params.append('max_price', '100000');
      } else if (selectedBudget === '1Lto2L') {
        params.append('min_price', '100000');
        params.append('max_price', '200000');
      } else if (selectedBudget === 'above2L') {
        params.append('min_price', '200000');
      }
      navigate(`/rentals?${params.toString()}`);
    } else {
      // Projects
      navigate(`/projects?${params.toString()}`);
    }
  };

  const handleSelectModeFromCard = (mode) => {
    setSearchMode(mode);
    const filterSection = document.getElementById('search-filter-section');
    if (filterSection) {
      filterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="landing-glow-orb-1" />
      <div className="landing-glow-orb-2" />
      <div className="landing-glow-orb-3" />

      {/* Main Single Responsive Container with Clean, Non-redundant Padding */}
      <div className="main-content" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2.25rem',
        padding: '1.25rem 1.5rem 3.5rem'
      }}>
        {/* =====================================================================
            1. HERO HEADER SECTION
            ===================================================================== */}
        <div style={{
          textAlign: 'center',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Animated Hero Trust Badge */}
          <div className="landing-hero-badge">
            <span className="landing-pulse-dot" />
            <span>Forensic Mumbai Real Estate • 0% Fake Bait • 100% Verified</span>
          </div>

          {/* User Welcome Pill if Authenticated */}
          {isAuthenticated && (
            <span className="badge badge-emerald" style={{ fontSize: '0.78rem', padding: '0.3rem 0.8rem' }}>
              <CheckCircle2 size={13} /> Active Session: Welcome back, {user?.name || user?.email}
            </span>
          )}

          {/* Hero Gradient Title */}
          <h1 className="landing-gradient-title" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.04em',
            margin: '0.2rem 0'
          }}>
            The Intelligent Way to Discover Real Estate in Mumbai.
          </h1>

          {/* Hero Subtitle */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            maxWidth: '740px',
            margin: 0
          }}>
            Zero duplicate broker spam. Zero fake clickbait pricing. Choose from three unbiased, data-audited discovery channels across verified sales, corporate leases, and tier-1 builder developments.
          </p>
        </div>

        {/* =====================================================================
            2. THE 3 CORE PILLARS DIRECTLY BELOW SUBTITLE (NO UNNECESSARY SPACING)
            ===================================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* ==================== OPTION 1: BUY ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '1.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Accent Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4338ca 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 6px 16px rgba(67, 56, 202, 0.3)'
                }}>
                  <Home size={22} />
                </div>
                <span className="badge badge-accent" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}>
                  5,100 Verified Records
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Properties for Sale
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Exclusive residences, penthouses, and gated sea-view complexes across Mumbai's elite corridors. Every property is audited for genuine pricing and physical dimensions.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.65rem',
                marginBottom: '1.25rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Median Price</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>₹3.30 Cr</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Carpet Rate</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-primary)' }}>₹32,528/sqft</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <NavLink to="/listings?locality=bandra+west" className="landing-quick-chip">
                  Bandra West
                </NavLink>
                <NavLink to="/listings?locality=worli" className="landing-quick-chip">
                  Worli
                </NavLink>
                <NavLink to="/listings?bhk=3" className="landing-quick-chip">
                  3 BHK
                </NavLink>
                <NavLink to="/listings?max_price=20000000" className="landing-quick-chip">
                  &lt; ₹2 Cr
                </NavLink>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <NavLink
                to="/listings"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.25rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Explore Properties for Sale</span>
                <ArrowRight size={15} />
              </NavLink>
              <button
                type="button"
                onClick={() => handleSelectModeFromCard('buy')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--accent-text)', justifyContent: 'center', gap: '4px', padding: '0.3rem' }}
              >
                <SlidersHorizontal size={12} />
                <span>Configure Filters Below</span>
              </button>
            </div>
          </div>

          {/* ==================== OPTION 2: RENT ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '1.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Accent Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 6px 16px rgba(5, 150, 105, 0.3)'
                }}>
                  <KeyRound size={22} />
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}>
                  Curated Executive Leases
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Rental Residences
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Vetted rental homes for corporate executives, expatriates, and families. Transparent security deposits, accurate furnishing states, and zero fake pricing bait.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.65rem',
                marginBottom: '1.25rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Move-In Speed</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>Immediate</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Lease Clarity</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>100% Honest</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <NavLink to="/rentals?furnishing=fully-furnished" className="landing-quick-chip">
                  Fully Furnished
                </NavLink>
                <NavLink to="/rentals?locality=powai" className="landing-quick-chip">
                  Powai IT Hub
                </NavLink>
                <NavLink to="/rentals?bhk=2" className="landing-quick-chip">
                  2 BHK Leases
                </NavLink>
                <NavLink to="/rentals?locality=andheri+west" className="landing-quick-chip">
                  Andheri West
                </NavLink>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <NavLink
                to="/rentals"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.25rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                }}
              >
                <span>Browse Rental Homes</span>
                <ArrowRight size={15} />
              </NavLink>
              <button
                type="button"
                onClick={() => handleSelectModeFromCard('rent')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: '#059669', justifyContent: 'center', gap: '4px', padding: '0.3rem' }}
              >
                <SlidersHorizontal size={12} />
                <span>Configure Filters Below</span>
              </button>
            </div>
          </div>

          {/* ==================== OPTION 3: PROJECTS ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '1.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Accent Pill */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 6px 16px rgba(217, 119, 6, 0.3)'
                }}>
                  <FolderKanban size={22} />
                </div>
                <span className="badge badge-amber" style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}>
                  50+ Master Projects
                </span>
              </div>

              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                Builder Developments
              </h3>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Direct-from-developer RERA-registered projects by tier-1 builders (Lodha, Godrej, Oberoi). Verified possession timelines and normalized ₹ Cr pricing.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.65rem',
                marginBottom: '1.25rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Developer Tier</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)' }}>Tier-1 RERA</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Pricing Unit</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706' }}>Correct ₹ Cr</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                <NavLink to="/projects?search=Lodha" className="landing-quick-chip">
                  Lodha
                </NavLink>
                <NavLink to="/projects?search=Godrej" className="landing-quick-chip">
                  Godrej
                </NavLink>
                <NavLink to="/projects" className="landing-quick-chip">
                  RERA Approved
                </NavLink>
                <NavLink to="/projects" className="landing-quick-chip">
                  Pre-Launch
                </NavLink>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <NavLink
                to="/projects"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.25rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.15s ease',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
                }}
              >
                <span>Discover Builder Projects</span>
                <ArrowRight size={15} />
              </NavLink>
              <button
                type="button"
                onClick={() => handleSelectModeFromCard('projects')}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', color: '#d97706', justifyContent: 'center', gap: '4px', padding: '0.3rem' }}
              >
                <SlidersHorizontal size={12} />
                <span>Configure Filters Below</span>
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. INTERACTIVE MULTI-MODE SEARCH & FILTER CONSOLE
            ===================================================================== */}
        <div id="search-filter-section" style={{ maxWidth: '1080px', width: '100%', margin: '0 auto' }}>
          <div className="ivy-card" style={{
            padding: '1.5rem 1.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 16px 32px -12px rgba(15, 23, 42, 0.1), 0 0 0 1px var(--border-subtle)',
            textAlign: 'left'
          }}>
            {/* Header / Instructions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-accent">
                    <SlidersHorizontal size={12} /> Fast Search & Filter
                  </span>
                  <span className="badge badge-slate">Real-time Catalog Query</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                  Filter & Search Mumbai Real Estate
                </h3>
              </div>

              {/* Mode Switcher Tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '4px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                gap: '4px',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={() => setSearchMode('buy')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    backgroundColor: searchMode === 'buy' ? 'var(--accent-primary)' : 'transparent',
                    color: searchMode === 'buy' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <Home size={13} />
                  <span>Buy (5,100)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMode('rent')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    backgroundColor: searchMode === 'rent' ? '#059669' : 'transparent',
                    color: searchMode === 'rent' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <KeyRound size={13} />
                  <span>Rent (Curated)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMode('projects')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    backgroundColor: searchMode === 'projects' ? '#d97706' : 'transparent',
                    color: searchMode === 'projects' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <FolderKanban size={13} />
                  <span>Projects (RERA)</span>
                </button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <form onSubmit={handleLaunchSearch} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) 160px',
              gap: '1rem',
              alignItems: 'flex-end'
            }}>
              {/* Field 1: Locality */}
              <div className="input-group">
                <label className="input-label" htmlFor="quick-locality">
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Target Locality
                </label>
                <select
                  id="quick-locality"
                  className="input-field"
                  value={selectedLocality}
                  onChange={(e) => setSelectedLocality(e.target.value)}
                  style={{ height: '40px', cursor: 'pointer' }}
                >
                  {LOCALITIES.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: BHK Bedrooms (for buy / rent) */}
              {searchMode !== 'projects' ? (
                <div className="input-group">
                  <label className="input-label" htmlFor="quick-bhk">
                    <BedDouble size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Configuration
                  </label>
                  <select
                    id="quick-bhk"
                    className="input-field"
                    value={selectedBhk}
                    onChange={(e) => setSelectedBhk(e.target.value)}
                    style={{ height: '40px', cursor: 'pointer' }}
                  >
                    <option value="all">Any Bedroom (BHK)</option>
                    <option value="1">1 BHK Residence</option>
                    <option value="2">2 BHK Residence</option>
                    <option value="3">3 BHK Premium</option>
                    <option value="4">4+ BHK Luxury</option>
                  </select>
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label" htmlFor="quick-dev-type">
                    <FolderKanban size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Project Type
                  </label>
                  <select
                    id="quick-dev-type"
                    className="input-field"
                    defaultValue="all"
                    style={{ height: '40px', cursor: 'pointer' }}
                  >
                    <option value="all">All RERA Projects</option>
                    <option value="ready">Ready Possession</option>
                    <option value="under-construction">Under Construction (2026-2028)</option>
                  </select>
                </div>
              )}

              {/* Field 3: Budget Range */}
              <div className="input-group">
                <label className="input-label" htmlFor="quick-budget">
                  <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Budget Bracket
                </label>
                {searchMode === 'buy' || searchMode === 'projects' ? (
                  <select
                    id="quick-budget"
                    className="input-field"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    style={{ height: '40px', cursor: 'pointer' }}
                  >
                    <option value="all">Any Price Bracket</option>
                    <option value="under2">Under ₹2.00 Cr</option>
                    <option value="2to5">₹2.00 Cr – ₹5.00 Cr</option>
                    <option value="5to10">₹5.00 Cr – ₹10.00 Cr</option>
                    <option value="above10">Ultra Luxury (₹10+ Cr)</option>
                  </select>
                ) : (
                  <select
                    id="quick-budget"
                    className="input-field"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    style={{ height: '40px', cursor: 'pointer' }}
                  >
                    <option value="all">Any Monthly Lease</option>
                    <option value="under50k">Under ₹50,000 / mo</option>
                    <option value="50kto1L">₹50,000 – ₹1,00,000 / mo</option>
                    <option value="1Lto2L">₹1,00,000 – ₹2,00,000 / mo</option>
                    <option value="above2L">Executive (₹2,00,000+ / mo)</option>
                  </select>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  height: '40px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: searchMode === 'rent'
                    ? '0 4px 14px rgba(5, 150, 105, 0.35)'
                    : searchMode === 'projects'
                    ? '0 4px 14px rgba(217, 119, 6, 0.35)'
                    : '0 4px 14px rgba(79, 70, 229, 0.35)',
                  backgroundColor: searchMode === 'rent'
                    ? '#059669'
                    : searchMode === 'projects'
                    ? '#d97706'
                    : 'var(--accent-primary)'
                }}
              >
                <Search size={15} />
                <span>Search {searchMode === 'buy' ? 'Sales' : searchMode === 'rent' ? 'Rentals' : 'Projects'}</span>
              </button>
            </form>

            {/* Quick Filter Shortcuts */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ fontWeight: 600 }}>Popular Shortcuts:</span>
              <NavLink to="/listings?locality=bandra+west" className="landing-quick-chip">
                Bandra West
              </NavLink>
              <NavLink to="/listings?locality=worli&bhk=3" className="landing-quick-chip">
                Worli 3 BHK
              </NavLink>
              <NavLink to="/rentals?furnishing=fully-furnished" className="landing-quick-chip">
                Fully Furnished Rentals
              </NavLink>
              <NavLink to="/projects" className="landing-quick-chip">
                Tier-1 Builder Projects
              </NavLink>
              <NavLink to="/compare" className="landing-quick-chip">
                <ArrowLeftRight size={11} /> Compare Assets
              </NavLink>
            </div>
          </div>
        </div>

        {/* =====================================================================
            4. LIVE MARKET TELEMETRY & AUDIT INTEGRITY BANNER
            ===================================================================== */}
        <div className="ivy-card" style={{
          padding: '1.35rem 1.75rem',
          background: 'linear-gradient(to right, var(--bg-surface), var(--bg-surface-subtle))',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-green-bg)',
                color: 'var(--status-green-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Activity size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Citywide Benchmark</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>₹32,528 / sqft</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-blue-bg)',
                color: 'var(--status-blue-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Median Valuation</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>₹3.30 Cr</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Deduplicated Catalog</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>4,775 Unique Homes</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-amber-bg)',
                color: 'var(--status-amber-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Forensic Health Shield</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#10b981' }}>10 / 10 Mitigated</div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            5. THE FORENSIC ADVANTAGE (WHY IVYHOMES IS BUILT DIFFERENT)
            ===================================================================== */}
        <div>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
              <Award size={13} /> Engineering Integrity
            </span>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
              Built With Forensic Data Integrity
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '640px', margin: '0.3rem auto 0 auto' }}>
              Most portals dump raw broker scrapings with fake bait prices and ghost listings. IvyHomes runs defensive sanitization on every single byte.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* Edge 1 */}
            <div className="ivy-card" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-blue-bg)',
                color: 'var(--status-blue-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}>
                <Layers size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Zero Duplicate Broker Spam
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Composite fingerprinting maps syndicated listings across agencies into single physical entities. 5,100 raw listings collapsed into 4,775 distinct homes.
              </p>
            </div>

            {/* Edge 2 */}
            <div className="ivy-card" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-amber-bg)',
                color: 'var(--status-amber-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}>
                <ShieldAlert size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Zero Fake Lead-Generation Bait
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Automated price-per-sqft outlier filters catch and isolate fake &lt;₹5,000/sqft bait listings intended by unscrupulous brokers to harvest buyer phone numbers.
              </p>
            </div>

            {/* Edge 3 */}
            <div className="ivy-card" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}>
                <ArrowLeftRight size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Unified Multi-Asset Compare
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                The first engine in India enabling direct side-by-side comparisons of ready sales, rental leases, and under-construction developments in one clean view.
              </p>
            </div>

            {/* Edge 4 */}
            <div className="ivy-card" style={{ padding: '1.5rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--status-green-bg)',
                color: 'var(--status-green-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                True Live Developer Inventories
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Reconciled 446 builder projects where self-reported availability counts misrepresent live inventory, giving you genuine unit counts and normalized ₹ Cr pricing.
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================================
            6. PRIME MUMBAI NEIGHBORHOODS SPOTLIGHT
            ===================================================================== */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span className="badge badge-slate" style={{ marginBottom: '0.4rem' }}>
                <MapPin size={12} /> Micro-Market Exploration
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
                Explore Prime Mumbai Enclaves
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Real-time micro-market median valuations and live inventory counts across the city's highest-velocity hubs.
              </p>
            </div>
            <NavLink to="/insights" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              <BarChart3 size={14} />
              <span>View Micro-Market Intelligence</span>
            </NavLink>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '1.25rem'
          }}>
            {LOCALITY_SPOTLIGHTS.map((loc, idx) => (
              <div
                key={idx}
                className="ivy-card landing-card-hover"
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      {loc.name}
                    </span>
                    <span className="badge badge-accent" style={{ fontSize: '0.68rem' }}>
                      {loc.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {loc.tagline}
                  </p>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.75rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.85rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Median Price</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-heading)' }}>{loc.medianPrice}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Rate</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{loc.pricePerSqft}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/listings?locality=${encodeURIComponent(loc.name.toLowerCase())}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      View Sales
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/rentals?locality=${encodeURIComponent(loc.name.toLowerCase())}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
                    >
                      View Rentals
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            7. HIGH-CONVERSION CTA FOOTER BANNER
            ===================================================================== */}
        <div style={{
          padding: '2.5rem 1.75rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #0369a1 100%)',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 20px 40px -12px rgba(67, 56, 202, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.85rem'
            }}>
              <Sparkles size={12} /> The Standard in Mumbai Real Estate
            </span>

            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.75rem', color: '#ffffff' }}>
              Ready to Explore Mumbai's Finest Properties?
            </h2>

            <p style={{ fontSize: '0.925rem', opacity: 0.9, lineHeight: 1.55, marginBottom: '1.75rem' }}>
              Choose your discovery path and experience audited listings, instant comparisons, and authentic market valuations without broker games.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <NavLink
                to="/listings"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  color: '#4338ca',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span>Explore Properties (Buy)</span>
                <ArrowRight size={15} />
              </NavLink>

              <NavLink
                to="/rentals"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span>Browse Rentals</span>
              </NavLink>

              <NavLink
                to="/projects"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span>Builder Projects</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
