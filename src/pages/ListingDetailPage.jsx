import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  Building,
  CheckCircle2,
  Phone,
  Bookmark,
  Share2,
  Sparkles
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();

  return (
    <div className="main-content">
      {/* Back Button & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <NavLink to="/listings" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to All Listings</span>
        </NavLink>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" title="Save property">
            <Bookmark size={15} />
            <span>Save</span>
          </button>
          <button className="btn btn-ghost btn-sm" title="Share link">
            <Share2 size={15} />
          </button>
        </div>
      </div>

      {/* Property Hero Card */}
      <div className="ivy-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald">Verified Listing</span>
              <span className="badge badge-slate">ID: {id || 'SQU-5004678'}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Assetz Park Residence
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              <MapPin size={16} color="var(--primary-600)" />
              <span>Kandivali East, Mumbai, Maharashtra</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              ₹4,17,40,000
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Estimated EMI: ₹2.15 Lakh/mo · ₹38,720/sqft
            </div>
          </div>
        </div>

        {/* Key Features Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          padding: '1.5rem 0',
          margin: '1.5rem 0',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BEDROOMS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BedDouble size={16} color="var(--primary-600)" />
              <span>3 BHK</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BATHROOMS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bath size={16} color="var(--primary-600)" />
              <span>2 Baths</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CARPET AREA</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize2 size={16} color="var(--primary-600)" />
              <span>1,078 sqft</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>FLOOR</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={16} color="var(--primary-600)" />
              <span>8 of 16</span>
            </div>
          </div>
        </div>

        {/* Description & Seller Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>Property Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Well-maintained 3 BHK corner apartment located in Assetz Park, Kandivali East. Fully-furnished, east-facing orientation with abundant natural ventilation. Features modern modular kitchen, reserved covered parking, and prime connectivity to Western Express Highway.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Seller Contact</h3>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shreya Rao</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Verified Partner Agent</div>
            <a href="tel:+912000774713" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              <Phone size={14} />
              <span>+91 2000 774 713</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
