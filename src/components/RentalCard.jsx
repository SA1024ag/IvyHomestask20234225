import React, { useState } from 'react';
import {
  MapPin,
  BedDouble,
  Bath,
  ShieldCheck,
  Building2,
  ArrowLeftRight,
  Phone,
  UserCheck
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return '₹' + Number(val).toLocaleString('en-IN');
}

const RENTAL_PHOTOS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab00f?auto=format&fit=crop&w=800&q=80',
];

export default function RentalCard({ rental, isRevealed, onToggleReveal }) {
  const { isCompared, toggleCompare } = useCompare();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const compared = isCompared(rental.listing_id, 'rentals');

  const photoIndex = Math.abs(
    String(rental.listing_id || '0')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % RENTAL_PHOTOS.length;

  const photoUrl = RENTAL_PHOTOS[photoIndex];

  const furnishingClean = rental.furnishing
    ? rental.furnishing.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Semi Furnished';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="ivy-card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderColor: compared ? 'var(--accent-primary)' : undefined,
        boxShadow: compared ? 'var(--shadow-hover)' : undefined
      }}
    >
      <div>
        {/* Photo Header */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-surface-subtle)'
          }}
        >
          {!imageError ? (
            <img
              src={photoUrl}
              alt={rental.apartment_name || rental.title || 'Rental Residence'}
              onError={() => setImageError(true)}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-faint)'
              }}
            >
              <Building2 size={40} strokeWidth={1.5} />
            </div>
          )}

          {/* Top Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {furnishingClean}
            </span>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(5, 150, 105, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ShieldCheck size={11} strokeWidth={2.5} />
              <span>Verified Rental</span>
            </span>

            {compared && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeftRight size={10} />
                <span>Comparing</span>
              </span>
            )}
          </div>

          {/* Top Right Listing Tag */}
          <span
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: 'rgba(255, 255, 255, 0.85)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            #{rental.listing_id}
          </span>

          {/* Bottom Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.35) 100%)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
          {/* Rent Price */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.35rem',
              marginBottom: '0.35rem'
            }}
          >
            <span
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-heading)',
                fontFamily: 'var(--font-sans)'
              }}
            >
              {formatINR(rental.price)}
            </span>
            <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              / month
            </span>
          </div>

          {/* Apartment Title */}
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-heading)',
              lineHeight: 1.35,
              marginBottom: '0.35rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {rental.apartment_name || rental.title}
          </h3>

          {/* Location & Floor */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              color: 'var(--text-muted)',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              textTransform: 'capitalize'
            }}
          >
            <MapPin size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {rental.locality || 'Mumbai'}
            </span>
            {rental.floor && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>•</span>
                <span>Floor {rental.floor}{rental.total_floors ? ` of ${rental.total_floors}` : ''}</span>
              </>
            )}
          </div>

          {/* Key Financial Breakdown Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 0.9rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '0.85rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Security Deposit
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {formatINR(rental.deposit)}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Maintenance
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rental.maintenance ? `${formatINR(rental.maintenance)}/mo` : 'Included'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Carpet Area
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rental.carpet_area ? `${Number(rental.carpet_area).toLocaleString('en-IN')} sqft` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Spec Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-body)',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <BedDouble size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 600 }}>{rental.bedroom} BHK</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Bath size={14} color="var(--text-muted)" />
              <span style={{ fontWeight: 600 }}>{rental.bathroom || 2} Bath</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <UserCheck size={14} color="var(--text-muted)" />
              <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{rental.posted_by || 'Owner'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div
        style={{
          padding: '0 1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}
      >
        <label
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            backgroundColor: compared ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
            color: compared ? 'var(--accent-text)' : 'var(--text-muted)',
            border: '1px solid ' + (compared ? 'var(--accent-border)' : 'var(--border-subtle)'),
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <input
            type="checkbox"
            checked={compared}
            onChange={() => toggleCompare(rental, 'rentals')}
            style={{ width: '14px', height: '14px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <span>{compared ? 'Comparing' : 'Compare'}</span>
        </label>

        {isRevealed ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.75rem'
            }}
          >
            <div style={{ overflow: 'hidden', marginRight: '6px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-text)', fontWeight: 600, truncate: 'true' }}>
                {rental.posted_by_name || 'Lister'}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {rental.posted_by_contact || '+91 98200 12345'}
              </div>
            </div>
            <a
              href={`tel:${rental.posted_by_contact || '+919820012345'}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', flexShrink: 0 }}
            >
              <Phone size={12} /> Call
            </a>
          </div>
        ) : (
          <button
            onClick={onToggleReveal}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem', padding: '0.55rem' }}
          >
            <Phone size={14} /> Contact Lister
          </button>
        )}
      </div>
    </div>
  );
}
