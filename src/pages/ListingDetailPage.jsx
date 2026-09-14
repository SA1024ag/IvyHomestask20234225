import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Navigation2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { useFavourites } from '../context/FavouritesContext';
import { useCompare } from '../context/CompareContext';
import PropertyCard, { formatINR } from '../components/PropertyCard';
import { getGoogleMapsUrl } from '../utils/dataUtils';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite } = useFavourites();
  const { isCompared, toggleCompare } = useCompare();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadData() {
      try {
        const detail = await apiClient.getListingDetail(id);
        if (!isMounted) return;
        setListing(detail);

        // Fetch similar / comparable listings
        const similar = await apiClient.getSimilarListings(id, detail);
        if (!isMounted) return;
        setSimilarListings(similar);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Failed to retrieve property details');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const saved = isFavourite(id);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="main-content" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 size={36} color="var(--primary-600)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
          Retrieving property record from GET /v1/listings/{id}...
        </p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-xs)',
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Property Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
          {error || `Listing with ID "${id}" could not be retrieved from the Ivy Homes service.`}
        </p>
        <NavLink to="/listings" className="btn btn-primary btn-sm">
          Back to Catalog
        </NavLink>
      </div>
    );
  }

  // Handle units discrepancy: magichomes reports carpet_area in square meters (< 300)
  const normalizedCarpet = listing.carpet_area
    ? (listing.carpet_area < 300 ? Math.round(listing.carpet_area * 10.7639) : listing.carpet_area)
    : null;

  const ratePerSqft = normalizedCarpet && listing.price
    ? Math.round(listing.price / normalizedCarpet)
    : null;

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
        >
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Direct Google Maps Action Button */}
          {listing.latitude && listing.longitude && (
            <a
              href={getGoogleMapsUrl(listing.latitude, listing.longitude, (listing.apartment_name || '') + ', ' + (listing.locality || '') + ', Mumbai')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669',
                borderColor: 'rgba(16,185,129,0.3)', fontWeight: 700
              }}
            >
              <Navigation2 size={14} /> View on Google Maps
            </a>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            title="Copy property link"
          >
            {copiedLink ? 'Link Copied!' : 'Share'}
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(listing, 'sale')}
            className="btn btn-secondary btn-sm"
            style={{
              color: isCompared(listing.listing_id, 'sale') ? 'var(--accent-text)' : 'var(--text-heading)',
              borderColor: isCompared(listing.listing_id, 'sale') ? 'var(--accent-border)' : 'var(--border-subtle)',
              backgroundColor: isCompared(listing.listing_id, 'sale') ? 'var(--accent-subtle)' : 'var(--bg-surface)'
            }}
          >
            {isCompared(listing.listing_id, 'sale') ? 'Comparing ✓' : 'Add to Compare'}
          </button>

          <button
            type="button"
            onClick={() => toggleFavourite(listing)}
            className="btn btn-secondary btn-sm"
            style={{
              color: saved ? '#ef4444' : 'var(--text-heading)',
              borderColor: saved ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)',
              backgroundColor: saved ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)'
            }}
          >
            {saved ? 'Saved to Favourites' : 'Save Property'}
          </button>
        </div>
      </div>

      {/* Main Property Card */}
      <div className="ivy-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderRadius: 'var(--radius-sm)' }}>
        {/* Header Ribbon */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.5rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <span className="badge badge-emerald" style={{ textTransform: 'capitalize' }}>
                {listing.property_type || 'Apartment'}
              </span>
              {listing.is_verified && (
                <span className="badge badge-blue">
                  Verified by Ivy Homes
                </span>
              )}
              <span className="badge badge-slate" style={{ fontFamily: 'var(--font-mono)' }}>
                ID: {listing.listing_id}
              </span>
            </div>

            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              color: 'var(--text-heading)',
              letterSpacing: '-0.025em',
              textTransform: 'capitalize'
            }}>
              {listing.apartment_name || `${listing.bedroom} BHK in ${listing.locality}`}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              marginTop: '0.35rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{listing.locality}, Mumbai (City ID: {listing.city_id || 5})</span>
              {listing.latitude && listing.longitude && (
                <a
                  href={getGoogleMapsUrl(listing.latitude, listing.longitude, (listing.apartment_name || '') + ', ' + (listing.locality || '') + ', Mumbai')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#059669',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  <Navigation2 size={13} /> Maps Location
                </a>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: 'var(--accent-text)',
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              {formatINR(listing.price)}
            </div>
            {ratePerSqft && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                ₹{ratePerSqft.toLocaleString('en-IN')} per sqft (Carpet)
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '0.2rem', fontWeight: 600 }}>
              Direct Verified Price · No Broker Commission
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1.25rem',
          padding: '1.75rem 0',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEDROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{listing.bedroom || '--'} BHK</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BATHROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{listing.bathroom || '--'} Baths</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CARPET AREA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{normalizedCarpet ? `${normalizedCarpet} sqft` : '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SUPER BUILT-UP AREA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{listing.super_built_up_area ? `${listing.super_built_up_area} sqft` : '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FURNISHING</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              {listing.furnishing || 'Unfurnished'}
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FACING DIRECTION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              <span>{listing.facing_direction || 'East'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FLOOR ELEVATION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{listing.floor || '1'} of {listing.total_floors || '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PARKING SPACES</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', color: 'var(--text-heading)' }}>
              <span>{listing.covered_parking ? `${listing.covered_parking} Covered` : 'Available'}</span>
            </div>
          </div>
        </div>

        {/* Description & Contact Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          paddingTop: '2rem'
        }} className="detail-columns">
          
          {/* Left Column: Description & Metadata */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              Property Description
            </h2>
            <div style={{
              fontSize: '0.95rem',
              color: 'var(--text-body)',
              lineHeight: 1.75,
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-subtle)'
            }}>
              {listing.description || 'No custom description provided by seller for this property.'}
            </div>

            {/* Extra metadata */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {listing.project_id && (
                <div>
                  <strong>Builder Project ID: </strong>
                  <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-text)' }}>{listing.project_id}</code>
                </div>
              )}
              {listing.posted_at && (
                <div>
                  <strong>Date Posted: </strong>
                  {new Date(listing.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              {listing.website && (
                <div>
                  <strong>Source Website: </strong>
                  <span style={{ textTransform: 'capitalize' }}>{listing.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Verified Contact Card */}
          <div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--accent-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-border)'
            }}>
              <div style={{ color: 'var(--accent-text)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Verified Seller Contact</span>
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.5rem' }}>
                {listing.posted_by_name || 'Listing Agent'}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                Posted by {listing.posted_by || 'Verified Seller'}
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <a
                  href={`tel:${listing.posted_by_contact || '+912001234567'}`}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span>{listing.posted_by_contact || 'Call Agent'}</span>
                </a>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <a
                  href={getGoogleMapsUrl(listing.latitude, listing.longitude, (listing.apartment_name || '') + ', ' + (listing.locality || '') + ', Mumbai')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Navigation2 size={13} color="#059669" /> Open in Google Maps
                </a>
              </div>

              {listing.listing_url && (
                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span>View Original Listing</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* "More Properties You'll Like" Similar Properties Section */}
      {similarListings.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                <span>Comparable Properties</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.25rem' }}>
                More Properties You'll Like
              </h2>
            </div>
            <NavLink to={`/listings?locality=${listing.locality}`} className="btn btn-secondary btn-sm">
              More in {listing.locality}
            </NavLink>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {similarListings.map((item) => (
              <PropertyCard key={item.listing_id} listing={item} currentListing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Responsive layout styling */}
      <style>{`
        @media (max-width: 800px) {
          .detail-columns {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
