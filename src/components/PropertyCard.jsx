import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Building2,
  ArrowLeftRight,
  ArrowUpRight
} from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext';
import { useCompare } from '../context/CompareContext';

export function formatINR(price) {
  if (!price && price !== 0) return '₹--';
  const num = Number(price);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

const ARCHITECTURAL_PHOTOS = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
];

export default function PropertyCard({ listing }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const { isCompared, toggleCompare } = useCompare();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const saved = isFavourite(listing.listing_id);
  const compared = isCompared(listing.listing_id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(listing);
  };

  const handleCompareClick = (e) => {
    e.stopPropagation();
    toggleCompare(listing);
  };

  const ratePerSqft =
    listing.carpet_area && listing.price
      ? Math.round(listing.price / listing.carpet_area)
      : null;

  const photoIndex = Math.abs(
    String(listing.listing_id || '0')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % ARCHITECTURAL_PHOTOS.length;

  const photoUrl = ARCHITECTURAL_PHOTOS[photoIndex];

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
        {/* Fixed Aspect Ratio Photo Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 10',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}>
          {!imageError ? (
            <img
              src={photoUrl}
              alt={listing.apartment_name || listing.title || 'Residence'}
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
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-faint)'
            }}>
              <Building2 size={40} strokeWidth={1.5} />
            </div>
          )}

          {/* Top Floating Badges */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textTransform: 'capitalize'
            }}>
              {listing.property_type || 'Apartment'}
            </span>

            {listing.is_verified && (
              <span style={{
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
              }}>
                <ShieldCheck size={11} strokeWidth={2.5} />
                <span>Verified</span>
              </span>
            )}

            {compared && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ArrowLeftRight size={10} />
                <span>Comparing</span>
              </span>
            )}
          </div>

          {/* Frosted Glass Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={saved ? 'Remove from saved' : 'Save property to favourites'}
            title={saved ? 'Remove from saved' : 'Save property'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: saved ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: saved ? '1px solid #f87171' : '1px solid rgba(255, 255, 255, 0.25)',
              color: saved ? '#ef4444' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background-color 0.15s ease'
            }}
          >
            <Heart
              size={16}
              fill={saved ? '#ef4444' : 'none'}
              strokeWidth={2.2}
            />
          </button>

          {/* Bottom Gradient Fade */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.25rem 1.25rem 0.75rem' }}>
          {/* Price Header (Bold & Prominent) */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.4rem'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-heading)',
              fontFamily: 'var(--font-sans)'
            }}>
              {formatINR(listing.price)}
            </div>

            {ratePerSqft && (
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                ₹{ratePerSqft.toLocaleString('en-IN')}/sqft
              </div>
            )}
          </div>

          {/* Title / Apartment Name */}
          <NavLink
            to={`/listings/${listing.listing_id}`}
            style={{
              display: 'block',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-heading)',
              textDecoration: 'none',
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {listing.apartment_name || listing.title || 'Exclusive Residence'}
          </NavLink>

          {/* Locality */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
            textTransform: 'capitalize'
          }}>
            <MapPin size={13} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {listing.locality || 'Mumbai, Maharashtra'}
            </span>
          </div>

          {/* Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '0.78rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-body)' }}>
              <BedDouble size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{listing.bedroom ?? 2} BHK</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-body)' }}>
              <Bath size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600 }}>{listing.bathroom ?? 2} Bath</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-body)', overflow: 'hidden' }}>
              <Maximize2 size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {listing.carpet_area ? `${Number(listing.carpet_area).toLocaleString('en-IN')} sqft` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: Compare Checkbox + View Details Button */}
      <div style={{
        padding: '0.75rem 1.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.65rem'
      }}>
        <label
          onClick={handleCompareClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            userSelect: 'none',
            backgroundColor: compared ? 'var(--accent-subtle)' : 'var(--bg-surface-subtle)',
            color: compared ? 'var(--accent-text)' : 'var(--text-muted)',
            border: '1px solid ' + (compared ? 'var(--accent-border)' : 'var(--border-subtle)'),
            transition: 'all 0.15s ease'
          }}
        >
          <input
            type="checkbox"
            checked={compared}
            onChange={() => {}}
            style={{ width: '14px', height: '14px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <span>{compared ? 'Comparing' : 'Compare'}</span>
        </label>

        <NavLink
          to={`/listings/${listing.listing_id}`}
          className="btn btn-secondary btn-sm"
          style={{
            flex: 1,
            justifyContent: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <span>View Details</span>
          <ArrowUpRight size={13} />
        </NavLink>
      </div>
    </div>
  );
}
