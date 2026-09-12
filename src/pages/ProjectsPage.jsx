import React from 'react';
import {
  FolderKanban,
  Building,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-amber">Developer Projects</span>
          <span className="badge badge-slate">590 Major Developments</span>
        </div>
        <h1 className="page-title">Builder Projects in Mumbai</h1>
        <p className="page-subtitle">
          Track upcoming and under-construction builder developments, launch timelines, unit inventories, and RERA registrations.
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>TOTAL PROJECTS</span>
            <FolderKanban size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            590
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            RERA registered developments
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>TOP DEVELOPERS</span>
            <Building size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            Lodha, Godrej, Oberoi
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Grade A builders
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>AVG COMPLETION</span>
            <Calendar size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            2027 – 2028
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Possession horizons
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { id: 'P50001', name: 'Century Terraces', developer: 'Century Real Estate', locality: 'Kandivali East', status: 'Under Construction', minPrice: '₹1.85 Cr', maxPrice: '₹4.50 Cr', units: 480, rera: 'P51800021482' },
          { id: 'P50002', name: 'Oberoi Sky City', developer: 'Oberoi Realty', locality: 'Borivali East', status: 'Ready to Move', minPrice: '₹3.20 Cr', maxPrice: '₹8.90 Cr', units: 720, rera: 'P51800003582' },
          { id: 'P50003', name: 'Lodha World One', developer: 'Lodha Group', locality: 'Lower Parel', status: 'Under Construction', minPrice: '₹9.50 Cr', maxPrice: '₹28.00 Cr', units: 310, rera: 'P51900008392' },
        ].map((proj) => (
          <div key={proj.id} className="ivy-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-amber">{proj.status}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{proj.rera}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{proj.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>By {proj.developer}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-700)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                <MapPin size={13} />
                <span>{proj.locality}</span>
              </div>
            </div>

            <div style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRICE RANGE</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{proj.minPrice} – {proj.maxPrice}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVENTORY</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-700)' }}>{proj.units} Units</div>
              </div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', width: '100%' }}>
              Explore Project Inventory →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
