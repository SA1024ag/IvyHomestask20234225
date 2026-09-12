import React from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileSearch,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-blue">Market Intelligence</span>
          <span className="badge badge-emerald">Mumbai Region</span>
        </div>
        <h1 className="page-title">Real Estate Insights & Audit Summary</h1>
        <p className="page-subtitle">
          Computed metrics, locality benchmarks, and API documentation reconciliation findings.
        </p>
      </div>

      {/* Primary Analytics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>DATASET AUDIT STATUS</span>
            <Database size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            7,790 Records
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', marginTop: '0.25rem' }}>
            5,100 Sales · 2,100 Rentals · 590 Projects
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>AVG RATE (2 BHK SALE)</span>
            <TrendingUp size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            ₹32,450 / sqft
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Excluding corrupt & fraudulent listings
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>DOC DISCREPANCIES</span>
            <AlertTriangle size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--accent-amber)' }}>
            Verified & Cataloged
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Headers, tokens, limits & pagination
          </div>
        </div>
      </div>

      {/* Discrepancies & Insights Card */}
      <div className="ivy-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <FileSearch size={20} color="var(--primary-600)" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Documented vs. Live API Findings</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Key technical findings discovered while reconciling the API reference with the live service:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            {
              category: 'Authentication Header',
              finding: 'Documented as query param (?api_key=...). The live API rejects this and strictly enforces X-API-Key header.',
              badge: 'auth'
            },
            {
              category: 'Access Token Field Name',
              finding: 'Documented as { token: "..." }. The live API returns { access_token: "...", refresh_token: "..." } with 900s expiry.',
              badge: 'auth'
            },
            {
              category: 'Pagination Scheme',
              finding: 'Documented as page (1-indexed) and limit=200. The API quietly ignores page and uses offset, with limit capped to 50.',
              badge: 'pagination'
            },
            {
              category: 'Stateless Session Termination',
              finding: 'Documented as server-side token invalidation. POST /auth/logout explicitly notes tokens are stateless.',
              badge: 'auth'
            }
          ].map((f, i) => (
            <div key={i} style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <CheckCircle2 size={18} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.category}</span>
                  <span className="badge badge-slate" style={{ fontSize: '0.7rem' }}>{f.badge}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {f.finding}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
