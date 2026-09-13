import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bookmark, Loader2 } from 'lucide-react';
import { useFavourites } from '../context/FavouritesContext';
import PropertyCard from '../components/PropertyCard';

export default function FavouritesPage() {
  const { favourites, isLoading, refetchFavourites } = useFavourites();

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-emerald">Saved Portfolio</span>
            <span className="badge badge-slate">Persisted Across Sessions</span>
          </div>
          <h1 className="page-title">Your Shortlisted Properties</h1>
          <p className="page-subtitle">
            Saved sale and rental listings synchronized with the Ivy Homes server.
          </p>
        </div>

        {/* Counter badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={refetchFavourites}
            className="btn btn-secondary btn-sm"
            title="Refresh saved list from server"
          >
            <span>Sync with Server</span>
          </button>
          <div className="badge badge-emerald" style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}>
            <span>{favourites.length} Saved {favourites.length === 1 ? 'Property' : 'Properties'}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            Syncing saved properties from GET /v1/saved...
          </p>
        </div>
      ) : favourites.length === 0 ? (
        /* Empty State */
        <div className="ivy-card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '520px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--accent-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem'
          }}>
            <Bookmark size={26} strokeWidth={1.8} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            No Saved Properties Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Click the heart icon on any property in the catalog or detail view to shortlist homes. Your saved list is securely synced with your user account.
          </p>

          <NavLink to="/listings" className="btn btn-primary" style={{ marginTop: '1.75rem' }}>
            Explore Sale Catalog
          </NavLink>
        </div>
      ) : (
        /* Favourites Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {favourites.map((item) => (
            <PropertyCard key={item.listing_id || item.id} listing={item} />
          ))}
        </div>
      )}
    </div>
  );
}
