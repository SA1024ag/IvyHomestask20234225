import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LOCALITY_SPOTLIGHTS = [
  {
    name: 'Bandra West',
    tagline: 'Queen of Suburbs • Sea Face & Chic Living',
    medianPrice: '₹5.20 Cr',
    pricePerSqft: '₹48,200',
    count: '1,180+',
    badge: 'High Demand'
  },
  {
    name: 'Worli',
    tagline: 'South Mumbai Luxury Corridor & Sea Link',
    medianPrice: '₹7.80 Cr',
    pricePerSqft: '₹62,500',
    count: '840+',
    badge: 'Ultra Luxury'
  },
  {
    name: 'Powai',
    tagline: 'Lakeside Tech, Startup & Academic Hub',
    medianPrice: '₹2.40 Cr',
    pricePerSqft: '₹24,800',
    count: '720+',
    badge: 'Executive Leases'
  },
  {
    name: 'Andheri West',
    tagline: 'Vibrant Entertainment, Dining & Metro Nexus',
    medianPrice: '₹2.85 Cr',
    pricePerSqft: '₹28,600',
    count: '950+',
    badge: 'Urban Lifestyle'
  },
  {
    name: 'Lower Parel',
    tagline: 'Corporate Financial Epicenter & Mills',
    medianPrice: '₹4.50 Cr',
    pricePerSqft: '₹42,000',
    count: '610+',
    badge: 'Prime Commercial'
  },
  {
    name: 'Juhu',
    tagline: 'Celebrity Beachfront Enclave & Serenity',
    medianPrice: '₹9.10 Cr',
    pricePerSqft: '₹68,000',
    count: '400+',
    badge: 'Private Estates'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="landing-glow-orb-1" />
      <div className="landing-glow-orb-2" />
      <div className="landing-glow-orb-3" />

      {/* Main Single Responsive Container with Clean Spacing */}
      <div className="main-content" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
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
              Active Session: Welcome back, {user?.name || user?.email}
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
            2. THE 3 CORE PILLARS (CLEAN, PROMINENT & SIMPLE)
            ===================================================================== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* ==================== OPTION 1: BUY ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Category Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
                  Channel 01 • Buy
                </span>
                <span className="badge badge-accent" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                  5,100 Verified Records
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                Properties for Sale
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Exclusive residences, penthouses, and gated sea-view complexes across Mumbai's elite corridors. Every property is audited for genuine pricing and physical dimensions.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Median Price</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>₹3.30 Cr</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Carpet Rate</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>₹32,528/sqft</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
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

            {/* Action Button */}
            <NavLink
              to="/listings"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.25rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Explore Properties for Sale</span>
            </NavLink>
          </div>

          {/* ==================== OPTION 2: RENT ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Category Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
                  Channel 02 • Rent
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                  Curated Executive Leases
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                Rental Residences
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Vetted rental homes for corporate executives, expatriates, and families. Transparent security deposits, accurate furnishing states, and zero fake pricing bait.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Move-In Speed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>Immediate</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Lease Clarity</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>100% Honest</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
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

            {/* Action Button */}
            <NavLink
              to="/rentals"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.25rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Browse Rental Homes</span>
            </NavLink>
          </div>

          {/* ==================== OPTION 3: PROJECTS ==================== */}
          <div className="ivy-card landing-card-hover" style={{
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <div>
              {/* Header Category Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-primary)' }}>
                  Channel 03 • Developments
                </span>
                <span className="badge badge-accent" style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                  50+ Master Projects
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>
                Builder Developments
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '1.5rem' }}>
                Direct-from-developer RERA-registered projects by tier-1 builders (Lodha, Godrej, Oberoi). Verified possession timelines and normalized ₹ Cr pricing.
              </p>

              {/* Pillar Micro-Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Developer Tier</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-heading)' }}>Tier-1 RERA</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700 }}>Pricing Unit</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>Correct ₹ Cr</div>
                </div>
              </div>

              {/* Quick Preset Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.75rem' }}>
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

            {/* Action Button */}
            <NavLink
              to="/projects"
              className="btn btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.25rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Discover Builder Projects</span>
            </NavLink>
          </div>
        </div>

        {/* =====================================================================
            3. LIVE MARKET TELEMETRY & AUDIT INTEGRITY BANNER
            ===================================================================== */}
        <div className="ivy-card" style={{
          padding: '1.25rem 1.75rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                Citywide Benchmark
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                ₹32,528 / sqft
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                Median Valuation
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                ₹3.30 Cr
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                Deduplicated Catalog
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                4,775 Unique Homes
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                Forensic Health Shield
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                10 / 10 Mitigated
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            4. THE FORENSIC ADVANTAGE (WHY IVYHOMES IS BUILT DIFFERENT)
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
            <div className="ivy-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Zero Duplicate Broker Spam
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Composite fingerprinting maps syndicated listings across agencies into single physical entities. 5,100 raw listings collapsed into 4,775 distinct homes.
              </p>
            </div>

            {/* Edge 2 */}
            <div className="ivy-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Zero Fake Lead-Generation Bait
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Automated price-per-sqft outlier filters catch and isolate fake &lt;₹5,000/sqft bait listings intended by unscrupulous brokers to harvest buyer phone numbers.
              </p>
            </div>

            {/* Edge 3 */}
            <div className="ivy-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.4rem' }}>
                Unified Multi-Asset Compare
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                The first engine in India enabling direct side-by-side comparisons of ready sales, rental leases, and under-construction developments in one clean view.
              </p>
            </div>

            {/* Edge 4 */}
            <div className="ivy-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
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
            5. PRIME MUMBAI NEIGHBORHOODS SPOTLIGHT
            ===================================================================== */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span className="badge badge-slate" style={{ marginBottom: '0.4rem' }}>
                Micro-Market Exploration
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
                Explore Prime Mumbai Enclaves
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Real-time micro-market median valuations and live inventory counts across the city's highest-velocity hubs.
              </p>
            </div>
            <NavLink to="/insights" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
              View Micro-Market Intelligence
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
                  borderRadius: 'var(--radius-sm)',
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
                    borderRadius: 'var(--radius-xs)',
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
            6. HIGH-CONVERSION CTA FOOTER BANNER
            ===================================================================== */}
        <div style={{
          padding: '2.5rem 1.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #111827 100%)',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 20px 40px -12px rgba(4, 120, 87, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '640px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.85rem'
            }}>
              The Standard in Mumbai Real Estate
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
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ffffff',
                  color: '#064e3b',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <span>Explore Properties (Buy)</span>
              </NavLink>

              <NavLink
                to="/rentals"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <span>Browse Rentals</span>
              </NavLink>

              <NavLink
                to="/projects"
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center'
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
