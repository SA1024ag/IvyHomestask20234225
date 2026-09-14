import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation2, ExternalLink, ChevronRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import PropertyImagePlaceholder from './PropertyImagePlaceholder';
import { getGoogleMapsUrl } from '../utils/dataUtils';

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
  const navigate = useNavigate();
  const { isCompared, toggleCompare } = useCompare();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const compared = isCompared(rental.listing_id, 'rentals');

  const handleCardClick = (e) => {
    if (e.target.closest('button, a, input, label')) return;
    navigate(`/rentals/${rental.listing_id}`);
  };

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
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px -8px rgba(15,23,42,0.13)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/rentals/${rental.listing_id}`); }}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="ivy-card"
      style={{
        cursor: 'pointer',
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
            <PropertyImagePlaceholder
              type="rental"
              locality={rental.locality}
              bedroom={rental.bedroom}
            />
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
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
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
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(5, 150, 105, 0.85)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              Verified Rental
            </span>

            {compared && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff'
                }}
              >
                Comparing
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
              borderRadius: 'var(--radius-xs)',
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
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              textTransform: 'capitalize'
            }}
          >
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
              borderRadius: 'var(--radius-xs)',
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
            <div>
              <span style={{ fontWeight: 600 }}>{rental.bedroom} BHK</span>
            </div>

            <div>
              <span style={{ fontWeight: 600 }}>{rental.bathroom || 2} Bath</span>
            </div>

            <div>
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
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Google Maps link */}
        {rental.latitude && rental.longitude && (
          <a
            href={getGoogleMapsUrl(rental.latitude, rental.longitude, (rental.apartment_name || '') + ', ' + (rental.locality || '') + ', Mumbai')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="View on Google Maps"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem', fontWeight: 700,
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#059669',
              border: '1px solid rgba(16,185,129,0.25)',
              textDecoration: 'none', flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            <Navigation2 size={12} /> Maps
          </a>
        )}

        <label
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-xs)',
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

        {/* View Details Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/rentals/${rental.listing_id}`);
          }}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem', padding: '0.55rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          View Details <ChevronRight size={14} />
        </button>

        {isRevealed ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--accent-subtle)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.45rem 0.65rem'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              {rental.posted_by_contact || '+91 98200 12345'}
            </div>
            <a
              href={`tel:${rental.posted_by_contact || '+919820012345'}`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
            >
              Call
            </a>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleReveal && onToggleReveal();
            }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '0.55rem 0.75rem', whiteSpace: 'nowrap' }}
          >
            Contact
          </button>
        )}

        {/* External listing URL */}
        {rental.listing_url && (
          <a
            href={rental.listing_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={`View on ${rental.website || 'portal'}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '6px 10px', borderRadius: 'var(--radius-xs)',
              fontSize: '0.72rem', fontWeight: 700,
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              textDecoration: 'none', flexShrink: 0, transition: 'all 0.15s',
            }}
          >
            <ExternalLink size={11} /> {rental.website || 'View'}
          </a>
        )}
      </div>
    </motion.div>
  );
}
