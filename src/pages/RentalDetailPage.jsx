import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Phone,
  ExternalLink,
  Navigation2,
  Share2,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fixCoordinates, getGoogleMapsUrl } from '../utils/dataUtils';
import RentalCard, { formatINR } from '../components/RentalCard';
import { useCompare } from '../context/CompareContext';
import PropertyImagePlaceholder from '../components/PropertyImagePlaceholder';

const RENTAL_PHOTOS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80',
];

export default function RentalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isCompared, toggleCompare } = useCompare();

  const [rental, setRental] = useState(null);
  const [similarRentals, setSimilarRentals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function loadData() {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}rentals.json`);
        if (!res.ok) throw new Error('Could not load rentals catalog');
        const rawList = await res.json();
        const catalog = Array.isArray(rawList) ? rawList : (rawList.results || []);

        const found = catalog.find((r) => String(r.listing_id) === String(id));
        if (!found) {
          if (isMounted) setError(`Rental property #${id} could not be found.`);
          return;
        }

        const fixed = fixCoordinates(found);
        if (isMounted) {
          setRental(fixed);

          // Find similar rentals (same locality or matching bedroom count)
          const similar = catalog
            .filter((r) => String(r.listing_id) !== String(id) && r.is_live !== false)
            .filter((r) => r.locality === found.locality || r.bedroom === found.bedroom)
            .slice(0, 3)
            .map(fixCoordinates);

          setSimilarRentals(similar);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to retrieve rental details');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const compared = rental ? isCompared(rental.listing_id, 'rentals') : false;

  if (isLoading) {
    return (
      <div className="main-content" style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Loader2 size={38} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading rental property details…</p>
        <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--radius-xs)',
          backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
        }}>
          <AlertCircle size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-heading)' }}>Rental Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '420px' }}>
          {error || `Rental record #${id} could not be found.`}
        </p>
        <button onClick={() => navigate('/rentals')} className="btn btn-primary btn-sm">
          ← Back to Rentals Catalog
        </button>
      </div>
    );
  }

  const photoIndex = Math.abs(
    String(rental.listing_id || '0')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % RENTAL_PHOTOS.length;
  const photoUrl = RENTAL_PHOTOS[photoIndex];

  const mapsUrl = getGoogleMapsUrl(
    rental.latitude,
    rental.longitude,
    (rental.apartment_name || rental.title || '') + ', ' + (rental.locality || '') + ', Mumbai'
  );

  const furnishingClean = rental.furnishing
    ? rental.furnishing.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Semi Furnished';

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          type="button"
          onClick={() => navigate('/rentals')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          <ArrowLeft size={15} /> Back to Rentals
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Direct Google Maps Action */}
          <a
            href={mapsUrl}
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

          <button
            type="button"
            onClick={handleShare}
            className="btn btn-secondary btn-sm"
            title="Copy property link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            {copiedLink ? <><Check size={14} /> Link Copied!</> : <><Share2 size={14} /> Share</>}
          </button>

          <button
            type="button"
            onClick={() => toggleCompare(rental, 'rentals')}
            className="btn btn-secondary btn-sm"
            style={{
              color: compared ? 'var(--accent-text)' : 'var(--text-heading)',
              borderColor: compared ? 'var(--accent-border)' : 'var(--border-subtle)',
              backgroundColor: compared ? 'var(--accent-subtle)' : 'var(--bg-surface)'
            }}
          >
            {compared ? 'Comparing ✓' : 'Add to Compare'}
          </button>
        </div>
      </div>

      {/* Hero Visual Card */}
      <div className="ivy-card" style={{
        overflow: 'hidden',
        marginBottom: '2rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '21 / 9',
          maxHeight: '380px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}>
          {!imageError ? (
            <img
              src={photoUrl}
              alt={rental.apartment_name || rental.title || 'Rental Residence'}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <PropertyImagePlaceholder type="rental" locality={rental.locality} bedroom={rental.bedroom} />
          )}

          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '2rem'
          }}>
            <div style={{ color: '#ffffff', width: '100%' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(5, 150, 105, 0.9)', color: '#ffffff',
                  fontSize: '0.75rem', fontWeight: 700
                }}>
                  Verified Rental
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff',
                  fontSize: '0.75rem', fontWeight: 700
                }}>
                  {furnishingClean}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff',
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600
                }}>
                  ID #{rental.listing_id}
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                marginBottom: '0.4rem',
                textTransform: 'capitalize'
              }}>
                {rental.apartment_name || rental.title || `${rental.bedroom} BHK Rental in ${rental.locality}`}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
                <MapPin size={16} />
                <span style={{ textTransform: 'capitalize' }}>{rental.locality}, Mumbai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Ribbon */}
        <div style={{
          padding: '1.25rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monthly Rent
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-text)', lineHeight: 1.1 }}>
              {formatINR(rental.price)}
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '6px' }}>/ month</span>
            </div>
          </div>

          {rental.deposit && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Security Deposit
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                {formatINR(rental.deposit)}
              </div>
            </div>
          )}

          {rental.maintenance !== undefined && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Maintenance
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                {rental.maintenance ? formatINR(rental.maintenance) + ' / mo' : 'Included'}
              </div>
            </div>
          )}

          <div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                borderColor: 'rgba(16,185,129,0.4)', color: '#059669',
                backgroundColor: 'rgba(16,185,129,0.08)', fontWeight: 700
              }}
            >
              <Navigation2 size={15} /> Open in Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="ivy-card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', borderRadius: 'var(--radius-sm)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '1.25rem' }}>
          Rental Specifications & Overview
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BEDROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {rental.bedroom ?? '--'} BHK
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>BATHROOMS</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {rental.bathroom ?? '--'} Baths
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>CARPET AREA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {rental.carpet_area ? `${Number(rental.carpet_area).toLocaleString('en-IN')} sqft` : '--'}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FURNISHING</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {furnishingClean}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PREFERRED TENANT</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              {rental.preferred_tenants || 'Any / All'}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FLOOR ELEVATION</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {rental.floor || '1'} of {rental.total_floors || '--'}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PARKING</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', color: 'var(--text-heading)' }}>
              {rental.parking ? `${rental.parking} Dedicated` : 'Available'}
            </div>
          </div>

          <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>FACING</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '3px', textTransform: 'capitalize', color: 'var(--text-heading)' }}>
              {rental.facing_direction || 'East'}
            </div>
          </div>
        </div>

        {/* Description and Verified Lister Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          paddingTop: '2rem',
          marginTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }} className="detail-columns">
          {/* Description */}
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.75rem' }}>
              Property Description
            </h3>
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
              {rental.description || `Spacious and well-maintained ${rental.bedroom || 2} BHK residence available for immediate lease in ${rental.locality}, Mumbai. Features high natural illumination, serene environment, and proximity to transit corridors.`}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              <div>
                <strong>City: </strong> Mumbai (City ID: {rental.city_id || 5})
              </div>
              {rental.posted_at && (
                <div>
                  <strong>Posted: </strong>
                  {new Date(rental.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              {rental.website && (
                <div>
                  <strong>Source: </strong>
                  <span style={{ textTransform: 'capitalize' }}>{rental.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div>
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'var(--accent-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-border)'
            }}>
              <div style={{ color: 'var(--accent-text)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Verified Lister Details
              </div>

              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.5rem' }}>
                {rental.posted_by_name || 'Property Manager'}
              </div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                Posted by {rental.posted_by || 'Owner / Verified Agent'}
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <a
                  href={`tel:${rental.posted_by_contact || '+919820012345'}`}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Phone size={15} />
                  <span>{rental.posted_by_contact || '+91 98200 12345'}</span>
                </a>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Navigation2 size={13} /> View on Google Maps
                </a>
              </div>

              {rental.listing_url && (
                <a
                  href={rental.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ExternalLink size={13} /> View on {rental.website || 'Portal'}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Rentals Section */}
      {similarRentals.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                Rental Alternatives
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-heading)', marginTop: '0.25rem' }}>
                More Rentals You'll Like
              </h2>
            </div>
            <NavLink to={`/rentals?locality=${rental.locality}`} className="btn btn-secondary btn-sm">
              More in {rental.locality}
            </NavLink>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {similarRentals.map((item) => (
              <RentalCard key={item.listing_id} rental={item} />
            ))}
          </div>
        </section>
      )}

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
