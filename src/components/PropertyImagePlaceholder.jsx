import React from 'react';
import { Home, Building2 } from 'lucide-react';

/**
 * PropertyImagePlaceholder
 * High-end corporate minimalist placeholder for properties without image assets.
 * Uses a deep dark-slate to rich-charcoal gradient layered with a translucent oversized Lucide icon.
 */
export default function PropertyImagePlaceholder({
  type = 'sale',
  locality = '',
  bedroom = null,
  style = {},
  className = ''
}) {
  const IconComponent = type === 'project' ? Building2 : Home;

  return (
    <div
      className={`property-image-placeholder ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 55%, #020617 100%)',
        overflow: 'hidden',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Subtle fine hairline inner highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }}
      />

      {/* Layered oversized translucent Lucide icon */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          opacity: 0.08,
          pointerEvents: 'none'
        }}
      >
        <IconComponent size={110} strokeWidth={1} />
      </div>

      {/* Subtle central architectural badge */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <IconComponent size={20} strokeWidth={1.75} />
        </div>

        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '2px'
          }}
        >
          {type === 'project' ? 'Verified Project' : type === 'rental' ? 'Curated Rental' : 'Verified Residence'}
        </span>
      </div>

      {/* Bottom ambient lighting vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(2, 6, 23, 0.4) 0%, transparent 60%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}
