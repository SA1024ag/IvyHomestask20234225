import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Heart,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext';

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

export default function PropertyCard({ listing }) {
  const { isFavourite, toggleFavourite } = useFavourites();
  const saved = isFavourite(listing.listing_id);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavourite(listing);
  };

  const ratePerSqft = listing.carpet_area && listing.price
    ? Math.round(listing.price / listing.carpet_area)
    : null;

  return (
    <div
      className="ivy-card property-card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Top Banner / Image Area */}
      <div
        style={{
          height: '190px',
          position: 'relative',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Building2 size={48} color="#cbd5e1" strokeWidth={1.5} />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
            {listing.property_type || 'Apartment'}
          </span>
          {listing.is_verified && (
            <span className="badge badge-blue" title="Operations verified">
              <ShieldCheck size={11} />
              <span>Verified</span>
            </span>
          )}
        </div>

        {/* Heart Favorite Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={saved ? 'Remove from saved properties' : 'Save property to favourites'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: saved ? '#ef4444' : '#64748b',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Heart
            size={18}
            fill={saved ? '#ef4444' : 'none'}
            stroke={saved ? '#ef4444' : 'currentColor'}
            strokeWidth={2}
          />
        </button>

        {/* Price Ribbon */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: 'var(--primary-800)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
          }}>
            {formatINR(listing.price)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <NavLink
            to={`/listings/${listing.listing_id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              textTransform: 'capitalize'
            }}>
              {listing.apartment_name || `${listing.bedroom || 2} BHK in ${listing.locality}`}
            </h3>
          </NavLink>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginTop: '0.35rem',
            textTransform: 'capitalize'
          }}>
            <MapPin size={13} color="var(--primary-600)" />
            <span>{listing.locality}, Mumbai</span>
          </div>
        </div>

        {/* Features Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.9rem',
          marginTop: '1rem',
          borderTop: '1px solid var(--border-light)',
          color: 'var(--text-secondary)',
          fontSize: '0.825rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BedDouble size={15} color="var(--text-muted)" />
            <span>{listing.bedroom || '--'} BHK</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bath size={15} color="var(--text-muted)" />
            <span>{listing.bathroom || '--'} Baths</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Maximize2 size={15} color="var(--text-muted)" />
            <span>{listing.carpet_area ? `${listing.carpet_area} sqft` : '--'}</span>
          </div>
        </div>

        {/* Action Button & Rate */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1rem',
          paddingTop: '0.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {ratePerSqft ? `₹${ratePerSqft.toLocaleString('en-IN')}/sqft` : ''}
          </span>
          <NavLink
            to={`/listings/${listing.listing_id}`}
            className="btn btn-secondary btn-sm"
          >
            Details →
          </NavLink>
        </div>
      </div>
    </div>
  );
}
