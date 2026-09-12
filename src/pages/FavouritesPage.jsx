import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Home, ArrowRight, Sparkles } from 'lucide-react';

export default function FavouritesPage() {
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-emerald">User Portfolio</span>
        </div>
        <h1 className="page-title">Saved Properties & Favourites</h1>
        <p className="page-subtitle">
          Manage your saved sale and rental properties. Saved records persist per user account across devices.
        </p>
      </div>

      <div className="ivy-card" style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '540px',
        margin: '2rem auto'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-600)',
          marginBottom: '1.25rem'
        }}>
          <Bookmark size={30} strokeWidth={1.8} />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Saved Properties Yet
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', maxWidth: '380px' }}>
          When you explore listings, click the bookmark icon to keep track of shortlisted properties, compare price benchmarks, and receive availability updates.
        </p>

        <NavLink to="/listings" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          <Home size={16} />
          <span>Browse Sale Listings</span>
          <ArrowRight size={16} />
        </NavLink>
      </div>
    </div>
  );
}
