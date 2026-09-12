import React from 'react';
import {
  KeyRound,
  Search,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Wallet,
  Coins
} from 'lucide-react';

export default function RentalsPage() {
  return (
    <div className="main-content">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-emerald">Residential Rentals</span>
          <span className="badge badge-slate">2,100 Verified Properties</span>
        </div>
        <h1 className="page-title">Rental Homes in Mumbai</h1>
        <p className="page-subtitle">
          Browse long-term verified rental homes with transparent monthly rents and security deposits.
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
            <span>TOTAL RENTALS</span>
            <KeyRound size={18} color="var(--primary-600)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            2,100
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Across all 24 city localities
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>MEDIAN MONTHLY RENT</span>
            <Wallet size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            ₹45,000
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Average security deposit: 4.5 mo
          </div>
        </div>

        <div className="ivy-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>FURNISHING SPREAD</span>
            <Coins size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            62% Semi / Furnished
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Immediate move-in ready
          </div>
        </div>
      </div>

      {/* Rentals Sample Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {[
          { id: 'R5000001', name: 'Mantri Greens', locality: 'Goregaon East', rent: '₹46,200/mo', deposit: '₹1,84,800', bhk: 3, area: '1,085 sqft', furnish: 'Unfurnished' },
          { id: 'R5000002', name: 'Assetz Boulevard', locality: 'Andheri East', rent: '₹38,000/mo', deposit: '₹1,50,000', bhk: 2, area: '890 sqft', furnish: 'Fully-Furnished' },
          { id: 'R5000003', name: 'Sobha Sapphire', locality: 'Powai', rent: '₹55,000/mo', deposit: '₹2,20,000', bhk: 3, area: '1,250 sqft', furnish: 'Semi-Furnished' },
        ].map((item) => (
          <div key={item.id} className="ivy-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span className="badge badge-emerald">{item.furnish}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>{item.rent}</span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{item.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                <MapPin size={13} color="var(--primary-600)" />
                <span>{item.locality}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 0',
              margin: '1rem 0',
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)'
            }}>
              <div><strong>Beds:</strong> {item.bhk} BHK</div>
              <div><strong>Area:</strong> {item.area}</div>
              <div><strong>Deposit:</strong> {item.deposit}</div>
            </div>

            <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Inquire Rental Details →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
