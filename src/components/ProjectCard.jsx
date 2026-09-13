import React, { useState } from 'react';
import {
  Building,
  MapPin,
  Eye,
  ArrowLeftRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import PropertyImagePlaceholder from './PropertyImagePlaceholder';

// Helper: Format project price range using price_min and price_max
export function formatProjectPrice(val) {
  if (val === null || val === undefined || isNaN(val)) return 'Price on Request';
  const num = Number(val);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 20) {
    // Values >= 20 in raw API are expressed in Lakhs (e.g. 90.8 -> ₹90.8 L)
    return `₹${num.toFixed(2)} L`;
  } else if (num > 0) {
    // Values under 20 in raw API are expressed in Crores (e.g. 4.03 -> ₹4.03 Cr)
    return `₹${num.toFixed(2)} Cr`;
  }
  return 'Price on Request';
}

// Helper: Format date cleanly as YYYY-MM-DD
export function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  try {
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.slice(0, 10);
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

const PROJECT_PHOTOS = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
];

export default function ProjectCard({ proj, onViewPlan }) {
  const { isCompared, toggleCompare } = useCompare();
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const compared = isCompared(proj.project_id, 'projects');

  const photoIndex = Math.abs(
    String(proj.project_id || '0')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % PROJECT_PHOTOS.length;

  const photoUrl = PROJECT_PHOTOS[photoIndex];

  const statusClean = proj.project_status || 'Under Construction';
  const statusLower = statusClean.toLowerCase();
  const statusBadgeColor = statusLower.includes('ready')
    ? 'rgba(5, 150, 105, 0.85)'
    : statusLower.includes('launch')
    ? 'rgba(37, 99, 235, 0.85)'
    : 'rgba(217, 119, 6, 0.85)';

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
              alt={proj.apartment_name || 'Project Development'}
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
              type="project"
              locality={project.locality}
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
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: statusBadgeColor,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textTransform: 'capitalize'
              }}
            >
              {statusClean}
            </span>

            {proj.rera_number && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
                <span>RERA Approved</span>
              </span>
            )}

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

          {/* Top Right Unit Badge */}
          {proj.total_units && (
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
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {proj.total_units.toLocaleString('en-IN')} Units
            </span>
          )}

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
          {/* Developer Name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-text)',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            <Building size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {proj.developer_name || 'Grade A Developer'}
            </span>
          </div>

          {/* Project Title */}
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-heading)',
              lineHeight: 1.3,
              marginBottom: '0.35rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {proj.apartment_name}
          </h3>

          {/* Location & Structure Specs */}
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
              {proj.locality || 'Mumbai'}
            </span>
            {proj.total_towers && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>•</span>
                <span>{proj.total_towers} Towers</span>
              </>
            )}
            {proj.total_floors && (
              <>
                <span style={{ color: 'var(--text-faint)' }}>•</span>
                <span>{proj.total_floors} Floors</span>
              </>
            )}
          </div>

          {/* Price Range Box */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '0.85rem'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Estimated Price Range
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-heading)',
                marginTop: '2px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '-0.02em'
              }}
            >
              {formatProjectPrice(proj.price_min)} – {formatProjectPrice(proj.price_max)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {proj.price_min ? `₹${Number(proj.price_min).toLocaleString('en-IN')}` : '—'} – {proj.price_max ? `₹${Number(proj.price_max).toLocaleString('en-IN')}` : '—'}
            </div>
          </div>

          {/* Detailed Specs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '0.75rem',
              fontSize: '0.78rem'
            }}
          >
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Unit Span
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {proj.min_area_sqft && proj.max_area_sqft
                  ? `${proj.min_area_sqft} – ${proj.max_area_sqft} sqft`
                  : 'On Request'}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Launch Date
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
                {formatDate(proj.launch_date)}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Possession
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', marginTop: '2px' }}>
                {formatDate(proj.possession_date)}
              </div>
            </div>
          </div>

          {/* Amenities Chips */}
          <div
            style={{
              minHeight: '28px',
              maxHeight: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '0.75rem',
              overflow: 'hidden'
            }}
          >
            {Array.isArray(proj.amenities) && proj.amenities.length > 0 ? (
              <>
                {proj.amenities.slice(0, 3).map((amenity, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '4px',
                      color: 'var(--text-body)',
                      textTransform: 'capitalize',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {amenity}
                  </span>
                ))}
                {proj.amenities.length > 3 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '2px 4px', whiteSpace: 'nowrap' }}>
                    +{proj.amenities.length - 3} more
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                Clubhouse, pool & landscaped garden
              </span>
            )}
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
            onChange={() => toggleCompare(proj, 'projects')}
            style={{ width: '14px', height: '14px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          <span>{compared ? 'Comparing' : 'Compare'}</span>
        </label>

        <button
          onClick={() => onViewPlan(proj)}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, justifyContent: 'center', fontSize: '0.825rem', padding: '0.55rem' }}
        >
          <Eye size={14} /> View Development Plan
        </button>
      </div>
    </div>
  );
}
