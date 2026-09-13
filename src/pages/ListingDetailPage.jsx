import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Building,
  Phone,
  Compass,
  Layers,
  Car,
  ShieldCheck,
  Share2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useFavourites } from '../context/FavouritesContext';
import PropertyCard, { formatINR } from '../components/PropertyCard';

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavourite, toggleFavourite } = useFavourites();

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
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <AlertCircle size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Property Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
          {error || `Listing with ID "${id}" could not be retrieved from the Ivy Homes service.`}
        </p>
        <NavLink to="/listings" className="btn btn-primary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Catalog</span>
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
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            title="Copy property link"
          >
            <Share2 size={15} />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
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
            <Heart size={16} fill={saved ? '#ef4444' : 'none'} stroke={saved ? '#ef4444' : 'currentColor'} />
            <span>{saved ? 'Saved to Favourites' : 'Save Property'}</span>
          </button>
        </div>
      </div>

      {/* Main Property Card */}
      <div className="ivy-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
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
                  <ShieldCheck size={12} />
                  <span>Verified by Ivy Homes</span>
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
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
              marginTop: '0.35rem',
              textTransform: 'capitalize'
            }}>
              <MapPin size={16} color="var(--accent-primary)" />
              <span>{listing.locality}, Mumbai (City ID: {listing.city_id || 5})</span>
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
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEDROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Bed size={18} color="var(--accent-primary)" />
              <span>{listing.bedroom || '--'} BHK</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BATHROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Bath size={18} color="var(--accent-primary)" />
              <span>{listing.bathroom || '--'} Baths</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CARPET AREA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Maximize2 size={18} color="var(--accent-primary)" />
              <span>{normalizedCarpet ? `${normalizedCarpet} sqft` : '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SUPER BUILT-UP AREA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Layers size={18} color="var(--accent-primary)" />
              <span>{listing.super_built_up_area ? `${listing.super_built_up_area} sqft` : '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FURNISHING</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              {listing.furnishing || 'Unfurnished'}
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FACING DIRECTION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              <Compass size={18} color="var(--accent-primary)" />
              <span>{listing.facing_direction || 'East'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FLOOR ELEVATION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Building size={18} color="var(--accent-primary)" />
              <span>{listing.floor || '1'} of {listing.total_floors || '--'}</span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PARKING SPACES</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-heading)' }}>
              <Car size={18} color="var(--accent-primary)" />
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
              borderRadius: 'var(--radius-md)',
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
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--accent-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-text)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} color="var(--accent-primary)" />
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
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Phone size={16} />
                  <span>{listing.posted_by_contact || 'Call Agent'}</span>
                </a>
              </div>

              {listing.listing_url && (
                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                >
                  <span>View Original Listing</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* "You May Also Like" Similar Properties Section */}
      {similarListings.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                <Sparkles size={16} />
                <span>Comparable Properties</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.25rem' }}>
                You May Also Like
              </h2>
            </div>
            <NavLink to={`/listings?locality=${listing.locality}`} className="btn btn-secondary btn-sm">
              More in {listing.locality} →
            </NavLink>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {similarListings.map((item) => (
              <PropertyCard key={item.listing_id} listing={item} />
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
