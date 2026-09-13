import React from 'react';

/**
 * IvyLogo Component
 * Uses the authentic Ivy wordmark from image.png without any clumsy boxes or clutter.
 * Automatically adapts to dark and light modes with crisp contrast.
 */
export default function IvyLogo({
  variant = 'full', // 'full' | 'emblem'
  size = 'md',      // 'sm' (22px) | 'md' (28px) | 'lg' (38px) | 'xl' (52px)
  className = '',
  style = {}
}) {
  const heightMap = {
    sm: 22,
    md: 28,
    lg: 38,
    xl: 52
  };

  const currentHeight = heightMap[size] || heightMap.md;

  const logoImage = (
    <img
      src={`${import.meta.env.BASE_URL}logo.png`}
      alt="Ivy"
      className="ivy-brand-mark"
      style={{
        height: `${currentHeight}px`,
        width: 'auto',
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );

  if (variant === 'emblem') {
    return (
      <div
        className={`ivy-brand-emblem ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        {logoImage}
      </div>
    );
  }

  return (
    <div
      className={`ivy-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        userSelect: 'none',
        ...style
      }}
    >
      {logoImage}
      <span
        style={{
          fontSize: size === 'sm' ? '1.05rem' : size === 'lg' ? '1.35rem' : size === 'xl' ? '1.75rem' : '1.2rem',
          fontWeight: 700,
          color: 'var(--text-heading)',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}
      >
        Homes
      </span>
    </div>
  );
}
