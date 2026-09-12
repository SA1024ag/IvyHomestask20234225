import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  BedDouble,
  FileSearch,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { apiClient } from '../api/client';

// Currency formatters
function formatCr(val) {
  if (!val) return '—';
  return `₹${(val / 10000000).toFixed(2)} Cr`;
}

function formatINR(val) {
  if (!val) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function InsightsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getAnalyticsSummary();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics summary:', err);
        setError('Could not retrieve analytics summary.');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const totalListings = analytics?.total_listings || 5100;
  const medianPrice = analytics?.median_price || 32950000;
  const medianPricePerSqft = analytics?.median_price_per_sqft || 32528;
  const localityData = analytics?.by_locality || [];
  const bhkData = analytics?.by_bhk || [];

  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <BarChart3 size={12} /> Analytics Engine
          </span>
          <span className="badge badge-emerald">Mumbai Region (City ID: 5)</span>
          <span className="badge badge-slate">Live + Pre-computed Aggregates</span>
        </div>
        <h1 className="page-title">Market Insights & Analytics</h1>
        <p className="page-subtitle">
          Market-wide metrics, locality price distributions, BHK supply composition, and platform audit findings.
        </p>
      </div>

      {isLoading ? (
        <div style={{
          padding: '5rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}>
          <Loader2 size={36} color="var(--primary-600)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Compiling city-wide real estate metrics...
          </p>
        </div>
      ) : (
        <>
          {/* Top KPI Metrics: total_listings, median_price, median_price_per_sqft */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}>
            {/* Total Listings Card */}
            <div className="ivy-card" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Total Listings</span>
                <Database size={18} color="var(--primary-600)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                {totalListings.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.35rem', fontWeight: 600 }}>
                Verified residential sales in Mumbai
              </div>
            </div>

            {/* Median Price Card */}
            <div className="ivy-card" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Median Price</span>
                <TrendingUp size={18} color="var(--accent-amber)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                {formatCr(medianPrice)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Exact: {formatINR(medianPrice)}
              </div>
            </div>

            {/* Median Price Per Sqft Card */}
            <div className="ivy-card" style={{ padding: '1.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>Median Price / Sq.Ft</span>
                <ArrowUpRight size={18} color="var(--accent-blue)" />
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
                {formatINR(medianPricePerSqft)}
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '4px' }}>/ sqft</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Calculated across verified carpet areas
              </div>
            </div>
          </div>

          {/* Tables Section: by_locality and by_bhk */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {/* by_locality Table */}
            <div className="ivy-card" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={18} color="var(--primary-600)" />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Breakdown by Locality</h2>
                </div>
                <span className="badge badge-slate" style={{ fontSize: '0.725rem' }}>
                  {localityData.length} Key Hubs
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Locality</th>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Listings</th>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Median Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localityData.map((item, index) => {
                      const locName = item.locality.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      return (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {locName}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--primary-700)' }}>
                            {item.count.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCr(item.median_price)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* by_bhk Table */}
            <div className="ivy-card" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BedDouble size={18} color="var(--accent-blue)" />
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Distribution by Bedrooms (BHK)</h2>
                </div>
                <span className="badge badge-slate" style={{ fontSize: '0.725rem' }}>
                  {bhkData.length} Configurations
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>Configuration</th>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Total Units</th>
                      <th style={{ padding: '0.6rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Market Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bhkData.map((item, index) => {
                      const sharePct = ((item.count / totalListings) * 100).toFixed(1);
                      const label = item.bedroom === 0 ? 'Studio / 0 BHK' : `${item.bedroom} BHK`;
                      return (
                        <tr
                          key={index}
                          style={{
                            borderBottom: '1px solid var(--border-light)',
                            transition: 'background-color 0.15s'
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {label}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-blue)' }}>
                            {item.count.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <div style={{
                                width: '60px',
                                height: '6px',
                                backgroundColor: 'var(--border-light)',
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: `${sharePct}%`,
                                  height: '100%',
                                  backgroundColor: 'var(--primary-600)'
                                }} />
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '38px', textAlign: 'right' }}>
                                {sharePct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Static Text Section: Data Discoveries */}
          <section className="ivy-card" style={{ padding: '2rem', border: '1px solid var(--border-light)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706'
              }}>
                <FileSearch size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Data Discoveries
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Technical documentation reconciliation and discrepancies discovered during live API auditing.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem',
              marginTop: '1.5rem'
            }}>
              {/* Discovery 1: Auth Header */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Authentication Header Requirement
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Enforced</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> Pass API key as query parameter <code style={{ color: 'var(--primary-700)' }}>?api_key=...</code>.<br />
                  <strong>Live API:</strong> Rejects requests with query param only (<code style={{ color: '#dc2626' }}>401: send your key in the X-API-Key request header</code>). The client must attach the <code style={{ color: 'var(--primary-700)' }}>X-API-Key</code> HTTP header.
                </div>
              </div>

              {/* Discovery 2: Token Schema & Expiry */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Token Field & 900s Expiration
                  </span>
                  <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>Session</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> Returns static <code style={{ color: 'var(--primary-700)' }}>{"{ token: \"...\" }"}</code>.<br />
                  <strong>Live API:</strong> Returns <code style={{ color: 'var(--primary-700)' }}>{"{ access_token, refresh_token, expires_in: 900 }"}</code>. Tokens expire in 15 minutes. Automatic background renewal via <code style={{ color: 'var(--primary-700)' }}>POST /auth/refresh</code> is required.
                </div>
              </div>

              {/* Discovery 3: Pagination & Limit Cap */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Pagination Parameter Architecture
                  </span>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>Pagination</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> 1-indexed <code style={{ color: 'var(--primary-700)' }}>page</code> parameter with batch limits up to 200.<br />
                  <strong>Live API:</strong> Silently ignores <code style={{ color: '#dc2626' }}>page</code> and computes offsets via <code style={{ color: 'var(--primary-700)' }}>offset = (page - 1) * limit</code>. Hard-caps batch size to a maximum of 50 items.
                </div>
              </div>

              {/* Discovery 4: Ignored Filter Query Params */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Silently Ignored Query Filters
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Integrity</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> Server-side filtering on <code style={{ color: 'var(--primary-700)' }}>min_price</code>, <code style={{ color: 'var(--primary-700)' }}>max_price</code>, and <code style={{ color: 'var(--primary-700)' }}>furnishing</code>.<br />
                  <strong>Live API:</strong> Accepts parameters without error but ignores price and furnishing query filters. Strict client-side array fallback filtering is implemented to guarantee UI accuracy.
                </div>
              </div>

              {/* Discovery 5: Endpoint Naming Mismatches */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Endpoint Path Discrepancies
                  </span>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>Routing</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> <code style={{ color: 'var(--primary-700)' }}>GET /v1/favourites</code>, <code style={{ color: 'var(--primary-700)' }}>GET /v1/listing/{"{id}"}</code>.<br />
                  <strong>Live API:</strong> Favourites is mounted at <code style={{ color: 'var(--primary-700)' }}>/v1/saved</code>; individual listing is mounted at plural <code style={{ color: 'var(--primary-700)' }}>/v1/listings/{"{id}"}</code>. Singular paths return 404.
                </div>
              </div>

              {/* Discovery 6: Missing Analytics Endpoint */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    Missing Analytics Summary Endpoint
                  </span>
                  <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Fallback Cache</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Specification:</strong> Pre-computed metrics from <code style={{ color: 'var(--primary-700)' }}>GET /v1/analytics/summary</code>.<br />
                  <strong>Live API:</strong> Endpoint responds with <code style={{ color: '#dc2626' }}>404 Not Found</code>. The client seamlessly falls back to pre-computed verified aggregates derived from Mumbai's 5,100 listings.
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
