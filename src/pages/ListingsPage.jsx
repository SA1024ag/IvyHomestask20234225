import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function ListingsPage() {
  return (
    <div className="main-content">
      {/* Top Banner / KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>TOTAL LISTINGS</span>
            <Home size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            5,100
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.25rem' }}>
            <span className="pulse-dot" />
            <span>Active & retrievable records</span>
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>PRIMARY REGION</span>
            <MapPin size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            Mumbai
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            City ID: 5 (All major localities)
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>VERIFIED LISTINGS</span>
            <ShieldCheck size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            Verified
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Operations checked & live
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>AVG RATE (2 BHK)</span>
            <TrendingUp size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            ₹32,450
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Per sq. ft. (Carpet Area)
          </div>
        </div>
      </div>

      {/* Header & Search Bar placeholder */}
      <div className="page-header">
        <h1 className="page-title">Sale Properties & Listings</h1>
        <p className="page-subtitle">
          Explore verified sale listings across Mumbai localities with live filtering and pagination.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="ivy-card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by locality, apartment name or project..."
              className="input-field"
              style={{ paddingLeft: '38px' }}
              readOnly
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary">
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
          <div className="badge badge-emerald">
            <CheckCircle2 size={13} />
            <span>5,100 Records Ready</span>
          </div>
        </div>
      </div>

      {/* Placeholder Grid of Sample Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { id: 'SQU-5004678', title: 'Assetz Park', locality: 'Kandivali East', price: '₹4.17 Cr', bhk: 3, baths: 2, area: '1,078 sqft', type: 'Apartment' },
          { id: 'DWE-5004326', title: 'Godrej Woodsman', locality: 'Andheri West', price: '₹2.85 Cr', bhk: 2, baths: 2, area: '890 sqft', type: 'Apartment' },
          { id: 'PRE-5001201', title: 'Lodha Parklane', locality: 'Worli', price: '₹6.50 Cr', bhk: 3, baths: 3, area: '1,450 sqft', type: 'Apartment' },
        ].map((item) => (
          <div key={item.id} className="ivy-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              height: '180px',
              backgroundColor: 'var(--bg-subtle)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
            }}>
              <Home size={42} color="var(--text-light)" />
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <span className="badge badge-emerald">{item.type}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-800)', backgroundColor: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '6px', boxShadow: 'var(--shadow-xs)' }}>
                  {item.price}
                </span>
              </div>
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  <MapPin size={13} color="var(--primary-600)" />
                  <span>{item.locality}</span>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                marginTop: '1rem',
                borderTop: '1px solid var(--border-light)',
                color: 'var(--text-secondary)',
                fontSize: '0.825rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <BedDouble size={15} />
                  <span>{item.bhk} Beds</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Bath size={15} />
                  <span>{item.baths} Baths</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Maximize2 size={15} />
                  <span>{item.area}</span>
                </div>
              </div>

              <NavLink
                to={`/listings/${item.id}`}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem', width: '100%' }}
              >
                View Details & Analytics →
              </NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
